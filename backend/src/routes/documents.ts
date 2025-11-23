import { Hono } from "hono";
import type { AppType } from "../index.js";
import { db } from "../db.js";
import {
  createDocumentRequestSchema,
  updateDocumentRequestSchema,
} from "../../../shared/contracts.js";

const documents = new Hono<AppType>();

// Get all documents for a client
documents.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const clientId = c.req.query("clientId");
    const assessmentId = c.req.query("assessmentId");
    const documentType = c.req.query("documentType");

    if (!clientId) {
      return c.json({ error: "clientId query parameter is required" }, 400);
    }

    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    // Build filter
    const where: any = { clientId };
    if (assessmentId) where.assessmentId = assessmentId;
    if (documentType) where.documentType = documentType;

    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      documents: documents.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

// Get single document by ID
documents.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    const document = await db.document.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Verify document belongs to user's client
    if (document.client.userId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    return c.json({
      document: {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return c.json({ error: "Failed to fetch document" }, 500);
  }
});

// Create new document
documents.post("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = createDocumentRequestSchema.parse(body);

    // Verify client belongs to user
    const client = await db.client.findFirst({
      where: {
        id: validatedData.clientId,
        userId: user.id,
      },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    // Create document
    const document = await db.document.create({
      data: {
        clientId: validatedData.clientId,
        assessmentId: validatedData.assessmentId,
        documentType: validatedData.documentType,
        title: validatedData.title,
        content: validatedData.content,
        format: validatedData.format || "json",
        metadata: validatedData.metadata,
        fileUrl: validatedData.fileUrl,
        status: validatedData.status || "draft",
      },
    });

    return c.json(
      {
        success: true,
        document: {
          ...document,
          createdAt: document.createdAt.toISOString(),
          updatedAt: document.updatedAt.toISOString(),
        },
      },
      201
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return c.json({ error: "Failed to create document" }, 500);
  }
});

// Update document
documents.put("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const body = await c.req.json();
    const validatedData = updateDocumentRequestSchema.parse(body);

    // Get existing document and verify ownership
    const existingDocument = await db.document.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!existingDocument) {
      return c.json({ error: "Document not found" }, 404);
    }

    if (existingDocument.client.userId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Update document (increment version)
    const document = await db.document.update({
      where: { id },
      data: {
        ...validatedData,
        version: existingDocument.version + 1,
      },
    });

    return c.json({
      success: true,
      document: {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return c.json({ error: "Failed to update document" }, 500);
  }
});

// Delete document
documents.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    // Get document and verify ownership
    const document = await db.document.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!document) {
      return c.json({ error: "Document not found" }, 404);
    }

    if (document.client.userId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Delete document
    await db.document.delete({ where: { id } });

    return c.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});

export default documents;
