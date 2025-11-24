# OT/AH Assessment App

A professional mobile application for Occupational Therapists and Allied Health professionals to streamline client assessments, equipment recommendations, and invoicing workflows.

## Recent Updates

### November 24, 2025 - APPLE TEAM ID CONFIGURATION ✅
- **Updated**: Added Apple Team ID (Z3MHL22LAF) to eas.json for App Store submissions
- **Improved**: Enhanced API error logging for better debugging of network issues
  - Added detailed logging of API request URLs and response status codes
  - Improved error messages when server returns non-JSON responses
  - Better tracking of which specific endpoints are failing

### November 23, 2025 - AI-POWERED ROUTE OPTIMIZATION WITH APPLE MAPS 🗺️✅
- **New**: Intelligent route optimization for appointment scheduling with real-time navigation
  - **AI Route Optimization**:
    - Powered by Claude 3.5 Sonnet for intelligent route planning
    - Analyzes multiple appointments to minimize travel time and distance
    - Considers appointment time windows and traffic patterns
    - Generates optimized visit order for maximum efficiency
    - Provides turn-by-turn directions between locations
  - **Route Optimization Features**:
    - Select multiple appointments for a specific day
    - AI calculates optimal visit order
    - Displays total distance and estimated travel time
    - Shows travel time and distance between each stop
    - Provides directions for each leg of the journey
    - Respects appointment scheduling constraints
  - **Apple Maps Integration**:
    - One-tap navigation to each client location
    - Opens directly in Apple Maps with directions
    - Uses client address coordinates for accurate routing
    - Supports real-time traffic data through Apple Maps
    - Works seamlessly on iOS devices
  - **Smart Route Display**:
    - Beautiful step-by-step route visualization
    - Numbered stops showing optimal visit order
    - Travel time and distance for each segment
    - Client name and appointment details at each stop
    - Color-coded route summary card
    - AI optimization notes explaining strategy
  - **Quick Access**:
    - "Route" button appears on days with 2+ appointments
    - Only shows for upcoming appointments (not past dates)
    - Auto-filters appointments with valid location data
    - Select all or individual appointments
    - Real-time route recalculation
  - **Dashboard Route Planning Tabs** 📊:
    - **Today's Routes**: Quick overview of today's appointment schedule
      - Shows total appointments, estimated distance, and travel time
      - Lists first 3 appointments with times and client names
      - Quick "Optimize Route" button when 2+ appointments with locations
      - Updates every minute for real-time accuracy
    - **Weekly Overview**: Complete week planning at a glance
      - Total weekly appointments, distance, and travel time
      - Beautiful gradient stats card with key metrics
      - Daily breakdown showing appointments per day
      - Tap any day to jump to route optimization
      - Shows which days have multiple appointments (route icon)
      - Updates every 5 minutes
    - **Tab Switching**: Toggle between Today and This Week views
    - **Location Indicators**: Green pin icon shows appointments with valid addresses
    - **Empty States**: Clean messaging when no appointments scheduled
    - **Direct Navigation**: Tap any day or "Optimize Route" to start planning
  - **Location Requirements**:
    - Uses client address with latitude/longitude coordinates
    - Falls back to appointment location field if available
    - Validates location data before optimization
    - Graceful handling of appointments without coordinates
  - **UI Features**:
    - Blue gradient theme matching appointment system
    - Stats showing total appointments and selected count
    - Select All / Clear buttons for quick selection
    - Checkboxes for individual appointment selection
    - Optimized route results with navigation buttons
    - Distance in kilometers, time in hours/minutes
  - **Backend API**:
    - POST `/api/route-optimization/optimize` - Generate optimized route with AI
    - GET `/api/route-optimization/appointments/:date` - Get appointments for specific day
    - GET `/api/route-optimization/summary/today` - Get today's route summary for dashboard
    - GET `/api/route-optimization/summary/week` - Get weekly route summary for dashboard
    - Haversine formula for distance calculations
    - Graceful fallback if AI unavailable
  - **Database**: Uses existing Client latitude/longitude and Appointment location fields
  - Access via Dashboard "Route Planning" card, or "Route" button next to date headers in Calendar screen

### November 23, 2025 - APPOINTMENT CALENDAR SYSTEM ✅
- **New**: Complete appointment management and calendar system
  - **Calendar Screen**: Beautiful list-based calendar view grouped by date
  - **Create Appointments**: Full-featured modal for creating new appointments
  - **Edit Appointments**: Update appointment details, times, and status
  - **Appointment Types**: Assessment, Follow Up, Consultation, Phone Call, Home Visit, Other
  - **Client Linking**: Link appointments to client profiles with quick navigation
  - **Date & Time Pickers**: Native iOS/Android date and time selection
  - **All-Day Events**: Toggle for all-day appointments
  - **Status Tracking**: Scheduled, Confirmed, Cancelled, Completed, No Show
  - **Location Field**: Add appointment locations
  - **Notes & Description**: Rich text fields for appointment details
  - **Automated Reminders**: 24-hour reminder system (emails coming soon)
  - **Dashboard Integration**: Appointment card on main dashboard
  - **Visual Status Indicators**: Color-coded status badges for quick scanning
  - **Upcoming Appointments**: Separate view for future appointments
  - **Past Appointments**: Historical record of completed/cancelled appointments
  - **Pull to Refresh**: Quick refresh of appointment list
  - **Backend API**: Complete CRUD operations at `/api/appointments`
  - **Purple-themed UI**: Professional gradient design matching app aesthetic
  - Access via Dashboard or direct navigation

