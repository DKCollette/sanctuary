import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify auth
    const cookieStore = await cookies();
    const token = cookieStore.get("sanctuary_token")?.value;
    let userId: string | null = null;
    if (token) {
      const userToken = await prisma.userToken.findUnique({
        where: { token },
        include: { user: { select: { id: true } } },
      });
      if (userToken && userToken.expiresAt > new Date()) {
        userId = userToken.user.id;
      }
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check ownership
    if (conversation.userId && conversation.userId !== userId) {
      return NextResponse.json({ error: "Not your conversation" }, { status: 403 });
    }

    return NextResponse.json(conversation.messages);
  } catch (err) {
    logger.error("Conversation messages error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}