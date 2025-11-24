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
  updateAssessmentRequestSchema,
  deleteAssessmentResponseSchema,
  addEquipmentRecommendationRequestSchema,
  getEquipmentRecommendationsResponseSchema,
  deleteEquipmentRecommendationResponseSchema,
} from "@/shared/contracts";
import {
  calculateAssessmentRetentionDate,
  canPermanentlyDelete,
} from "../utils/retention";

const assessmentsRouter = new Hono<AppType>();

// GET /api/assessments - Get all active (non-archived) assessments for the current user
assessmentsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assessments = await db.assessment.findMany({
    where: { userId: user.id, isArchived: false },
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

    // Create media record with the uploaded file URL
    const media = await db.assessmentMedia.create({
      data: {
        assessmentId: id,
        type: body.type,
        url: body.url,
        caption: body.caption,
        aiAnalysis: body.aiAnalysis,
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

// POST /api/assessments/:id/analyze - AI-powered analysis with multi-agent system
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

  // Multi-agent orchestration for comprehensive analysis
  try {
    // Agent 1: GPT-5 Mini for assessment summary
    const summaryPrompt = `Generate a professional OT/AH assessment summary:

Client: ${assessment.client.name}
Assessment Type: ${assessment.assessmentType}
Location: ${assessment.location || "Not specified"}
Media Captured: ${assessment.media.length} items
- Photos: ${assessment.media.filter((m) => m.type === "photo").length}
- Videos: ${assessment.media.filter((m) => m.type === "video").length}
- Audio: ${assessment.media.filter((m) => m.type === "audio").length}
Notes: ${assessment.notes || "None"}

Provide a concise professional summary (3-4 paragraphs) including:
1. Assessment overview and context
2. Key observations from media
3. Client needs identified
4. Recommended next steps`;

    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Occupational Therapist assistant specializing in client assessments and care planning.",
          },
          { role: "user", content: summaryPrompt },
        ],
        max_completion_tokens: 1000,
        temperature: 1,
      }),
    });

    let aiSummary = "";
    if (summaryResponse.ok) {
      const summaryData = (await summaryResponse.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      aiSummary = summaryData.choices?.[0]?.message?.content || "";
    } else {
      aiSummary = `Assessment for ${assessment.client.name} (${assessment.assessmentType}). ${assessment.media.length} media items captured. Detailed analysis pending.`;
    }

    // Update assessment with AI summary
    await db.assessment.update({
      where: { id },
      data: { aiSummary },
    });

    return c.json({
      success: true,
      summary: aiSummary,
      model: "gpt-5-mini",
      mediaAnalyzed: assessment.media.length,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return c.json(
      {
        error: "AI analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// PUT /api/assessments/:id - Update an assessment
assessmentsRouter.put("/:id", zValidator("json", updateAssessmentRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = c.req.valid("json");

  // Verify that the assessment belongs to this user
  const existingAssessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingAssessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const assessment = await db.assessment.update({
    where: { id },
    data: body,
  });

  return c.json({
    success: true,
    assessment: {
      ...assessment,
      assessmentDate: assessment.assessmentDate.toISOString(),
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    },
  });
});

// DELETE /api/assessments/:id - Archive an assessment (soft delete)
assessmentsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = await c.req.json();
  const deletionReason = body.reason || "No reason provided";

  // Verify that the assessment belongs to this user
  const existingAssessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: { client: true },
  });

  if (!existingAssessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const now = new Date();
  const retentionDate = calculateAssessmentRetentionDate(
    existingAssessment.status,
    existingAssessment.completedAt,
    now,
    existingAssessment.client.dateOfBirth
  );

  // Archive the assessment
  await db.assessment.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: now,
      deletionReason,
      canDeleteAfter: retentionDate,
    },
  });

  return c.json({
    success: true,
    message: "Assessment archived successfully",
    canDeleteAfter: retentionDate.toISOString(),
    retentionInfo:
      existingAssessment.status === "draft" || existingAssessment.status === "in_progress"
        ? "Incomplete assessment can be permanently deleted in 30 days"
        : "Completed assessment must be retained for 7 years",
  });
});

