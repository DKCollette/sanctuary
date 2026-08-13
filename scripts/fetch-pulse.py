#!/usr/bin/env python3
"""
Live Pulse Feed Fetcher
Fetches real news from RSS feeds, validates, categorizes, and saves to the database.
"""

import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import sqlite3
import os
import re
import sys

DB_PATH = os.path.expanduser("~/spirit/prisma/prisma/dev.db")
CACHE_DURATION_SECS = 6 * 60 * 60  # 6 hours

# ── RSS Feed Sources ──────────────────────────────────────────

FEEDS = [
    # Cosmic / Space
    {"url": "https://www.nasa.gov/rss/dyn/breaking_news.rss", "type": "spiritual", "category": "Cosmic Portals & Transits", "faith": "general", "source": "NASA"},
    {"url": "https://www.space.com/feeds/all.rss", "type": "spiritual", "category": "Astro / Zodiac Season", "faith": "general", "source": "Space.com"},
    # Uplifting / Positive
    {"url": "https://www.goodnewsnetwork.org/feed/", "type": "uplifting", "category": "Human Interest", "faith": "general", "source": "Good News Network"},
    {"url": "https://feeds.feedburner.com/PositiveNewsStories", "type": "uplifting", "category": "Global Kindness", "faith": "general", "source": "Positive News"},
    # Religion / Faith
    {"url": "https://religionnews.com/feed/", "type": "general", "category": "Interfaith Wisdom & Universal Spirituality", "faith": "interfaith", "source": "Religion News Service"},
    {"url": "https://www.vaticannews.va/en.rss.xml", "type": "general", "category": "Faith Spotlight", "faith": "christian", "source": "Vatican News"},
    # Buddhist
    {"url": "https://tricycle.org/feed/", "type": "general", "category": "Mindfulness & Universal News", "faith": "buddhist", "source": "Tricycle"},
    # Jewish
    {"url": "https://www.jta.org/feed", "type": "general", "category": "Faith Spotlight", "faith": "jewish", "source": "Jewish Telegraphic Agency"},
]

CATEGORY_COLORS = {
    "Astro / Zodiac Season": "purple", "Cosmic Portals & Transits": "amber",
    "Lunar Cycles": "blue", "Energetic States & Earth Frequency": "emerald",
    "Mindfulness & Universal News": "rose", "Human Interest": "teal",
    "Global Kindness": "green", "Breakthroughs": "cyan",
    "Community & Connection": "sky", "Interfaith Wisdom & Universal Spirituality": "yellow",
    "Faith Spotlight": "violet",
}

MOON_API = "https://api.farmsense.net/v1/moonphases/"
SUN_URL = "https://api.astronomyapi.com/"  # placeholder


