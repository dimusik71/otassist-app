/**
 * Session Timeout Middleware
 * Healthcare Compliance - APP 11.1 (Security safeguards)
 *
 * Enforces 15-minute idle timeout for healthcare data access
 * Sensitive operations require "fresh" session (< 15 minutes old)
 */

import type { Context, Next } from "hono";
import type { AppType } from "../types";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Middleware to check session age and enforce idle timeout
 * Use this on routes that access sensitive patient data
 */
export async function requireFreshSession(c: Context, next: Next) {
  const session = c.get("session");
  const user = c.get("user");

  if (!user?.id || !session) {
    return c.json({ error: "Unauthorized - Please log in" }, 401);
  }

  // Check if session has expired
  const now = new Date();
  const sessionExpiry = new Date(session.expiresAt);

  if (now > sessionExpiry) {
    return c.json({
      error: "Session expired - Please log in again",
      sessionExpired: true
    }, 401);
  }

  // Check session freshness for sensitive operations
  // Better Auth tracks session.updatedAt which represents last activity
  const sessionUpdated = new Date(session.updatedAt || session.createdAt);
  const sessionAge = now.getTime() - sessionUpdated.getTime();

  if (sessionAge > IDLE_TIMEOUT_MS) {
    return c.json({
      error: "Session timed out due to inactivity - Please log in again",
      sessionTimedOut: true,
      idleMinutes: Math.floor(sessionAge / 60000),
    }, 401);
  }

  // Session is fresh, continue
  return next();
}

/**
 * Middleware to warn about upcoming timeout
 * Returns time until timeout in response headers
 */
export async function addTimeoutHeaders(c: Context, next: Next) {
  const session = c.get("session");

  if (session) {
    const now = new Date();
    const sessionUpdated = new Date(session.updatedAt || session.createdAt);
    const sessionAge = now.getTime() - sessionUpdated.getTime();
    const timeUntilTimeout = IDLE_TIMEOUT_MS - sessionAge;
    const minutesRemaining = Math.floor(timeUntilTimeout / 60000);

    // Add header indicating time remaining
    c.header("X-Session-Expires-In", `${minutesRemaining}m`);

    // Add warning header if less than 5 minutes remaining
    if (minutesRemaining < 5) {
      c.header("X-Session-Warning", "Session will expire soon");
    }
  }

  return next();
}

/**
 * Check if session requires refresh
 * Returns true if session should be refreshed (> 5 minutes since last update)
 */
export function shouldRefreshSession(session: any): boolean {
  if (!session) return false;

  const now = new Date();
  const sessionUpdated = new Date(session.updatedAt || session.createdAt);
  const sessionAge = now.getTime() - sessionUpdated.getTime();

  // Refresh if session is older than 5 minutes
  return sessionAge > 5 * 60 * 1000;
}
