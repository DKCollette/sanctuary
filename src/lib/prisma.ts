import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a PrismaClient that works on both Node.js (local dev) and
 * Cloudflare Workers (edge / opennextjs-cloudflare).
 *
 * On Workers the Prisma binary engine doesn't exist, so we use the
 * JS-only driver adapter (@prisma/adapter-pg + pg).  On Node.js the
 * adapter is also used when the DATABASE_URL is a postgres:// string.
 *
 * Fallback to the plain client (e.g. for local SQLite during
 * transitional testing, or an empty DATABASE_URL).
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgres")) {
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;