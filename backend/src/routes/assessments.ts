import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createAssessmentRequestSchema,
  createAssessmentResponseSchema,
  getAssessmentsResponseSchema,
  uploadAssessmentMediaRequestSchema,
  uploadAssessmentMediaResponseSchema,
} from "@/shared/contracts";

const assessmentsRouter = new Hono<AppType>();

// GET /api/assessments - Get all assessments for the current user
assessmentsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assessments = await db.assessment.findMany({
    where: { userId: user.id },
    include: {
      client: true,
      media: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    assessments: assessments.map((assessment) => ({
      id: assessment.id,
      clientId: assessment.clientId,
      clientName: assessment.client.name,
      assessmentType: assessment.assessmentType,
      status: assessment.status,
      location: assessment.location,
      assessmentDate: assessment.assessmentDate.toISOString(),
      notes: assessment.notes,
      aiSummary: assessment.aiSummary,
      reportGenerated: assessment.reportGenerated,
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
      mediaCount: assessment.media.length,
    })),
  };

  return c.json(response);
});

// GET /api/assessments/:id - Get a single assessment
assessmentsRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  const assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: {
      client: true,
      media: true,
      equipment: {
        include: {
          equipment: true,
        },
      },
    },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const response = {
    ...assessment,
    assessmentDate: assessment.assessmentDate.toISOString(),
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
    media: assessment.media.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    equipment: assessment.equipment.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      equipment: {
        ...e.equipment,
        price: Number(e.equipment.price),
        supplierPrice: e.equipment.supplierPrice ? Number(e.equipment.supplierPrice) : null,
        margin: e.equipment.margin ? Number(e.equipment.margin) : null,
        createdAt: e.equipment.createdAt.toISOString(),
        updatedAt: e.equipment.updatedAt.toISOString(),
      },
    })),
  };

  return c.json(response);
});

// POST /api/assessments - Create a new assessment
assessmentsRouter.post("/", zValidator("json", createAssessmentRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  // Verify that the client belongs to this user
  const client = await db.client.findFirst({
    where: { id: body.clientId, userId: user.id },
  });

  if (!client) {
    return c.json({ error: "Client not found" }, 404);
  }

  const assessment = await db.assessment.create({
    data: {
      ...body,
      userId: user.id,
    },
  });

  const response = {
    success: true,
    assessment: {
      ...assessment,
      assessmentDate: assessment.assessmentDate.toISOString(),
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    },
  };

  return c.json(response, 201);
});

// POST /api/assessments/:id/media - Upload media for an assessment
assessmentsRouter.post(
  "/:id/media",
  zValidator("json", uploadAssessmentMediaRequestSchema),
  async (c) => {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { id } = c.req.param();
    const body = c.req.valid("json");

    // Verify that the assessment belongs to this user
    const assessment = await db.assessment.findFirst({
      where: { id, userId: user.id },
    });

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    // In a real implementation, you would handle file upload here
    // For now, we'll use a placeholder URL
    const media = await db.assessmentMedia.create({
      data: {
        assessmentId: id,
        type: body.type,
        url: `https://placeholder.com/media/${Date.now()}`,
        caption: body.caption,
      },
    });

    const response = {
      success: true,
      media: {
        ...media,
        createdAt: media.createdAt.toISOString(),
      },
    };

    return c.json(response, 201);
  }
);

// POST /api/assessments/:id/analyze - AI-powered analysis
assessmentsRouter.post("/:id/analyze", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: {
      media: true,
      client: true,
    },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  // TODO: Implement actual AI analysis using OpenAI API
  // For now, generate a simple summary
  const aiSummary = `Assessment for ${assessment.client.name} (${assessment.assessmentType}).
Captured ${assessment.media.length} media items.
Status: ${assessment.status}.
${assessment.location ? `Location: ${assessment.location}.` : ""}
Recommendation: Complete equipment evaluation and generate quote.`;

  // Update assessment with AI summary
  await db.assessment.update({
    where: { id },
    data: { aiSummary },
  });

  return c.json({
    success: true,
    summary: aiSummary,
  });
});

export default assessmentsRouter;
