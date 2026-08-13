import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenUser } from "@/lib/auth-middleware";
import { recordConsciousnessReading } from "@/lib/profile";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Phase labels for immersive progress display
const PHASE_LABELS: Record<string, string> = {
  quick: "Tuning into your present moment",
  balanced: "Exploring your inner landscape",
  deep: "Journeying into the depths of your being",
};

const PHASE_TOPICS: Record<string, string[]> = {
  quick: ["emotional state", "current mindset", "inner balance"],
  balanced: [
    "emotional landscape",
    "relationships & connection",
    "purpose & meaning",
    "patterns & beliefs",
    "strengths & growth",
    "daily habits & practices",
    "inner wisdom",
  ],
  deep: [
    "emotional landscape",
    "relationships & attachment",
    "purpose & meaning",
    "limiting beliefs & patterns",
    "shadow & inner child",
    "values & authenticity",
    "ego & true self",
    "spiritual archetypes",
    "motivations & drivers",
    "decision-making",
    "triggers & responses",
    "consciousness journey",
    "integration & roadmap",
  ],
};

const MAX_QUESTIONS: Record<string, number> = { quick: 8, balanced: 25, deep: 60 };

const TIER_NAMES: Record<string, string> = {
  quick: "Quick Reflection",
  balanced: "Balanced Journey",
  deep: "Deep Discovery",
};

