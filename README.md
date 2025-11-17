# OT/AH Assessment App

A professional mobile application for Occupational Therapists and Allied Health professionals to streamline client assessments, equipment recommendations, and invoicing workflows.

## Overview

This app enables OT/AH professionals to:
- Conduct AI-guided assessments with photo, video, and audio capture
- Manage client information and assessment history
- Browse and recommend equipment from a comprehensive catalog
- Generate professional quotes with multiple options
- Create itemized invoices based on hourly rates
- Track assessment status and generate reports

## Tech Stack

### Frontend (Mobile App)
- **Expo SDK 53** + **React Native 0.79.2** + **React 19.0.0**
- **React Navigation 7** for navigation (Stack + Bottom Tabs)
- **NativeWind (TailwindCSS)** for styling
- **TanStack Query** for data fetching and caching
- **Better Auth (Expo)** for authentication
- **TypeScript** with strict mode
- **Lucide React Native** for icons
- **Expo Camera, Image Picker, AV** for media capture

### Backend (Cloud)
- **Bun** runtime
- **Hono** web framework
- **Prisma ORM** with SQLite database
- **Better Auth** for session management
- **Zod** for schema validation

### AI & Machine Learning (Multi-Agent System)
- **GPT-5 Mini** (OpenAI) - Assessment summaries and text analysis
- **Gemini 2.5 Flash** (Google) - Image analysis and structured data extraction
- **Grok 4 Fast** (xAI) - Equipment recommendations and quick responses
- **Multi-Agent Orchestrator** - Intelligent task routing to optimal AI model

## App Structure

### Screens

#### Bottom Tabs
1. **Assessments Tab** (`src/screens/AssessmentsScreen.tsx`)
   - List view of all assessments
   - Status badges (draft, completed, approved)
   - Client name, type, date, and media count
   - Floating action button to create new assessments

2. **Clients Tab** (`src/screens/ClientsScreen.tsx`)
   - List view of all clients
   - Contact information (email, phone, address)
   - Quick access to client details
   - Floating action button to add new clients

3. **Equipment Tab** (`src/screens/EquipmentScreen.tsx`)
   - Browse equipment catalog
   - Category filtering (mobility, bathroom, bedroom, assistive tech, IoT)
   - Government approval indicators
   - Pricing and supplier information

#### Stack Screens
- **CreateAssessment** ✅ - Select client and assessment type
- **AssessmentDetail** ✅ - Capture photos, video, audio with AI analysis
- **CreateClient** ✅ - Add new client form with all contact info
- **ClientDetail** ✅ - View/edit client with assessment history
- **EquipmentRecommendations** ✅ - AI-powered equipment suggestions (Grok 4 Fast)
- **EquipmentDetail** ✅ - View/edit equipment specs and pricing
- **AddEquipment** ✅ - Add new equipment to catalog with full form
- **GenerateQuote** ✅ - Generate 3 pricing options (Essential, Recommended, Premium)
- **GenerateInvoice** ✅ - Create itemized invoices with hourly rates
- **LoginModalScreen** ✅ - Email/password authentication

### Database Schema

#### Core Models
- **Client** - Client information (name, contact, DOB, notes)
- **Assessment** - Assessment records (type, status, location, AI summary)
- **AssessmentMedia** - Photos, videos, audio with AI analysis
- **EquipmentItem** - Equipment catalog with pricing and approvals
- **AssessmentEquipment** - Equipment recommendations per assessment
- **Quote** - Multi-option quotes with items and totals
- **Invoice** - Itemized invoices with hourly rates

### Backend API Routes

All routes require authentication except `/health` and `/api/auth/*`

#### Clients
- `GET /api/clients` - List all clients for current user
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client information
- `DELETE /api/clients/:id` - Delete client

#### Assessments
- `GET /api/assessments` - List all assessments with client info
- `GET /api/assessments/:id` - Get assessment details with media and equipment
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment (status, notes, location)
- `DELETE /api/assessments/:id` - Delete assessment
- `POST /api/assessments/:id/media` - Upload media for assessment

#### AI Services
- `POST /api/assessments/:id/analyze` - AI-powered assessment analysis (GPT-5 Mini)
- `POST /api/ai/equipment-recommendations` - Equipment recommendations (Grok 4 Fast)
- `POST /api/ai/generate-quotes` - Generate 3 quote options (Grok 4 Fast)
- `POST /api/ai/vision-analysis` - Image analysis (Gemini 2.5 Flash)

#### Equipment
- `GET /api/equipment` - List all equipment items
- `POST /api/equipment` - Add new equipment item
- `PUT /api/equipment/:id` - Update equipment details/pricing
- `DELETE /api/equipment/:id` - Delete equipment item
- `POST /api/assessments/:id/equipment` - Save equipment recommendation
- `GET /api/assessments/:id/equipment` - Get saved equipment recommendations
- `DELETE /api/assessments/:assessmentId/equipment/:id` - Delete equipment recommendation

