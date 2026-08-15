import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error, slugify, ensureSlugUnique } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const {
    conversationId, title, description, body: pathBody,
    selectedMessageIds, reflection, visibility, isAnonymous,
    tags, topics,
  } = body;

  if (!conversationId || !title || !selectedMessageIds?.length) {
    return error("Conversation, title, and selected messages are required");
  }

  if (title.length > 200) return error("Title too long (max 200)");

  // Fetch the conversation and verify ownership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        where: { id: { in: selectedMessageIds } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) return error("Conversation not found", 404);
  if (conversation.userId && conversation.userId !== user.id) {
    return error("Not your conversation", 403);
  }

  // Build path message snapshot
  const pathMessages = conversation.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    milestone: null as string | null,
  }));

  // Create the forum post
  const slug = ensureSlugUnique(slugify(title));
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : []);
  const topicsJson = JSON.stringify(Array.isArray(topics) ? topics.slice(0, 10) : []);

  const pathData = {
    intro: description || "",
    reflection: reflection || "",
    messages: pathMessages,
    sourceConversationId: conversationId,
    conversationDate: conversation.createdAt.toISOString(),
    modelUsed: process.env.AI_MODEL || "Sanctuary Guide",
    topics: Array.isArray(topics) ? topics : [],
  };

  const post = await prisma.forumPost.create({
    data: {
      title: title.trim(),
      body: pathBody || description || title,
      slug,
      postType: "path",
      categoryId: body.categoryId || (await getDefaultCategory()),
      authorId: user.id,
      isAnonymous: !!isAnonymous,
      tags: tagsJson,
      pathData: JSON.stringify(pathData),
    },
    include: {
      author: { select: { id: true, displayName: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
    },
  });

  return success({
    ...post,
    tags: JSON.parse(post.tags),
    pathData: JSON.parse(post.pathData!),
  }, 201);
}

async function getDefaultCategory(): Promise<string> {
  let cat = await prisma.forumCategory.findFirst({ where: { slug: "the-path" } });
  if (!cat) {
    cat = await prisma.forumCategory.findFirst({ orderBy: { sortOrder: "asc" } });
  }
  return cat?.id || "";
}