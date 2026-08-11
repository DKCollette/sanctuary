import { NextRequest, NextResponse } from "next/server";
import { getNewsFeed, refreshNewsFeed } from "@/lib/news-generator";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getNewsFeed();
    return NextResponse.json({ items, generatedAt: new Date().toISOString() });
  } catch (err) {
    logger.error("News feed error", err);
    return NextResponse.json(
      { error: "Failed to load cosmic news feed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Optional: require a refresh token to prevent abuse
  const body = await request.json().catch(() => ({}));
  const token = body.token;

  if (process.env.NEWS_REFRESH_TOKEN && token !== process.env.NEWS_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await refreshNewsFeed();
    return NextResponse.json({ items, generatedAt: new Date().toISOString() });
  } catch (err) {
    logger.error("News feed refresh error", err);
    return NextResponse.json(
      { error: "Failed to refresh cosmic news feed" },
      { status: 500 }
    );
  }
}