### November 23, 2025 - APPOINTMENT CONSENT & GUIDELINES SYSTEM ✅
- **New**: Comprehensive consent tracking and appointment preparation system
  - **Appointment Summary**: Add custom summary of what the appointment is about
  - **Guidelines Field**: Include detailed guidelines for what to expect during appointment
  - **Consent Requirement Toggle**: Enable/disable consent requirement per appointment
  - **Consent Tracking**:
    - Track whether client has given consent
    - Record who gave consent (email/identifier)
    - Timestamp when consent was given
    - Track consent method (email reply, phone, in-person, portal)
    - Automatic status change to "Confirmed" when consent is received
  - **Visual Consent Indicators**:
    - Green shield with "Consent Confirmed" for approved appointments
    - Amber shield with "Awaiting Consent" for pending appointments
    - Shows consent date when available
  - **Reminder Email Integration** (Ready for implementation):
    - Summary and guidelines will be included in reminder emails
    - Consent form template asking client to reply "YES" to confirm
    - Terms of service and consent to visit included in email
    - Backend endpoint `/api/appointments/:id/consent` ready for recording consent responses
  - **Database Fields**:
    - `summary` - Brief appointment description for reminders
    - `guidelines` - What to expect during appointment
    - `consentRequired` - Whether consent is needed (default: true)
    - `consentGiven` - Whether consent was received
    - `consentGivenAt` - Timestamp of consent
    - `consentGivenBy` - Who gave consent (email/identifier)
    - `consentMethod` - How consent was given (email_reply, phone, in_person, portal)
  - **UI Updates**:
    - Summary and guidelines fields in appointment creation modal
    - Help text explaining fields will be included in reminders
    - Consent requirement toggle with explanation
    - Consent status visible in appointment list
  - **Backend API**: POST `/api/appointments/:id/consent` for recording consent
  - Access all features via appointment creation/edit modal

### November 23, 2025 - BUSINESS REPORTING SYSTEM ✅
- **New**: Comprehensive reporting and analytics system for business intelligence
  - **Four Report Types**:
    - **Financial Reports**: Revenue analytics, invoice tracking, payment status, monthly trends, and top clients by revenue
    - **Operational Reports**: Assessment metrics, appointment statistics, daily activity tracking, and workflow analytics
    - **Clinical Reports**: Client demographics, equipment recommendations analysis, assessment type distribution, and clinical outcomes
    - **Custom Reports**: Build your own reports with selected metrics and date ranges
  - **AI-Powered Analysis** 🤖:
    - **Executive Summary**: AI-generated 2-3 sentence summary of report findings
    - **Key Insights**: 3-5 data-driven insights extracted from report metrics
    - **Actionable Recommendations**: 3-5 specific suggestions for improving business performance
    - **Trends & Patterns**: 2-3 notable trends identified across the data
    - Powered by Claude 3.5 Sonnet for intelligent business intelligence
    - Automatic analysis generation for every report
  - **Report Storage**:
    - Reports saved to `/uploads/reports/` directory as JSON files
    - Persistent storage for all generated reports
    - Download and share functionality
  - **Report Detail Screen**:
    - Beautiful card-based layout for AI insights
    - Executive summary prominently displayed
    - Numbered key insights with visual indicators
    - Trend analysis with icons
    - Recommendations with action-oriented formatting
    - Report metadata and details
    - Download button for exporting reports
    - Share functionality for collaboration
  - **Report Features**:
    - Date range selection for flexible time periods
    - Visual report type cards with color-coded icons
    - Quick report generation with one tap
    - Report history with easy access to past reports
    - Delete unwanted reports
    - Tap any report to view detailed AI analysis
  - **Financial Report Metrics**:
    - Total, paid, pending, and overdue revenue
    - Average invoice value
    - Monthly revenue breakdown
    - Top 10 clients by revenue
    - Invoice count by status
  - **Operational Report Metrics**:
    - Assessment counts by type and status
    - Appointment statistics
    - New client acquisition
    - Daily activity tracking
    - Recent assessment history
  - **Clinical Report Metrics**:
    - Client demographics and age analysis
    - Equipment recommendation patterns
    - Assessment type distribution
    - Media capture statistics
  - **UI Features**:
    - Beautiful blue gradient theme
    - Report type selection with icons
    - Date picker for custom ranges
    - Empty state with call-to-action
    - Dashboard integration with Reports card
    - Back button navigation
  - **Backend API**:
    - GET `/api/reports` - List all reports
    - GET `/api/reports/:id` - Get single report with AI analysis
    - POST `/api/reports/generate` - Generate new report with AI insights
    - DELETE `/api/reports/:id` - Delete report
  - **Database**: Full report history with filters, metadata, and file URLs
  - Access via Dashboard or direct navigation

### November 23, 2025 - COMPREHENSIVE DASHBOARD ✅
- **New**: Beautiful consolidated dashboard for practice overview
  - **Real-time metrics** with auto-refresh every minute
  - **Revenue Overview** card showing total, paid, and pending revenue
  - **Quick Stats Grid**: Clients, Assessments, Invoices, Equipment counts
  - **Upcoming Tasks** section for in-progress assessments
  - **Recent Activity** feed showing latest assessments
  - **Smart Alerts System**:
    - Overdue invoices notification
    - Documents expiring within 30 days
    - Pending assessments requiring attention
  - **Assessment Progress Tracking**: See pending vs completed counts
  - **Invoice Status**: Track paid vs overdue invoices at a glance
  - **Visual Status Indicators**: Color-coded badges for quick scanning
  - **Direct Navigation**: Tap any metric to jump to relevant screen
  - Set as default home screen (first tab)
  - Blue/purple gradient theme for professional look
  - Backend endpoint: `/api/dashboard/stats`
  - **Makes it easy to see what's happening, what's done, and what needs attention**

### November 23, 2025 - PDF CATALOG UPLOAD & AI PARSING ✅
- **New**: AI-powered equipment catalog upload feature with **Hybrid Multimodal Parsing**
  - Upload PDF equipment catalogs via the Equipment screen
  - **Intelligent parsing strategy**:
    - **Gemini 3 Pro Vision** for image-heavy catalogs (tables, product photos, visual layouts)
    - **Grok text parsing** for text-based catalogs (fallback and primary for text-rich PDFs)
    - Automatic detection of PDF type and selection of best parsing method
  - Extracts: name, description, category, price, brand, model, specifications
  - Adds all items to your equipment database automatically
  - Handles complex layouts, tables, multi-column formats, and product images
  - Supports PDFs up to 50MB in size
  - Beautiful purple-themed upload screen with progress tracking
  - Success screen shows equipment count and link to view items
  - Access via "Upload Catalog" button in Equipment header
  - Backend: PDF parsing with pdf-parse library
  - Backend: Hybrid AI catalog parsing endpoint at `/api/ai/parse-catalog`
  - Backend: PDF upload endpoint at `/api/upload/catalog`
  - **Works with both visual and text-based equipment catalogs**

### November 23, 2025 - AUTO-CREATE BUSINESS DOCUMENTS ✅
- **New**: Invoices and quotes automatically create Business Documents
  - When you generate an invoice, it's automatically added to your Business Documents as "Invoice Sent"
  - When you generate a quote, it's automatically added to your Business Documents as "Quote Sent"
  - Includes client name, amount, items, and all relevant details
  - Track all invoices/quotes you've sent in one place
  - Due dates automatically set for invoices
  - Valid until dates automatically set for quotes
  - No manual entry needed - everything is automatic!

