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

### Backend (Cloud)
- **Bun** runtime
- **Hono** web framework
- **Prisma ORM** with SQLite database
- **Better Auth** for session management
- **Zod** for schema validation

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

#### Stack Screens (Coming Soon)
- **CreateAssessment** - AI-guided assessment creation with media capture
- **AssessmentDetail** - View/edit assessment details and media
- **CreateClient** - Add new client form
- **ClientDetail** - View/edit client information
- **EquipmentDetail** - Detailed equipment specifications
- **AddEquipment** - Add new equipment to catalog
- **LoginModalScreen** - Email/password authentication

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

#### Assessments
- `GET /api/assessments` - List all assessments with client info
- `GET /api/assessments/:id` - Get assessment details with media and equipment
- `POST /api/assessments` - Create new assessment
- `POST /api/assessments/:id/media` - Upload media for assessment

#### Equipment
- `GET /api/equipment` - List all equipment items
- `POST /api/equipment` - Add new equipment item

#### Quotes & Invoices
- `POST /api/quotes` - Generate quote for assessment
- `POST /api/invoices` - Create invoice for assessment

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

## Key Features (Roadmap)

### Phase 1 (Current)
- ✅ User authentication
- ✅ Client management
- ✅ Assessment tracking
- ✅ Equipment catalog
- ✅ Backend API routes

### Phase 2 (Next)
- 🔲 Camera/photo/video capture for assessments
- 🔲 Audio notes with transcription
- 🔲 AI-powered assessment analysis
- 🔲 Quote generation (3 options per assessment)
- 🔲 Invoice creation with hourly rates
- 🔲 PDF report generation

### Phase 3 (Future)
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
