import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error, notFound, parseJsonArray } from "@/lib/dreamshare-server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();

  const entry = await prisma.dreamShareEntry.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, displayName: true, createdAt: true } },
      resonates: { include: { user: { select: { id: true, displayName: true } } }, take: 10 },
      reflections: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, displayName: true } },
          children: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, displayName: true } } },
          },
        },
      },
      _count: { select: { resonates: true, reflections: true } },
    },
  });

  if (!entry) return notFound("Experience not found");

  // Privacy check
  if (entry.visibility !== "PUBLIC" && (!user || user.id !== entry.authorId)) {
    return notFound("Experience not found");
  }

  let userHasResonated = false;
  if (user) {
    const resonate = await prisma.dreamShareResonate.findUnique({
      where: { entryId_userId: { entryId: entry.id, userId: user.id } },
    });
    userHasResonated = !!resonate;
  }

  return success({
    ...entry,
    emotions: parseJsonArray(entry.emotions),
    symbols: parseJsonArray(entry.symbols),
    resonateCount: entry._count.resonates,
    reflectionCount: entry._count.reflections,
    userHasResonated,
    relates: entry.resonates.map((r) => ({ id: r.userId, displayName: r.user.displayName })),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const entry = await prisma.dreamShareEntry.findUnique({ where: { id } });
  if (!entry) return notFound("Experience not found");
  if (entry.authorId !== user.id) return error("Not authorized", 403);

  await prisma.dreamShareEntry.delete({ where: { id } });
  return success({ deleted: true });
}