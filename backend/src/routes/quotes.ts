import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import { createQuoteRequestSchema, createQuoteResponseSchema } from "@/shared/contracts";

const quotesRouter = new Hono<AppType>();

// POST /api/quotes - Create a new quote
quotesRouter.post("/", zValidator("json", createQuoteRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = c.req.valid("json");

  // Verify that the assessment belongs to this user
  const assessment = await db.assessment.findFirst({
    where: { id: body.assessmentId, userId: user.id },
  });

  if (!assessment) {
    return c.json({ error: "Assessment not found" }, 404);
  }

  // Calculate totals
  const subtotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Generate quote number
  const quoteCount = await db.quote.count();
  const quoteNumber = `Q${String(quoteCount + 1).padStart(6, "0")}`;

  const quote = await db.quote.create({
    data: {
      assessmentId: body.assessmentId,
      quoteNumber,
      optionName: body.optionName,
      items: JSON.stringify(body.items),
      subtotal,
      tax,
      total,
      notes: body.notes,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    },
  });

  const response = {
    success: true,
    quote: {
      ...quote,
      subtotal: Number(quote.subtotal),
      tax: Number(quote.tax),
      total: Number(quote.total),
      validUntil: quote.validUntil?.toISOString() ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
    },
  };

  return c.json(response, 201);
});

export default quotesRouter;
