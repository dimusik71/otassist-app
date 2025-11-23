/**
 * Audit Logging Utility
 * Healthcare Compliance - Australian Privacy Principles (APP 11, APP 13)
 *
 * Logs all access to sensitive patient data for:
 * - Data breach investigations
 * - Patient access requests (APP 12)
 * - Compliance audits
 * - Third-party disclosures (APP 6)
 */

import { db } from "../db";

export type AuditAction =
  | "client_view"
  | "client_create"
  | "client_update"
  | "client_delete"
  | "assessment_view"
  | "assessment_create"
  | "assessment_update"
  | "assessment_delete"
  | "file_upload"
  | "file_access"
  | "ai_analysis"
  | "data_export"
  | "profile_update"
  | "login"
  | "logout"
  | "failed_login";

export interface AuditContext {
  userId: string;
  action: AuditAction;
  resource?: string; // e.g., "client:abc123", "assessment:xyz789"
  details?: Record<string, any>; // Additional context
  thirdParty?: "openai" | "google" | "xai" | "elevenlabs"; // AI service used
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 * Automatically called by middleware and critical operations
 */
export async function createAuditLog(context: AuditContext): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: context.userId,
        action: context.action,
        resource: context.resource || null,
        details: context.details ? JSON.stringify(context.details) : null,
        thirdParty: context.thirdParty || null,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
      },
    });

    // Log to console for monitoring (can be sent to external logging service)
    console.log(`[AUDIT] ${context.action} by user ${context.userId} ${context.resource ? `on ${context.resource}` : ""}`);
  } catch (error) {
    // Critical: Audit logging must not fail silently
    console.error("[AUDIT ERROR]: Failed to create audit log:", error);
    console.error("[AUDIT CONTEXT]:", context);
  }
}

/**
 * Get audit logs for a specific user
 * Used for APP 12 compliance (access to personal information)
 */
export async function getUserAuditLogs(userId: string, limit = 100) {
  return db.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs for a specific resource
 * Used for investigating access to specific client/assessment data
 */
export async function getResourceAuditLogs(resource: string, limit = 100) {
  return db.auditLog.findMany({
    where: { resource },
    orderBy: { timestamp: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get audit logs for third-party data sharing
 * Critical for APP 8 compliance (cross-border disclosure)
 */
export async function getThirdPartyDisclosures(thirdParty: string, startDate: Date, endDate: Date) {
  return db.auditLog.findMany({
    where: {
      thirdParty,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { timestamp: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get failed login attempts
 * Security monitoring for breach detection
 */
export async function getFailedLoginAttempts(ipAddress: string, since: Date) {
  return db.auditLog.findMany({
    where: {
      action: "failed_login",
      ipAddress,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "desc" },
  });
}

/**
 * Middleware helper to extract IP and user agent from Hono context
 */
export function extractAuditMetadata(c: any) {
  return {
    ipAddress: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || undefined,
    userAgent: c.req.header("user-agent") || undefined,
  };
}
