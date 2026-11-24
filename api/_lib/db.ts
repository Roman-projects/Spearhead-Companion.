import { Pool } from "pg";

let pool: Pool | undefined;

export function getDbPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });

  pool.on("error", (error: unknown) => {
    const diagnostic = error && typeof error === "object"
      ? error as { name?: unknown; code?: unknown }
      : {};
    console.error("Unexpected idle database client error", {
      errorName: typeof diagnostic.name === "string" ? diagnostic.name : "UnknownError",
      errorCode: typeof diagnostic.code === "string" ? diagnostic.code : undefined,
    });
  });

  return pool;
}
