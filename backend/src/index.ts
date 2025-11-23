import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { rateLimiter } from "hono-rate-limiter";

import { auth } from "./auth";
import { env } from "./env";
import { addTimeoutHeaders } from "./middleware/sessionTimeout";
import { uploadRouter } from "./routes/upload";
import clientsRouter from "./routes/clients";
import assessmentsRouter from "./routes/assessments";
import equipmentRouter from "./routes/equipment";
import quotesRouter from "./routes/quotes";
import invoicesRouter from "./routes/invoices";
import aiRouter from "./routes/ai";
import houseMapRouter from "./routes/houseMap";
import iotDevicesRouter from "./routes/iotDevices";
import profileRouter from "./routes/profile";
import documentsRouter from "./routes/documents";
import businessDocumentsRouter from "./routes/businessDocuments";
import sentInvoicesRouter from "./routes/sentInvoices";
import { type AppType } from "./types";

// AppType context adds user and session to the context, will be null if the user or session is null
const app = new Hono<AppType>();

console.log("🔧 Initializing Hono application...");
app.use("*", logger());
app.use("/*", cors());

/** Authentication middleware
 * Extracts session from request headers and attaches user/session to context
 * All routes can access c.get("user") and c.get("session")
 */
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null); // type: typeof auth.$Infer.Session.user | null
  c.set("session", session?.session ?? null); // type: typeof auth.$Infer.Session.session | null
  return next();
});

// Session timeout headers (Healthcare compliance - 15-minute idle timeout)
console.log("⏱️  Adding session timeout headers");
app.use("/api/*", addTimeoutHeaders);

// Rate limiting for authentication endpoints (Healthcare security compliance)
console.log("🛡️  Applying rate limiting to auth endpoints");
app.use(
  "/api/auth/*",
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 login attempts per 15 minutes
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      // Use IP address for rate limiting
      return c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    },
  })
);

// Rate limiting for AI endpoints (prevent abuse of expensive operations)
console.log("🛡️  Applying rate limiting to AI endpoints");
app.use(
  "/api/ai/*",
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 10, // 10 AI requests per minute
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const user = c.get("user");
      return user?.id || c.req.header("x-forwarded-for") || "unknown";
    },
  })
);

// Rate limiting for file uploads
console.log("🛡️  Applying rate limiting to upload endpoints");
app.use(
  "/api/upload/*",
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 20, // 20 uploads per minute
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const user = c.get("user");
      return user?.id || c.req.header("x-forwarded-for") || "unknown";
    },
  })
);

// Better Auth handler
// Handles all authentication endpoints: /api/auth/sign-in, /api/auth/sign-up, etc.
console.log("🔐 Mounting Better Auth handler at /api/auth/*");
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Serve uploaded images statically with authentication (Healthcare compliance)
// Files in uploads/ directory require valid session
console.log("📁 Serving static files from uploads/ directory (authenticated)");
app.use("/uploads/*", async (c, next) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized - Authentication required to access files" }, 401);
  }
  return next();
});
app.use("/uploads/*", serveStatic({ root: "./" }));

// Mount route modules
console.log("📤 Mounting upload routes at /api/upload");
app.route("/api/upload", uploadRouter);

console.log("👥 Mounting clients routes at /api/clients");
app.route("/api/clients", clientsRouter);

console.log("📋 Mounting assessments routes at /api/assessments");
app.route("/api/assessments", assessmentsRouter);

console.log("🛠️  Mounting equipment routes at /api/equipment");
app.route("/api/equipment", equipmentRouter);

console.log("💰 Mounting quotes routes at /api/quotes");
app.route("/api/quotes", quotesRouter);

console.log("📄 Mounting invoices routes at /api/invoices");
app.route("/api/invoices", invoicesRouter);

console.log("🤖 Mounting AI routes at /api/ai");
app.route("/api/ai", aiRouter);

console.log("🏠 Mounting house map routes at /api");
app.route("/api", houseMapRouter);

console.log("📱 Mounting IoT devices routes at /api");
app.route("/api", iotDevicesRouter);

console.log("👤 Mounting profile routes at /api/profile");
app.route("/api/profile", profileRouter);

console.log("📄 Mounting documents routes at /api/documents");
app.route("/api/documents", documentsRouter);

console.log("💼 Mounting business documents routes at /api/business-documents");
app.route("/api/business-documents", businessDocumentsRouter);

console.log("📨 Mounting sent invoices routes at /api/sent-invoices");
app.route("/api/sent-invoices", sentInvoicesRouter);

// Health check endpoint
// Used by load balancers and monitoring tools to verify service is running
app.get("/health", (c) => {
  console.log("💚 Health check requested");
  return c.json({ status: "ok" });
});

// Start the server
console.log("⚙️  Starting server...");
serve({ fetch: app.fetch, port: Number(env.PORT) }, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🚀 Server is running on port ${env.PORT}`);
  console.log(`🔗 Base URL: http://localhost:${env.PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📚 Available endpoints:");
  console.log("  🔐 Auth:       /api/auth/*");
  console.log("  📤 Upload:     POST /api/upload/image");
  console.log("  👥 Clients:    GET/POST /api/clients");
  console.log("  📋 Assess:     GET/POST /api/assessments");
  console.log("  🛠️  Equipment:  GET/POST /api/equipment");
  console.log("  💰 Quotes:     POST /api/quotes");
  console.log("  📄 Invoices:   POST /api/invoices");
  console.log("  🤖 AI:         POST /api/ai/*");
  console.log("  🏠 House Maps: GET/POST /api/house-maps");
  console.log("  📱 IoT:        GET/POST /api/iot-devices");
  console.log("  👤 Profile:    GET/POST /api/profile");
  console.log("  💚 Health:     GET /health");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});
