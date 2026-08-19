import { NextRequest, NextResponse } from "next/server";
import { getTokenUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { computeTransits } from "@/lib/transit-engine";
import { generateSanctuaryResponse as generateAIResponse } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/insights/today — returns today's insight for the logged-in user.
 * If no insight exists yet, returns the transit data so the UI can show it.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bp = await prisma.userBlueprint.findUnique({ where: { userId: user.id } });
    if (!bp) {
      return NextResponse.json({ exists: false, error: "No blueprint yet" });
    }

    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    // Check if insight already exists for today
    const existing = await prisma.dailyInsight.findUnique({
      where: { userId_date: { userId: user.id, date: todayDate } },
    });

    if (existing) {
      return NextResponse.json({ exists: true, insight: existing.insight, source: existing.source });
    }

    // Compute transits and return them
    const transits = await computeTransits(bp.blueprint as any);
    return NextResponse.json({
      exists: false,
      transits,
      message: "No insight yet. Trigger generation at /api/insights/generate",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch insight" }, { status: 500 });
  }
}

/**
 * POST /api/insights/today — generates and stores today's insight using LLM.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bp = await prisma.userBlueprint.findUnique({ where: { userId: user.id } });
    if (!bp) {
      return NextResponse.json({ error: "No blueprint found" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    // Check if already generated today
    const existing = await prisma.dailyInsight.findUnique({
      where: { userId_date: { userId: user.id, date: todayDate } },
    });
    if (existing) {
      return NextResponse.json({ exists: true, insight: existing.insight });
    }

    const blueprint = bp.blueprint as any;
    const transits = await computeTransits(blueprint);

    // Build the LLM prompt
    const prompt = `Generate a daily insight for a Collettive user.

## User's Energetic Blueprint
- Human Design Type: ${blueprint.humanDesign.type}
- Strategy: ${blueprint.humanDesign.strategy}
- Authority: ${blueprint.humanDesign.authority}
- Profile: ${blueprint.humanDesign.profile}
- Life Path: ${blueprint.numerology.lifePath}

## Today's Transit Activations
Personal Day Number: ${transits.personalDayNumber}
${transits.raw}

## Requirements
Write 2-3 sentences of actionable, poetic wisdom.
Reference the specific gate or transit being activated if relevant.
Tie it to the user's Human Design type and authority.
Warm, precise, spiritually grounded — not generic.
End with a single-line practice or question.`;

    // Generate via AI
    const aiResponse = await generateAIResponse([
      { role: "system", content: "You are a spiritual guide generating personalized daily insights based on Human Design, astrology, and numerology." },
      { role: "user", content: prompt },
    ], "balanced", "", { maxTokens: 300 });

    // Store in database
    await prisma.dailyInsight.create({
      data: {
        userId: user.id,
        date: todayDate,
        insight: aiResponse.content,
        source: "blended",
      },
    });

    return NextResponse.json({ exists: true, insight: aiResponse.content });
  } catch (err: any) {
    console.error("Insight generation error:", err);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}