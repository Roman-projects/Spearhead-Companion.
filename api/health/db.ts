import { getDbPool } from "../../server/db";

type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
};

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
    await getDbPool().query("SELECT 1");
    response.status(200).json({
      ok: true,
      database: "connected",
    });
  } catch (error: unknown) {
    const diagnostic = error && typeof error === "object"
      ? error as { name?: unknown; code?: unknown }
      : {};
    console.error("Database health check failed", {
      errorName: typeof diagnostic.name === "string" ? diagnostic.name : "UnknownError",
      errorCode: typeof diagnostic.code === "string" ? diagnostic.code : undefined,
    });

    response.status(503).json({
      ok: false,
      database: "unavailable",
    });
  }
}
