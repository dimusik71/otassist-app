import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createClientRequestSchema,
  createClientResponseSchema,
  getClientsResponseSchema,
} from "@/shared/contracts";

const clientsRouter = new Hono<AppType>();

// GET /api/clients - Get all clients for the current user
clientsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const clients = await db.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    clients: clients.map((client) => ({
      ...client,
      dateOfBirth: client.dateOfBirth?.toISOString() ?? null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
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

export default clientsRouter;
