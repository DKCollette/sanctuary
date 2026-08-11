import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { messageId, rating, comment } = parsed.data;

    // Check message exists
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Upsert feedback
    await prisma.feedback.upsert({
      where: { id: `fb-${messageId}` },
      update: { rating: rating === "up" ? 1 : -1, comment },
      create: {
        id: `fb-${messageId}`,
        messageId,
        rating: rating === "up" ? 1 : -1,
        comment,
      },
    });

    // Update message feedback rating
    await prisma.message.update({
      where: { id: messageId },
      data: { feedbackRating: rating === "up" ? 1 : -1 },
    });

    logger.info("Feedback recorded", { messageId, rating });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Feedback API error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}