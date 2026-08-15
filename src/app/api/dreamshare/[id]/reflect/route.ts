import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/dreamshare-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const entry = await prisma.dreamShareEntry.findUnique({ where: { id } });
  if (!entry) return error("Experience not found", 404);

  // Privacy check
  if (entry.visibility !== "PUBLIC" && entry.authorId !== user.id) {
    return error("Experience not found", 404);
  }

  const body = await req.json();
  const { text, parentId } = body;

  if (!text || !text.trim()) return error("Reflection text is required");
  if (text.length > 5000) return error("Reflection is too long (max 5,000 characters)");

  // If parentId is provided, verify it exists and belongs to this entry
  if (parentId) {
    const parent = await prisma.dreamShareReflection.findUnique({ where: { id: parentId } });
    if (!parent || parent.entryId !== id) return error("Parent reflection not found");
  }

  const reflection = await prisma.dreamShareReflection.create({
    data: {
      body: text.trim(),
      entryId: id,
      authorId: user.id,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });

  return success(reflection, 201);
}