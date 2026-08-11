import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, passcode, modalities } = body;

    if (!displayName || displayName.length < 2 || displayName.length > 30) {
      return NextResponse.json(
        { error: "Display name must be 2-30 characters" },
        { status: 400 }
      );
    }
    if (!passcode || passcode.length < 4) {
      return NextResponse.json(
        { error: "Passcode must be at least 4 characters" },
        { status: 400 }
      );
    }

    const result = await registerUser(displayName, passcode, modalities);
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
    if (err.message === "Display name already taken") {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}