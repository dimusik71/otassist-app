import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import type { AppType } from "../types";
import {
  createInvoiceRequestSchema,
  createInvoiceResponseSchema,
  getInvoicesResponseSchema,
  updateInvoiceRequestSchema,
  deleteInvoiceResponseSchema,
} from "@/shared/contracts";

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

// GET /api/invoices/:assessmentId - Get all invoices for an assessment
invoicesRouter.get("/:assessmentId", async (c) => {
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

  const invoices = await db.invoice.findMany({
    where: { assessmentId },
    orderBy: { createdAt: "desc" },
  });

  const response = {
    invoices: invoices.map((invoice) => ({
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
    })),
  };

  return c.json(response);
});

// PUT /api/invoices/:id - Update an invoice
invoicesRouter.put("/:id", zValidator("json", updateInvoiceRequestSchema), async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();
  const body = c.req.valid("json");

  // Verify that the invoice's assessment belongs to this user
  const existingInvoice = await db.invoice.findUnique({
    where: { id },
    include: { assessment: true },
  });

  if (!existingInvoice || existingInvoice.assessment.userId !== user.id) {
    return c.json({ error: "Invoice not found" }, 404);
  }

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      ...body,
      paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
    },
  });

  return c.json({
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
  });
});

// DELETE /api/invoices/:id - Delete an invoice
invoicesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { id } = c.req.param();

  // Verify that the invoice's assessment belongs to this user
  const existingInvoice = await db.invoice.findUnique({
    where: { id },
    include: { assessment: true },
  });

  if (!existingInvoice || existingInvoice.assessment.userId !== user.id) {
    return c.json({ error: "Invoice not found" }, 404);
  }

  await db.invoice.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: "Invoice deleted successfully",
  });
});

export default invoicesRouter;
