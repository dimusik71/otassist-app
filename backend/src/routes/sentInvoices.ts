import { Hono } from "hono";
import type { AppType } from "../index.js";
import { db } from "../db.js";
import { createSentInvoiceRequestSchema } from "../../../shared/contracts.js";

const sentInvoices = new Hono<AppType>();

// Get all sent invoices for current user
sentInvoices.get("/", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const status = c.req.query("status");
    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const invoices = await db.sentInvoice.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
    });

    return c.json({
      invoices: invoices.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        paidDate: inv.paidDate?.toISOString() || null,
        lastReminderDate: inv.lastReminderDate?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching sent invoices:", error);
    return c.json({ error: "Failed to fetch invoices" }, 500);
  }
});

// Create new sent invoice
sentInvoices.post("/", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = createSentInvoiceRequestSchema.parse(body);

    const invoice = await db.sentInvoice.create({
      data: {
        userId: session.user.id,
        businessDocumentId: validatedData.businessDocumentId,
        recipientEmail: validatedData.recipientEmail,
        recipientName: validatedData.recipientName,
        invoiceNumber: validatedData.invoiceNumber,
        amount: validatedData.amount,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: new Date(validatedData.dueDate),
        notes: validatedData.notes,
      },
    });

    return c.json(
      {
        success: true,
        invoice: {
          ...invoice,
          amount: Number(invoice.amount),
          issueDate: invoice.issueDate.toISOString(),
          dueDate: invoice.dueDate.toISOString(),
          paidDate: invoice.paidDate?.toISOString() || null,
          lastReminderDate: invoice.lastReminderDate?.toISOString() || null,
          createdAt: invoice.createdAt.toISOString(),
          updatedAt: invoice.updatedAt.toISOString(),
        },
      },
      201
    );
  } catch (error) {
    console.error("Error creating sent invoice:", error);
    return c.json({ error: "Failed to create invoice" }, 500);
  }
});

// Mark invoice as paid
sentInvoices.put("/:id/mark-paid", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const existing = await db.sentInvoice.findUnique({ where: { id } });

    if (!existing) {
      return c.json({ error: "Invoice not found" }, 404);
    }
    if (existing.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const invoice = await db.sentInvoice.update({
      where: { id },
      data: {
        status: "paid",
        paidDate: new Date(),
      },
    });

    // Also update linked business document if exists
    if (existing.businessDocumentId) {
      await db.businessDocument.update({
        where: { id: existing.businessDocumentId },
        data: {
          status: "paid",
          paidDate: new Date(),
        },
      });
    }

    return c.json({
      success: true,
      invoice: {
        ...invoice,
        amount: Number(invoice.amount),
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        paidDate: invoice.paidDate?.toISOString() || null,
        lastReminderDate: invoice.lastReminderDate?.toISOString() || null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    return c.json({ error: "Failed to mark invoice as paid" }, 500);
  }
});

// Delete invoice
sentInvoices.delete("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const invoice = await db.sentInvoice.findUnique({ where: { id } });

    if (!invoice) {
      return c.json({ error: "Invoice not found" }, 404);
    }
    if (invoice.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.sentInvoice.delete({ where: { id } });

    return c.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return c.json({ error: "Failed to delete invoice" }, 500);
  }
});

// Check and update invoice statuses (called by scheduler)
sentInvoices.post("/check-reminders", async (c) => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find invoices that need 3-day reminders
    const needsThreeDayReminder = await db.sentInvoice.findMany({
      where: {
        status: "pending",
        dueDate: {
          lte: threeDaysFromNow,
          gte: now,
        },
      },
    });

    // Find overdue invoices
    const overdueInvoices = await db.sentInvoice.findMany({
      where: {
        status: {
          in: ["pending", "reminded_3_days"],
        },
        dueDate: {
          lt: now,
        },
      },
    });

    console.log(`📧 Found ${needsThreeDayReminder.length} invoices needing 3-day reminder`);
    console.log(`⚠️  Found ${overdueInvoices.length} overdue invoices`);

    // Update statuses and prepare for reminders
    const updatedThreeDayReminders = [];
    for (const invoice of needsThreeDayReminder) {
      const updated = await db.sentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "reminded_3_days",
          remindersSent: invoice.remindersSent + 1,
          lastReminderDate: now,
        },
      });
      updatedThreeDayReminders.push(updated);
    }

    const updatedOverdueReminders = [];
    for (const invoice of overdueInvoices) {
      const updated = await db.sentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "reminded_overdue",
          remindersSent: invoice.remindersSent + 1,
          lastReminderDate: now,
        },
      });
      updatedOverdueReminders.push(updated);

      // Also update linked business document
      if (invoice.businessDocumentId) {
        await db.businessDocument.update({
          where: { id: invoice.businessDocumentId },
          data: {
            status: "overdue",
            reminderSent: true,
            reminderDate: now,
          },
        });
      }
    }

    return c.json({
      success: true,
      threeDayReminders: updatedThreeDayReminders.length,
      overdueReminders: updatedOverdueReminders.length,
      message: "Reminder check completed",
    });
  } catch (error) {
    console.error("Error checking reminders:", error);
    return c.json({ error: "Failed to check reminders" }, 500);
  }
});

export default sentInvoices;
