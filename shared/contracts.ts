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

// PUT /api/clients/:id
export const updateClientRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateClientRequest = z.infer<typeof updateClientRequestSchema>;

// DELETE /api/clients/:id
export const deleteClientResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteClientResponse = z.infer<typeof deleteClientResponseSchema>;

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

// PUT /api/assessments/:id
export const updateAssessmentRequestSchema = z.object({
  status: z.enum(["draft", "completed", "approved"]).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateAssessmentRequest = z.infer<typeof updateAssessmentRequestSchema>;

// DELETE /api/assessments/:id
export const deleteAssessmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteAssessmentResponse = z.infer<typeof deleteAssessmentResponseSchema>;

// POST /api/assessments/:id/media
export const uploadAssessmentMediaRequestSchema = z.object({
  type: z.enum(["photo", "video", "audio"]),
  url: z.string(), // URL from uploaded file
  caption: z.string().optional(),
  aiAnalysis: z.string().optional(), // For audio transcriptions
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

// PUT /api/equipment/:id
export const updateEquipmentRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["mobility", "bathroom", "bedroom", "assistive_tech", "iot"]).optional(),
  price: z.number().min(0).optional(),
  supplierPrice: z.number().optional(),
  margin: z.number().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  specifications: z.string().optional(),
  governmentApproved: z.boolean().optional(),
  approvalReference: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type UpdateEquipmentRequest = z.infer<typeof updateEquipmentRequestSchema>;

// DELETE /api/equipment/:id
export const deleteEquipmentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteEquipmentResponse = z.infer<typeof deleteEquipmentResponseSchema>;

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

// GET /api/quotes/:assessmentId
export const getQuotesResponseSchema = z.object({
  quotes: z.array(
    z.object({
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
    })
  ),
});
export type GetQuotesResponse = z.infer<typeof getQuotesResponseSchema>;

// PUT /api/quotes/:id
export const updateQuoteRequestSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
  notes: z.string().optional(),
});
export type UpdateQuoteRequest = z.infer<typeof updateQuoteRequestSchema>;

// DELETE /api/quotes/:id
export const deleteQuoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteQuoteResponse = z.infer<typeof deleteQuoteResponseSchema>;

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

// GET /api/invoices/:assessmentId
export const getInvoicesResponseSchema = z.object({
  invoices: z.array(
    z.object({
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
    })
  ),
});
export type GetInvoicesResponse = z.infer<typeof getInvoicesResponseSchema>;

// PUT /api/invoices/:id
export const updateInvoiceRequestSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateInvoiceRequest = z.infer<typeof updateInvoiceRequestSchema>;

// DELETE /api/invoices/:id
export const deleteInvoiceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteInvoiceResponse = z.infer<typeof deleteInvoiceResponseSchema>;

// ====================
// EQUIPMENT RECOMMENDATIONS CONTRACTS
// ====================

// POST /api/assessments/:id/equipment
export const addEquipmentRecommendationRequestSchema = z.object({
  equipmentId: z.string(),
  priority: z.enum(["essential", "recommended", "optional"]),
  quantity: z.number().min(1),
  notes: z.string().optional(),
});
export type AddEquipmentRecommendationRequest = z.infer<typeof addEquipmentRecommendationRequestSchema>;

// GET /api/assessments/:id/equipment
export const getEquipmentRecommendationsResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      id: z.string(),
      equipmentId: z.string(),
      priority: z.string(),
      quantity: z.number(),
      notes: z.string().nullable(),
      createdAt: z.string(),
      equipment: z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        price: z.number(),
        brand: z.string().nullable(),
      }),
    })
  ),
});
export type GetEquipmentRecommendationsResponse = z.infer<typeof getEquipmentRecommendationsResponseSchema>;

// DELETE /api/assessments/:assessmentId/equipment/:id
export const deleteEquipmentRecommendationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteEquipmentRecommendationResponse = z.infer<typeof deleteEquipmentRecommendationResponseSchema>;


