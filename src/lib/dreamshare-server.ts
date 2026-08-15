import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ─── Auth Helpers (Server-Only) ───

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sanctuary_token")?.value;
  if (!token) return null;

  const userToken = await prisma.userToken.findUnique({
    where: { token },
    include: { user: { include: { preferences: true } } },
  });

  if (!userToken || userToken.expiresAt < new Date()) return null;
  return userToken.user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function parseJsonArray(str: string): any[] {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}