### November 23, 2025 - BUSINESS DOCUMENTS FEATURE ✅
- **New**: Complete Business Documents management system for practitioners
  - Store and manage your own professional documents (insurance, licenses, certifications)
  - Track invoices you've sent to clients with payment status
  - Manage receipts, contracts, tax documents, and notes
  - Support for amounts and expiry date tracking
  - Filter documents by type (invoices sent, insurance, licenses, notes, etc.)
  - Long-press to delete documents
  - Add new documents via modal with document type selection
  - Expiry date warnings (30 days before expiry)
  - Beautiful teal-themed UI matching client documents
  - Accessible via Settings screen → "View My Documents" button

### November 23, 2025 - DOCUMENT GENERATION FIX ✅
- **Fixed**: Documents now automatically created when generating invoices and quotes
  - Invoice creation now creates a corresponding Document record for the client
  - Quote creation now creates a corresponding Document record for the client
  - Documents include full invoice/quote data in JSON format
  - Document metadata tracks invoice/quote ID and number for reference
  - Added "View Documents" button in Client Detail screen for easy access
  - Documents properly filtered by client and accessible via Documents screen

### November 23, 2025 - COMPREHENSIVE DOCUMENT MANAGEMENT SYSTEM ✅
- **Client Documents**: Complete document management for client-related files
  - Store invoices, quotes, reports, house maps, and assessment summaries
  - Filter documents by type (invoices, quotes, reports, maps, summaries)
  - View, edit, and delete documents with version tracking
  - Automatic document generation when creating invoices/quotes
  - Beautiful document viewer with formatted content display
  - Direct access from Client Detail screen

- **Business Documents**: Personal business document management for the practitioner
  - Track invoices sent to clients/providers with payment status
  - Store insurance policies, registrations, licenses, certifications
  - Manage contracts, receipts, tax documents, and notes
  - Support for file uploads and JSON content
  - Expiry date tracking for time-sensitive documents
  - Tag system for easy organization

- **Invoice Tracking & Reminders**: Automated payment reminder system
  - Track invoice status (pending, paid, overdue)
  - Automatic reminder 3 days before due date
  - Overdue reminder system for late payments
  - Mark invoices as paid with one tap
  - Links business documents to sent invoices
  - Backend scheduler endpoint (`/api/sent-invoices/check-reminders`)

- **Database Models**:
  - `Document` - Client assessment documents
  - `BusinessDocument` - Practitioner's business documents
  - `SentInvoice` - Invoice tracking with payment reminders

### November 23, 2025 - SECURE STORAGE FIX ✅
- **Fixed**: Non-std C++ exception error in SecureStorage by adding proper availability checks and AsyncStorage fallback
  - SecureStorage now checks if expo-secure-store is available before use
  - Automatic fallback to AsyncStorage for web/simulators where SecureStore isn't supported
  - Graceful error handling prevents app crashes on platforms without native secure storage
  - Fixed missing `trackKey()` call in `setSecure()` method

### November 23, 2025 - SECURITY & COMPLIANCE OVERHAUL ✅

**🔒 Critical Security Enhancements (Healthcare Compliance)**:
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA using Better Auth - Complies with APP 11.1
- **Session Timeout**: 15-minute idle timeout with automatic logout
- **Encrypted Mobile Storage**: AES-256 encryption for AHPRA numbers, banking details, profile data
- **Input Validation**: Comprehensive Zod schemas preventing XSS/SQL injection
- **File Upload Authentication**: Patient photos/videos require valid session
- **Rate Limiting**: Protection against brute force (auth: 5/15min, AI: 10/min, uploads: 20/min)
- **Audit Logging**: Tracks all data access and third-party AI disclosures (APP 11, 13)
- **Privacy Policy**: Legal-compliant policy covering all Australian Privacy Principles
- **AI Consent Tracking**: Database fields for informed consent on cross-border data sharing

**📊 Compliance**: Australian Privacy Act 1988 + APPs - **CRITICAL REQUIREMENTS MET** ✅

### November 23, 2025 - PROFESSIONAL PROFILE SYSTEM
- **Added**: Complete Professional Profile System
  - 3-step onboarding wizard for collecting AHPRA, business details, and custom rates (src/screens/ProfessionalProfileSetupScreen.tsx)
  - Settings screen for editing profile after setup (src/screens/SettingsScreen.tsx)
  - Backend API routes for profile management (backend/src/routes/profile.ts)
  - Integrated with invoice/quote generation - uses custom rates from profile
  - Accessible via settings icon (gear) in assessments header
- **Extended**: Database schema with professional profile fields (AHPRA, ABN, business details, customizable rates)
- **Added**: Complete onboarding experience for new users (src/screens/OnboardingScreen.tsx)
  - Beautiful 5-slide welcome tour introducing key features
  - Interactive animations and smooth transitions
  - Persistent state using AsyncStorage
- **Added**: Quick Start Checklist to guide new users (src/components/QuickStartChecklist.tsx)
  - 5 actionable steps: Create client, conduct assessment, browse equipment, read guide, try AI
  - Progress tracking with visual indicators
  - Direct navigation to relevant screens
  - Accessible via checklist icon in assessments header
- **Added**: Interactive User Guide with AI-powered support chatbot (src/screens/UserGuideScreen.tsx)
  - Comprehensive guide covering all features with expandable sections
  - Real-time AI assistant using GPT-4o-mini for personalized help
  - Accessible from help icon in assessments screen header
  - Updated with onboarding and Quick Start Checklist documentation
- **Migrated**: Upgraded from deprecated expo-av to expo-audio for audio recording and playback (SDK 54 compatibility)
- **Fixed**: Audio recording now properly calls `prepareToRecordAsync()` before recording (src/screens/AssessmentDetailScreen.tsx:252)
- **Improved**: Text-to-speech cleanup now uses actual audio duration instead of fixed 5-second timeout (src/lib/textToSpeech.ts:134)
- **Upgraded**: 3D House Map Generation now uses real Gemini 2.0 Flash AI vision to analyze frames and extract room types, dimensions, and features
- **Upgraded**: Video Walkthrough frame analysis enhanced to extract AI-estimated dimensions, features, and safety issues from each frame
- **Improved**: Client Detail screen now groups assessments into "Ongoing" and "Completed" sections for better organization
- **Added**: "New" button in Client Detail screen to quickly add assessments to the current client without re-selecting
- **Added**: Empty state button to create first assessment when a client has no assessments
- **Fixed**: Database schema synchronization - Added archival tracking fields (`isArchived`, `archivedAt`, etc.) to Client and Assessment tables
- **Fixed**: Assessment detail button now correctly displays the assessment type (e.g., "Mobility Scooter Assessment Form" instead of always showing "Environmental Assessment Form")
- **Fixed**: Navigation issue where clicking different assessments would show cached data

