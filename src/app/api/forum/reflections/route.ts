import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let reflection = await prisma.dailyReflection.findUnique({
    where: { date: today },
    include: {
      responses: {
        where: { isPrivate: false },
        select: { id: true, content: true, createdAt: true, userId: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!reflection) {
    // Get the latest reflection
    reflection = await prisma.dailyReflection.findFirst({
      where: { isActive: true },
      orderBy: { date: "desc" },
      include: {
        responses: {
          where: { isPrivate: false },
          select: { id: true, content: true, createdAt: true, userId: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!reflection) return success({ prompt: "Take a moment to breathe and be present.", responses: [] });

  return success(reflection);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  const body = await req.json();
  const { content, isPrivate, reflectionId } = body;

  if (!content || !reflectionId) return error("Content and reflection ID are required");

  const reflection = await prisma.dailyReflection.findUnique({ where: { id: reflectionId } });
  if (!reflection) return error("Reflection not found");

  const response = await prisma.reflectionResponse.create({
    data: {
      reflectionId,
      userId: user?.id || null,
      content,
      isPrivate: isPrivate !== false,
    },
  });

  return success(response, 201);
}