import { getRequest } from "@tanstack/react-start/server";

/** Coarse caller identity for throttling: best-effort client IP, never user data. */
export function callerKey(): string {
  try {
    const req = getRequest();
    const h = req?.headers;
    const raw =
      h?.get("cf-connecting-ip") ??
      h?.get("x-real-ip") ??
      h?.get("x-forwarded-for")?.split(",")[0] ??
      "unknown";
    return raw.trim().slice(0, 64) || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Fixed-window limiter backed by a service-role-only table.
 * Throws a generic error when the caller exceeds `limit` requests per `windowSeconds`.
 */
export async function enforceRateLimit(
  endpoint: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const key = callerKey();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = Date.now();
    const { data: row } = await supabaseAdmin
      .from("api_rate_limits")
      .select("id, window_start, request_count")
      .eq("bucket_key", key)
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (!row) {
      await supabaseAdmin
        .from("api_rate_limits")
        .insert({ bucket_key: key, endpoint, request_count: 1 });
      return;
    }

    const started = new Date(row.window_start as string).getTime();
    if (now - started > windowSeconds * 1000) {
      await supabaseAdmin
        .from("api_rate_limits")
        .update({ window_start: new Date(now).toISOString(), request_count: 1 })
        .eq("id", row.id);
      return;
    }

    if ((row.request_count as number) >= limit) {
      throw new RateLimitError();
    }

    await supabaseAdmin
      .from("api_rate_limits")
      .update({ request_count: (row.request_count as number) + 1 })
      .eq("id", row.id);
  } catch (error) {
    if (error instanceof RateLimitError) throw error;
    // Limiter storage problems must not break the product; fail open but log server-side.
    console.error("[rate-limit] check failed", error);
  }
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many requests. Please wait a moment and try again.");
    this.name = "RateLimitError";
  }
}
