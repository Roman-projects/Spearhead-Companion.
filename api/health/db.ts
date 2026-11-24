import { Pool } from "pg";

type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

let pool: Pool | undefined;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  });

  return pool;
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
): Promise<void> {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    await getPool().query("SELECT 1");
    response.status(200).json({
      ok: true,
      database: "connected",
    });
  } catch {
    // Keep connection details and provider errors out of the public response.
    response.status(503).json({
      ok: false,
      database: "unavailable",
    });
  }
}
