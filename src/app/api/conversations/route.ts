import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session");

    // Also check for logged-in user
    let userId: string | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("sanctuary_token")?.value;
    if (token) {
      const userToken = await prisma.userToken.findUnique({
        where: { token },
        include: { user: { select: { id: true } } },
      });
      if (userToken && userToken.expiresAt > new Date()) {
        userId = userToken.user.id;
      }
    }

    const where: any = {};
    if (session && userId) {
      where.OR = [{ anonymousSessionId: session }, { userId }];
    } else if (session) {
      where.anonymousSessionId = session;
    } else if (userId) {
      where.userId = userId;
    }

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