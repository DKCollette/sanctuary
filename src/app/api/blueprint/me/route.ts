import { NextRequest, NextResponse } from "next/server";
import { getTokenUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bp = await prisma.userBlueprint.findUnique({
      where: { userId: user.id },
    });

    if (!bp) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, blueprint: bp.blueprint, version: bp.version });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load blueprint" }, { status: 500 });
  }
}