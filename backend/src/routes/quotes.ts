import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createQuoteRequestSchema,
  createQuoteResponseSchema,
  getQuotesResponseSchema,
  updateQuoteRequestSchema,
  deleteQuoteResponseSchema,
} from "@/shared/contracts";

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

// GET /api/quotes/:assessmentId - Get all quotes for an assessment
quotesRouter.get("/:assessmentId", async (c) => {
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

  const quotes = await db.quote.findMany({
    where: { assessmentId },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    quotes: quotes.map((quote) => ({
      ...quote,
      subtotal: Number(quote.subtotal),
      tax: Number(quote.tax),
      total: Number(quote.total),
      validUntil: quote.validUntil?.toISOString() ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
    })),
  };

  return c.json(response);
});

// PUT /api/quotes/:id - Update a quote
quotesRouter.put("/:id", zValidator("json", updateQuoteRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = c.req.valid("json");

  // Verify that the quote's assessment belongs to this user
  const existingQuote = await db.quote.findUnique({
    where: { id },
    include: { assessment: true },
  });

  if (!existingQuote || existingQuote.assessment.userId !== user.id) {
    return c.json({ error: "Quote not found" }, 404);
  }

  const quote = await db.quote.update({
    where: { id },
    data: body,
  });

  return c.json({
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
  });
});

// DELETE /api/quotes/:id - Delete a quote
quotesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the quote's assessment belongs to this user
  const existingQuote = await db.quote.findUnique({
    where: { id },
    include: { assessment: true },
  });

  if (!existingQuote || existingQuote.assessment.userId !== user.id) {
    return c.json({ error: "Quote not found" }, 404);
  }

  await db.quote.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Quote deleted successfully",
  });
});

export default quotesRouter;