// Get the AI provider config
function getProviderConfig() {
  return {
    provider: process.env.AI_PROVIDER || "openrouter",
    model: process.env.AI_MODEL || "deepseek/deepseek-v4-flash",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  };
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = getProviderConfig();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Sanctuary Assessment",
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
    throw new Error(`AI provider error (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Start a new assessment
export async function POST(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;

    if (!["quick", "balanced", "deep"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Generate the first question using AI
    const systemPrompt = `You are Sanctuary, a compassionate guide for a daily reflection practice called "${TIER_NAMES[tier]}".
Generate a single, warm, open-ended question to begin today's session. The question should feel like a gentle invitation into self-reflection, not an interrogation.
Keep it to one sentence. Do not include any labels, numbers, or markdown — just the question text.`;

    const firstQuestion = await callAI(systemPrompt,
      `Begin a ${TIER_NAMES[tier]} session. The user is returning for daily reflection. Ask a gentle opening question that invites them to check in with their present moment.`
    );

    // Create assessment in DB
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        tier,
        status: "in_progress",
        currentPhase: 0,
        conversation: JSON.stringify([
          { question: firstQuestion, answer: null, phase: 0 },
        ]),
      },
    });

    return NextResponse.json({
      id: assessment.id,
      tier,
      question: firstQuestion,
      phase: 0,
      phaseLabel: PHASE_TOPICS[tier][0] || "your inner world",
      totalQuestions: MAX_QUESTIONS[tier],
      progress: 0,
    });
  } catch (err) {
    logger.error("Assessment start error", err);
    return NextResponse.json({ error: "Could not start assessment" }, { status: 500 });
  }
}

// Submit an answer and get the next question
export async function PUT(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, answer } = body;

    if (!assessmentId || !answer) {
      return NextResponse.json({ error: "Assessment ID and answer required" }, { status: 400 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.userId !== user.id) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if (assessment.status === "completed") {
      return NextResponse.json({ error: "Assessment already completed" }, { status: 400 });
    }

    const conversation = JSON.parse(assessment.conversation);
    const tier = assessment.tier;
    const maxQ = MAX_QUESTIONS[tier];
    const topics = PHASE_TOPICS[tier];
    const currentQ = conversation.length;

    // Store the answer in the last unanswered question
    const lastIdx = conversation.length - 1;
    if (lastIdx >= 0 && conversation[lastIdx].answer === null) {
      conversation[lastIdx].answer = answer;
    }

    // Check if we've reached the max questions
    if (currentQ >= maxQ) {
      // Generate final results
      const results = await generateResults(user.displayName, conversation, tier);

      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "completed",
          completedAt: new Date(),
          conversation: JSON.stringify(conversation),
          results: JSON.stringify(results),
          currentPhase: topics.length - 1,
        },
      });

      // Save consciousness reading to profile timeline
      try {
        const cl = results?.consciousness_level || 200;
        const tierLabel = results?.tier_label || "The Seeker";
        const stage = cl <= 50 ? "Seeking" : cl <= 175 ? "Seeking" : cl <= 310 ? "Awakening" : cl <= 400 ? "Grounding" : cl <= 540 ? "Integrating" : "Aligning";
        await recordConsciousnessReading(user.id, {
          stage,
          energeticState: results?.emotional_patterns || "Completed a guided reflection session",
          sessionSummary: `Guided Reflection (${TIER_NAMES[tier]})`,
          milestone: results?.affirmation ? `✨ ${results.affirmation}` : undefined,
          stateData: {
            avatar: {
              tier: tierLabel,
              consciousness_level: cl,
              xp_gained: 30,
              current_element: "Ether",
              aura_color: "#8B5CF6",
            },
            chakras: [],
            reflection_prompt: results?.reflection_prompt || "",
            reflectionResults: {
              current_state: results?.current_state || "",
              strengths: results?.strengths || [],
              growth_areas: results?.growth_areas || [],
              dominant_emotions: results?.dominant_emotions || [],
              emotional_patterns: results?.emotional_patterns || "",
              purpose_alignment: results?.purpose_alignment || "",
              practices: results?.practices || [],
              suggested_action: results?.suggested_action || "",
              affirmation: results?.affirmation || "",
              consciousness_estimate: results?.consciousness_estimate || "",
            },
          },
        });
      } catch (err) {
        logger.warn("Failed to save consciousness reading from assessment", err);
      }

      return NextResponse.json({
        done: true,
        results,
        tier,
      });
    }

    // Determine which phase we're in
    const phase = Math.min(Math.floor((currentQ / maxQ) * topics.length), topics.length - 1);
    const topic = topics[phase];

    // Generate next question using AI, adapting based on previous answers
    const recentAnswers = conversation.slice(-3).map((c: any) => c.answer).filter(Boolean);
    const context = recentAnswers.length > 0
      ? `The user recently shared: "${recentAnswers.join('", "')}".`
      : "";

    const systemPrompt = `You are Sanctuary, a compassionate spiritual guide. You are conducting a ${TIER_NAMES[tier]} assessment.
Generate ONE warm, open-ended follow-up question exploring the theme of "${topic}".
The question should feel like a natural conversation, not a survey. Use the context of their previous answers to make it feel personal.
Keep it to 1-2 sentences. Do not include labels, numbers, emoji, or markdown — just the question text.`;

    const nextQuestion = await callAI(systemPrompt,
      `${context} Ask a question about "${topic}" that feels like a gentle next step in our conversation.`
    );

    conversation.push({ question: nextQuestion, answer: null, phase });

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        conversation: JSON.stringify(conversation),
        currentPhase: phase,
      },
    });

    return NextResponse.json({
      done: false,
      question: nextQuestion,
      phase,
      phaseLabel: topic,
      progress: currentQ / maxQ,
      questionNumber: currentQ + 1,
      totalQuestions: maxQ,
    });
  } catch (err) {
    logger.error("Assessment answer error", err);
    return NextResponse.json({ error: "Could not process answer" }, { status: 500 });
  }
}

// Get assessment results
export async function GET(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const assessment = await prisma.assessment.findUnique({ where: { id } });
      if (!assessment || assessment.userId !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: assessment.id,
        tier: assessment.tier,
        status: assessment.status,
        createdAt: assessment.createdAt,
        completedAt: assessment.completedAt,
        conversation: JSON.parse(assessment.conversation),
        results: assessment.results ? JSON.parse(assessment.results) : null,
      });
    }

    // List all assessments for this user
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, tier: true, status: true, createdAt: true, completedAt: true },
    });

    return NextResponse.json({ assessments });
  } catch (err) {
    logger.error("Assessment fetch error", err);
    return NextResponse.json({ error: "Could not fetch assessments" }, { status: 500 });
  }
}

async function generateResults(displayName: string, conversation: any[], tier: string) {
  const config = getProviderConfig();
  const qaSummary = conversation
    .map((c: any, i: number) => `Q${i + 1}: ${c.question}\nA: ${c.answer || "(skipped)"}`)
    .join("\n\n");

  const systemPrompt = `You are Sanctuary, a compassionate spiritual guide. Analyze the user's assessment responses and provide a gentle, insightful reflection.

IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code fences, no extra text.`;

  const userPrompt = `The user "${displayName}" completed a ${TIER_NAMES[tier]} assessment. Here is their conversation:

${qaSummary}

Generate a JSON object with these fields:
{
  "consciousness_level": number (1-1000, based on Hawkins Scale),
  "tier_label": "string (e.g. 'The Seeker', 'The Awakening', 'The Radiant')",
  "dominant_emotions": ["string"],
  "current_state": "string (2-3 sentences about their current state)",
  "strengths": ["string"],
  "growth_areas": ["string"],
  "emotional_patterns": "string (1-2 sentences)",
  "purpose_alignment": "string (1-2 sentences)",
  "affirmation": "string (one personalized affirmation)",
  "suggested_action": "string (one concrete action for today)",
  "reflection_prompt": "string (one deep question to sit with)",
  "practices": ["string (3-5 recommended practices)"],
  "consciousness_estimate": "string (1-2 sentences about their consciousness journey)"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Sanctuary Assessment Results",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`AI error: ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  // Strip any markdown fences the AI might add
  const clean = content.replace(/```json?/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return {
      consciousness_level: 200,
      tier_label: "The Seeker",
      dominant_emotions: ["reflective", "curious"],
      current_state: "You are in a period of gentle self-discovery.",
      strengths: ["self-awareness", "courage to explore"],
      growth_areas: ["deepening self-trust"],
      emotional_patterns: "You are open and reflective.",
      purpose_alignment: "You are exploring your deeper purpose.",
      affirmation: "You are exactly where you need to be.",
      suggested_action: "Take a quiet moment to journal your thoughts.",
      reflection_prompt: "What would it feel like to trust yourself more deeply?",
      practices: ["Morning journaling", "Quiet reflection"],
      consciousness_estimate: "You are on the path of awakening.",
    };
  }
}