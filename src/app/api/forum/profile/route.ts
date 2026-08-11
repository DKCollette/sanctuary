import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, parseTags } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const [posts, bookmarks, replies, recognitions, exploring] = await Promise.all([
    prisma.forumPost.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { name: true, icon: true, color: true } },
        _count: { select: { replies: true, reactions: true } },
      },
    }),
    prisma.forumBookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          select: { id: true, title: true, slug: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.forumReply.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        post: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.communityRecognition.findMany({
      where: { userId: user.id },
      include: { awardedBy: { select: { displayName: true } } },
    }),
    prisma.currentlyExploring.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return success({
    user: { id: user.id, displayName: user.displayName, createdAt: user.createdAt, currentStage: user.currentStage },
    posts: posts.map((p) => ({ ...p, tags: parseTags(p.tags) })),
    bookmarks: bookmarks.map((b) => b.post),
    replies,
    recognitions,
    exploring: exploring.map((e) => e.topic),
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();

  // Update currently exploring
  if (body.exploring !== undefined) {
    // Clear existing
    await prisma.currentlyExploring.deleteMany({ where: { userId: user.id } });
    // Add new topics
    if (Array.isArray(body.exploring) && body.exploring.length > 0) {
      await prisma.currentlyExploring.createMany({
        data: body.exploring.map((topic: string) => ({ userId: user.id, topic })),
      });
    }
  }

  // Update bio/display name (via the main profile API)
  if (body.bio !== undefined || body.displayName !== undefined) {
    const updateData: any = {};
    if (body.displayName) updateData.displayName = body.displayName;
    await prisma.user.update({ where: { id: user.id }, data: updateData });
  }

  return success({ updated: true });
}