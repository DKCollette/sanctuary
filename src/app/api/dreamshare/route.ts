import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized, success, error, parseJsonArray } from "@/lib/dreamshare-server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const sort = searchParams.get("sort") || "newest";
  const symbol = searchParams.get("symbol");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = (page - 1) * limit;
  const slug = searchParams.get("slug");

  // Single entry by slug (for detail pages)
  if (slug) {
    const entry = await prisma.dreamShareEntry.findFirst({
      where: { id: slug },
      include: {
        author: { select: { id: true, displayName: true, createdAt: true } },
        resonates: { include: { user: { select: { id: true, displayName: true } } }, take: 10 },
        reflections: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, displayName: true } },
            children: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, displayName: true } },
              },
            },
          },
        },
        _count: { select: { resonates: true, reflections: true } },
      },
    });

    if (!entry) return notFound("Experience not found");

    // Check privacy — only author can see private/limited entries
    const user = await getAuthUser();
    if (entry.visibility !== "PUBLIC" && (!user || user.id !== entry.authorId)) {
      return notFound("Experience not found");
    }

    // Increment view count
    await prisma.dreamShareEntry.update({ where: { id: entry.id }, data: { viewCount: { increment: 1 } } });

    let userHasResonated = false;
    if (user) {
      const resonate = await prisma.dreamShareResonate.findUnique({
        where: { entryId_userId: { entryId: entry.id, userId: user.id } },
      });
      userHasResonated = !!resonate;
    }

    return success({
      ...entry,
      emotions: parseJsonArray(entry.emotions),
      symbols: parseJsonArray(entry.symbols),
      resonateCount: entry._count.resonates,
      reflectionCount: entry._count.reflections,
      userHasResonated,
      relates: entry.resonates.map((r) => ({ id: r.userId, displayName: r.user.displayName })),
    });
  }

  // List entries
  const where: any = { visibility: "PUBLIC" };

  if (type) where.experienceType = type;
  if (symbol) {
    // Filter by symbol in JSON string
    where.symbols = { contains: symbol };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "resonated") {
    orderBy = { resonateCount: "desc" };
  } else if (sort === "discussed") {
    orderBy = { reflections: { _count: "desc" } };
  }

  const [entries, total] = await Promise.all([
    prisma.dreamShareEntry.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { resonates: true, reflections: true } },
      },
    }),
    prisma.dreamShareEntry.count({ where }),
  ]);

  return success({
    entries: entries.map((e) => ({
      ...e,
      emotions: parseJsonArray(e.emotions),
      symbols: parseJsonArray(e.symbols),
      resonateCount: e._count.resonates,
      reflectionCount: e._count.reflections,
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
  const {
    title,
    body: entryBody,
    experienceType,
    visibility,
    emotions,
    symbols,
    dateLabel,
    happenedAt,
    isRecurring,
    recurringThemeName,
    authorReflection,
  } = body;

  if (!title || !entryBody) {
    return error("Title and description are required");
  }

  if (title.length > 200) return error("Title is too long (max 200 characters)");
  if (entryBody.length > 50000) return error("Story is too long (max 50,000 characters)");

  const validTypes = ["DREAM", "VISION", "SPIRITUAL_EXPERIENCE", "STORY", "REFLECTION"];
  const validVisibilities = ["PRIVATE", "LIMITED", "PUBLIC"];
  const typeVal = validTypes.includes(experienceType) ? experienceType : "DREAM";
  const visVal = validVisibilities.includes(visibility) ? visibility : "PUBLIC";

  const entry = await prisma.dreamShareEntry.create({
    data: {
      title: title.trim(),
      body: entryBody.trim(),
      experienceType: typeVal,
      visibility: visVal,
      emotions: JSON.stringify(Array.isArray(emotions) ? emotions.slice(0, 10) : []),
      symbols: JSON.stringify(Array.isArray(symbols) ? symbols.slice(0, 20) : []),
      dateLabel: dateLabel || null,
      happenedAt: happenedAt ? new Date(happenedAt) : null,
      isRecurring: !!isRecurring,
      recurringThemeName: recurringThemeName || null,
      authorReflection: authorReflection?.trim() || null,
      authorId: user.id,
    },
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });

  return success({
    ...entry,
    emotions: parseJsonArray(entry.emotions),
    symbols: parseJsonArray(entry.symbols),
  }, 201);
}