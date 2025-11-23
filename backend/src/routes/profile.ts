import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import type { AppType } from "../index";
import { updateProfileRequestSchema, type UpdateProfileRequest } from "@/shared/contracts";

const profileRouter = new Hono<AppType>();

// Get current user's profile
profileRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    return c.json({ profile });
  } catch (error) {
    console.error("[profile.ts]: Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Create or update user's profile (with Zod validation)
profileRouter.post("/", zValidator("json", updateProfileRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = c.req.valid("json") as UpdateProfileRequest;
    const {
      ahpraNumber,
      profession,
      registrationExpiry,
      businessName,
      abn,
      acn,
      businessPhone,
      businessEmail,
      businessAddress,
      businessSuburb,
      businessState,
      businessPostcode,
      defaultHourlyRate,
      assessmentFee,
      reportFee,
      travelRate,
      qualifications,
      specializations,
      yearsExperience,
      paymentTerms,
      bankAccountName,
      bsb,
      accountNumber,
      logoUrl,
      brandColor,
    } = body;

    // Check if profile exists
    const existingProfile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await db.profile.update({
        where: { userId: user.id },
        data: {
          ahpraNumber: ahpraNumber || null,
          profession: profession || null,
          registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : null,
          businessName: businessName || null,
          abn: abn || null,
          acn: acn || null,
          businessPhone: businessPhone || null,
          businessEmail: businessEmail || null,
          businessAddress: businessAddress || null,
          businessSuburb: businessSuburb || null,
          businessState: businessState || null,
          businessPostcode: businessPostcode || null,
          defaultHourlyRate: defaultHourlyRate ? parseFloat(defaultHourlyRate) : 150,
          assessmentFee: assessmentFee ? parseFloat(assessmentFee) : 250,
          reportFee: reportFee ? parseFloat(reportFee) : 180,
          travelRate: travelRate ? parseFloat(travelRate) : 85,
          qualifications: qualifications ? JSON.stringify(qualifications) : null,
          specializations: specializations ? JSON.stringify(specializations) : null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          paymentTerms: paymentTerms || "Payment due within 14 days",
          bankAccountName: bankAccountName || null,
          bsb: bsb || null,
          accountNumber: accountNumber || null,
          logoUrl: logoUrl || null,
          brandColor: brandColor || null,
        },
      });
    } else {
      // Create new profile
      // Generate unique handle based on user email or name
      const handle =
        user.email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") +
        "_" +
        Math.random().toString(36).substring(2, 8);

      profile = await db.profile.create({
        data: {
          userId: user.id,
          handle,
          ahpraNumber: ahpraNumber || null,
          profession: profession || null,
          registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : null,
          businessName: businessName || null,
          abn: abn || null,
          acn: acn || null,
          businessPhone: businessPhone || null,
          businessEmail: businessEmail || null,
          businessAddress: businessAddress || null,
          businessSuburb: businessSuburb || null,
          businessState: businessState || null,
          businessPostcode: businessPostcode || null,
          defaultHourlyRate: defaultHourlyRate ? parseFloat(defaultHourlyRate) : 150,
          assessmentFee: assessmentFee ? parseFloat(assessmentFee) : 250,
          reportFee: reportFee ? parseFloat(reportFee) : 180,
          travelRate: travelRate ? parseFloat(travelRate) : 85,
          qualifications: qualifications ? JSON.stringify(qualifications) : null,
          specializations: specializations ? JSON.stringify(specializations) : null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          paymentTerms: paymentTerms || "Payment due within 14 days",
          bankAccountName: bankAccountName || null,
          bsb: bsb || null,
          accountNumber: accountNumber || null,
          logoUrl: logoUrl || null,
          brandColor: brandColor || null,
        },
      });
    }

    return c.json({ profile, success: true });
  } catch (error) {
    console.error("[profile.ts]: Error creating/updating profile:", error);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

export default profileRouter;
