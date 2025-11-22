import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createClientRequestSchema,
  createClientResponseSchema,
  getClientsResponseSchema,
  updateClientRequestSchema,
  deleteClientResponseSchema,
} from "@/shared/contracts";
import {
  calculateClientRetentionDate,
  calculateAssessmentRetentionDate,
  canPermanentlyDelete,
  isChild as checkIsChild,
} from "../utils/retention";

const clientsRouter = new Hono<AppType>();

// GET /api/clients - Get all active (non-archived) clients for the current user
clientsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const clients = await db.client.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    clients: clients.map((client) => ({
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      archivedAt: client.archivedAt?.toISOString() ?? null,
      canDeleteAfter: client.canDeleteAfter?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    })),
  };

  return c.json(response);
});

// GET /api/clients/archived - Get all archived clients with search
clientsRouter.get("/archived", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const search = c.req.query("search") || "";

  const clients = await db.client.findMany({
    where: {
      userId: user.id,
      isArchived: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      assessments: {
        select: {
          id: true,
          assessmentType: true,
          status: true,
          isArchived: true,
        },
      },
    },
    orderBy: { archivedAt: "desc" },
  });

  const response = {
    clients: clients.map((client) => ({
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      archivedAt: client.archivedAt?.toISOString() ?? null,
      canDeleteAfter: client.canDeleteAfter?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      canPermanentlyDelete: canPermanentlyDelete(client.canDeleteAfter),
      assessmentCount: client.assessments.length,
    })),
  };

  return c.json(response);
});

// POST /api/clients - Create a new client
clientsRouter.post("/", zValidator("json", createClientRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  const client = await db.client.create({
    data: {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      userId: user.id,
    },
  });

  const response = {
    success: true,
    client: {
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
  };

  return c.json(response, 201);
});

// PUT /api/clients/:id - Update a client
clientsRouter.put("/:id", zValidator("json", updateClientRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = c.req.valid("json");

  // Verify that the client belongs to this user
  const existingClient = await db.client.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingClient) {
    return c.json({ error: "Client not found" }, 404);
  }

  const client = await db.client.update({
    where: { id },
    data: {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    },
  });

  const response = {
    success: true,
    client: {
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
  };

  return c.json(response);
});

// DELETE /api/clients/:id - Archive a client (soft delete) and cascade to assessments
clientsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = await c.req.json();
  const deletionReason = body.reason || "No reason provided";

  // Verify that the client belongs to this user
  const existingClient = await db.client.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingClient) {
    return c.json({ error: "Client not found" }, 404);
  }

  const now = new Date();
  const clientIsChild = checkIsChild(existingClient.dateOfBirth);
  const retentionDate = calculateClientRetentionDate(existingClient.dateOfBirth, now);

  // Archive the client
  const client = await db.client.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: now,
      deletionReason,
      canDeleteAfter: retentionDate,
      isChild: clientIsChild,
    },
  });

  // Archive all associated assessments
  const assessments = await db.assessment.findMany({
    where: { clientId: id },
  });

  for (const assessment of assessments) {
    const assessmentRetentionDate = calculateAssessmentRetentionDate(
      assessment.status,
      assessment.completedAt,
      now,
      existingClient.dateOfBirth
    );

    await db.assessment.update({
      where: { id: assessment.id },
      data: {
        isArchived: true,
        archivedAt: now,
        deletionReason: `Client archived: ${deletionReason}`,
        canDeleteAfter: assessmentRetentionDate,
      },
    });
  }

  return c.json({
    success: true,
    message: `Client and ${assessments.length} associated assessments archived successfully`,
    archivedCount: assessments.length + 1,
    canDeleteAfter: retentionDate.toISOString(),
  });
});

// DELETE /api/clients/:id/permanent - Permanently delete an archived client
clientsRouter.delete("/:id/permanent", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the client belongs to this user and is archived
  const existingClient = await db.client.findFirst({
    where: { id, userId: user.id, isArchived: true },
  });

  if (!existingClient) {
    return c.json({ error: "Client not found or not archived" }, 404);
  }

  // Check if retention period has passed
  if (!canPermanentlyDelete(existingClient.canDeleteAfter)) {
    const daysRemaining = Math.ceil(
      (existingClient.canDeleteAfter!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return c.json(
      {
        error: "Cannot delete yet",
        message: `This client must be retained for ${daysRemaining} more days due to healthcare record retention requirements.`,
        canDeleteAfter: existingClient.canDeleteAfter?.toISOString(),
      },
      403
    );
  }

  // Permanently delete the client (Prisma cascade will delete assessments)
  await db.client.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Client and all associated records permanently deleted",
  });
});

// POST /api/clients/:id/restore - Restore an archived client
clientsRouter.post("/:id/restore", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the client belongs to this user and is archived
  const existingClient = await db.client.findFirst({
    where: { id, userId: user.id, isArchived: true },
  });

  if (!existingClient) {
    return c.json({ error: "Client not found or not archived" }, 404);
  }

  // Restore the client
  const client = await db.client.update({
    where: { id },
    data: {
      isArchived: false,
      archivedAt: null,
      deletionReason: null,
      canDeleteAfter: null,
    },
  });

  // Restore all associated assessments
  await db.assessment.updateMany({
    where: { clientId: id, isArchived: true },
    data: {
      isArchived: false,
      archivedAt: null,
      deletionReason: null,
      canDeleteAfter: null,
    },
  });

  return c.json({
    success: true,
    message: "Client and associated assessments restored successfully",
    client: {
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
  });
});

export default clientsRouter;
