import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "./env";
import { db } from "./db";
// ============================================
// Better Auth Configuration
// ============================================
// Better Auth handles all authentication flows for the application
// Endpoints are automatically mounted at /api/auth/* in index.ts
//
// Available endpoints:
//   - POST /api/auth/sign-up/email       - Sign up with email/password
//   - POST /api/auth/sign-in/email       - Sign in with email/password
//   - POST /api/auth/sign-out            - Sign out current session
//   - GET  /api/auth/session             - Get current session
//   - POST /api/auth/two-factor/enable   - Enable 2FA (Healthcare compliance)
//   - POST /api/auth/two-factor/disable  - Disable 2FA
//   - POST /api/auth/two-factor/verify   - Verify 2FA code
//   - And many more... (see Better Auth docs)
//
// This configuration includes:
//   - Prisma adapter for SQLite database
//   - Expo plugin for React Native support
//   - Email/password authentication
//   - Two-Factor Authentication (TOTP) for healthcare compliance
//   - Trusted origins for CORS
console.log("🔐 [Auth] Initializing Better Auth...");
export const auth = betterAuth({
  appName: "OT/AH Assessment", // Used as issuer for 2FA
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BACKEND_URL,
  plugins: [
    expo(),
    twoFactor({
      issuer: "OT/AH Assessment",
      // Require password verification before enabling 2FA (security best practice)
      skipVerificationOnEnable: false,
    }),
  ],
  trustedOrigins: [
    "vibecode://", // Expo app scheme (IMPORTANT: Update if you change app.json scheme)
    "http://localhost:3000",
    env.BACKEND_URL,
  ],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    freshAge: 60 * 15, // 15 minutes - session considered "fresh" for sensitive operations
  },
});
console.log("✅ [Auth] Better Auth initialized with 2FA");
console.log(`🔗 [Auth] Base URL: ${env.BACKEND_URL}`);
console.log(`🌐 [Auth] Trusted origins: ${auth.options.trustedOrigins?.join(", ")}`);