#### Quotes & Invoices
- `POST /api/quotes` - Generate quote for assessment
- `GET /api/quotes/:assessmentId` - Get all quotes for assessment
- `PUT /api/quotes/:id` - Update quote status
- `DELETE /api/quotes/:id` - Delete quote
- `POST /api/invoices` - Create invoice for assessment
- `GET /api/invoices/:assessmentId` - Get all invoices for assessment
- `PUT /api/invoices/:id` - Update invoice status/payment
- `DELETE /api/invoices/:id` - Delete invoice

#### Auth & Upload
- `POST /api/auth/sign-in` - Email/password login
- `POST /api/auth/sign-up` - Create new account
- `POST /api/upload/image` - Upload image files
- `GET /health` - Health check endpoint

## Design System

### Colors
- **Primary Blue**: `#1E40AF` (Blue-700) - Main actions, headers
- **Teal Accent**: `#14B8A6` (Teal-600) - Secondary actions, clients
- **Orange Accent**: `#F97316` (Orange-600) - Equipment, CTAs
- **Status Colors**: Green (completed), Blue (approved), Gray (draft)

### Typography
- **Headings**: Bold, 3xl for page titles
- **Body**: Regular, base size
- **Metadata**: Small, gray-600

### Layout Patterns
- **Card-based** lists with rounded-2xl borders
- **Floating Action Buttons** for primary actions
- **Gradient headers** with white text
- **Shadow-sm** for depth on cards

## File Structure

```
/home/user/workspace/
├── src/
│   ├── screens/
│   │   ├── AssessmentsScreen.tsx
│   │   ├── ClientsScreen.tsx
│   │   ├── EquipmentScreen.tsx
│   │   └── LoginModalScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── components/
│   │   ├── LoginButton.tsx
│   │   └── LoginWithEmailPassword.tsx
│   ├── lib/
│   │   ├── api.ts (API client with auth)
│   │   ├── authClient.ts
│   │   ├── aiAgents.ts (Multi-agent orchestrator)
│   │   ├── audioTranscription.ts (Whisper API integration)
│   │   └── useSession.tsx
│   └── api/ (Vibecode pre-built AI APIs)
├── backend/
│   ├── src/
│   │   ├── index.ts (Hono server)
│   │   ├── auth.ts (Better Auth config)
│   │   ├── db.ts (Prisma client)
│   │   ├── env.ts (Environment validation)
│   │   └── routes/
│   │       ├── clients.ts
│   │       ├── assessments.ts
│   │       ├── equipment.ts
│   │       ├── quotes.ts
│   │       ├── invoices.ts
│   │       ├── ai.ts (AI service endpoints)
│   │       └── upload.ts
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── shared/
    └── contracts.ts (Shared Zod schemas and types)
```

## Development Workflow

### Environment
- Frontend dev server: Port 8081 (automatically managed)
- Backend dev server: Port 3000 (automatically managed)
- Database: SQLite at `backend/prisma/dev.db`
- Prisma Studio: Port 3001 (view in CLOUD tab)

### Common Tasks

**View logs:**
- Frontend: Read `expo.log` or use LOGS tab in Vibecode app
- Backend: Read `backend/server.log`

**Update database schema:**
```bash
# Edit backend/prisma/schema.prisma
bunx prisma migrate dev --create-only --name <migration-name>
bunx prisma migrate deploy
```

**Type check:**
```bash
bun run typecheck
```

**Lint:**
```bash
bun run lint
```

## Key Features

### Completed Features

**User Management:**
- Email/password authentication
- Session management with Better Auth
- User-specific data isolation

**Client Management:**
- Create clients with full contact information
- View client list with search/filtering
- Track client history and assessments
- Store notes and dates of birth

**Assessment Workflow:**
- Create assessments linked to clients
- Choose assessment type (home, assistive tech, general)
- Capture photos using device camera
- Select photos/videos from gallery
- Record audio notes with Whisper API transcription
- **AI-powered assessment analysis using GPT-5 Mini**
- **Smart equipment recommendations using Grok 4 Fast**
- **Image analysis capabilities with Gemini 2.5 Flash**
- **Generate 3 pricing options (Essential, Recommended, Premium)**
- **Create itemized invoices with hourly rates and line items**
- **Inline editing of status, location, and notes**
- **Payment tracking with "Mark as Paid" functionality**
- **Quote expiration warnings (visual alerts for expired/expiring quotes)**
- View assessment details with media gallery
- Track assessment status (draft/completed/approved)
- View invoice and quote history with payment status

**Multi-Agent AI System:**
- Intelligent task routing to optimal AI model
- GPT-5 Mini for professional summaries and analysis
- Gemini 2.5 Flash for vision and structured data
- Grok 4 Fast for quick equipment recommendations
- Orchestrated workflows combining multiple agents

**Equipment Catalog:**
- Browse equipment by category
- View pricing and government approvals
- Track supplier pricing and margins
- Equipment specifications storage
- **Save equipment recommendations with priority levels**
- **Associate equipment with specific assessments**

