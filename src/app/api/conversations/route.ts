import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session");

    const where = session ? { anonymousSessionId: session } : {};

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, selectedMode: true },
      take: 50,
    });

    return NextResponse.json(conversations);
  } catch (err) {
    logger.error("Conversations list error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    await prisma.conversation.delete({ where: { id } });
    logger.info("Conversation deleted", { conversationId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Conversation delete error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}