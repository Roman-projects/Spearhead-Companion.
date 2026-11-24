import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;
const APPLY = process.argv.includes("--apply");
const MIGRATION_FILE = "database/migrations/0001_initial_schema.sql";
const MIGRATION_ID = "0001_initial_schema";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (process.env.VERCEL && APPLY) {
  console.error("Refusing to run schema migrations inside a Vercel deployment.");
  process.exit(1);
}

const sql = await readFile(resolve(process.cwd(), MIGRATION_FILE), "utf8");
const checksum = createHash("sha256").update(sql).digest("hex");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
});

try {
  await client.connect();

  if (!APPLY) {
    const result = await client.query(
      "SELECT to_regclass('public.schema_migrations') AS ledger"
    );

    if (!result.rows[0]?.ledger) {
      console.log(`DRY RUN: ${MIGRATION_ID} is pending. No database changes were made.`);
    } else {
      const applied = await client.query(
        "SELECT checksum FROM public.schema_migrations WHERE migration_id = $1",
        [MIGRATION_ID]
      );
      if (applied.rowCount) {
        if (applied.rows[0].checksum !== checksum) {
          throw new Error(`Checksum mismatch for already-applied migration ${MIGRATION_ID}.`);
        }
        console.log(`Already applied: ${MIGRATION_ID}. No database changes were made.`);
      } else {
        console.log(`DRY RUN: ${MIGRATION_ID} is pending. No database changes were made.`);
      }
    }
    console.log("Pass --apply to apply this migration explicitly.");
  } else {
    if (process.env.ALLOW_SCHEMA_MIGRATIONS !== "true") {
      throw new Error("Set ALLOW_SCHEMA_MIGRATIONS=true to confirm schema changes.");
    }

    await client.query("BEGIN");
    try {
      await client.query("SELECT pg_advisory_xact_lock(731942, 1)");
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          migration_id TEXT PRIMARY KEY,
          checksum TEXT NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);

      const applied = await client.query(
        "SELECT checksum FROM public.schema_migrations WHERE migration_id = $1",
        [MIGRATION_ID]
      );

      if (applied.rowCount) {
        if (applied.rows[0].checksum !== checksum) {
          throw new Error(`Checksum mismatch for already-applied migration ${MIGRATION_ID}.`);
        }
        console.log(`Already applied: ${MIGRATION_ID}. No changes needed.`);
      } else {
        await client.query(sql);
        await client.query(
          "INSERT INTO public.schema_migrations (migration_id, checksum) VALUES ($1, $2)",
          [MIGRATION_ID, checksum]
        );
        console.log(`Applied: ${MIGRATION_ID}`);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} catch (error) {
  const diagnostic = error && typeof error === "object"
    ? error
    : {};
  console.error("Database migration failed:", {
    name: typeof diagnostic.name === "string" ? diagnostic.name : "Error",
    code: typeof diagnostic.code === "string" ? diagnostic.code : undefined,
  });
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
