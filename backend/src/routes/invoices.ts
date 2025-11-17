import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import { createInvoiceRequestSchema, createInvoiceResponseSchema } from "@/shared/contracts";

const invoicesRouter = new Hono<AppType>();

// POST /api/invoices - Create a new invoice
invoicesRouter.post("/", zValidator("json", createInvoiceRequestSchema), async (c) => {
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
  let subtotal = body.items.reduce((sum, item) => sum + item.rate * item.quantity, 0);

  // Add hourly rate if provided
  if (body.hourlyRate && body.hoursWorked) {
    subtotal += body.hourlyRate * body.hoursWorked;
  }

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Generate invoice number
  const invoiceCount = await db.invoice.count();
  const invoiceNumber = `INV${String(invoiceCount + 1).padStart(6, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      assessmentId: body.assessmentId,
      invoiceNumber,
      items: JSON.stringify(body.items),
      subtotal,
      tax,
      total,
      hourlyRate: body.hourlyRate,
      hoursWorked: body.hoursWorked,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      notes: body.notes,
    },
  });

  const response = {
    success: true,
    invoice: {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      hourlyRate: invoice.hourlyRate ? Number(invoice.hourlyRate) : null,
      hoursWorked: invoice.hoursWorked ? Number(invoice.hoursWorked) : null,
      dueDate: invoice.dueDate?.toISOString() ?? null,
      paidDate: invoice.paidDate?.toISOString() ?? null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    },
  };

  return c.json(response, 201);
});

export default invoicesRouter;
