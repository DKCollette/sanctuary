import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/dreamshare-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const entry = await prisma.dreamShareEntry.findUnique({ where: { id } });
  if (!entry) return error("Experience not found", 404);

  // Check privacy — can't interact with private entries unless you're the author
  if (entry.visibility !== "PUBLIC" && entry.authorId !== user.id) {
    return error("Experience not found", 404);
  }

  try {
    await prisma.dreamShareResonate.create({
      data: { entryId: id, userId: user.id },
    });
    await prisma.dreamShareEntry.update({ where: { id }, data: { resonateCount: { increment: 1 } } });
    return success({ resonated: true }, 201);
  } catch (e: any) {
    if (e.code === "P2002") {
      // Already resonated — toggle off
      await prisma.dreamShareResonate.deleteMany({
        where: { entryId: id, userId: user.id },
      });
      await prisma.dreamShareEntry.update({ where: { id }, data: { resonateCount: { decrement: 1 } } });
      return success({ resonated: false });
    }
    return error("Failed to resonate");
  }
}