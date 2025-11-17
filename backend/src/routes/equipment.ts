import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createEquipmentRequestSchema,
  createEquipmentResponseSchema,
  getEquipmentResponseSchema,
  updateEquipmentRequestSchema,
  deleteEquipmentResponseSchema,
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

// PUT /api/equipment/:id - Update an equipment item
equipmentRouter.put("/:id", zValidator("json", updateEquipmentRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = c.req.valid("json");

  const equipment = await db.equipmentItem.update({
    where: { id },
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

  return c.json(response);
});

// DELETE /api/equipment/:id - Delete an equipment item
equipmentRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  await db.equipmentItem.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Equipment deleted successfully",
  });
});

export default equipmentRouter;