// GET /api/assessments/archived - Get all archived assessments with search
assessmentsRouter.get("/archived", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const search = c.req.query("search") || "";

  const assessments = await db.assessment.findMany({
    where: {
      userId: user.id,
      isArchived: true,
      ...(search
        ? {
            OR: [
              { client: { name: { contains: search } } },
              { assessmentType: { contains: search } },
              { location: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      media: { select: { id: true } },
    },
    orderBy: { archivedAt: "desc" },
  });

  const response = {
    assessments: assessments.map((assessment) => ({
      ...assessment,
      assessmentDate: assessment.assessmentDate.toISOString(),
      archivedAt: assessment.archivedAt?.toISOString() ?? null,
      canDeleteAfter: assessment.canDeleteAfter?.toISOString() ?? null,
      completedAt: assessment.completedAt?.toISOString() ?? null,
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
      canPermanentlyDelete: canPermanentlyDelete(assessment.canDeleteAfter),
      mediaCount: assessment.media.length,
    })),
  };

  return c.json(response);
});

// DELETE /api/assessments/:id/permanent - Permanently delete an archived assessment
assessmentsRouter.delete("/:id/permanent", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the assessment belongs to this user and is archived
  const existingAssessment = await db.assessment.findFirst({
    where: { id, userId: user.id, isArchived: true },
  });

  if (!existingAssessment) {
    return c.json({ error: "Assessment not found or not archived" }, 404);
  }

  // Check if retention period has passed
  if (!canPermanentlyDelete(existingAssessment.canDeleteAfter)) {
    const daysRemaining = Math.ceil(
      (existingAssessment.canDeleteAfter!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return c.json(
      {
        error: "Cannot delete yet",
        message: `This assessment must be retained for ${daysRemaining} more days due to healthcare record retention requirements.`,
        canDeleteAfter: existingAssessment.canDeleteAfter?.toISOString(),
      },
      403
    );
  }

  // Permanently delete the assessment (Prisma cascade will delete media, responses, etc.)
  await db.assessment.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Assessment and all associated records permanently deleted",
  });
});

// POST /api/assessments/:id/restore - Restore an archived assessment
assessmentsRouter.post("/:id/restore", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the assessment belongs to this user and is archived
  const existingAssessment = await db.assessment.findFirst({
    where: { id, userId: user.id, isArchived: true },
  });

  if (!existingAssessment) {
    return c.json({ error: "Assessment not found or not archived" }, 404);
  }

  // Restore the assessment
  const assessment = await db.assessment.update({
    where: { id },
    data: {
      isArchived: false,
      archivedAt: null,
      deletionReason: null,
      canDeleteAfter: null,
    },
  });

  return c.json({
    success: true,
    message: "Assessment restored successfully",
    assessment: {
      ...assessment,
      assessmentDate: assessment.assessmentDate.toISOString(),
      completedAt: assessment.completedAt?.toISOString() ?? null,
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    },
  });
});

// POST /api/assessments/:id/equipment - Add equipment recommendation
assessmentsRouter.post(
  "/:id/equipment",
  zValidator("json", addEquipmentRecommendationRequestSchema),
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

    // Verify equipment exists
    const equipment = await db.equipmentItem.findUnique({
      where: { id: body.equipmentId },
    });

    if (!equipment) {
      return c.json({ error: "Equipment not found" }, 404);
    }

    // Create recommendation
    const recommendation = await db.assessmentEquipment.create({
      data: {
        assessmentId: id,
        equipmentId: body.equipmentId,
        priority: body.priority,
        quantity: body.quantity,
        notes: body.notes,
        // AI Justification fields
        aiJustification: body.aiJustification,
        ndisApproved: body.ndisApproved || false,
        ndisCategory: body.ndisCategory,
        sahApproved: body.sahApproved || false,
        sahCategory: body.sahCategory,
        fundingEligibility: body.fundingEligibility ? JSON.stringify(body.fundingEligibility) : null,
        clinicalRationale: body.clinicalRationale,
      },
    });

    return c.json({
      success: true,
      recommendation: {
        ...recommendation,
        createdAt: recommendation.createdAt.toISOString(),
      },
    }, 201);
  }
);

// GET /api/assessments/:id/equipment - Get equipment recommendations
assessmentsRouter.get("/:id/equipment", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const recommendations = await db.assessmentEquipment.findMany({
    where: { assessmentId: id },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          brand: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    recommendations: recommendations.map((rec) => ({
      id: rec.id,
      equipmentId: rec.equipmentId,
      priority: rec.priority,
      quantity: rec.quantity,
      notes: rec.notes,
      // AI Justification fields
      aiJustification: rec.aiJustification,
      ndisApproved: rec.ndisApproved,
      ndisCategory: rec.ndisCategory,
      sahApproved: rec.sahApproved,
      sahCategory: rec.sahCategory,
      fundingEligibility: rec.fundingEligibility,
      clinicalRationale: rec.clinicalRationale,
      createdAt: rec.createdAt.toISOString(),
      equipment: {
        ...rec.equipment,
        price: Number(rec.equipment.price),
      },
    })),
  };

  return c.json(response);
});