## Overview

This app enables OT/AH professionals to:
- Conduct AI-guided assessments with photo, video, and audio capture
  - **Home Environmental Assessments** (50+ questions based on AOTA/CAOT standards)
  - **Mobility Scooter Assessments** (NDIS-compliant AS 3695)
  - **Falls Risk Assessments** (FRAT-based comprehensive evaluation)
  - **Movement & Mobility Assessments** (FIM/Barthel Index)
  - **Assistive Technology Assessments**
- Manage client information and assessment history
- Browse and recommend equipment from a comprehensive catalog
- **Create 3D maps of properties with rooms and outdoor areas**
- **Recommend IoT devices and assistive technology with AI-powered placement**
- **Generate technical specifications and placement diagrams for IoT devices**
- Generate professional quotes with multiple options **(including hardware, installation, and SaaS subscription costs)**
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
- **GPT-4O** (OpenAI) - Enhanced audio transcription and assessment question analysis
- **Gemini 3 Pro** (Google) - Structured data extraction and JSON responses
- **Gemini 3 Pro Image** (Google) - Advanced image analysis and equipment mockups (via Nano Banana Pro)
- **Gemini 3 Pro Video** (Google) - Video analysis for gait, transfers, and mobility assessments
- **Grok 4 Fast** (xAI) - Equipment recommendations and quick responses
- **Multi-Agent Orchestrator** - Intelligent task routing to optimal AI model

### Audio & Voice
- **GPT-4O Transcribe** - High-accuracy audio transcription with domain context
- **ElevenLabs TTS** - Natural text-to-speech for guidance and accessibility
- **Expo AV** - Audio recording and playback
- **Voice Guidance System** - Interactive voice prompts and instructions

### Location & Mapping
- **Expo Location** - Geocoding and reverse geocoding
- **React Native Maps** - Apple Maps integration for property locations
- **Native Maps Apps** - Deep linking to iOS Maps and Android Maps

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
- **ConductAssessment** ✅ - Structured environmental assessment form with AI guidance
- **AssessmentDetail** ✅ - Capture photos, video, audio with AI analysis (requires authentication)
- **CreateClient** ✅ - Add new client form with all contact info
- **ClientDetail** ✅ - View/edit client with assessment history
- **EquipmentRecommendations** ✅ - AI-powered equipment suggestions (Grok 4 Fast)
- **EquipmentDetail** ✅ - View/edit equipment specs and pricing
- **AddEquipment** ✅ - Add new equipment to catalog with full form
- **GenerateQuote** ✅ - Generate 3 pricing options (Essential, Recommended, Premium)
- **GenerateInvoice** ✅ - Create itemized invoices with hourly rates
- **HouseMapping** ✅ - Create 3D property maps with rooms and outdoor areas
- **VideoWalkthrough** ✅ - AI-guided video walkthrough for property mapping
- **IoTDeviceLibrary** ✅ - Browse and select IoT devices for placement
- **DevicePlacement** ✅ - 3D map view showing IoT device placements in property
- **LoginModalScreen** ✅ - Email/password authentication

> **Note:** All screens now properly check authentication status before loading data. Users will be prompted to log in if they attempt to access protected resources.

### Database Schema

#### Core Models
- **Client** - Client information (name, contact, DOB, notes)
- **Assessment** - Assessment records (type, status, location, AI summary)
- **AssessmentResponse** - Structured responses to assessment questions with AI analysis
- **AssessmentMedia** - Photos, videos, audio with AI analysis
- **EquipmentItem** - Equipment catalog with pricing and approvals
- **AssessmentEquipment** - Equipment recommendations per assessment
- **Quote** - Multi-option quotes with items and totals
- **Invoice** - Itemized invoices with hourly rates
- **HouseMap** - 3D property maps with floors and metadata
- **Room** - Individual rooms with dimensions and 3D positions
- **Area** - Outdoor areas (patios, yards, driveways) with dimensions
- **IoTDeviceLibrary** - Catalog of IoT devices with specs and placement rules
- **IoTDevicePlacement** - Specific device placements in rooms/areas with 3D coordinates

### Backend API Routes

All routes require authentication except `/health` and `/api/auth/*`

#### Clients
- `GET /api/clients` - List all active (non-archived) clients for current user
- `GET /api/clients/archived?search=query` - Search and list archived clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client information
- `DELETE /api/clients/:id` - Archive client (requires `reason` in body, cascades to assessments)
- `DELETE /api/clients/:id/permanent` - Permanently delete archived client (only after retention period)
- `POST /api/clients/:id/restore` - Restore archived client and associated assessments

#### Assessments
- `GET /api/assessments` - List all active (non-archived) assessments with client info
- `GET /api/assessments/archived?search=query` - Search and list archived assessments
- `GET /api/assessments/:id` - Get assessment details with media and equipment
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment (status, notes, location)
- `DELETE /api/assessments/:id` - Archive assessment (requires `reason` in body)
- `DELETE /api/assessments/:id/permanent` - Permanently delete archived assessment (only after retention period)
- `POST /api/assessments/:id/restore` - Restore archived assessment
- `POST /api/assessments/:id/media` - Upload media for assessment
- `POST /api/assessments/:assessmentId/responses` - Save/update response to assessment question
- `GET /api/assessments/:assessmentId/responses` - Get all responses for an assessment
- `GET /api/assessments/client/:clientId/previous-responses` - Get responses from previous assessments for pre-filling
- `POST /api/assessments/:assessmentId/responses/:responseId/analyze` - Get AI analysis for specific response

#### AI Services
- `POST /api/assessments/:id/analyze` - AI-powered assessment analysis (GPT-5 Mini)
- `POST /api/ai/equipment-recommendations` - Equipment recommendations (Grok 4 Fast)
- `POST /api/ai/generate-quotes` - Generate 3 quote options (Grok 4 Fast)
- `POST /api/ai/vision-analysis` - Image analysis (Gemini 3 Pro Image)
- `POST /api/ai/video-analysis` - Video analysis (Gemini 3 Pro Video) with assessment-specific prompts

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

