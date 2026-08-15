import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { selectedOption } = body;

  if (!selectedOption) return error("Selected option is required");

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return error("Post not found", 404);
  if (!post.pollOptions) return error("This post is not a poll", 400);

  const pollOpts = JSON.parse(post.pollOptions);
  const validIds = pollOpts.map((o: any) => o.id);
  if (!validIds.includes(selectedOption)) return error("Invalid option", 400);

  if (post.pollConfig) {
    const cfg = JSON.parse(post.pollConfig);
    if (cfg.isClosed) return error("Voting is closed", 403);
  }

  // Check for existing vote
  const existing = await prisma.forumPollVote.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
  });

  const pollCfg = post.pollConfig ? JSON.parse(post.pollConfig) : {};
  const allowChange = pollCfg.allowChangeVote !== false;

  if (existing && !allowChange) return error("You cannot change your vote", 403);

  try {
    if (existing) {
      // Update existing vote
      const prevOption = existing.selectedOption;
      await prisma.forumPollVote.update({
        where: { id: existing.id },
        data: { selectedOption },
      });
      return success({ voted: true, changed: prevOption !== selectedOption, selectedOption });
    } else {
      // Create new vote
      await prisma.forumPollVote.create({
        data: { postId: id, userId: user.id, selectedOption },
      });
      await prisma.forumPost.update({
        where: { id },
        data: { pollVoteCount: { increment: 1 } },
      });
      return success({ voted: true, changed: false, selectedOption }, 201);
    }
  } catch (e: any) {
    if (e.code === "P2002") {
      return error("Already voted");
    }
    return error("Failed to cast vote");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const existing = await prisma.forumPollVote.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
  });
  if (!existing) return error("No vote to remove", 404);

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return error("Post not found", 404);

  const pollCfg = post.pollConfig ? JSON.parse(post.pollConfig) : {};
  if (pollCfg.isClosed) return error("Voting is closed", 403);

  await prisma.forumPollVote.delete({ where: { id: existing.id } });
  await prisma.forumPost.update({
    where: { id },
    data: { pollVoteCount: { decrement: 1 } },
  });
  return success({ removed: true });
}