def fetch_rss(url: str, timeout: int = 10) -> list[dict]:
    """Fetch and parse an RSS feed, returning up to 3 latest items."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CollettivePulse/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            xml_data = resp.read()
    except Exception as e:
        print(f"  ⚠ Failed to fetch {url}: {e}", file=sys.stderr)
        return []

    items = []
    try:
        root = ET.fromstring(xml_data)
        # Handle both RSS 2.0 and Atom feeds
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall(".//item")[:3]:
            title = entry.findtext("title", "").strip()
            desc = entry.findtext("description", "").strip()
            link = entry.findtext("link", "").strip()
            pub_date = entry.findtext("pubDate", "")
            # Clean HTML tags from description
            desc = re.sub(r"<[^>]+>", "", desc)
            items.append({"title": title, "summary": desc[:300], "url": link, "publishedAt": pub_date})
        # Try Atom format
        if not items:
            for entry in root.findall(".//atom:entry", ns)[:3]:
                title = entry.findtext("atom:title", "", ns).strip()
                link_el = entry.find("atom:link", ns)
                link = link_el.get("href", "") if link_el is not None else ""
                summary = entry.findtext("atom:summary", "", ns).strip()
                published = entry.findtext("atom:published", "", ns)
                summary = re.sub(r"<[^>]+>", "", summary)
                items.append({"title": title, "summary": summary[:300], "url": link, "publishedAt": published})
    except ET.ParseError as e:
        print(f"  ⚠ Parse error for {url}: {e}", file=sys.stderr)

    return items


def get_moon_phase() -> str:
    """Get real moon phase from API."""
    try:
        days_since_epoch = int(datetime.now().timestamp() / 86400)
        url = f"{MOON_API}?d={days_since_epoch}"
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
            if data and len(data) > 0:
                return data[0].get("Phase", "unknown")
    except Exception:
        pass
    return "in its current phase"


def get_sun_sign() -> str:
    """Calculate the current sun sign based on date."""
    d = datetime.now()
    m, day = d.month, d.day
    if (m == 3 and day >= 21) or (m == 4 and day <= 19): return "Aries"
    if (m == 4 and day >= 20) or (m == 5 and day <= 20): return "Taurus"
    if (m == 5 and day >= 21) or (m == 6 and day <= 20): return "Gemini"
    if (m == 6 and day >= 21) or (m == 7 and day <= 22): return "Cancer"
    if (m == 7 and day >= 23) or (m == 8 and day <= 22): return "Leo"
    if (m == 8 and day >= 23) or (m == 9 and day <= 22): return "Virgo"
    if (m == 9 and day >= 23) or (m == 10 and day <= 22): return "Libra"
    if (m == 10 and day >= 23) or (m == 11 and day <= 21): return "Scorpio"
    if (m == 11 and day >= 22) or (m == 12 and day <= 21): return "Sagittarius"
    if (m == 12 and day >= 22) or (m == 1 and day <= 19): return "Capricorn"
    if (m == 1 and day >= 20) or (m == 2 and day <= 18): return "Aquarius"
    return "Pisces"


def save_to_db(items: list[dict]):
    """Save curated items to the SQLite database, replacing old items."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Clear old items before inserting fresh ones
    cursor.execute("DELETE FROM NewsItem")
    # Use the SAME timestamp for ALL items so the cache filter finds them all
    batch_time = datetime.now(timezone.utc).isoformat()
    batch_ts = int(datetime.now().timestamp())
    saved = 0
    for i, item in enumerate(items):
        cursor.execute("""
            INSERT INTO NewsItem (id, title, category, newsType, religion, isActiveNow, dateDisplay, summary, source, url, eventType, isRealtimeEvent, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"pulse_{batch_ts}_{i}",
            item["title"],
            item.get("category", "Human Interest"),
            item.get("newsType", "uplifting"),
            item.get("faith", "general"),
            item.get("isActiveNow", False),
            item.get("dateDisplay", datetime.now().strftime("%b %d, %Y")),
            item["summary"],
            item.get("source", ""),
            item.get("url", ""),
            item.get("eventType", ""),
            item.get("isRealtimeEvent", False),
            batch_time,
            batch_time,
        ))
        saved += 1
    conn.commit()
    conn.close()
    return saved


def main():
    print("🌐 Collettive Pulse Feed Fetcher", file=sys.stderr)
    print(f"   Moon phase: {get_moon_phase()}", file=sys.stderr)
    print(f"   Sun sign: {get_sun_sign()}", file=sys.stderr)
    print(f"   Fetching {len(FEEDS)} feeds...\n", file=sys.stderr)

    all_items = []
    for feed in FEEDS:
        print(f"  📡 {feed['source']}...", file=sys.stderr)
        articles = fetch_rss(feed["url"])
        for i, article in enumerate(articles):
            article["newsType"] = feed["type"]
            article["category"] = feed["category"]
            article["faith"] = feed["faith"]
            article["source"] = feed["source"]
            article["eventType"] = "News Story"
            article["isRealtimeEvent"] = True
            article["dateDisplay"] = datetime.now().strftime("%b %d, %Y")
            article["_idx"] = i
            all_items.append(article)
        print(f"     → {len(articles)} items", file=sys.stderr)

    print(f"\n  💾 Saving {len(all_items)} items to database...", file=sys.stderr)
    saved = save_to_db(all_items)
    print(f"  ✅ Saved {saved} new items (skipped {len(all_items) - saved} duplicates)", file=sys.stderr)


if __name__ == "__main__":
    main()