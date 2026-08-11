import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error, notFound } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Increment view count
  await prisma.forumPost.updateMany({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, displayName: true, createdAt: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
      _count: { select: { replies: true, reactions: true, bookmarks: true, followers: true } },
      reactions: {
        include: { user: { select: { id: true, displayName: true } } },
      },
      replies: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, displayName: true } },
          _count: { select: { reactions: true } },
          reactions: { select: { type: true, userId: true } },
          children: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, displayName: true } },
              _count: { select: { reactions: true } },
              reactions: { select: { type: true, userId: true } },
              children: {
                orderBy: { createdAt: "asc" },
                include: {
                  author: { select: { id: true, displayName: true } },
                  _count: { select: { reactions: true } },
                  reactions: { select: { type: true, userId: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!post) return notFound("Post not found");

  const user = await getAuthUser();
  let isBookmarked = false;
  let isFollowing = false;
  let userReactions: string[] = [];

  if (user) {
    const [bookmark, follow] = await Promise.all([
      prisma.forumBookmark.findUnique({ where: { userId_postId: { userId: user.id, postId: id } } }),
      prisma.forumPostFollower.findUnique({ where: { userId_postId: { userId: user.id, postId: id } } }),
    ]);
    isBookmarked = !!bookmark;
    isFollowing = !!follow;
    userReactions = post.reactions.filter((r) => r.userId === user.id).map((r) => r.type);
  }

  const formatReplies = (replies: any[]): any[] =>
    replies.map((r: any) => ({
      ...r,
      reactionCounts: countReactions(r.reactions),
      children: r.children ? formatReplies(r.children) : [],
    }));

  return success({
    ...post,
    tags: JSON.parse(post.tags),
    reactionCounts: countReactions(post.reactions),
    isBookmarked,
    isFollowing,
    userReactions,
    replies: formatReplies(post.replies),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return notFound();
  if (post.authorId !== user.id) return error("Not authorized", 403);

  const body = await req.json();
  const updateData: any = {};

  if (body.title) updateData.title = body.title;
  if (body.body) updateData.body = body.body;
  if (body.tags) updateData.tags = JSON.stringify(body.tags);
  if (body.realization !== undefined) updateData.realization = body.realization;
  if (body.whatChanged !== undefined) updateData.whatChanged = body.whatChanged;
  if (body.practicingNow !== undefined) updateData.practicingNow = body.practicingNow;

  if (Object.keys(updateData).length === 0) return error("No fields to update");

  const updated = await prisma.forumPost.update({ where: { id }, data: updateData });
  return success({ ...updated, tags: JSON.parse(updated.tags) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return notFound();
  if (post.authorId !== user.id) return error("Not authorized", 403);

  await prisma.forumPost.delete({ where: { id } });
  return success({ deleted: true });
}

function countReactions(reactions: { type: string; userId: string }[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}