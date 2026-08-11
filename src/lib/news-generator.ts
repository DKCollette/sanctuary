import { prisma } from "./prisma";

function getProviderConfig() {
  return {
    provider: process.env.AI_PROVIDER || "openrouter",
    model: process.env.AI_MODEL || "deepseek/deepseek-v4-flash",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.OLLAMA_BASE_URL || process.env.LM_STUDIO_BASE_URL,
  };
}

const CATEGORIES = [
  "Astro / Zodiac Season",
  "Cosmic Portals & Transits",
  "Lunar Cycles",
  "Energetic States & Earth Frequency",
  "Mindfulness & Universal News",
] as const;

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Returns cached news items if fresh enough, otherwise generates new ones.
 */
export async function getNewsFeed(): Promise<NewsItem[]> {
  // Check for cached items
  const recent = await prisma.newsItem.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (recent && Date.now() - recent.createdAt.getTime() < CACHE_DURATION_MS) {
    // Only return items from the latest generation batch
    const latestGeneration = recent.createdAt;
    const windowStart = new Date(latestGeneration.getTime() - 5000); // 5s window before
    const windowEnd = new Date(latestGeneration.getTime() + 1000);  // 1s window after
    const items = await prisma.newsItem.findMany({
      where: {
        createdAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      orderBy: [{ isActiveNow: "desc" }, { createdAt: "desc" }],
    });
    // Fallback: if no items match the window, return all recent items
    if (items.length > 0) {
      return items.map(mapDbItem);
    }
  }

  // Generate fresh feed
  return generateAndSaveFeed();
}

/**
 * Force-regenerates the feed regardless of cache age.
 */
export async function refreshNewsFeed(): Promise<NewsItem[]> {
  await prisma.newsItem.deleteMany();
  return generateAndSaveFeed();
}

async function generateAndSaveFeed(): Promise<NewsItem[]> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const moonData = await getMoonPhase();
  const sunSign = getSunSign();

  const prompt = `Today is ${today}. The ACTUAL Moon phase right now (from astronomical API) is: "${moonData}". The Sun is in ${sunSign} (astronomically verified).

You are the Cosmic Pulse curator for Sanctuary — a space of spiritual stillness and awareness.

Generate EXACTLY 5 news items — one per category below. Use the exact category names listed. Do NOT add extra items beyond 5.

1. **Astro / Zodiac Season**: Current Sun sign (${sunSign}), active retrogrades, major aspects, seasonal shifts
2. **Cosmic Portals & Transits**: Active gateways (Lion's Gate, solstices, equinoxes, 11:11 shifts)
3. **Lunar Cycles**: REFER TO THE ACTUAL MOON DATA ABOVE. Generate exactly ONE Moon item and it MUST match "${moonData}" — do NOT invent a different moon phase.
4. **Energetic States & Earth Frequency**: Solar flares, Schumann Resonance, geomagnetic activity
5. **Mindfulness & Universal News**: Collective consciousness trends, seasonal rituals, modern spiritual practices

Use REAL astronomical data for today's date (August 2026). The Lion's Gate Portal peaks August 8. Check current retrogrades, moon phase, and zodiac season.

Return ONLY valid JSON — a single array of objects with NO markdown formatting, NO code blocks, NO extra text:

[
  {
    "id": "news_001",
    "title": "...",
    "category": "...",
    "isActiveNow": true,
    "dateDisplay": "...",
    "summary": "...",
    "energeticImpact": "...",
    "suggestedAction": "..."
  }
]

Rules:
- id format: news_001, news_002, etc.
- category must be one of: "Astro / Zodiac Season", "Cosmic Portals & Transits", "Lunar Cycles", "Energetic States & Earth Frequency", "Mindfulness & Universal News"
- isActiveNow: true for events happening right now today, false for upcoming
- dateDisplay: e.g. "Active Now | Aug 8 - Aug 12", "Peak: Tonight", "Current Moon Phase"
- summary: 2-3 sentences on what's happening
- energeticImpact: specific emotional/physical/energetic symptoms someone may feel
- suggestedAction: 1-2 practical steps — journaling, rituals, crystals, etc.
- Tone: grounded, supportive, accessible. Frame retrogrades as reflection time, not chaos.`;

  const config = getProviderConfig();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Sanctuary",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.7,
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`AI provider error (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";

  // Parse JSON — strip any markdown fences the AI might add
  const jsonStr = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let items: AIGeneratedItem[];
  try {
    items = JSON.parse(jsonStr);
  } catch {
    // Fallback: try to extract array from the text
    const match = jsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      items = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  // Save to database
  const saved: NewsItem[] = [];
  for (const item of items) {
    const dbItem = await prisma.newsItem.create({
      data: {
        title: item.title,
        category: item.category,
        isActiveNow: item.isActiveNow ?? false,
        dateDisplay: item.dateDisplay,
        summary: item.summary,
        energeticImpact: item.energeticImpact,
        suggestedAction: item.suggestedAction,
      },
    });
    saved.push(mapDbItem(dbItem));
  }

  return saved;
}

async function getMoonPhase(): Promise<string> {
  try {
    const res = await fetch(
      `https://api.farmsense.net/v1/moonphases/?d=${Math.floor(Date.now() / 86400000)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const phases = await res.json();
      if (phases?.length) {
        return phases[0]?.Phase || "unknown phase";
      }
    }
  } catch {
    // fall through to default
  }
  return "in its current phase";
}

function getSunSign(): string {
  const d = new Date();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

interface AIGeneratedItem {
  id: string;
  title: string;
  category: string;
  isActiveNow?: boolean;
  dateDisplay: string;
  summary: string;
  energeticImpact: string;
  suggestedAction: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  isActiveNow: boolean;
  dateDisplay: string;
  summary: string;
  energeticImpact: string;
  suggestedAction: string;
  createdAt: string;
}

function mapDbItem(item: any): NewsItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    isActiveNow: item.isActiveNow,
    dateDisplay: item.dateDisplay,
    summary: item.summary,
    energeticImpact: item.energeticImpact,
    suggestedAction: item.suggestedAction,
    createdAt: item.createdAt?.toISOString?.() || item.createdAt,
  };
}