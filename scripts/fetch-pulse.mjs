#!/usr/bin/env node
/**
 * Pulse RSS Feed Fetcher -- writes to PostgreSQL (Neon).
 *
 * Replaces the old fetch-pulse.py which wrote to SQLite.
 * Run via cron: DATABASE_URL=... node scripts/fetch-pulse.mjs
 *
 * Reads DATABASE_URL from the environment.  If not set, falls back
 * to the .env file in the project root.
 */
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually if no DATABASE_URL is set
const envPath = resolve(__dirname, "..", ".env");
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(envPath, "utf-8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgres")) {
  console.error("❌ Set DATABASE_URL to your Neon Postgres connection string");
  process.exit(1);
}

// ── Feeds ────────────────────────────────────────────────────────
const FEEDS = [
  { url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", type: "spiritual", category: "Cosmic Portals & Transits", faith: "general", source: "NASA" },
  { url: "https://www.space.com/feeds/all.rss", type: "spiritual", category: "Astro / Zodiac Season", faith: "general", source: "Space.com" },
  { url: "https://www.goodnewsnetwork.org/feed/", type: "uplifting", category: "Human Interest", faith: "general", source: "Good News Network" },
  { url: "https://feeds.feedburner.com/PositiveNewsStories", type: "uplifting", category: "Global Kindness", faith: "general", source: "Positive News" },
  { url: "https://religionnews.com/feed/", type: "general", category: "Interfaith Wisdom & Universal Spirituality", faith: "interfaith", source: "Religion News Service" },
  { url: "https://www.vaticannews.va/en.rss.xml", type: "general", category: "Faith Spotlight", faith: "christian", source: "Vatican News" },
  { url: "https://tricycle.org/feed/", type: "general", category: "Mindfulness & Universal News", faith: "buddhist", source: "Tricycle" },
  { url: "https://www.jta.org/feed", type: "general", category: "Faith Spotlight", faith: "jewish", source: "Jewish Telegraphic Agency" },
];

// ── Import pg ─────────────────────────────────────────────────────
const require = createRequire(import.meta.url);
const { Client } = require("pg");

// ── Helpers ───────────────────────────────────────────────────────
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").trim();
}

function parseDate(str) {
  if (!str) return new Date().toISOString();
  try {
    return new Date(str).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

async function fetchRss(url, timeout = 15000) {
  const items = [];
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    const xml = await resp.text();

    // Simple RSS 2.0 parser
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = (itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
      const desc = (itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || "";
      const link = (itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || "";
      const pubDate = (itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
      items.push({ title: stripHtml(title), summary: stripHtml(desc).slice(0, 300), url: link, publishedAt: pubDate });
      if (items.length >= 3) break;
    }

    // Try Atom format if no RSS items found
    if (items.length === 0) {
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
      while ((match = entryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        const title = (entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
        const summary = (entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || "";
        const link = (entryXml.match(/<link[^>]*\s+href="([^"]*)"/i) || [])[1] || "";
        const published = (entryXml.match(/<published[^>]*>([\s\S]*?)<\/published>/i) || [])[1] || "";
        items.push({ title: stripHtml(title), summary: stripHtml(summary).slice(0, 300), url: link, publishedAt: published });
        if (items.length >= 3) break;
      }
    }
  } catch (e) {
    console.error(`  ⚠ Failed to fetch ${url}: ${e.message}`);
  }
  return items;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log("🌐 Collettive Pulse Feed Fetcher (Node.js → Neon)");
  const now = new Date();
  const batchId = `pulse_${Math.floor(now.getTime() / 1000)}`;

  // Fetch all feeds
  const allItems = [];
  for (const feed of FEEDS) {
    console.log(`  📡 ${feed.source}...`);
    const articles = await fetchRss(feed.url);
    for (const a of articles) {
      allItems.push({
        ...a,
        newsType: feed.type,
        category: feed.category,
        religion: feed.faith,
        source: feed.source,
        eventType: "News Story",
        isRealtimeEvent: true,
        dateDisplay: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      });
    }
    console.log(`     → ${articles.length} items`);
  }

  if (allItems.length === 0) {
    console.log("  ⏭ No items fetched");
    return;
  }

  // Connect to Neon and write
  console.log(`\n  💾 Saving ${allItems.length} items to Neon...`);
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    // Clear old items
    await client.query("DELETE FROM \"NewsItem\"");

    // Insert new items
    const batchTime = now.toISOString();
    let saved = 0;
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const id = `${batchId}_${i}`;
      await client.query(
        `INSERT INTO "NewsItem" (id, title, category, "newsType", religion, "isActiveNow", "dateDisplay", summary, source, url, "eventType", "isRealtimeEvent", "energeticImpact", "suggestedAction", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          id, item.title, item.category, item.newsType, item.religion,
          false, item.dateDisplay, item.summary, item.source, item.url,
          item.eventType, item.isRealtimeEvent, "", "",
          batchTime, batchTime,
        ]
      );
      saved++;
    }
    console.log(`  ✅ Saved ${saved} items`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌ Pulse fetch failed:", e.message);
  process.exit(1);
});