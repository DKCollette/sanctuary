#!/usr/bin/env node
/**
 * Daily Insight Generator — runs via cron at 3 AM daily.
 * Iterates over all users with a blueprint, computes transits,
 * generates an AI insight, and stores it in the DailyInsight table.
 */
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = resolve(__dirname, "..", ".env");
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(envPath, "utf-8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
      if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
      const m2 = line.match(/^\s*OPENROUTER_API_KEY\s*=\s*(.+)\s*$/);
      if (m2) process.env.OPENROUTER_API_KEY = m2[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgres")) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("❌ OPENROUTER_API_KEY not set");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const { Client } = require("pg");

async function main() {
  console.log("🌅 Daily Insight Generator");
  const today = new Date().toISOString().split("T")[0];
  console.log(`  Date: ${today}`);

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    // Get all users with blueprints
    const bpRes = await client.query('SELECT "userId", blueprint FROM "UserBlueprint"');
    console.log(`  Users with blueprints: ${bpRes.rows.length}`);

    let generated = 0;
    for (const row of bpRes.rows) {
      const { userId, blueprint } = row;
      
      // Check if insight already exists for today
      const check = await client.query(
        'SELECT id FROM "DailyInsight" WHERE "userId" = $1 AND date = $2',
        [userId, today]
      );
      if (check.rows.length > 0) {
        continue; // Already generated
      }

      const bp = typeof blueprint === "string" ? JSON.parse(blueprint) : blueprint;

      // Build the prompt for the AI
      const prompt = `Generate a daily insight for a Collettive user.

## User's Energetic Blueprint
- Human Design Type: ${bp.humanDesign?.type || "Unknown"}
- Strategy: ${bp.humanDesign?.strategy || "Unknown"}
- Authority: ${bp.humanDesign?.authority || "Unknown"}
- Profile: ${bp.humanDesign?.profile || "Unknown"}
- Life Path: ${bp.numerology?.lifePath || "?"}

## Requirements
Write 2-3 sentences of actionable, poetic wisdom.
Tie it to the user's Human Design type and authority.
Warm, precise, spiritually grounded — not generic.
End with a single-line practice or question.`;

      // Call OpenRouter
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-v4-flash",
          messages: [
            { role: "system", content: "You are a spiritual guide generating personalized daily insights based on Human Design and numerology." },
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error(`  ❌ User ${userId.slice(0, 8)}: AI error: ${errText}`);
        continue;
      }

      const aiData = await aiRes.json();
      const insight = aiData.choices?.[0]?.message?.content;
      if (!insight) {
        console.error(`  ❌ User ${userId.slice(0, 8)}: No insight returned`);
        continue;
      }

      // Store in database
      await client.query(
        `INSERT INTO "DailyInsight" (id, "userId", date, insight, source, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `di_${Date.now()}_${generated}`,
          userId,
          today,
          insight.trim(),
          "blended",
          new Date().toISOString(),
        ]
      );

      generated++;
      console.log(`  ✅ User ${userId.slice(0, 8)}: insight generated`);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🎉 Generated ${generated} insights for ${today}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});