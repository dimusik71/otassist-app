# Security Audit Report - OT/AH Assessment App
**Date**: November 23, 2025
**Compliance Focus**: Australian Privacy Act 1988, Australian Privacy Principles (APPs), Healthcare Records Legislation

---

## Executive Summary

This security audit assesses the OT/AH Assessment App's compliance with Australian healthcare security requirements. The app handles sensitive health information and must comply with:
- **Privacy Act 1988** (Commonwealth)
- **Australian Privacy Principles (APPs)** - particularly APP 11 (security of personal information)
- **My Health Records Act 2012**
- State-based health records legislation (e.g., Health Records Act 2001 VIC)

### Overall Security Rating: ⚠️ MODERATE RISK

**Critical Issues**: 4
**High Priority**: 6
**Medium Priority**: 5
**Low Priority**: 3

---

## 1. Authentication & Session Management

### ✅ Strengths
- **Better Auth Integration**: Modern, secure authentication using industry-standard library
- **Session Management**: Sessions stored in database with expiry tracking
- **User Isolation**: All queries filtered by `userId` preventing unauthorized data access
- **Password Hashing**: Better Auth handles secure password hashing automatically
- **CSRF Protection**: Better Auth includes built-in CSRF protection

### ❌ Critical Issues

#### 1.1 No Multi-Factor Authentication (MFA)
**Risk Level**: 🔴 CRITICAL
**APP Violation**: APP 11.1 (reasonable steps to protect personal information)

**Issue**: Healthcare apps handling sensitive patient data must implement MFA.

**Recommendation**:
```typescript
// Add to backend/src/auth.ts
import { twoFactor } from "@better-auth/two-factor";

export const auth = betterAuth({
  // ... existing config
  plugins: [
    expo(),
    twoFactor({
      issuer: "OT/AH Assessment",
    }),
  ],
});
```

#### 1.2 No Session Timeout Policy
**Risk Level**: 🔴 CRITICAL
**APP Violation**: APP 11.1

**Issue**: Sessions don't have automatic timeout for inactive users. Healthcare data should have strict session management.

**Current State**: Sessions expire based on `expiresAt` but no idle timeout.

**Recommendation**: Implement 15-minute idle timeout for healthcare compliance.

---

## 2. Data Storage & Encryption

### ✅ Strengths
- **User Isolation**: Row-level security via Prisma queries filtered by `userId`
- **Cascade Deletes**: Proper foreign key constraints prevent orphaned records
- **Data Retention Policy**: Built-in archival system with retention dates

### ❌ Critical Issues

#### 2.1 Database Not Encrypted at Rest
**Risk Level**: 🔴 CRITICAL
**APP Violation**: APP 11.1 (security safeguards)
**Healthcare Compliance**: My Health Records Act Section 75

**Issue**: SQLite database (`backend/prisma/dev.db`) stores unencrypted:
- Patient names, dates of birth
- Medical assessment data
- Photos/videos of patient homes
- AHPRA registration numbers
- Banking details (BSB, account numbers)

**Current State**:
```bash
-rw-r--r-- 1 vibecode vibecode 68K Nov 23 01:21 dev.db
```

**Recommendations**:
1. **Immediate**: Use SQLCipher for SQLite encryption
```bash
bun add @journeyapps/sqlcipher
```

2. **Production**: Migrate to PostgreSQL with Transparent Data Encryption (TDE)
3. **Encrypt sensitive columns**: Use application-level encryption for:
   - `Client.dateOfBirth`
   - `Profile.ahpraNumber`
   - `Profile.accountNumber`, `Profile.bsb`

#### 2.2 No Encryption for Uploaded Files
**Risk Level**: 🔴 CRITICAL
**APP Violation**: APP 11.1

**Issue**: Uploaded photos/videos stored in `backend/uploads/` without encryption.

**Current State**:
```typescript
// backend/src/index.ts:47
app.use("/uploads/*", serveStatic({ root: "./" }));
```

**Risks**:
- Photos of patient homes contain identifying information
- Video assessments show patients and medical conditions
- Files accessible if file paths are guessed or leaked

**Recommendations**:
1. Encrypt files before storage using AES-256
2. Store encryption keys in secure key management service
3. Implement signed URLs with expiration (max 15 minutes)
4. Add authentication check before serving files