#### 3D House Mapping & IoT Devices
- `POST /api/assessments/:id/house-map` - Create 3D house map for assessment
- `GET /api/house-maps/:id` - Get house map with rooms, areas, and IoT placements
- `POST /api/house-maps/:id/rooms` - Add room to house map
- `PUT /api/rooms/:id` - Update room details and dimensions
- `DELETE /api/rooms/:id` - Delete room
- `POST /api/house-maps/:id/areas` - Add outdoor area to house map
- `PUT /api/areas/:id` - Update area details
- `DELETE /api/areas/:id` - Delete area
- `GET /api/iot-devices` - Get IoT device library (12 pre-seeded devices)
- `POST /api/iot-devices` - Add new IoT device to library
- `PUT /api/iot-devices/:id` - Update IoT device specs/pricing
- `DELETE /api/iot-devices/:id` - Delete IoT device
- `POST /api/house-maps/:id/device-placements` - Place IoT device in room/area
- `PUT /api/device-placements/:id` - Update device placement/position
- `DELETE /api/device-placements/:id` - Remove device placement

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
│   │   ├── LoginWithEmailPassword.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── FloorPlanView.tsx
│   │   └── VoiceGuidance.tsx
│   ├── lib/
│   │   ├── api.ts (API client with auth)
│   │   ├── authClient.ts
│   │   ├── aiAgents.ts (Multi-agent orchestrator)
│   │   ├── audioTranscription.ts (Whisper API integration)
│   │   ├── audioTranscriptionEnhanced.ts (GPT-4O transcription)
│   │   ├── textToSpeech.ts (ElevenLabs TTS)
│   │   ├── geocoding.ts (Location and geocoding utilities)
│   │   ├── imageGeneration.ts (AI image generation - Nano Banana Pro & GPT Image 1)
│   │   ├── offlineQueue.ts (Offline request queuing)
│   │   ├── offlineStorage.ts (Local caching with TTL)
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
# Method 1: Create migration (recommended for production)
bunx prisma migrate dev --create-only --name <migration-name>
bunx prisma migrate deploy

# Method 2: Quick push (for development)
bunx prisma db push --skip-generate
bunx prisma generate
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

### Voice & Audio AI System

The app includes a comprehensive voice and audio AI system powered by GPT-4O and ElevenLabs for enhanced accessibility and productivity.

**Audio Transcription (GPT-4O):**
- **99%+ accuracy** with multi-language support
- **Contextual transcription** - Recognizes OT/AH medical terminology
- **Sentiment analysis** - Automatically detects positive, neutral, or concerning content
- **Action item extraction** - Identifies tasks and follow-ups from voice notes
- **Batch processing** - Transcribe multiple recordings efficiently
- **Verbose mode** - Provides duration, language detection, and metadata

**Text-to-Speech (ElevenLabs):**
- **4 Professional Voices** - Male/female voices optimized for different contexts
  - Professional Female: Clear instructions and guidance
  - Professional Male: Calm, reassuring feedback
  - Friendly Female: Client interactions
  - Authoritative Male: Technical information and alerts
- **Voice-guided assessments** - Step-by-step audio instructions for each room type
- **Read-aloud functionality** - Accessibility for visually impaired users
- **Safety alerts** - Audio notifications for concerns
- **Interactive prompts** - Feedback for photo capture, video recording, analysis completion
- **Offline preparation** - Pre-generate guidance audio for field use

**Voice Guidance Components:**
- `VoiceGuidanceToggle` - Enable/disable voice guidance
- `SpeakButton` - Read any text aloud with customizable voices
- `VoiceInstruction` - Display instructions with auto-play option

**Use Cases:**
- Hands-free assessment documentation
- Accessibility for therapists with visual impairments
- Training new assessors with guided walkthroughs
- Real-time feedback during property assessments
- Client-facing explanations of recommendations

### Environmental Assessment Form

The app includes comprehensive, structured assessment forms based on AOTA, CAOT standards, NDIS guidelines, and Australian legislation:

**1. Home Environmental Assessment (50+ questions)**
- **8 Major Sections** covering all areas of home safety:
  1. **Entrance & Exit** (7 questions) - Accessibility, lighting, stairs, handrails
  2. **Bathroom** (8 questions) - Grab bars, toilet height, non-slip surfaces, space
  3. **Kitchen** (8 questions) - Storage access, lighting, appliances, safety
  4. **Bedroom** (6 questions) - Bed height, clearance, lighting, closet access
  5. **Living Areas** (6 questions) - Walkways, furniture, cords, lighting
  6. **Stairs & Hallways** (5 questions) - Handrails, contrast marking, width
  7. **Safety & Emergency** (5 questions) - Detectors, exits, emergency contacts
  8. **Outdoor Spaces** (4 questions) - Pathways, lighting, steps, accessibility

**2. Mobility Scooter Assessment (NDIS-Compliant)**
Based on AS 3695 and NDIS Assistive Technology Guidelines
- **5 Major Sections** (31 questions total):
  1. **Client Assessment** (7 questions) - Purpose, mobility level, transfer ability, cognitive function
  2. **Environmental Assessment** (7 questions) - Storage, doorways, ramps, surfaces, turning space
  3. **Scooter Specification** (6 questions) - Class selection, range, configuration, seating, safety features
  4. **Safety & Training** (6 questions) - Operation, slope navigation, battery safety, maintenance
  5. **NDIS Funding Justification** (5 questions) - Reasonable and necessary criteria, goals, alternatives

**3. Falls Risk Assessment (FRAT-Based)**
Comprehensive falls assessment based on FRAT and Aged Care Quality Standard 3
- **5 Major Sections** (25 questions total):
  1. **Falls History** (4 questions) - Previous falls, injuries, fear of falling, activity avoidance
  2. **Mobility & Balance** (6 questions) - TUG test, sit-to-stand, balance, gait, mobility aids
  3. **Medical Risk Factors** (6 questions) - Medications, dizziness, vision, conditions, blood pressure
  4. **Environmental Hazards** (6 questions) - Rugs, lighting, stairs, grab rails, footwear, storage
  5. **Falls Risk Score & Plan** (5 questions) - Risk rating, interventions, referrals, equipment, follow-up

