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

// POST /api/upload/catalog
export const uploadCatalogRequestSchema = z.object({
  pdf: z.instanceof(File),
});
export type UploadCatalogRequest = z.infer<typeof uploadCatalogRequestSchema>;
export const uploadCatalogResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadCatalogResponse = z.infer<typeof uploadCatalogResponseSchema>;

// POST /api/ai/parse-catalog
export const parseCatalogRequestSchema = z.object({
  fileUrl: z.string(),
  filename: z.string(),
});
export type ParseCatalogRequest = z.infer<typeof parseCatalogRequestSchema>;
export const parseCatalogResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  equipmentCount: z.number(),
  equipment: z.array(z.object({
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    price: z.number(),
    brand: z.string().nullable(),
    model: z.string().nullable(),
    specifications: z.string().nullable(),
  })),
});
export type ParseCatalogResponse = z.infer<typeof parseCatalogResponseSchema>;

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
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
  assessmentType: z.enum(["home", "assistive_tech", "general", "mobility_scooter", "falls_risk", "movement_mobility"]),
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

// ====================
// 3D HOUSE MAPPING CONTRACTS
// ====================

// Position3D helper schema
const position3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  rotation: z.number().optional(),
});

// POST /api/assessments/:id/house-map
export const createHouseMapRequestSchema = z.object({
  propertyType: z.enum(["single_family", "apartment", "condo", "townhouse"]).optional(),
  totalArea: z.number().optional(),
  floors: z.number().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type CreateHouseMapRequest = z.infer<typeof createHouseMapRequestSchema>;

export const houseMapResponseSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  propertyType: z.string().nullable(),
  totalArea: z.number().nullable(),
  floors: z.number(),
  metadata: z.string().nullable(),
  aiGenerated: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type HouseMapResponse = z.infer<typeof houseMapResponseSchema>;

// GET /api/house-maps/:id
export const getHouseMapResponseSchema = z.object({
  houseMap: houseMapResponseSchema.extend({
    rooms: z.array(z.object({
      id: z.string(),
      name: z.string(),
      roomType: z.string(),
      floor: z.number(),
      length: z.number().nullable(),
      width: z.number().nullable(),
      height: z.number().nullable(),
      area: z.number().nullable(),
      position3D: z.string().nullable(),
      features: z.string().nullable(),
      notes: z.string().nullable(),
      photoUrl: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
    areas: z.array(z.object({
      id: z.string(),
      name: z.string(),
      areaType: z.string(),
      length: z.number().nullable(),
      width: z.number().nullable(),
      area: z.number().nullable(),
      position3D: z.string().nullable(),
      features: z.string().nullable(),
      notes: z.string().nullable(),
      photoUrl: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
    iotDevices: z.array(z.object({
      id: z.string(),
      deviceId: z.string(),
      roomId: z.string().nullable(),
      areaId: z.string().nullable(),
      quantity: z.number(),
      position3D: z.string(),
      placementReason: z.string().nullable(),
      priority: z.string(),
      status: z.string(),
      installationNotes: z.string().nullable(),
      aiRecommended: z.boolean(),
      device: z.object({
        id: z.string(),
        name: z.string(),
        manufacturer: z.string().nullable(),
        category: z.string(),
        deviceType: z.string(),
        price: z.number(),
        installationCost: z.number().nullable(),
        subscriptionCost: z.number().nullable(),
        imageUrl: z.string().nullable(),
      }),
    })),
  }),
});
export type GetHouseMapResponse = z.infer<typeof getHouseMapResponseSchema>;

// POST /api/house-maps/:id/rooms
export const createRoomRequestSchema = z.object({
  name: z.string().min(1),
  roomType: z.enum(["bedroom", "bathroom", "kitchen", "living", "dining", "hallway", "entrance", "utility"]),
  floor: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  area: z.number().optional(),
  position3D: position3DSchema.optional(),
  features: z.record(z.string(), z.any()).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;

// POST /api/house-maps/:id/areas
export const createAreaRequestSchema = z.object({
  name: z.string().min(1),
  areaType: z.enum(["outdoor", "garage", "patio", "deck", "yard", "driveway", "pathway"]),
  length: z.number().optional(),
  width: z.number().optional(),
  area: z.number().optional(),
  position3D: position3DSchema.optional(),
  features: z.record(z.string(), z.any()).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});
export type CreateAreaRequest = z.infer<typeof createAreaRequestSchema>;

// PUT /api/rooms/:id
export const updateRoomRequestSchema = createRoomRequestSchema.partial();
export type UpdateRoomRequest = z.infer<typeof updateRoomRequestSchema>;

// PUT /api/areas/:id
export const updateAreaRequestSchema = createAreaRequestSchema.partial();
export type UpdateAreaRequest = z.infer<typeof updateAreaRequestSchema>;

// ====================
// IOT DEVICE LIBRARY CONTRACTS
// ====================

// GET /api/iot-devices
export const getIoTDevicesResponseSchema = z.object({
  devices: z.array(z.object({
    id: z.string(),
    name: z.string(),
    manufacturer: z.string().nullable(),
    model: z.string().nullable(),
    category: z.string(),
    deviceType: z.string(),
    description: z.string().nullable(),
    technicalSpecs: z.string(),
    placementRules: z.string().nullable(),
    coverageArea: z.number().nullable(),
    powerRequirements: z.string().nullable(),
    connectivity: z.string().nullable(),
    price: z.number(),
    installationCost: z.number().nullable(),
    subscriptionCost: z.number().nullable(),
    subscriptionType: z.string().nullable(),
    imageUrl: z.string().nullable(),
    documentationUrl: z.string().nullable(),
    approvedFor: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
});
export type GetIoTDevicesResponse = z.infer<typeof getIoTDevicesResponseSchema>;

// POST /api/iot-devices
export const createIoTDeviceRequestSchema = z.object({
  name: z.string().min(1),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(["safety", "security", "accessibility", "comfort", "health", "lighting", "climate"]),
  deviceType: z.string(),
  description: z.string().optional(),
  technicalSpecs: z.record(z.string(), z.any()),
  placementRules: z.record(z.string(), z.any()).optional(),
  coverageArea: z.number().optional(),
  powerRequirements: z.string().optional(),
  connectivity: z.string().optional(),
  price: z.number(),
  installationCost: z.number().optional(),
  subscriptionCost: z.number().optional(),
  subscriptionType: z.enum(["monthly", "annual", "one_time"]).optional(),
  imageUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  approvedFor: z.array(z.string()).optional(),
});
export type CreateIoTDeviceRequest = z.infer<typeof createIoTDeviceRequestSchema>;

// PUT /api/iot-devices/:id
export const updateIoTDeviceRequestSchema = createIoTDeviceRequestSchema.partial();
export type UpdateIoTDeviceRequest = z.infer<typeof updateIoTDeviceRequestSchema>;

// ====================
// IOT DEVICE PLACEMENT CONTRACTS
// ====================

// POST /api/house-maps/:id/device-placements
export const createDevicePlacementRequestSchema = z.object({
  deviceId: z.string(),
  roomId: z.string().optional(),
  areaId: z.string().optional(),
  quantity: z.number().min(1).default(1),
  position3D: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    rotation: z.number().optional(),
    wallMounted: z.boolean().optional(),
    ceilingMounted: z.boolean().optional(),
  }),
  placementReason: z.string().optional(),
  priority: z.enum(["essential", "recommended", "optional"]).default("recommended"),
  status: z.enum(["proposed", "approved", "installed", "rejected"]).default("proposed"),
  installationNotes: z.string().optional(),
  aiRecommended: z.boolean().default(false),
});
export type CreateDevicePlacementRequest = z.infer<typeof createDevicePlacementRequestSchema>;

// PUT /api/device-placements/:id
export const updateDevicePlacementRequestSchema = createDevicePlacementRequestSchema.partial();
export type UpdateDevicePlacementRequest = z.infer<typeof updateDevicePlacementRequestSchema>;

// ====================
// AI SERVICES FOR IOT/3D MAPPING
// ====================

// POST /api/ai/analyze-space
export const analyzeSpaceRequestSchema = z.object({
  assessmentId: z.string(),
  photos: z.array(z.object({
    url: z.string(),
    roomType: z.string().optional(),
    description: z.string().optional(),
  })),
  clientNeeds: z.string().optional(),
});
export type AnalyzeSpaceRequest = z.infer<typeof analyzeSpaceRequestSchema>;

export const analyzeSpaceResponseSchema = z.object({
  houseMapId: z.string(),
  rooms: z.array(z.object({
    name: z.string(),
    roomType: z.string(),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
    features: z.array(z.string()),
    safetyIssues: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
  areas: z.array(z.object({
    name: z.string(),
    areaType: z.string(),
    features: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
});
export type AnalyzeSpaceResponse = z.infer<typeof analyzeSpaceResponseSchema>;

// POST /api/ai/recommend-iot-devices
export const recommendIoTDevicesRequestSchema = z.object({
  houseMapId: z.string(),
  clientNeeds: z.array(z.string()),
  budget: z.enum(["essential", "recommended", "premium"]).optional(),
  existingDevices: z.array(z.string()).optional(),
});
export type RecommendIoTDevicesRequest = z.infer<typeof recommendIoTDevicesRequestSchema>;

export const recommendIoTDevicesResponseSchema = z.object({
  placements: z.array(z.object({
    deviceId: z.string(),
    deviceName: z.string(),
    roomId: z.string().optional(),
    areaId: z.string().optional(),
    position: position3DSchema,
    priority: z.enum(["essential", "recommended", "optional"]),
    reason: z.string(),
    coverageDetails: z.string().optional(),
  })),
  totalCost: z.object({
    hardware: z.number(),
    installation: z.number(),
    monthlySubscription: z.number(),
    annualSubscription: z.number(),
  }),
  summary: z.string(),
});
export type RecommendIoTDevicesResponse = z.infer<typeof recommendIoTDevicesResponseSchema>;

// POST /api/ai/generate-iot-quote
export const generateIoTQuoteRequestSchema = z.object({
  assessmentId: z.string(),
  houseMapId: z.string(),
  selectedPlacements: z.array(z.string()), // device placement IDs
  includeInstallation: z.boolean().default(true),
  subscriptionDuration: z.enum(["monthly", "annual"]).default("monthly"),
});
export type GenerateIoTQuoteRequest = z.infer<typeof generateIoTQuoteRequestSchema>;

export const generateIoTQuoteResponseSchema = z.object({
  quoteId: z.string(),
  options: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      name: z.string(),
      category: z.enum(["hardware", "installation", "subscription"]),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number(),
      description: z.string().optional(),
    })),
    hardwareTotal: z.number(),
    installationTotal: z.number(),
    subscriptionTotal: z.number(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
  })),
});
export type GenerateIoTQuoteResponse = z.infer<typeof generateIoTQuoteResponseSchema>;

// ====================
// PROFILE CONTRACTS
// ====================

// Validation helpers
const ahpraNumberRegex = /^[A-Z]{3}\d{10}$/; // e.g., OCC0001234567
const abnRegex = /^\d{11}$/; // 11 digits
const bsbRegex = /^\d{6}$/; // 6 digits
const accountNumberRegex = /^\d{1,9}$/; // Up to 9 digits

// POST /api/profile - Create or update profile
export const updateProfileRequestSchema = z.object({
  // Professional Registration
  ahpraNumber: z.string()
    .regex(ahpraNumberRegex, "AHPRA number must be 3 letters followed by 10 digits (e.g., OCC0001234567)")
    .optional()
    .nullable(),
  profession: z.string()
    .min(1, "Profession is required if provided")
    .max(100, "Profession must be less than 100 characters")
    .optional()
    .nullable(),
  registrationExpiry: z.string().datetime().optional().nullable(),

  // Business Details
  businessName: z.string()
    .min(1, "Business name is required if provided")
    .max(200, "Business name must be less than 200 characters")
    .optional()
    .nullable(),
  abn: z.string()
    .regex(abnRegex, "ABN must be exactly 11 digits")
    .optional()
    .nullable(),
  acn: z.string()
    .regex(/^\d{9}$/, "ACN must be exactly 9 digits")
    .optional()
    .nullable(),

  // Contact & Address
  businessPhone: z.string()
    .regex(/^\+?[\d\s()-]{8,20}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  businessEmail: z.string()
    .email("Invalid email address")
    .optional()
    .nullable(),
  businessAddress: z.string().max(500, "Address too long").optional().nullable(),
  businessSuburb: z.string().max(100).optional().nullable(),
  businessState: z.enum(["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]).optional().nullable(),
  businessPostcode: z.string()
    .regex(/^\d{4}$/, "Postcode must be 4 digits")
    .optional()
    .nullable(),

  // Rates & Pricing - must be positive numbers
  defaultHourlyRate: z.number()
    .positive("Hourly rate must be positive")
    .max(10000, "Hourly rate seems unreasonably high")
    .optional(),
  assessmentFee: z.number()
    .positive("Assessment fee must be positive")
    .max(50000, "Assessment fee seems unreasonably high")
    .optional(),
  reportFee: z.number()
    .positive("Report fee must be positive")
    .max(50000, "Report fee seems unreasonably high")
    .optional(),
  travelRate: z.number()
    .positive("Travel rate must be positive")
    .max(10000, "Travel rate seems unreasonably high")
    .optional(),

  // Additional Professional Info
  qualifications: z.string().optional().nullable(), // JSON string
  specializations: z.string().optional().nullable(), // JSON string
  yearsExperience: z.number()
    .int("Years of experience must be a whole number")
    .min(0, "Years of experience cannot be negative")
    .max(70, "Years of experience seems unreasonably high")
    .optional()
    .nullable(),

  // Invoice/Quote Details
  paymentTerms: z.string().max(500).optional().nullable(),
  bankAccountName: z.string().max(200).optional().nullable(),
  bsb: z.string()
    .regex(bsbRegex, "BSB must be exactly 6 digits")
    .optional()
    .nullable(),
  accountNumber: z.string()
    .regex(accountNumberRegex, "Account number must be 1-9 digits")
    .optional()
    .nullable(),

  // Logo & Branding
  logoUrl: z.string().url("Invalid logo URL").optional().nullable(),
  brandColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Brand color must be a valid hex color (e.g., #FF5733)")
    .optional()
    .nullable(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

// GET /api/profile response
export const getProfileResponseSchema = z.object({
  profile: z.object({
    id: z.number(),
    handle: z.string(),
    userId: z.string(),
    ahpraNumber: z.string().nullable(),
    profession: z.string().nullable(),
    registrationExpiry: z.string().nullable(),
    businessName: z.string().nullable(),
    abn: z.string().nullable(),
    acn: z.string().nullable(),
    businessPhone: z.string().nullable(),
    businessEmail: z.string().nullable(),
    businessAddress: z.string().nullable(),
    businessSuburb: z.string().nullable(),
    businessState: z.string().nullable(),
    businessPostcode: z.string().nullable(),
    defaultHourlyRate: z.number().nullable(),
    assessmentFee: z.number().nullable(),
    reportFee: z.number().nullable(),
    travelRate: z.number().nullable(),
    qualifications: z.string().nullable(),
    specializations: z.string().nullable(),
    yearsExperience: z.number().nullable(),
    paymentTerms: z.string().nullable(),
    bankAccountName: z.string().nullable(),
    bsb: z.string().nullable(),
    accountNumber: z.string().nullable(),
    logoUrl: z.string().nullable(),
    brandColor: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).nullable(),
});

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;

// ====================
// DOCUMENT CONTRACTS
// ====================

// Document schema
export const documentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  assessmentId: z.string().nullable(),
  documentType: z.enum(["invoice", "quote", "report", "house_map", "assessment_summary"]),
  title: z.string(),
  content: z.string(), // JSON string
  format: z.string(),
  metadata: z.string().nullable(), // JSON string
  fileUrl: z.string().nullable(),
  status: z.enum(["draft", "final", "archived"]),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Document = z.infer<typeof documentSchema>;

// GET /api/documents?clientId=xxx
export const getDocumentsResponseSchema = z.object({
  documents: z.array(documentSchema),
});
export type GetDocumentsResponse = z.infer<typeof getDocumentsResponseSchema>;

// GET /api/documents/:id
export const getDocumentResponseSchema = z.object({
  document: documentSchema,
});
export type GetDocumentResponse = z.infer<typeof getDocumentResponseSchema>;

// POST /api/documents
export const createDocumentRequestSchema = z.object({
  clientId: z.string(),
  assessmentId: z.string().optional(),
  documentType: z.enum(["invoice", "quote", "report", "house_map", "assessment_summary"]),
  title: z.string().min(1),
  content: z.string(), // JSON string
  format: z.string().default("json"),
  metadata: z.string().optional(), // JSON string
  fileUrl: z.string().optional(),
  status: z.enum(["draft", "final", "archived"]).default("draft"),
});
export type CreateDocumentRequest = z.infer<typeof createDocumentRequestSchema>;

export const createDocumentResponseSchema = z.object({
  success: z.boolean(),
  document: documentSchema,
});
export type CreateDocumentResponse = z.infer<typeof createDocumentResponseSchema>;

// PUT /api/documents/:id
export const updateDocumentRequestSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  metadata: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.enum(["draft", "final", "archived"]).optional(),
});
export type UpdateDocumentRequest = z.infer<typeof updateDocumentRequestSchema>;

export const updateDocumentResponseSchema = z.object({
  success: z.boolean(),
  document: documentSchema,
});
export type UpdateDocumentResponse = z.infer<typeof updateDocumentResponseSchema>;

// DELETE /api/documents/:id
export const deleteDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteDocumentResponse = z.infer<typeof deleteDocumentResponseSchema>;

// ====================
// BUSINESS DOCUMENT CONTRACTS
// ====================

// Business Document schema
export const businessDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  documentType: z.enum(["invoice_sent", "quote_sent", "insurance", "registration", "license", "certification", "contract", "note", "receipt", "tax_document"]),
  title: z.string(),
  content: z.string().nullable(),
  fileUrl: z.string().nullable(),
  amount: z.number().nullable(),
  dueDate: z.string().nullable(),
  paidDate: z.string().nullable(),
  status: z.enum(["active", "paid", "overdue", "archived", "expired"]),
  reminderSent: z.boolean(),
  reminderDate: z.string().nullable(),
  tags: z.string().nullable(), // JSON string
  notes: z.string().nullable(),
  metadata: z.string().nullable(), // JSON string
  createdAt: z.string(),
  updatedAt: z.string(),
  expiryDate: z.string().nullable(),
});
export type BusinessDocument = z.infer<typeof businessDocumentSchema>;

// GET /api/business-documents
export const getBusinessDocumentsResponseSchema = z.object({
  documents: z.array(businessDocumentSchema),
});
export type GetBusinessDocumentsResponse = z.infer<typeof getBusinessDocumentsResponseSchema>;

// POST /api/business-documents
export const createBusinessDocumentRequestSchema = z.object({
  documentType: z.enum(["invoice_sent", "quote_sent", "insurance", "registration", "license", "certification", "contract", "note", "receipt", "tax_document"]),
  title: z.string().min(1),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  amount: z.number().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["active", "paid", "overdue", "archived", "expired"]).default("active"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.string().optional(),
  expiryDate: z.string().optional(),
});
export type CreateBusinessDocumentRequest = z.infer<typeof createBusinessDocumentRequestSchema>;

// PUT /api/business-documents/:id
export const updateBusinessDocumentRequestSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  amount: z.number().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  status: z.enum(["active", "paid", "overdue", "archived", "expired"]).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.string().optional(),
  expiryDate: z.string().optional(),
});
export type UpdateBusinessDocumentRequest = z.infer<typeof updateBusinessDocumentRequestSchema>;

// Sent Invoice schema
export const sentInvoiceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessDocumentId: z.string().nullable(),
  recipientEmail: z.string(),
  recipientName: z.string().nullable(),
  invoiceNumber: z.string(),
  amount: z.number(),
  issueDate: z.string(),
  dueDate: z.string(),
  paidDate: z.string().nullable(),
  status: z.enum(["pending", "reminded_3_days", "reminded_overdue", "paid", "cancelled"]),
  remindersSent: z.number(),
  lastReminderDate: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SentInvoice = z.infer<typeof sentInvoiceSchema>;

// GET /api/sent-invoices
export const getSentInvoicesResponseSchema = z.object({
  invoices: z.array(sentInvoiceSchema),
});
export type GetSentInvoicesResponse = z.infer<typeof getSentInvoicesResponseSchema>;

// POST /api/sent-invoices
export const createSentInvoiceRequestSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
  invoiceNumber: z.string().min(1),
  amount: z.number().positive(),
  issueDate: z.string().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
  businessDocumentId: z.string().optional(),
});
export type CreateSentInvoiceRequest = z.infer<typeof createSentInvoiceRequestSchema>;

// PUT /api/sent-invoices/:id/mark-paid
export const markInvoicePaidResponseSchema = z.object({
  success: z.boolean(),
  invoice: sentInvoiceSchema,
});
export type MarkInvoicePaidResponse = z.infer<typeof markInvoicePaidResponseSchema>;


