import { NextRequest, NextResponse } from "next/server";
import { changePasscode } from "@/lib/profile";
import { getUserIdFromToken } from "@/lib/auth-middleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPasscode, newPasscode } = body;

    if (!currentPasscode || !newPasscode) {
      return NextResponse.json(
        { error: "Current passcode and new passcode are required" },
        { status: 400 }
      );
    }

    await changePasscode(userId, currentPasscode, newPasscode);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Current passcode is incorrect") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err.message === "New passcode must be at least 4 characters") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to change passcode" }, { status: 500 });
  }
}