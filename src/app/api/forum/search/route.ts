import { prisma } from "@/lib/prisma";
import { success, parseTags } from "@/lib/forum-utils";
import { NextRequest } from "next/server";

const topicKeywords: Record<string, string[]> = {
  validation: ["validation", "approval", "self-worth", "worth", "acceptance", "external", "seeking approval"],
  attachment: ["attachment", "letting go", "detachment", "cling", "dependency", "codependency"],
  ego: ["ego", "self-importance", "identity", "self-concept", "separate self"],
  surrender: ["surrender", "letting go", "release", "surrender control", "trust", "flow"],
  presence: ["presence", "mindfulness", "now", "moment", "being present", "awareness"],
  meditation: ["meditation", "meditate", "stillness", "silence", "mindful breath"],
  purpose: ["purpose", "meaning", "calling", "mission", "why am i here", "direction"],
  peace: ["peace", "inner peace", "calm", "stillness", "tranquility", "serenity"],
  shadow: ["shadow", "shadow work", "darkness", "unconscious", "dark side"],
  awakening: ["awakening", "enlightenment", "spiritual awakening", "awake", "consciousness shift"],
  self: ["self", "self-awareness", "self-love", "self-compassion", "self-care"],
  healing: ["healing", "trauma", "recovery", "inner child", "wounded", "grief", "pain"],
  love: ["love", "compassion", "kindness", "heart", "unconditional"],
  god: ["god", "source", "divine", "universe", "creator", "higher power", "spirit"],
  death: ["death", "dying", "afterlife", "mortality", "end of life"],
  forgiveness: ["forgiveness", "forgive", "letting go of resentment", "grudge"],
  gratitude: ["gratitude", "thankful", "appreciation", "blessing"],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const categorySlug = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = (page - 1) * limit;

  if (!q && !categorySlug) {
    // Return trending topics
    const trending = await prisma.forumPost.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const categories = await prisma.forumCategory.findMany({
      where: { id: { in: trending.map((t) => t.categoryId) } },
    });

    const topicData = trending.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return { name: cat?.name || "Unknown", count: t._count.id };
    });

    return success({ trending: topicData });
  }

  // Build keyword-driven search
  const foundKeywords = Object.entries(topicKeywords).filter(([_, keywords]) =>
    keywords.some((kw) => q.includes(kw))
  );
  const relevantTags = foundKeywords.map(([tag]) => tag);

  // Full-text search on title and body
  const searchTerms = q.split(/\s+/).filter((t) => t.length > 1);

  let where: any = {};

  if (categorySlug) {
    const category = await prisma.forumCategory.findUnique({ where: { slug: categorySlug } });
    if (category) where.categoryId = category.id;
  }

  if (searchTerms.length > 0) {
    where.OR = [
      ...searchTerms.map((term) => ({ title: { contains: term } })),
      ...searchTerms.map((term) => ({ body: { contains: term } })),
      ...(relevantTags.length > 0
        ? relevantTags.map((tag) => ({ tags: { contains: tag } }))
        : []),
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      skip: offset,
      take: limit,
      include: {
        author: { select: { id: true, displayName: true } },
        category: { select: { slug: true, name: true, icon: true, color: true } },
        _count: { select: { replies: true, reactions: true, bookmarks: true } },
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  const suggested = foundKeywords.map(([tag]) => tag);

  return success({
    query: q,
    posts: posts.map((p) => ({ ...p, tags: parseTags(p.tags) })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    suggestedTopics: suggested,
  });
}