// DELETE /api/assessments/:assessmentId/equipment/:id - Delete equipment recommendation
assessmentsRouter.delete("/:assessmentId/equipment/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { assessmentId, id } = c.req.param();

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  await db.assessmentEquipment.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Equipment recommendation deleted successfully",
  });
});

// POST /api/assessments/:assessmentId/responses - Save or update a response to a question
assessmentsRouter.post("/:assessmentId/responses", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { assessmentId } = c.req.param();
  const body = await c.req.json();
  const { questionId, sectionId, answer, notes, mediaUrl, mediaType, needsFollowUp } = body;

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  // Check if response already exists
  const existing = await db.assessmentResponse.findUnique({
    where: {
      assessmentId_questionId: {
        assessmentId,
        questionId,
      },
    },
  });

  let response;
  if (existing) {
    // Update existing response
    response = await db.assessmentResponse.update({
      where: { id: existing.id },
      data: {
        answer,
        notes,
        mediaUrl,
        mediaType,
        needsFollowUp: needsFollowUp || false,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new response
    response = await db.assessmentResponse.create({
      data: {
        id: crypto.randomUUID(),
        assessmentId,
        questionId,
        sectionId,
        answer,
        notes,
        mediaUrl,
        mediaType,
        needsFollowUp: needsFollowUp || false,
      },
    });
  }

  return c.json({ success: true, response });
});

// POST /api/assessments/:assessmentId/responses/:responseId/analyze - Get AI analysis for a specific response
assessmentsRouter.post("/:assessmentId/responses/:responseId/analyze", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { assessmentId, responseId } = c.req.param();

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const response = await db.assessmentResponse.findUnique({
    where: { id: responseId },
  });

  if (!response) {
    return c.json({ error: "Response not found" }, 404);
  }

  // Import the assessment form to get the AI prompt
  const { getQuestionById } = await import("../../../src/constants/assessmentForm");
  const question = getQuestionById(response.questionId);

  if (!question) {
    return c.json({ error: "Question not found in form" }, 404);
  }

  try {
    // Call AI for analysis
    const analysisPrompt = `${question.aiPrompt}

Current Response:
- Question: ${question.question}
- Answer: ${response.answer || "Not answered"}
- Notes: ${response.notes || "None"}
- Media: ${response.mediaUrl ? "Uploaded" : "No media"}

Provide:
1. Analysis of what you can see/understand
2. Specific suggestions for improvement
3. Whether more documentation is needed (photos, videos, or descriptions)`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Occupational Therapist conducting home environmental assessments. Provide detailed, actionable feedback to guide the assessment process.",
          },
          { role: "user", content: analysisPrompt },
        ],
        max_completion_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI API request failed");
    }

    const aiData = (await aiResponse.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const analysis = aiData.choices?.[0]?.message?.content || "";

    // Update the response with AI analysis
    await db.assessmentResponse.update({
      where: { id: responseId },
      data: {
        aiAnalysis: analysis,
        updatedAt: new Date(),
      },
    });

    return c.json({
      success: true,
      analysis,
      model: "gpt-4o",
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return c.json(
      {
        error: "AI analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /api/assessments/:assessmentId/responses - Get all responses for an assessment
assessmentsRouter.get("/:assessmentId/responses", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { assessmentId } = c.req.param();

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  const responses = await db.assessmentResponse.findMany({
    where: { assessmentId },
    orderBy: { createdAt: "asc" },
  });

  return c.json({ success: true, responses });
});

// GET /api/assessments/client/:clientId/previous-responses - Get all responses from previous assessments for a client
assessmentsRouter.get("/client/:clientId/previous-responses", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { clientId } = c.req.param();

  // Verify that the client belongs to this user
  const client = await db.client.findFirst({
    where: { id: clientId, userId: user.id },
  });

  if (!client) {
    return c.json({ error: "Client not found" }, 404);
  }

  // Get all completed assessments for this client (excluding current assessment if any)
  const assessments = await db.assessment.findMany({
    where: {
      clientId,
      userId: user.id,
      status: { in: ["completed", "approved"] }, // Only get completed assessments for pre-filling
    },
    orderBy: { updatedAt: "desc" },
  });

  // Get all responses from these assessments
  const assessmentIds = assessments.map((a) => a.id);
  const responses = await db.assessmentResponse.findMany({
    where: {
      assessmentId: { in: assessmentIds },
    },
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ success: true, responses });
});

export default assessmentsRouter;
