import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getAdminCredentials } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkAuth(request: NextRequest): Promise<boolean> {
  const { username, password } = await getAdminCredentials();

  // Check cookie first
  const cookie = request.cookies.get("admin_token")?.value;
  if (cookie) {
    try {
      const decoded = atob(cookie);
      if (decoded === password) return true;
    } catch {}
  }

  // Check basic auth header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(6));
      const [user, pass] = decoded.split(":");
      if (user === username && pass === password) return true;
    } catch {}
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json(
      { error: "Authentication required" },
      {
        status: 401,
        headers: { "WWW-Authenticate": `Basic realm="Sanctuary Admin"` },
      }
    );
  }

  try {
    const [conversationCount, messageCount, feedbackCount, positiveCount, recentErrors] =
      await Promise.all([
        prisma.conversation.count(),
        prisma.message.count(),
        prisma.feedback.count(),
        prisma.feedback.count({ where: { rating: 1 } }),
        prisma.siteError.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      ]);

    const negativeCount = feedbackCount - positiveCount;

    // Average latency
    const latencyResult = await prisma.message.aggregate({
      _avg: { responseLatency: true },
      where: { role: "assistant" },
    });

    // Token usage
    const tokenResult = await prisma.message.aggregate({
      _sum: { tokenUsage: true },
    });

    // Model and mode usage
    const conversations = await prisma.conversation.findMany({
      select: { selectedMode: true },
    });
    const messages = await prisma.message.findMany({
      where: { role: "assistant" },
      select: { model: true },
    });

    const modeUsage: Record<string, number> = {};
    conversations.forEach((c) => {
      modeUsage[c.selectedMode] = (modeUsage[c.selectedMode] || 0) + 1;
    });

    const modelUsage: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.model) modelUsage[m.model] = (modelUsage[m.model] || 0) + 1;
    });

    return NextResponse.json({
      conversationCount,
      messageCount,
      feedbackCount,
      positiveFeedback: positiveCount,
      negativeFeedback: negativeCount,
      averageLatency: Math.round(latencyResult._avg.responseLatency || 0),
      tokenUsage: tokenResult._sum.tokenUsage || 0,
      modelUsage,
      modeUsage,
      recentErrors: recentErrors.map((e) => ({
        id: e.id,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error("Admin stats error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}