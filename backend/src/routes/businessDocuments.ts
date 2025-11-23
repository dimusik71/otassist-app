import { Hono } from "hono";
import type { AppType } from "../index.js";
import { db } from "../db.js";
import {
  createBusinessDocumentRequestSchema,
  updateBusinessDocumentRequestSchema,
} from "../../../shared/contracts.js";

const businessDocuments = new Hono<AppType>();

// Get all business documents for current user
businessDocuments.get("/", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const documentType = c.req.query("documentType");
    const status = c.req.query("status");

    // Build filter
    const where: any = { userId: session.user.id };
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;

    const documents = await db.businessDocument.findMany({
      where,
      orderBy: [
        { status: "asc" }, // Active/Overdue first
        { dueDate: "asc" }, // Earliest due date first
        { createdAt: "desc" },
      ],
    });

    return c.json({
      documents: documents.map((doc) => ({
        ...doc,
        amount: doc.amount ? Number(doc.amount) : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        dueDate: doc.dueDate?.toISOString() || null,
        paidDate: doc.paidDate?.toISOString() || null,
        reminderDate: doc.reminderDate?.toISOString() || null,
        expiryDate: doc.expiryDate?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching business documents:", error);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

// Get single business document
businessDocuments.get("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const document = await db.businessDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    if (document.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    return c.json({
      document: {
        ...document,
        amount: document.amount ? Number(document.amount) : null,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        dueDate: document.dueDate?.toISOString() || null,
        paidDate: document.paidDate?.toISOString() || null,
        reminderDate: document.reminderDate?.toISOString() || null,
        expiryDate: document.expiryDate?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching business document:", error);
    return c.json({ error: "Failed to fetch document" }, 500);
  }
});

// Create new business document
businessDocuments.post("/", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = createBusinessDocumentRequestSchema.parse(body);

    // Convert tags array to JSON string
    const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null;

    const document = await db.businessDocument.create({
      data: {
        userId: session.user.id,
        documentType: validatedData.documentType,
        title: validatedData.title,
        content: validatedData.content,
        fileUrl: validatedData.fileUrl,
        amount: validatedData.amount,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status || "active",
        tags,
        notes: validatedData.notes,
        metadata: validatedData.metadata,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
      },
    });

    return c.json(
      {
        success: true,
        document: {
          ...document,
          amount: document.amount ? Number(document.amount) : null,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
          dueDate: document.dueDate?.toISOString() || null,
          paidDate: document.paidDate?.toISOString() || null,
          reminderDate: document.reminderDate?.toISOString() || null,
          expiryDate: document.expiryDate?.toISOString() || null,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error creating business document:", error);
    return c.json({ error: "Failed to create document" }, 500);
  }
});

// Update business document
businessDocuments.put("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const body = await c.req.json();
    const validatedData = updateBusinessDocumentRequestSchema.parse(body);

    // Check ownership
    const existing = await db.businessDocument.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }
    if (existing.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Convert tags array to JSON string if provided
    const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : undefined;

    const updateData: any = {
      ...validatedData,
      tags,
    };

    // Convert date strings to Date objects
    if (validatedData.dueDate) updateData.dueDate = new Date(validatedData.dueDate);
    if (validatedData.paidDate) updateData.paidDate = new Date(validatedData.paidDate);
    if (validatedData.expiryDate) updateData.expiryDate = new Date(validatedData.expiryDate);

    const document = await db.businessDocument.update({
      where: { id },
      data: updateData,
    });

    return c.json({
      success: true,
      document: {
        ...document,
        amount: document.amount ? Number(document.amount) : null,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        dueDate: document.dueDate?.toISOString() || null,
        paidDate: document.paidDate?.toISOString() || null,
        reminderDate: document.reminderDate?.toISOString() || null,
        expiryDate: document.expiryDate?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error updating business document:", error);
    return c.json({ error: "Failed to update document" }, 500);
  }
});

// Delete business document
businessDocuments.delete("/:id", async (c) => {
  try {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const document = await db.businessDocument.findUnique({ where: { id } });

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }
    if (document.userId !== session.user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.businessDocument.delete({ where: { id } });

    return c.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting business document:", error);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});

export default businessDocuments;
