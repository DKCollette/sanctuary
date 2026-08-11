import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const replies = await prisma.forumReply.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, displayName: true } },
      _count: { select: { reactions: true } },
      reactions: { select: { type: true, userId: true } },
    },
  });

  return success(replies);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const { body: replyBody, parentId } = body;

  if (!replyBody || replyBody.trim().length === 0) return error("Reply body is required");
  if (replyBody.length > 20000) return error("Reply is too long (max 20,000 characters)");

  // Verify post exists and isn't locked
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return error("Post not found", 404);
  if (post.isLocked) return error("This post is locked and cannot accept new replies");

  // Calculate depth for nesting
  let depth = 0;
  if (parentId) {
    const parent = await prisma.forumReply.findUnique({ where: { id: parentId } });
    if (parent) {
      depth = parent.depth + 1;
      if (depth > 5) return error("Reply nesting limit reached (max 5 levels)");
    }
  }

  const reply = await prisma.forumReply.create({
    data: {
      body: replyBody,
      postId: id,
      authorId: user.id,
      parentId: parentId || null,
      depth,
    },
    include: {
      author: { select: { id: true, displayName: true } },
      _count: { select: { reactions: true } },
    },
  });

  return success(reply, 201);
}