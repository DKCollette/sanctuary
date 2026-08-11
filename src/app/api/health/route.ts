import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    uptime: process.uptime(),
    provider: process.env.AI_PROVIDER || "not configured",
    model: process.env.AI_MODEL || "not configured",
  });
}