#### 2.3 Mobile App Storage Not Encrypted
**Risk Level**: 🟠 HIGH
**APP Violation**: APP 11.1

**Issue**: `AsyncStorage` used for caching sensitive data without encryption.

**Affected Files**:
- `src/lib/offlineStorage.ts` - Caches client/assessment data
- `src/screens/ProfessionalProfileSetupScreen.tsx` - Stores profile data locally
- `src/components/QuickStartChecklist.tsx` - Stores app state

**Current Code**:
```typescript
// src/lib/offlineStorage.ts:30
await AsyncStorage.setItem(this.getCacheKey(key), JSON.stringify(entry));
```

**Recommendations**:
1. Use `expo-secure-store` for sensitive data:
```typescript
import * as SecureStore from 'expo-secure-store';

export class SecureOfflineStorage {
  static async set(key: string, data: any) {
    await SecureStore.setItemAsync(key, JSON.stringify(data));
  }
}
```

2. Migrate sensitive data to SecureStore:
   - Session tokens
   - Cached patient data
   - Professional profile (AHPRA, banking)

---

## 3. API Security & Input Validation

### ✅ Strengths
- **Zod Validation**: Input validation on key endpoints (clients, assessments, equipment)
- **Prisma ORM**: Prevents SQL injection through parameterized queries
- **CORS Configured**: Uses Hono CORS middleware
- **Authentication Middleware**: All routes check user session

### ❌ Critical Issues

#### 3.1 Missing Input Validation on Profile Routes
**Risk Level**: 🟠 HIGH
**APP Violation**: APP 11.1

**Issue**: Profile endpoint accepts unvalidated user input.

**Vulnerable Code**:
```typescript
// backend/src/routes/profile.ts:34
const body = await c.req.json();
const { ahpraNumber, abn, accountNumber, ... } = body;
// Direct use without validation
```

**Risks**:
- AHPRA numbers not validated (should be specific format)
- ABN not validated (11 digits with checksum)
- Email/phone not validated
- XSS via unescaped text fields

**Recommendation**:
```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const profileSchema = z.object({
  ahpraNumber: z.string().regex(/^[A-Z]{3}\d{10}$/).optional(),
  abn: z.string().length(11).regex(/^\d{11}$/).optional(),
  businessEmail: z.string().email().optional(),
  accountNumber: z.string().max(9).regex(/^\d+$/).optional(),
  // ... other fields
});

profileRouter.post("/", zValidator("json", profileSchema), async (c) => {
  // validated body
});
```

#### 3.2 Missing Rate Limiting
**Risk Level**: 🟠 HIGH
**Security Issue**: Brute force attacks, DoS

**Issue**: No rate limiting on authentication or API endpoints.

**Vulnerable Endpoints**:
- `/api/auth/sign-in/email` - Password brute force
- `/api/ai/*` - Expensive AI operations
- `/api/upload/image` - File upload spam

**Recommendation**:
```typescript
import { rateLimiter } from "hono-rate-limiter";

app.use(
  "/api/auth/*",
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 attempts
    keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
  })
);
```

#### 3.3 Overly Permissive CORS
**Risk Level**: 🟡 MEDIUM

**Issue**: CORS allows all origins.

**Current Code**:
```typescript
// backend/src/index.ts:26
app.use("/*", cors());
```

**Recommendation**:
```typescript
app.use("/*", cors({
  origin: [
    process.env.FRONTEND_URL,
    "vibecode://",
    /\.vibecode\.run$/,
  ],
  credentials: true,
}));
```

#### 3.4 Missing Content Security Policy
**Risk Level**: 🟡 MEDIUM

**Issue**: No CSP headers to prevent XSS attacks.

**Recommendation**:
```typescript
import { secureHeaders } from "hono/secure-headers";

app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));
```

---

## 4. Third-Party Service Security

### ✅ Strengths
- **HTTPS Only**: All third-party APIs use HTTPS
- **Reputable Providers**: OpenAI, Google, xAI are enterprise-grade

### ❌ Issues

#### 4.1 API Keys in Environment Variables
**Risk Level**: 🟠 HIGH
**Security Issue**: Key exposure risk

**Issue**: API keys passed via environment variables which can leak in logs, error messages.

