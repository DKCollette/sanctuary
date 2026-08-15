import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error, notFound, slugify, ensureSlugUnique } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const sort = searchParams.get("sort") || "latest";
  const type = searchParams.get("type");
  const tag = searchParams.get("tag");
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = (page - 1) * limit;

  const where: any = {};

  // Lookup by slug — returns a single post directly with full detail
  if (slug) {
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, displayName: true, createdAt: true } },
        category: { select: { slug: true, name: true, icon: true, color: true } },
        _count: { select: { replies: true, reactions: true, bookmarks: true, followers: true } },
        reactions: { include: { user: { select: { id: true, displayName: true } } } },
        replies: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, displayName: true } },
            _count: { select: { reactions: true } },
            reactions: { select: { type: true, userId: true } },
            children: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, displayName: true } },
                _count: { select: { reactions: true } },
                reactions: { select: { type: true, userId: true } },
                children: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    author: { select: { id: true, displayName: true } },
                    _count: { select: { reactions: true } },
                    reactions: { select: { type: true, userId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!post) return notFound("Post not found");

    // Check user-specific state
    const user = await getAuthUser();
    let isBookmarked = false;
    let isFollowing = false;
    let userReactions: string[] = [];
    if (user) {
      const [bookmark, follow] = await Promise.all([
        prisma.forumBookmark.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } } }),
        prisma.forumPostFollower.findUnique({ where: { userId_postId: { userId: user.id, postId: post.id } } }),
      ]);
      isBookmarked = !!bookmark;
      isFollowing = !!follow;
      userReactions = post.reactions.filter((r) => r.userId === user.id).map((r) => r.type);
    }

    const formatReplies = (replies: any[]): any[] =>
      replies.map((r: any) => ({
        ...r,
        reactionCounts: countReactions(r.reactions),
        children: r.children ? formatReplies(r.children) : [],
      }));

    return success({
      ...post,
      tags: JSON.parse(post.tags),
      reactionCounts: countReactions(post.reactions),
      isBookmarked,
      isFollowing,
      userReactions,
      replies: formatReplies(post.replies),
      pollOptions: post.pollOptions ? JSON.parse(post.pollOptions) : null,
      pollConfig: post.pollConfig ? JSON.parse(post.pollConfig) : null,
      pollResults: post.pollOptions ? await getPollResults(post.id, user?.id) : null,
    });
  }

  if (categorySlug) {
    const category = await prisma.forumCategory.findUnique({ where: { slug: categorySlug } });
    if (category) where.categoryId = category.id;
  }

  if (type) where.postType = type;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "resonated") {
    orderBy = { reactions: { _count: "desc" } };
  } else if (sort === "views") {
    orderBy = { viewCount: "desc" };
  } else if (sort === "replies") {
    orderBy = { replies: { _count: "desc" } };
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { slug: true, name: true, icon: true, color: true } },
        _count: { select: { replies: true, reactions: true, bookmarks: true } },
        reactions: {
          select: { type: true, userId: true },
          take: 20,
        },
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  return success({
    posts: posts.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags),
      reactionCounts: countReactions(p.reactions),
      pollOptions: p.pollOptions ? JSON.parse(p.pollOptions) : null,
      pollConfig: p.pollConfig ? JSON.parse(p.pollConfig) : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { title, body: postBody, postType, categoryId, tags, isAnonymous, realization, whatChanged, practicingNow, pollOptions, pollConfig } = body;

  if (!title || !postBody || !categoryId) {
    return error("Title, body, and category are required");
  }

  if (title.length > 200) return error("Title is too long (max 200 characters)");
  if (postBody.length > 50000) return error("Body is too long (max 50,000 characters)");

  const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
  if (!category) return error("Category not found");

  const validTypes = ["question", "reflection", "experience", "teaching", "discussion", "journal", "resource", "poll", "would-you-rather"];
  const postTypeVal = validTypes.includes(postType) ? postType : "reflection";

  // Validate poll data
  if (["poll", "would-you-rather"].includes(postTypeVal) && !Array.isArray(pollOptions)) {
    return error("Poll options are required for poll posts");
  }
  if (Array.isArray(pollOptions) && pollOptions.length < 2) {
    return error("At least 2 poll options are required");
  }
  if (Array.isArray(pollOptions) && pollOptions.length > 10) {
    return error("Maximum 10 poll options");
  }

  const slug = ensureSlugUnique(slugify(title));
  const tagsJson = JSON.stringify(Array.isArray(tags) ? tags.slice(0, 10) : []);

  const post = await prisma.forumPost.create({
    data: {
      title,
      body: postBody,
      slug,
      postType: postTypeVal,
      categoryId,
      authorId: user.id,
      isAnonymous: !!isAnonymous,
      tags: tagsJson,
      realization,
      whatChanged,
      practicingNow,
      pollOptions: Array.isArray(pollOptions) ? JSON.stringify(pollOptions) : undefined,
      pollConfig: pollConfig ? JSON.stringify(pollConfig) : undefined,
    },
    include: {
      author: { select: { id: true, displayName: true } },
      category: { select: { slug: true, name: true, icon: true, color: true } },
    },
  });

  return success({ ...post, tags: JSON.parse(post.tags) }, 201);
}

function countReactions(reactions: { type: string; userId: string }[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}

async function getPollResults(postId: string, currentUserId?: string | null) {
  const votes = await prisma.forumPollVote.findMany({ where: { postId } });
  const total = votes.length;
  const optionCounts: Record<string, number> = {};
  for (const v of votes) {
    optionCounts[v.selectedOption] = (optionCounts[v.selectedOption] || 0) + 1;
  }
  const userVote = currentUserId
    ? votes.find((v) => v.userId === currentUserId)?.selectedOption || null
    : null;
  return { total, optionCounts, userVote };
}