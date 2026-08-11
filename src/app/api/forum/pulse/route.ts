import { prisma } from "@/lib/prisma";
import { success, parseTags } from "@/lib/forum-utils";

export async function GET() {
  // Get posts grouped by tag/keyword to build the community pulse
  const recentPosts = await prisma.forumPost.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { tags: true, categoryId: true },
  });

  // Count tag occurrences
  const tagCounts: Record<string, number> = {};
  for (const post of recentPosts) {
    const tags = parseTags(post.tags);
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Also count by category topics
  const categories = await prisma.forumCategory.findMany();
  const categoryCount: Record<string, number> = {};
  for (const post of recentPosts) {
    const cat = categories.find((c) => c.id === post.categoryId);
    if (cat) {
      categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
    }
  }

  // Build pulse data
  const pulse = [
    ...Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count })),
    ...Object.entries(tagCounts)
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .filter((item) => !categoryCount[item.name]),
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return success(pulse);
}