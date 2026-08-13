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

// New dual-axis tagging: newsType (spiritual vs uplifting) + religion (faith tradition)
export const NEWS_TYPES = ["spiritual", "uplifting", "general"] as const;
export const RELIGIONS = ["general", "christian", "islamic", "jewish", "hindu", "buddhist", "interfaith"] as const;

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
    // Window filter didn't match — return all recent items as fallback
    const allRecent = await prisma.newsItem.findMany({
      orderBy: [{ isActiveNow: "desc" }, { createdAt: "desc" }],
    });
    if (allRecent.length > 0) {
      return allRecent.map(mapDbItem);
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

You are a precise Content Curator for the Collettive Pulse feed. Your job is to produce accurate, well-categorized, real-world news items following strict editorial guidelines.

## CONTENT CATEGORIES & RULES

### 1. Cosmic & Spiritual (Factual & Informational) — 3 items
ONLY factual astronomical, astrological, and planetary event data. Examples: Lion's Gate Portal alignments, solar/lunar eclipses, planetary retrograde dates, solstice/equinox tracking, real-time zodiac season transitions, NASA/JWST space discoveries.
- Tone: Grounded, informative, mathematically accurate, historically contextualized. NO sensationalized "doomsday" clickbait.
- Use exact category names: "Astro / Zodiac Season", "Cosmic Portals & Transits", "Lunar Cycles", "Energetic States & Earth Frequency", "Mindfulness & Universal News"
- REFER TO THE ACTUAL MOON DATA: "${moonData}" — must match exactly.

### 2. Uplifting & Positive (Real-World Actions & Humanity) — 3 items
ONLY verified, real-world positive actions, humanitarian milestones, environmental wins, and inspiring community events.
Examples: Buddhist monks conducting peace walks; interfaith disaster relief; environmental restoration led by faith groups; global acts of charity, healing, unity.
- Tone: Inspiring, authentic, warm, objective.
- Use categories: "Human Interest", "Global Kindness", "Breakthroughs", "Community & Connection"
- Tag with appropriate faith: christian, islamic, buddhist, jewish, hindu, interfaith, or general.

### 3. Interfaith & Universal — 1 item
Multi-faith cooperation, shared human values, cross-cultural peace summits, non-denominational spiritual practices.
- Category: "Interfaith Wisdom & Universal Spirituality"
- Religion tag: "interfaith"

### 4. Faith-Specific — 1 item
Accurate, positive, or notable news from one specific tradition. Rotate which tradition each generation.
- Category: "Faith Spotlight"
- Religion tag: one of christian, islamic, buddhist, jewish, hindu
- Use proper terminology (Sangha, Torah, Ramadan, Dharma, Gospel, Mandir).

## FACT-CHECKING RULES
- ALWAYS verify astronomical dates against real data. The Sun is in ${sunSign} (astronomically verified).
- For lunar items, the EXACT moon phase is "${moonData}" — do NOT invent a different phase.
- Do NOT invent news. If no major event is occurring today, report the most recent verified event.
- No hallucinated celestial events, portals, or alignments that don't exist in real astronomical data.

## OUTPUT FORMAT
Return ONLY valid JSON — a single array of exactly 8 objects with NO markdown formatting, NO code blocks, NO extra text:

[
  {
    "id": "news_001",
    "title": "...",
    "category": "Astro / Zodiac Season | Cosmic Portals & Transits | Lunar Cycles | Energetic States & Earth Frequency | Mindfulness & Universal News | Human Interest | Global Kindness | Breakthroughs | Community & Connection | Interfaith Wisdom & Universal Spirituality | Faith Spotlight",
    "newsType": "spiritual | uplifting | general",
    "religion": "general | interfaith | christian | islamic | jewish | hindu | buddhist",
    "isActiveNow": true,
    "dateDisplay": "...",
    "summary": "2-3 sentence factual overview",
    "source": "Publisher or source name",
    "url": "https://...",
    "factual_metadata": {
      "event_type": "Celestial Event | Peace Movement | Interfaith Summit | Humanitarian Milestone | Environmental Win | Faith Celebration",
      "is_realtime_event": true
    }
  }
]

RULES:
- id: news_001 through news_008
- isActiveNow: true for events happening right now today, false for upcoming
- dateDisplay: e.g. "Active Now | Aug 8-12", "Peak: Tonight", "Current Moon Phase"
- summary: 2-3 factual sentences
- source: credible name (NASA, Positive News, RNS, Vatican News, etc.)
- url: placeholder starting with "https://"
- Tone per category rules above. NO sensationalism.`;

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
    const fm = item.factual_metadata || {};
    const dbItem = await prisma.newsItem.create({
      data: {
        title: item.title,
        category: item.category,
        newsType: item.newsType || "spiritual",
        religion: item.religion || "general",
        isActiveNow: item.isActiveNow ?? false,
        dateDisplay: item.dateDisplay,
        summary: item.summary,
        source: item.source || "",
        url: item.url || "",
        eventType: fm.event_type || "",
        isRealtimeEvent: fm.is_realtime_event || false,
        energeticImpact: item.energeticImpact || "",
        suggestedAction: item.suggestedAction || "",
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
  newsType?: string;
  religion?: string;
  isActiveNow?: boolean;
  dateDisplay: string;
  summary: string;
  source?: string;
  url?: string;
  factual_metadata?: {
    event_type: string;
    is_realtime_event: boolean;
  };
  energeticImpact?: string;
  suggestedAction?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  newsType: string;
  religion: string;
  isActiveNow: boolean;
  dateDisplay: string;
  summary: string;
  source: string;
  url: string;
  eventType: string;
  isRealtimeEvent: boolean;
  energeticImpact: string;
  suggestedAction: string;
  createdAt: string;
}

function mapDbItem(item: any): NewsItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    newsType: item.newsType || "spiritual",
    religion: item.religion || "general",
    isActiveNow: item.isActiveNow,
    dateDisplay: item.dateDisplay,
    summary: item.summary,
    source: item.source || "",
    url: item.url || "",
    eventType: item.eventType || "",
    isRealtimeEvent: item.isRealtimeEvent || false,
    energeticImpact: item.energeticImpact || "",
    suggestedAction: item.suggestedAction || "",
    createdAt: item.createdAt?.toISOString?.() || item.createdAt,
  };
}