import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, passcode } = body;

    if (!displayName || !passcode) {
      return NextResponse.json(
        { error: "Display name and passcode are required" },
        { status: 400 }
      );
    }

    const result = await loginUser(displayName, passcode);
    const res = NextResponse.json({
      user: { id: result.userId, displayName: result.displayName },
      token: result.token,
    });
    res.cookies.set("sanctuary_token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (err: any) {
    if (err.message === "Invalid display name or passcode") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}