**Current State**:
```typescript
// backend/src/routes/ai.ts:48
Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`
```

**Risks**:
- `EXPO_PUBLIC_*` prefix suggests these might be in client bundle
- Keys in environment variables can appear in error stack traces
- No key rotation mechanism

**Recommendations**:
1. Use AWS Secrets Manager or HashiCorp Vault
2. Implement key rotation every 90 days
3. Remove `EXPO_PUBLIC_` prefix (these should be backend-only)
4. Audit client bundle to ensure keys not exposed

#### 4.2 No API Request Logging for Compliance
**Risk Level**: 🟡 MEDIUM
**APP Violation**: APP 13 (correction and deletion)

**Issue**: No audit trail of what patient data was sent to AI services.

**Healthcare Requirement**: Must log when patient data is processed by third parties for:
- Data breach investigations
- Patient access requests
- Compliance audits

**Recommendation**:
```typescript
// Create audit log table
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // "ai_analysis", "photo_upload", etc.
  resource    String   // "assessment:123"
  thirdParty  String?  // "openai", "google"
  timestamp   DateTime @default(now())
  ipAddress   String?
}
```

#### 4.3 Sensitive Data Sent to AI Without Consent
**Risk Level**: 🟠 HIGH
**APP Violation**: APP 6 (use and disclosure)

**Issue**: Patient photos, videos, and assessment data sent to AI services without explicit patient consent.

**Affected Services**:
- OpenAI GPT-4 (assessment summaries)
- Google Gemini Vision (photo/video analysis)
- xAI Grok (equipment recommendations)

**Legal Requirement**: Under APP 6, must obtain explicit consent before disclosing health information to overseas recipients.

**Recommendations**:
1. Add consent checkbox during assessment creation
2. Update Privacy Policy to list AI providers
3. Provide opt-out option for AI analysis
4. Implement data minimization (strip identifying info before sending to AI)

---

## 5. Data Retention & Deletion

### ✅ Strengths
- **Retention Policy**: Built-in 7-year retention for health records
- **Archival System**: Soft delete with `isArchived` flags
- **Child Records**: Special handling for patients under 18

### ❌ Issues

#### 5.1 No Automated Deletion After Retention Period
**Risk Level**: 🟡 MEDIUM
**APP Violation**: APP 11.2 (destruction or de-identification)

**Issue**: Records marked with `canDeleteAfter` date but no cron job to delete them.

**Current State**: Manual deletion required via `/api/clients/:id/permanently-delete`

**Recommendation**:
```typescript
// Add scheduled job
import { CronJob } from 'cron';

