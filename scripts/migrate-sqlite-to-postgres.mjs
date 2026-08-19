#!/usr/bin/env node
/**
 * Migrate data from the local SQLite dev.db to PostgreSQL (Neon).
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/migrate-sqlite-to-postgres.mjs
 *
 * Reads every row from ~/spirit/prisma/prisma/dev.db and inserts it into
 * the Postgres database, converting epoch-ms datetimes to ISO timestamps.
 * Table order matters: parent tables first (Prisma FK constraints).
 */
import { DatabaseSync } from "node:sqlite";
import pg from "pg";

const SQLITE_PATH = process.env.SQLITE_PATH || "prisma/prisma/dev.db";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || !DATABASE_URL.startsWith("postgres")) {
  console.error("❌ Set DATABASE_URL to your Neon Postgres connection string");
  process.exit(1);
}

// ── Tables in FK-safe order ─────────────────────────────────────────
const TABLES = [
  "User",
  "UserPreferences",
  "UserToken",
  "Conversation",
  "Message",
  "Feedback",
  "ForumCategory",
  "ForumPost",
  "ForumReply",
  "ForumReaction",
  "ForumBookmark",
  "ForumPostFollower",
  "ForumReport",
  "ForumPollVote",
  "PathWalk",
  "ConsciousnessRecord",
  "SessionLog",
  "StateSnapshot",
  "Assessment",
  "DailyReflection",
  "ReflectionResponse",
  "StudyGroup",
  "StudyGroupMember",
  "CommunityRecognition",
  "CurrentlyExploring",
  "DreamShareEntry",
  "DreamShareResonate",
  "DreamShareReflection",
  "Organization",
  "FinancialDisclosure",
  "WorkforceDisclosure",
  "OwnershipDisclosure",
  "NewsItem",
  "SiteError",
  "UserBookmark",
];

// Convert epoch-ms (numbers) to ISO strings for Postgres timestamp cols
function convertValue(v) {
  if (v === null || v === undefined) return v;
  if (typeof v === "number" && v > 100000000000) {
    // Looks like epoch milliseconds (post-1973) → ISO timestamp
    return new Date(v).toISOString();
  }
  // Leave numbers (including 0/1) as-is. pg handles type coercion:
  //   integer cols ← 1, 0
  //   boolean cols ← "1", "0" (at driver level)
  // String booleans from SQLite (rare) need explicit conversion
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

async function main() {
  const sqlite = new DatabaseSync(SQLITE_PATH);
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log(`🔌 Connected to Postgres. Migrating from ${SQLITE_PATH}\n`);

  let total = 0;
  for (const table of TABLES) {
    // Verify table exists in sqlite
    const check = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
      .get(table);
    if (!check) {
      console.log(`  ⏭ ${table}: not in SQLite, skipping`);
      continue;
    }

    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    if (rows.length === 0) {
      console.log(`  ⏭ ${table}: 0 rows`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`;

    let inserted = 0;
    for (const row of rows) {
      const values = cols.map((c) => convertValue(row[c]));
      try {
        await client.query(insertSql, values);
        inserted++;
      } catch (e) {
        console.error(`  ❌ ${table} row ${row.id}: ${e.message}`);
      }
    }
    total += inserted;
    console.log(`  ✅ ${table}: ${inserted}/${rows.length} rows`);
  }

  await client.end();
  sqlite.close();
  console.log(`\n🎉 Migration complete: ${total} rows inserted total`);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
