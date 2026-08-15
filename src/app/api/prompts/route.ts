import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenUser } from "@/lib/auth-middleware";

function parseJsonArray(val: string | undefined | null): string[] {
  try { const p = JSON.parse(val || "[]"); return Array.isArray(p) ? p : []; } catch { return []; }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hawkins Scale levels mapped to prompt categories
const HAWKINS_MAP = [
  { range: "1-29", label: "Shame", band: "lower", color: "#1A1040" },
  { range: "30-49", label: "Guilt", band: "lower", color: "#4A148C" },
  { range: "50-74", label: "Apathy", band: "lower", color: "#6A1B9A" },
  { range: "75-99", label: "Grief", band: "lower", color: "#8E24AA" },
  { range: "100-124", label: "Fear", band: "lower", color: "#C62828" },
  { range: "125-149", label: "Desire", band: "lower", color: "#E53935" },
  { range: "150-174", label: "Anger", band: "lower", color: "#FF4B4B" },
  { range: "175-199", label: "Pride", band: "lower", color: "#FF8C42" },
  { range: "200-249", label: "Courage", band: "transition", color: "#FFB74D" },
  { range: "250-309", label: "Neutrality", band: "transition", color: "#FFD700" },
  { range: "310-349", label: "Willingness", band: "transition", color: "#66BB6A" },
  { range: "350-399", label: "Acceptance", band: "upper", color: "#4CAF50" },
  { range: "400-499", label: "Reason", band: "upper", color: "#42A5F5" },
  { range: "500-539", label: "Love", band: "transcendent", color: "#7C4DFF" },
  { range: "540-599", label: "Joy", band: "transcendent", color: "#A78BFA" },
  { range: "600-699", label: "Peace", band: "transcendent", color: "#E0B0FF" },
  { range: "700-1000", label: "Enlightenment", band: "transcendent", color: "#F0E6FF" },
];

// Fallback prompts for unauthenticated users — one per band
const FALLBACK_PROMPTS = [
  {
    question: "What heavy emotion am I holding onto that is ready to be observed and surrendered?",
    band: "lower",
    scaleLabel: "Transmutation",
    scaleRange: "1-199",
    scaleColor: "#FF8C42",
  },
  {
    question: "How can I accept this present moment exactly as it is without trying to force or control it?",
    band: "transition",
    scaleLabel: "Willingness & Action",
    scaleRange: "200-349",
    scaleColor: "#66BB6A",
  },
  {
    question: "What higher lesson is hidden within the challenge I am currently facing?",
    band: "upper",
    scaleLabel: "Wisdom & Forgiveness",
    scaleRange: "350-499",
    scaleColor: "#42A5F5",
  },
  {
    question: "How can I open my heart today and feel connected to the flow of the universe?",
    band: "transcendent",
    scaleLabel: "Awareness & Oneness",
    scaleRange: "500-1000",
    scaleColor: "#A78BFA",
  },
];

function getProviderConfig() {
  return {
    provider: process.env.AI_PROVIDER || "openrouter",
    model: process.env.AI_MODEL || "deepseek/deepseek-v4-flash",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  };
}

async function generatePersonalizedPrompts(profile: {
  displayName: string;
  stage: string;
  consciousnessLevel: number;
  recentTopics: string[];
  modalities: string[];
}): Promise<typeof FALLBACK_PROMPTS> {
  const config = getProviderConfig();
  const topics = profile.recentTopics.length > 0
    ? `Recent topics they've explored: ${profile.recentTopics.slice(0, 3).join(", ")}.`
    : "";
  const modalities = profile.modalities.length > 0
    ? `Their spiritual modalities: ${profile.modalities.slice(0, 3).join(", ")}.`
    : "";

  const systemPrompt = `You are Collettive, a compassionate spiritual guide. Generate 4 personalized reflection questions for a user based on their profile. Each question should target a different Hawkins Scale band.

Return ONLY valid JSON — a single array with 4 objects, NO markdown, NO code blocks:
[
  {
    "question": "The question text",
    "band": "lower | transition | upper | transcendent",
    "scaleLabel": "short label for the band",
    "scaleRange": "level range e.g. 1-199",
    "scaleColor": "hex color for the band"
  }
]

Bands and their colors:
- lower (1-199, Transmutation): #FF8C42 — questions about releasing, surrendering, observing pain
- transition (200-349, Willingness & Action): #66BB6A — questions about acceptance, courage, choice
- upper (350-499, Wisdom & Forgiveness): #42A5F5 — questions about lessons, perspective, forgiveness
- transcendent (500-1000, Awareness & Oneness): #A78BFA — questions about connection, love, unity`;

  const userPrompt = `Generate 4 personalized reflection questions for "${profile.displayName}" who is at consciousness level ${profile.consciousnessLevel} (stage: ${profile.stage}). ${topics} ${modalities}
Each question should feel personal and relevant to where they are on their journey.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Collettive Adaptive Prompts",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI error (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  const clean = content.replace(/```json?/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return FALLBACK_PROMPTS;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getTokenUser(request);

    // Authenticated — generate personalized prompts
    if (user) {
      try {
        // Fetch user's profile data
        const [latestRecord, prefs] = await Promise.all([
          prisma.consciousnessRecord.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
          }),
          prisma.userPreferences.findUnique({
            where: { userId: user.id },
          }),
        ]);

        const profile = {
          displayName: user.displayName,
          stage: latestRecord?.stage || "Seeking",
          consciousnessLevel: latestRecord?.stateData
            ? (JSON.parse(latestRecord.stateData) as any)?.avatar?.consciousness_level || 200
            : 200,
          recentTopics: parseJsonArray(prefs?.intentions),
          modalities: parseJsonArray(prefs?.primaryModalities),
        };

        const prompts = await generatePersonalizedPrompts(profile);
        return NextResponse.json({ prompts, source: "personalized" });
      } catch {
        // Fall back to level-based prompts if AI generation fails
        return NextResponse.json({ prompts: FALLBACK_PROMPTS, source: "fallback" });
      }
    }

    // Unauthenticated — return level-based fallback prompts
    return NextResponse.json({ prompts: FALLBACK_PROMPTS, source: "fallback" });
  } catch (err) {
    return NextResponse.json({ prompts: FALLBACK_PROMPTS, source: "fallback" });
  }
}