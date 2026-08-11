import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const { reason, description, replyId } = body;

  if (!reason) return error("A reason is required");

  const report = await prisma.forumReport.create({
    data: {
      reason,
      description: description || null,
      postId: replyId ? undefined : id,
      replyId: replyId || undefined,
      reporterId: user.id,
    },
  });

  return success(report, 201);
}