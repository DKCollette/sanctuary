import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET() {
  const groups = await prisma.studyGroup.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      creator: { select: { id: true, displayName: true } },
      _count: { select: { members: true } },
    },
  });

  return success(groups);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { name, description, focus, focusItem, maxMembers } = body;

  if (!name || !description || !focus || !focusItem) {
    return error("Name, description, focus, and focus item are required");
  }

  const group = await prisma.studyGroup.create({
    data: {
      name,
      description,
      focus,
      focusItem,
      createdById: user.id,
      maxMembers: maxMembers || 50,
    },
  });

  // Auto-join the creator as creator-role member
  await prisma.studyGroupMember.create({
    data: { groupId: group.id, userId: user.id, role: "creator" },
  });

  return success(group, 201);
}