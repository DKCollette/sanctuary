import { NextRequest, NextResponse } from "next/server";
import { getNewsFeed } from "@/lib/news-generator";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const feed = await getNewsFeed();
    return NextResponse.json({ feed });
  } catch (err) {
    logger.error("Pulse feed fetch error", err);
    return NextResponse.json({ error: "Could not load feed" }, { status: 500 });
  }
}