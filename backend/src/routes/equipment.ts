import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createEquipmentRequestSchema,
  createEquipmentResponseSchema,
  getEquipmentResponseSchema,
} from "@/shared/contracts";

const equipmentRouter = new Hono<AppType>();

// GET /api/equipment - Get all equipment items
equipmentRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const equipment = await db.equipmentItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const response = {
    equipment: equipment.map((item) => ({
      ...item,
      price: Number(item.price),
      supplierPrice: item.supplierPrice ? Number(item.supplierPrice) : null,
      margin: item.margin ? Number(item.margin) : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };

  return c.json(response);
});

// POST /api/equipment - Create a new equipment item
equipmentRouter.post("/", zValidator("json", createEquipmentRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  const equipment = await db.equipmentItem.create({
    data: body,
  });

  const response = {
    success: true,
    equipment: {
      ...equipment,
      price: Number(equipment.price),
      supplierPrice: equipment.supplierPrice ? Number(equipment.supplierPrice) : null,
      margin: equipment.margin ? Number(equipment.margin) : null,
      createdAt: equipment.createdAt.toISOString(),
      updatedAt: equipment.updatedAt.toISOString(),
    },
  };

  return c.json(response, 201);
});

export default equipmentRouter;
