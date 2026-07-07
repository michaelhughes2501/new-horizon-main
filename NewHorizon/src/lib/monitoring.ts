/**
 * Client-side monitoring utilities.
 *
 * Provides:
 *  - Error tracking (console + extensible hook for Sentry/Datadog)
 *  - Request logging with duration measurement
 *  - Performance markers
 *  - Health check against Supabase
 *
 * To add a real error tracking service, replace `reportToService` below.
 */
import { supabase } from "../../lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ErrorReport {
  error: Error | unknown;
  context?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

export interface RequestLog {
  label: string;
  durationMs: number;
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface HealthStatus {
  ok: boolean;
  latencyMs: number;
  error?: string;
  checkedAt: string;
}

// ─── Error tracking ──────────────────────────────────────────────────────────

/** Replace this stub with a call to Sentry, Datadog, Bugsnag, etc. */
function reportToService(report: ErrorReport): void {
  // e.g. Sentry.captureException(report.error, { extra: report.extra });
}

export function captureError(report: ErrorReport): void {
  const message =
    report.error instanceof Error
      ? report.error.message
      : String(report.error);

  const prefix = report.context ? `[${report.context}]` : "[error]";

  console.error(`${prefix} ${message}`, {
    userId: report.userId,
    extra: report.extra,
  });

  reportToService(report);
}

/**
 * Wraps an async function and captures any thrown error before re-throwing.
 * Useful for top-level screen effects.
 *
 * @example
 *   const data = await withErrorTracking(() => fetchJobs(), "JobsScreen");
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context: string,
  userId?: string
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    captureError({ error: err, context, userId });
    throw err;
  }
}

// ─── Request logging ─────────────────────────────────────────────────────────

/**
 * Wraps an async operation and logs its label, duration, and outcome.
 *
 * @example
 *   const jobs = await logRequest("getApprovedJobs", () => getApprovedJobs());
 */
export async function logRequest<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const log: RequestLog = {
      label,
      durationMs: Date.now() - start,
      success: true,
    };
    console.debug(`[request] ${label} ${log.durationMs}ms ✓`);
    return result;
  } catch (err: any) {
    const log: RequestLog = {
      label,
      durationMs: Date.now() - start,
      success: false,
      error: err?.message,
    };
    console.warn(`[request] ${label} ${log.durationMs}ms ✗ — ${log.error}`);
    throw err;
  }
}

// ─── Performance markers ─────────────────────────────────────────────────────

const _marks: Record<string, number> = {};

export function markStart(name: string): void {
  _marks[name] = Date.now();
}

export function markEnd(name: string): number {
  const start = _marks[name];
  if (!start) return -1;
  const duration = Date.now() - start;
  console.debug(`[perf] ${name}: ${duration}ms`);
  delete _marks[name];
  return duration;
}

// ─── Health check ─────────────────────────────────────────────────────────────

/**
 * Pings the Supabase database to confirm connectivity.
 * Call on app start or from a diagnostics screen.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    // Lightweight query — just checks connectivity
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    const latencyMs = Date.now() - start;

    if (error && error.code !== "PGRST116") {
      // PGRST116 = "No rows" — still a successful connection
      return {
        ok: false,
        latencyMs,
        error: error.message,
        checkedAt: new Date().toISOString(),
      };
    }

    return { ok: true, latencyMs, checkedAt: new Date().toISOString() };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err?.message ?? "Unknown error",
      checkedAt: new Date().toISOString(),
    };
  }
}
