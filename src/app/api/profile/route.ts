import { NextRequest, NextResponse } from "next/server";
import { getTokenUser } from "@/lib/auth-middleware";
import { updatePreferences, getUserProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getTokenUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    displayName: profile.displayName,
    currentStage: profile.currentStage,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt,
    preferences: profile.preferences
      ? {
          primaryModalities: JSON.parse(profile.preferences.primaryModalities),
          intentions: JSON.parse(profile.preferences.intentions),
          bookmarkedCategories: JSON.parse(profile.preferences.bookmarkedCategories),
          contentDepth: profile.preferences.contentDepth,
          enableTracking: profile.preferences.enableTracking,
        }
      : null,
    consciousnessRecords: profile.consciousnessRecords.map((r) => ({
      stage: r.stage,
      energeticState: r.energeticState,
      sessionSummary: r.sessionSummary,
      milestone: r.milestone,
      stateData: r.stateData ? JSON.parse(r.stateData) : null,
      createdAt: r.createdAt,
    })),
    sessionLogs: profile.sessionLogs.map((s) => ({
      summary: s.summary,
      frequentTopics: JSON.parse(s.frequentTopics),
      messageCount: s.messageCount,
      createdAt: s.createdAt,
    })),
    bookmarkedCategories: profile.bookmarkedCategories.map((b) => b.category),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getTokenUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { primaryModalities, intentions, bookmarkedCategories, contentDepth, enableTracking } = body;

  await updatePreferences(user.id, {
    primaryModalities,
    intentions,
    bookmarkedCategories,
    contentDepth,
    enableTracking,
  });

  return NextResponse.json({ updated: true });
}

export async function POST(request: NextRequest) {
  // Logout — delete the current token
  const token = request.cookies.get("sanctuary_token")?.value;
  if (token) {
    await prisma.userToken.deleteMany({ where: { token } }).catch(() => {});
  }
  const res = NextResponse.json({ loggedOut: true });
  res.cookies.set("sanctuary_token", "", { path: "/", maxAge: 0 });
  return res;
}