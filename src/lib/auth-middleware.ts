import { NextRequest } from "next/server";
import { prisma } from "./prisma";

/**
 * Reads the sanctuary_token cookie and resolves it to a user (with full profile),
 * or returns null if the token is invalid/expired.
 */
export async function getTokenUser(request: NextRequest): Promise<any | null> {
  const token = request.cookies.get("sanctuary_token")?.value;
  if (!token) return null;

  const session = await prisma.userToken.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          preferences: true,
          consciousnessRecords: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          sessionLogs: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          bookmarkedCategories: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Clean up expired token
    if (session) await prisma.userToken.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}