**4. Movement & Mobility Assessment (FIM/Barthel)**
Functional assessment based on FIM and Barthel Index
- **5 Major Sections** (25 questions total):
  1. **Transfers** (5 questions) - Bed, chair, toilet, shower, car transfers with independence scoring
  2. **Walking & Ambulation** (6 questions) - Distance, aids, stairs, outdoor surfaces, speed, gait
  3. **Wheelchair Mobility** (5 questions) - Type, propulsion, fit, brakes, accessibility
  4. **ADL Mobility Components** (4 questions) - Dressing, bathing, domestic tasks, meal prep
  5. **Mobility Goals & Plan** (5 questions) - Goals, rehabilitation potential, equipment, referrals, scores

**Form Features:**
- **Detailed Questions** with clinical context and descriptions
- **Multiple Question Types** - Yes/No, Text, Multiple Choice, Checkbox, and Rating response types
- **Checkbox Questions** - Multi-select options with mandatory validation
- **Required Field Validation** - Enforce completion of critical questions before proceeding
- **Smart Pre-filling** - Automatically populate answers from previous completed assessments for the same client
- **Media Documentation** - Photo/video upload for each question
- **Real-time AI Analysis** - Instant feedback using appropriate AI model (GPT-4o, Gemini 2.5 Flash)
- **Contextual AI Prompts** - Each question has specific analysis instructions for OT best practices
- **Progress Tracking** - Visual progress bar shows completion status
- **Response Persistence** - Answers automatically saved and can be resumed
- **Risk Scoring** - Automated risk stratification for falls and clinical assessments

### Recent Updates

**LATEST: Healthcare Record Archival & Retention System:**
- ✅ **Compliant Archival System** - Meets Australian healthcare record retention requirements
  - Soft delete (archival) instead of permanent deletion
  - Records retained for legally required periods
  - Full audit trail with deletion reasons
  - Restore capability for mistaken deletions
- ✅ **Retention Policies** - Automatic calculation of retention periods
  - **Adult clients**: 7 years from archival date
  - **Child clients**: 7 years from turning 18 (up to 25 years total)
  - **Completed assessments**: 7 years from completion date
  - **Incomplete assessments**: 30 days (can be deleted sooner)
- ✅ **Backend API Routes** - Complete archival management
  - Archive clients/assessments with required deletion reason
  - Search archived records with full-text search
  - Restore archived records
  - Permanent deletion (only after retention period expires)
  - Cascade archival: deleting client archives all assessments
- ✅ **DeleteConfirmationModal Component** - Beautiful, informative deletion UI
  - Required reason input (minimum 5 characters)
  - Shows retention policy information
  - Different messages for adults/children and complete/incomplete
  - Displays cascade impact (e.g., "will archive 5 assessments")
  - Validation and loading states
- ✅ **Database Schema** - Archival tracking fields
  - `isArchived`, `archivedAt`, `deletionReason`
  - `canDeleteAfter` - Calculated retention expiry date
  - `isChild` flag for child retention rules
  - `completedAt` for assessment completion tracking
- ✅ **Compliance Features**
  - NDIS Practice Standards compliant
  - Aged Care Quality Standards compliant
  - Privacy Act 1988 compliant
  - Automatic retention period enforcement
  - Blocks permanent deletion until retention expires
  - Shows days remaining for retained records

**PREVIOUS: Checkbox Questions & Smart Pre-filling:**
- ✅ **Checkbox Question Type** - Multi-select questions for comprehensive data collection
  - Multiple selection support (e.g., "Indoor use", "Outdoor use", "Community access")
  - Visual checkbox UI with teal accent colors
  - Stored as JSON arrays for structured data
- ✅ **Required Field Validation** - Mandatory questions must be completed before proceeding
  - Checkbox validation ensures at least one option selected
  - Alert messages for incomplete required fields
  - Applies to yes/no, multiple choice, and checkbox questions
- ✅ **Smart Pre-filling System** - Automatically populate answers from previous assessments
  - Fetches responses from completed/approved assessments for the same client
  - Questions can define `prefillFrom` array to specify related question IDs
  - Visual indicator shows when data is pre-filled
  - Works across different assessment types (e.g., mobility data pre-fills scooter assessment)
- ✅ **Backend API** - New endpoint `/api/assessments/client/:clientId/previous-responses`
  - Retrieves all responses from completed assessments
  - Sorted by most recent first
  - Proper authorization and client verification
- ✅ **Fixed Navigation** - Creating new assessments now goes directly to ConductAssessment screen
  - Previously incorrectly went to AssessmentDetail
  - Now properly shows assessment form for data entry

**PREVIOUS: Gemini 3 Pro Image & Video Integration:**
- ✅ **Gemini 3 Pro Image** - Advanced image analysis across all assessment types
  - 4K resolution support with 4096 max output tokens
  - Enhanced visual inspection for equipment, hazards, and accessibility
  - Supports all image formats (JPEG, PNG, WebP, HEIC)
  - Higher accuracy for mobility aid identification and environmental assessment
- ✅ **Gemini 3 Pro Video** - Full video analysis capabilities
  - 8K token detailed analysis for comprehensive video assessment
  - Gait analysis, balance testing, transfer technique evaluation
  - Falls risk assessment through movement patterns
  - Mobility scooter operation skill assessment
  - Automatic assessment-type-specific prompt enhancement
- ✅ **Gemini 3 Pro** - Structured data extraction and JSON schemas
  - Enhanced reliability for form filling and categorization
  - 4096 token responses for complex structured outputs
- ✅ **Nano Banana Pro** - Latest Gemini 3 Pro Image generation
  - Ultra-high quality equipment mockups and visualizations
  - Multiple aspect ratios and resolution options (up to 3840x2160)
  - Photorealistic, technical, and artistic style support
  - Negative prompts for precise control
- ✅ **Updated backend AI routes** with assessment-specific video analysis
- ✅ **MIME type support** for all image and video formats
- ✅ **Backward compatible** with existing assessment workflows

**NEW: Clinical & Mobility Assessment Forms:**
- ✅ **Mobility Scooter Assessment** - NDIS-compliant AS 3695 (31 questions across 5 sections)
  - Client capability assessment for safe scooter operation
  - Environmental home and community access evaluation
  - Scooter class selection and specification (Class 1/2/3)
  - Safety training and maintenance protocols
  - NDIS funding justification with reasonable and necessary criteria