### Phase Progress

#### Phase 1 (Completed)
- ✅ User authentication with Better Auth
- ✅ Client management (list, create)
- ✅ Assessment tracking (list, create, view details)
- ✅ Equipment catalog (list, browse)
- ✅ Backend API routes (6 modules)
- ✅ Database schema with all models

#### Phase 2 (Completed)
- ✅ Camera photo capture for assessments
- ✅ Image picker for gallery photos/videos
- ✅ Audio recording with permissions
- ✅ **Multi-agent AI orchestrator with intelligent routing**
- ✅ **GPT-5 Mini integration for assessment summaries**
- ✅ **Gemini 2.5 Flash integration for vision analysis**
- ✅ **Grok 4 Fast integration for equipment recommendations**
- ✅ Assessment detail screen with media gallery
- ✅ Client and assessment creation forms

#### Phase 3 (Completed)
- ✅ **Audio transcription with Whisper API**
- ✅ **Equipment recommendations screen with Grok 4 Fast**
- ✅ **Quote generation with 3 pricing options (Essential, Recommended, Premium)**
- ✅ **Invoice generation with hourly rates and itemized line items**
- ✅ Navigation integration for all Phase 3 features
- 🔲 Advanced AI vision with real-time photo analysis (future)
- 🔲 PDF report generation (future)

#### Phase 4 (Completed - Full CRUD & Media Upload)
- ✅ **Complete media upload system** (photos, videos, audio)
- ✅ **Multipart/form-data support in API client**
- ✅ **Audio transcriptions saved to database with AI analysis**
- ✅ **Client UPDATE and DELETE endpoints**
- ✅ **Assessment UPDATE and DELETE endpoints**
- ✅ **Equipment UPDATE and DELETE endpoints**
- ✅ **Quote GET (by assessment), UPDATE, DELETE endpoints**
- ✅ **Invoice GET (by assessment), UPDATE, DELETE endpoints**
- ✅ **Full CRUD operations for all entities**
- ✅ **Assessment status workflow** (draft → completed → approved)
- ✅ **Type-safe contracts with Zod validation**
- ✅ **Proper error handling and authorization checks**

#### Phase 5 (Completed - All Missing Screens)
- ✅ **ClientDetail screen** - View/edit client info with inline editing
- ✅ **EquipmentDetail screen** - View/edit equipment with pricing management
- ✅ **AddEquipment screen** - Complete form for adding new equipment
- ✅ **Delete functionality** for clients and equipment
- ✅ **Assessment history** display in ClientDetail
- ✅ **Form validation** on all input screens
- ✅ **Category selection** UI for equipment
- ✅ **Government approval** toggle and reference fields
- ✅ **Navigation integration** - All screens properly connected

### App Status: 100% Complete! 🎉

**All core functionality implemented:**
- ✅ User authentication and authorization
- ✅ Complete CRUD for all entities (Clients, Assessments, Equipment, Quotes, Invoices)
- ✅ Media upload system (photos, videos, audio)
- ✅ AI-powered features (GPT-5 Mini, Gemini 2.5 Flash, Grok 4 Fast)
- ✅ Audio transcription with Whisper API
- ✅ Multi-agent AI orchestration
- ✅ Quote generation (3 pricing tiers)
- ✅ Invoice generation with hourly rates
- ✅ Equipment recommendations
- ✅ All 10 screens fully functional
- ✅ Type-safe API with Zod validation
- ✅ Proper error handling throughout

### Optional Enhancements (ALL COMPLETED! 🎉)

**All enhancements have been successfully implemented:**
- ✅ **Equipment recommendations persistence** - Save/delete recommendations to AssessmentEquipment table with priority levels (Essential, Recommended, Optional)
- ✅ **Assessment inline editing** - Edit status, location, and notes directly in AssessmentDetailScreen with Save/Cancel buttons
- ✅ **Payment tracking** - Invoice status updates with "Mark as Paid" button, status badges (draft/sent/paid/overdue)
- ✅ **Quote expiration warnings** - Visual indicators for expired quotes (red alert) and expiring soon (amber warning within 7 days)
- ✅ **Invoice & Quote history** - Display all invoices and quotes for assessment with payment status and expiration dates

**Advanced Features (Future):**
- 🔲 Assistive tech 3D environment mapping
- 🔲 IoT device specifications and placement
- 🔲 Equipment pricing automation (competitive analysis)
- 🔲 Government approval verification
- 🔲 Integration with XERO/accounting software
- 🔲 Multi-user collaboration

## Notes

- All dates are stored as ISO strings in API responses
- Decimal fields (prices, totals) are returned as numbers
- Equipment specifications stored as JSON strings
- Invoice/quote items stored as JSON strings
- Safe area handling is automatic via React Navigation
- Authentication required for all client data access
- Bottom tab screens destructure navigation from props object (not function params) to avoid React Navigation 7 context issues
