import { prisma } from "@/lib/prisma";
import { success } from "@/lib/forum-utils";

export async function GET() {
  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return success(categories);
}