new CronJob('0 0 * * *', async () => {
  const expiredClients = await db.client.findMany({
    where: {
      isArchived: true,
      canDeleteAfter: { lte: new Date() }
    }
  });

  for (const client of expiredClients) {
    // Permanent deletion logic
  }
}).start();
```

#### 5.2 File Uploads Not Deleted on Record Deletion
**Risk Level**: 🟠 HIGH

**Issue**: Deleting assessments doesn't delete associated photos/videos from `uploads/` directory.

**Orphaned Files**: Photos remain on disk even after patient records deleted.

**Recommendation**: Implement cascade file deletion in deletion handlers.

---

## 6. Logging & Monitoring

### ❌ Critical Gaps

#### 6.1 No Security Event Logging
**Risk Level**: 🟠 HIGH
**APP Violation**: APP 11.1 (d) - monitoring systems

**Missing Logs**:
- Failed login attempts
- Unauthorized access attempts
- Data export/download events
- Profile modifications
- Patient record access

**Recommendation**: Implement structured logging with Winston or Pino.

#### 6.2 No Intrusion Detection
**Risk Level**: 🟡 MEDIUM

**Issue**: No monitoring for suspicious patterns (e.g., mass data export, unusual access times).

---

## 7. Mobile App Security

### ❌ Issues

#### 7.1 No Certificate Pinning
**Risk Level**: 🟡 MEDIUM

**Issue**: App doesn't pin SSL certificates, vulnerable to MITM attacks.

**Recommendation**:
```typescript
// app.json
{
  "expo": {
    "extra": {
      "certificatePins": {
        "vibecode.run": ["sha256/..."]
      }
    }
  }
}
```

#### 7.2 No Root/Jailbreak Detection
**Risk Level**: 🟡 MEDIUM

**Issue**: App runs on compromised devices without warning.

**Recommendation**: Add jailbreak detection library.

---

## 8. Compliance Gaps

### 8.1 Privacy Policy Required
**Risk Level**: 🔴 CRITICAL
**APP Violation**: APP 5 (notification of collection)

**Missing**: No privacy policy informing users about:
- What data is collected
- How data is used
- Third-party disclosures (AI services)
- International data transfers
- Data retention periods
- User rights (access, correction, deletion)

### 8.2 Data Breach Response Plan
**Risk Level**: 🟠 HIGH
**Legal Requirement**: Notifiable Data Breaches (NDB) scheme

**Missing**: No documented process for:
- Detecting breaches
- Notifying affected individuals within 30 days
- Notifying Office of the Australian Information Commissioner (OAIC)

---

## Priority Action Plan

### Immediate (Week 1)
1. ✅ **Enable database encryption** (SQLCipher or migrate to PostgreSQL with TDE)
2. ✅ **Implement MFA** using Better Auth two-factor plugin
3. ✅ **Add file upload encryption** and signed URLs
4. ✅ **Migrate sensitive data to SecureStore** on mobile
5. ✅ **Add input validation to profile routes**

### Short Term (Month 1)
6. ✅ **Create Privacy Policy** and Terms of Service
7. ✅ **Implement audit logging** for all patient data access
8. ✅ **Add rate limiting** on auth and AI endpoints
9. ✅ **Implement consent flow** for AI analysis
10. ✅ **Add session timeout** (15 minutes idle)

### Medium Term (Quarter 1)
11. ✅ **Security penetration testing** by certified firm
12. ✅ **Data breach response plan**
13. ✅ **Certificate pinning** for mobile app
14. ✅ **Automated retention deletion** job
15. ✅ **Security awareness training** for development team

### Long Term (Year 1)
16. ✅ **ISO 27001 certification** process
17. ✅ **SOC 2 Type II audit**
18. ✅ **Healthcare compliance audit** (if applicable)
19. ✅ **Bug bounty program**

---

## Regulatory Compliance Checklist

### Australian Privacy Principles (APPs)

| APP | Requirement | Status | Notes |
|-----|-------------|--------|-------|
| APP 1 | Open and transparent management | ⚠️ Partial | Need Privacy Policy |
| APP 5 | Notification of collection | ❌ Not Met | No privacy notice |
| APP 6 | Use/disclosure of info | ❌ Not Met | AI disclosures not documented |
| APP 8 | Cross-border disclosure | ❌ Not Met | AI services overseas, no consent |
| APP 11 | Security | ⚠️ Partial | Missing encryption, MFA |
| APP 12 | Access to personal info | ✅ Met | Users can access own data |
| APP 13 | Correction | ✅ Met | Users can update records |

### My Health Records Act Compliance
- ❌ **Section 70**: Authentication (need MFA)
- ❌ **Section 75**: Encryption requirements
- ⚠️ **Section 77**: Access controls (partial)
- ✅ **Section 79**: Audit logs (if implemented)

---

## Estimated Implementation Cost

| Priority | Tasks | Developer Hours | Timeline |
|----------|-------|-----------------|----------|
| Immediate | 5 tasks | 80-120 hours | 1-2 weeks |
| Short Term | 5 tasks | 120-160 hours | 3-4 weeks |
| Medium Term | 5 tasks | 200-300 hours | 8-12 weeks |

**Total Estimated Hours**: 400-580 hours
**Estimated Cost**: $60,000 - $90,000 AUD (at $150/hour)

---

## Conclusion

The OT/AH Assessment App has a solid foundation but requires significant security enhancements before handling production healthcare data. The most critical issues are:

1. **Unencrypted data at rest** (database and files)
2. **No multi-factor authentication**
3. **Missing privacy policy and consent flows**
4. **Unvalidated user input on sensitive endpoints**

These issues must be addressed before the app can be considered compliant with Australian healthcare regulations.

**Recommended Next Steps**:
1. Prioritize immediate actions from the action plan
2. Engage a healthcare compliance lawyer to review data handling
3. Conduct professional security audit before production launch
4. Implement continuous security monitoring

---

**Report Prepared By**: Claude (Security Audit)
**Date**: November 23, 2025
**Version**: 1.0
