// contracts.ts
// Shared API contracts (schemas and types) used by both the server and the app.
// Import in the app as: `import { type GetSampleResponse } from "@shared/contracts"`
// Import in the server as: `import { postSampleRequestSchema } from "@shared/contracts"`

import { z } from "zod";

// POST /api/upload/image
export const uploadImageRequestSchema = z.object({
  image: z.instanceof(File),
});
export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// ====================
// CLIENT CONTRACTS
// ====================

// GET /api/clients
export const getClientsResponseSchema = z.object({
  clients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      address: z.string().nullable(),
      dateOfBirth: z.string().nullable(),
      notes: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});
export type GetClientsResponse = z.infer<typeof getClientsResponseSchema>;

// POST /api/clients
export const createClientRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateClientRequest = z.infer<typeof createClientRequestSchema>;
export const createClientResponseSchema = z.object({
  success: z.boolean(),
  client: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type CreateClientResponse = z.infer<typeof createClientResponseSchema>;

// ====================
// ASSESSMENT CONTRACTS
// ====================

// GET /api/assessments
export const getAssessmentsResponseSchema = z.object({
  assessments: z.array(
    z.object({
      id: z.string(),
      clientId: z.string(),
      clientName: z.string(),
      assessmentType: z.string(),
      status: z.string(),
      location: z.string().nullable(),
      assessmentDate: z.string(),
      notes: z.string().nullable(),
      aiSummary: z.string().nullable(),
      reportGenerated: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      mediaCount: z.number(),
    })
  ),
});
export type GetAssessmentsResponse = z.infer<typeof getAssessmentsResponseSchema>;

// POST /api/assessments
export const createAssessmentRequestSchema = z.object({
  clientId: z.string(),
  assessmentType: z.enum(["home", "assistive_tech", "general"]),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateAssessmentRequest = z.infer<typeof createAssessmentRequestSchema>;
export const createAssessmentResponseSchema = z.object({
  success: z.boolean(),
  assessment: z.object({
    id: z.string(),
    clientId: z.string(),
    assessmentType: z.string(),
    status: z.string(),
    location: z.string().nullable(),
    assessmentDate: z.string(),
    notes: z.string().nullable(),
    aiSummary: z.string().nullable(),
    reportGenerated: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type CreateAssessmentResponse = z.infer<typeof createAssessmentResponseSchema>;

// POST /api/assessments/:id/media
export const uploadAssessmentMediaRequestSchema = z.object({
  type: z.enum(["photo", "video", "audio"]),
  caption: z.string().optional(),
});
export type UploadAssessmentMediaRequest = z.infer<typeof uploadAssessmentMediaRequestSchema>;
export const uploadAssessmentMediaResponseSchema = z.object({
  success: z.boolean(),
  media: z.object({
    id: z.string(),
    assessmentId: z.string(),
    type: z.string(),
    url: z.string(),
    caption: z.string().nullable(),
    aiAnalysis: z.string().nullable(),
    createdAt: z.string(),
  }),
});
export type UploadAssessmentMediaResponse = z.infer<typeof uploadAssessmentMediaResponseSchema>;

// ====================
// EQUIPMENT CONTRACTS
// ====================

// GET /api/equipment
export const getEquipmentResponseSchema = z.object({
  equipment: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      category: z.string(),
      price: z.number(),
      supplierPrice: z.number().nullable(),
      margin: z.number().nullable(),
      brand: z.string().nullable(),
      model: z.string().nullable(),
      specifications: z.string().nullable(),
      governmentApproved: z.boolean(),
      approvalReference: z.string().nullable(),
      imageUrl: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});
export type GetEquipmentResponse = z.infer<typeof getEquipmentResponseSchema>;

// POST /api/equipment
export const createEquipmentRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["mobility", "bathroom", "bedroom", "assistive_tech", "iot"]),
  price: z.number().min(0),
  supplierPrice: z.number().optional(),
  margin: z.number().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  specifications: z.string().optional(),
  governmentApproved: z.boolean().default(false),
  approvalReference: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type CreateEquipmentRequest = z.infer<typeof createEquipmentRequestSchema>;
export const createEquipmentResponseSchema = z.object({
  success: z.boolean(),
  equipment: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    price: z.number(),
    supplierPrice: z.number().nullable(),
    margin: z.number().nullable(),
    brand: z.string().nullable(),
    model: z.string().nullable(),
    specifications: z.string().nullable(),
    governmentApproved: z.boolean(),
    approvalReference: z.string().nullable(),
    imageUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type CreateEquipmentResponse = z.infer<typeof createEquipmentResponseSchema>;

// ====================
// QUOTE CONTRACTS
// ====================

// POST /api/quotes
export const createQuoteRequestSchema = z.object({
  assessmentId: z.string(),
  optionName: z.string(),
  items: z.array(
    z.object({
      equipmentId: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});
export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>;
export const createQuoteResponseSchema = z.object({
  success: z.boolean(),
  quote: z.object({
    id: z.string(),
    assessmentId: z.string(),
    quoteNumber: z.string(),
    optionName: z.string(),
    items: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    notes: z.string().nullable(),
    validUntil: z.string().nullable(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type CreateQuoteResponse = z.infer<typeof createQuoteResponseSchema>;

// ====================
// INVOICE CONTRACTS
// ====================

// POST /api/invoices
export const createInvoiceRequestSchema = z.object({
  assessmentId: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
    })
  ),
  hourlyRate: z.number().optional(),
  hoursWorked: z.number().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateInvoiceRequest = z.infer<typeof createInvoiceRequestSchema>;
export const createInvoiceResponseSchema = z.object({
  success: z.boolean(),
  invoice: z.object({
    id: z.string(),
    assessmentId: z.string(),
    invoiceNumber: z.string(),
    items: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    hourlyRate: z.number().nullable(),
    hoursWorked: z.number().nullable(),
    status: z.string(),
    dueDate: z.string().nullable(),
    paidDate: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type CreateInvoiceResponse = z.infer<typeof createInvoiceResponseSchema>;
