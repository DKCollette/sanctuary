import { NextRequest, NextResponse } from "next/server";
import { getTokenUser } from "@/lib/auth-middleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getTokenUser(request);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      currentStage: user.currentStage,
      createdAt: user.createdAt,
    },
  });
}