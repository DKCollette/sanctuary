import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const { type, replyId } = body;

  const validTypes = ["resonates", "insightful", "growth", "gratitude", "reflecting"];
  if (!validTypes.includes(type)) return error("Invalid reaction type");

  if (!replyId && !id) return error("Must specify either a post or reply to react to");

  try {
    const reaction = await prisma.forumReaction.create({
      data: {
        type,
        postId: replyId ? undefined : id,
        replyId: replyId || undefined,
        userId: user.id,
      },
    });
    return success(reaction, 201);
  } catch (e: any) {
    if (e.code === "P2002") {
      // Already exists - toggle it off
      await prisma.forumReaction.deleteMany({
        where: {
          type,
          userId: user.id,
          postId: replyId ? undefined : id,
          replyId: replyId || undefined,
        },
      });
      return success({ removed: true });
    }
    return error("Failed to add reaction");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const replyId = searchParams.get("replyId");

  if (!type) return error("Reaction type is required");

  const where: any = { type, userId: user.id };
  if (replyId) {
    where.replyId = replyId;
  } else {
    where.postId = id;
  }

  await prisma.forumReaction.deleteMany({ where });
  return success({ removed: true });
}