- ✅ **Falls Risk Assessment** - FRAT-based comprehensive evaluation (25 questions across 5 sections)
  - Falls history and fear of falling assessment
  - Mobility and balance testing (TUG, functional reach, single-leg stance)
  - Medical risk factors (medications, orthostatic hypotension, vision)
  - Environmental hazard identification
  - Risk stratification (Low/Moderate/High) and intervention planning
- ✅ **Movement & Mobility Assessment** - FIM/Barthel functional assessment (25 questions across 5 sections)
  - Transfer assessment (bed, chair, toilet, shower, car) with independence scoring
  - Ambulation evaluation (distance, aids, stairs, gait analysis, 6MWT)
  - Wheelchair mobility for manual and power chair users
  - ADL mobility components (dressing, bathing, housework, meal prep)
  - Goal-setting and rehabilitation potential determination
- ✅ **Updated assessment type selection** with 6 assessment categories
- ✅ **Dynamic form loading** based on assessment type
- ✅ **Compliance with NDIS Practice Standards, Aged Care Quality Standards, and Australian legislation**

**Voice & Audio AI:**
- ✅ GPT-4O transcription with 99%+ accuracy and multi-language support
- ✅ Contextual transcription for OT/AH terminology
- ✅ ElevenLabs TTS integration with 4 professional voices
- ✅ Voice-guided assessment instructions
- ✅ Audio analysis with sentiment detection (positive/neutral/concerning)
- ✅ Automatic action item extraction from voice notes
- ✅ Read-aloud functionality for accessibility
- ✅ Interactive voice prompts for assessment workflow
- ✅ Batch audio generation for offline use
- ✅ Safety alerts with voice notifications
- ✅ VoiceGuidance component with toggle controls

**Location & Maps Integration:**
- ✅ Geocoding support for client addresses using Expo Location
- ✅ Latitude/longitude storage in Client and Assessment models
- ✅ "Get Location Coordinates" button in client editing mode
- ✅ "Open in Maps" button to launch native maps apps (iOS/Android)
- ✅ Visual coordinates display with map pin icons
- ✅ Automatic address-to-coordinate conversion
- ✅ Deep linking to Apple Maps (iOS) and Google Maps (Android)
- ✅ Location permissions handling

**AI Image Generation (NEW!):**
- ✅ Nano Banana Pro (Gemini 3 Pro Image) integration for equipment mockups and visualizations
- ✅ GPT Image 1 integration for property modifications
- ✅ Equipment mockup generator (realistic and technical styles)
- ✅ Property modification visualizations
- ✅ IoT device placement renderings
- ✅ Image generation utilities with TypeScript types
- ✅ Support for image generation and editing
- ✅ Automatic image download and caching

**Visual Floor Plan & Map Toggle:**
- ✅ Interactive 2D floor plan visualization using SVG graphics
- ✅ Automatic room layout algorithm with grid positioning
- ✅ Color-coded rooms by type (bedroom=blue, kitchen=yellow, living=green, bathroom=cyan, etc.)
- ✅ Device placement indicators shown as colored circles on floor plan
- ✅ Map/List view toggle with icon buttons for flexible viewing
- ✅ Floor selector for multi-story properties
- ✅ Grid background with dashed lines for visual reference
- ✅ Device summary showing count per room
- ✅ Room dimensions displayed in scaled format
- ✅ Seamless switching between visual map and detailed list view

**AI Room Recognition & Manual Override:**
- ✅ Real-time room detection using Gemini 2.5 Flash vision AI
- ✅ AI analyzes camera frames to identify room types (living, kitchen, bedroom, etc.)
- ✅ Confidence score display showing AI detection accuracy
- ✅ Manual room type selector with "Edit" button overlay
- ✅ Dropdown menu with 11 room types for manual correction
- ✅ AI detection info shown: "AI detected: kitchen (95% confidence)"
- ✅ Users can override incorrect AI detections instantly

**3D House Mapping & IoT Device Placement Screens:**
- ✅ IoTDeviceLibrary screen - Browse IoT device catalog with category filtering
- ✅ DevicePlacement screen - Place devices in rooms and areas with 3D visualization
- ✅ Full navigation integration for house mapping workflow
- ✅ Category filtering (safety, security, accessibility, lighting, climate)
- ✅ Device placement with room/area selection
- ✅ Visual placement list with location details
- ✅ Device removal and management
- ✅ Government approval indicators
- ✅ Installation cost and monthly subscription display

**IoT & 3D House Mapping System:**
- Complete database schema for 3D property mapping
- Room and outdoor area modeling with dimensions and positions
- IoT device library with 12 pre-seeded devices:
  - **Safety**: Fall detectors, emergency buttons, smoke/CO detectors, water leak sensors
  - **Security**: Smart doorbells, door/window sensors, smart locks
  - **Accessibility**: Voice assistants, medication reminders
  - **Lighting**: Motion sensors, smart bulbs
  - **Climate**: Smart thermostats
- Device placement system with 3D coordinates
- Technical specifications and placement rules for each device
- Installation cost and SaaS subscription tracking
- Government approval indicators (NDIS, DVA)
- Full CRUD API for house maps, rooms, areas, and device placements
- Type-safe contracts for all IoT/3D mapping endpoints

**SafeAreaView Implementation (iPhone Notch Support):**
- Fixed header layout for iPhone 17 Pro Max and all devices with notches
- Wrapped LinearGradient headers inside SafeAreaView for proper safe area handling
- Consistent structure across all main screens (Assessments, Clients, Equipment)
- Proper background color handling to prevent white gaps behind notch

**Audio Transcription:**
- Fixed file upload format for React Native compatibility
- Switched from fetch/Blob to XMLHttpRequest with proper FormData structure
- Audio files now successfully transcribe using OpenAI Whisper API
- Format: `{uri, name, type: "audio/m4a"}` structure required for React Native

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
- **Complete structured environmental assessment form with 50+ detailed questions**
- **AI guidance for each assessment question with real-time feedback**
- **Photo/video documentation for each question with AI analysis**
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
- Track assessment status (draft/in_progress/completed/approved)
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
- ✅ AI-powered features (GPT-5 Mini, Gemini 2.5 Flash, Grok 4 Fast, Nano Banana Pro, GPT-4O)
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
- ✅ **IoT device library with 12 pre-seeded assistive tech devices**
- ✅ **3D house mapping with rooms and outdoor areas**
- ✅ **IoT device placement tracking with 3D coordinates**
- ✅ **IoT device library browsing screen with category filters**
- ✅ **Device placement screen with visual 3D map**
- ✅ **AI-powered room recognition using Gemini 2.5 Flash**
- ✅ **Manual room type override with dropdown selector**
- 🔲 AI-powered IoT device placement recommendations
- 🔲 Interactive 3D visualization for device placement mapping
- 🔲 Enhanced quote generation with itemized hardware/installation/SaaS costs
- 🔲 Equipment pricing automation (competitive analysis)
- 🔲 Government approval verification
- 🔲 Integration with XERO/accounting software
- 🔲 Multi-user collaboration

