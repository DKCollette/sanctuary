import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { messageIndex } = body;

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return error("Path not found", 404);
  if (post.postType !== "path" || !post.pathData) return error("Not a Path", 400);

  const pd = JSON.parse(post.pathData);

  // Check if already walked
  const existing = await prisma.pathWalk.findUnique({
    where: { pathPostId_userId_messageIndex: { pathPostId: id, userId: user.id, messageIndex: messageIndex ?? -1 } },
  });
  if (existing && existing.conversationId) {
    return success({ alreadyWalking: true, conversationId: existing.conversationId });
  }

  // Build context message for the AI
  let contextMessage = "";
  if (messageIndex !== undefined && messageIndex !== null && pd.messages[messageIndex]) {
    const msg = pd.messages[messageIndex];
    contextMessage = `You just read someone's Path exploring "${post.title}". A specific question stood out to you:\n\n"${msg.content}"\n\nWhere does this question show up in your own life?`;
  } else {
    // Full path walk context
    const firstQuestion = pd.messages.find((m: any) => m.role === "user");
    contextMessage = `You just read someone's Path exploring "${post.title}". ${pd.intro ? `They began: "${pd.intro}"` : ""} ${firstQuestion ? `Their journey started with: "${firstQuestion.content}"` : ""}\n\nWhere does this question show up in your own life?`;
  }

  // Create a new private conversation for this user
  const conversation = await prisma.conversation.create({
    data: {
      title: `Walking: ${post.title}`,
      selectedMode: "balanced",
      userId: user.id,
      anonymousSessionId: null,
    },
  });

  // Save context as first user message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: contextMessage,
    },
  });

  // Save or update PathWalk
  if (existing) {
    await prisma.pathWalk.update({
      where: { id: existing.id },
      data: { conversationId: conversation.id },
    });
  } else {
    await prisma.pathWalk.create({
      data: {
        pathPostId: id,
        userId: user.id,
        conversationId: conversation.id,
        messageIndex: messageIndex ?? null,
      },
    });
  }

  return success({
    walked: true,
    conversationId: conversation.id,
    contextMessage,
  }, 201);
}