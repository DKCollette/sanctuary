import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const existing = await prisma.forumBookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
  });

  if (existing) {
    await prisma.forumBookmark.delete({ where: { id: existing.id } });
    return success({ bookmarked: false });
  }

  await prisma.forumBookmark.create({ data: { userId: user.id, postId: id } });
  return success({ bookmarked: true });
}