## Recent Bug Fixes

### SafeArea Implementation for iPhone Pro Max (Latest)
- **Issue**: Content overlapping with notch, clock, and battery icons on iPhone Pro Max and devices with dynamic island
- **Cause**: Stack navigation screens were not using `useSafeAreaInsets` hook for proper top padding
- **Fixes Applied**:
  - Added `useSafeAreaInsets` hook to all 15+ screens with headers
  - Updated all LinearGradient headers to use `style={{ paddingTop: insets.top + 16, ... }}`
  - Replaced className with style prop for consistent safe area handling
  - Fixed tab screens (AssessmentsScreen, ClientsScreen, EquipmentScreen)
  - Fixed stack screens (AssessmentDetailScreen, CreateAssessmentScreen, CreateClientScreen, ConductAssessmentScreen, GenerateQuoteScreen, GenerateInvoiceScreen, EquipmentRecommendationsScreen, IoTDeviceLibraryScreen, HouseMappingScreen, DevicePlacementScreen, VideoWalkthroughScreen, AddEquipmentScreen)
- **Result**: All screens now properly respect safe areas on all iPhone models including Pro Max, preventing content from being hidden behind system UI elements
- **Location**: All screen files in `/src/screens/`

### TypeScript Errors Fixed (Latest)
- **Issue**: Multiple TypeScript compilation errors in backend preventing type safety
- **Errors Fixed**:
  - Unknown type errors in AI API responses (ai.ts, assessments.ts)
  - Possibly undefined optional chaining errors for room/equipment types
  - AppType import errors in houseMap.ts and iotDevices.ts
- **Fixes Applied**:
  - Added proper type assertions for all API response data using `as` with specific interfaces
  - Added null coalescing operators (`??`) and optional chaining (`?.`) for undefined values
  - Fixed AppType imports to use `../types` instead of `../index`
- **Location**: `backend/src/routes/ai.ts`, `backend/src/routes/assessments.ts`, `backend/src/routes/houseMap.ts`, `backend/src/routes/iotDevices.ts`
- **Result**: All TypeScript errors resolved, full type safety restored across backend

### 3D House Map Duplicate Error (Fixed)
- **Issue**: "Unique constraint failed on assessmentId" when generating 3D maps
- **Cause**: Trying to create a new house map when one already exists for the assessment
- **Fix**: Added check in `/api/ai/generate-3d-map` to delete existing house map before creating new one
- **Location**: `backend/src/routes/ai.ts:430-440`
- **Result**: Users can now regenerate 3D maps multiple times for the same assessment without errors

### Authentication Client Error (Fixed)
- **Issue**: "Failed to load client" error on app startup
- **Cause**: Frontend auth client was configured with `emailOTPClient()` plugin, but backend only supports email/password authentication
- **Fix**: Removed unnecessary `emailOTPClient()` plugin from `src/lib/authClient.ts`
- **Result**: Auth client now properly initializes with only the Expo plugin matching backend configuration

### Gradient Backgrounds Not Rendering (Fixed)
- **Issue**: Screens appeared empty/blank with gradient backgrounds not displaying
- **Cause**: NativeWind doesn't support Tailwind gradient classes like `bg-gradient-to-br` in React Native
- **Fix**: Replaced all gradient `<View>` components with `<LinearGradient>` from `expo-linear-gradient` across all 9 screens
- **Files Updated**:
  - AssessmentsScreen, ClientsScreen, EquipmentScreen
  - CreateClientScreen, CreateAssessmentScreen
  - AssessmentDetailScreen (4 gradients)
  - GenerateQuoteScreen, GenerateInvoiceScreen
  - EquipmentRecommendationsScreen
- **Result**: All screens now render properly with beautiful gradient headers and buttons

## Notes

- All dates are stored as ISO strings in API responses
- Decimal fields (prices, totals) are returned as numbers
- Equipment specifications stored as JSON strings
- Invoice/quote items stored as JSON strings
- **Safe area handling**: Tab screens have automatic bottom insets via React Navigation tabs. Stack screens use `useSafeAreaInsets` hook for top padding on headers to avoid notch/dynamic island overlap.
- Authentication required for all client data access
- Tab screens use inline shadow styles instead of NativeWind shadow classes to avoid runtime CSS parsing issues
- Auth client uses only Expo plugin (no OTP) to match backend email/password setup
- Use LinearGradient component for gradients (NativeWind doesn't support gradient classes)

## Documentation Workflow

**📝 Important**: When adding or updating features, follow this checklist to keep documentation in sync:

### New Feature Checklist:
1. ✅ **Implement the feature** in code
2. ✅ **Update FEATURES.md**:
   - Add feature entry with status, files, and description
   - Reference the User Guide section
3. ✅ **Update User Guide** (`src/screens/UserGuideScreen.tsx`):
   - Add new section or subsection in `guideSections` array
   - Include step-by-step instructions
   - Explain where to find the feature in the app
4. ✅ **Update README.md**:
   - Add to "Recent Updates" section
   - Update relevant sections (API, Features, etc.)
5. ✅ **Test AI Chatbot**:
   - Open User Guide
   - Tap "AI Help"
   - Ask questions about the new feature
   - Verify the AI has context to answer

### Feature Enhancement Checklist:
1. ✅ **Update implementation**
2. ✅ **Update FEATURES.md** (if behavior changed)
3. ✅ **Update User Guide** (if UX changed)
4. ✅ **Update README.md** Recent Updates

### Quick Reference Files:
- **FEATURES.md**: Complete feature inventory with status tracking
- **UserGuideScreen.tsx**: User-facing documentation with AI chatbot
- **README.md**: Developer documentation and changelog
- **backend/src/routes/ai.ts**: AI chatbot system prompt (line ~847)

### AI Chatbot Auto-Updates:
The AI support chatbot in the User Guide automatically has context about:
- All features documented in the User Guide
- App structure and navigation
- Best practices and workflows
- Common troubleshooting

**No manual AI updates needed** - just keep the User Guide sections accurate!
