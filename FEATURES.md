# App Features & Documentation

**Last Updated**: November 23, 2025

This file tracks all features in the OT/AH Assessment App. When adding new features, update this file AND the User Guide (src/screens/UserGuideScreen.tsx).

## Core Features

### 1. User Onboarding
**Status**: ✅ Implemented
**Files**:
- `src/screens/OnboardingScreen.tsx`
- `src/components/QuickStartChecklist.tsx`
- `App.tsx`

**Description**:
- 5-slide welcome tour for new users
- Interactive animations with smooth scrolling
- Quick Start Checklist with 5 guided tasks
- Persistent state using AsyncStorage
- Auto-shows after onboarding completion

**User Guide Section**: Getting Started → First Time Setup, Quick Start Checklist

---

### 2. Professional Profile
**Status**: ✅ Implemented
**Files**:
- `backend/prisma/schema.prisma` (Profile model)
- `src/screens/ProfessionalProfileSetupScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `backend/src/routes/profile.ts`

**Description**:
- 3-step onboarding wizard for new users
- AHPRA registration number & profession
- Business details (name, ABN, contact info, address)
- Customizable rates (hourly, assessment, report, travel)
- Settings screen for editing profile after setup
- Backend API for profile storage and retrieval
- Integrated with invoice/quote generation

**User Guide Section**: Getting Started → Professional Profile Setup

---

### 3. Client Management
**Status**: ✅ Implemented
**Files**:
- `src/screens/ClientsScreen.tsx`
- `src/screens/ClientDetailScreen.tsx`
- `src/screens/CreateClientScreen.tsx`

**Description**:
- Create and manage client profiles
- Store contact details, address, DOB
- Add photos and notes
- View assessment history grouped by status
- Archive clients with retention tracking

**User Guide Section**: Getting Started → Creating Your First Client

---

### 4. Assessment Types
**Status**: ✅ Implemented
**Files**:
- `src/screens/ConductAssessmentScreen.tsx`
- `src/screens/AssessmentDetailScreen.tsx`
- `src/constants/` (various assessment forms)

**Description**:
- **Home Environmental Assessment**: 50+ questions (AOTA/CAOT standards)
- **Mobility Scooter Assessment**: NDIS-compliant AS 3695
- **Falls Risk Assessment**: FRAT-based evaluation
- **Movement & Mobility Assessment**: FIM/Barthel Index
- **Assistive Technology Assessment**

**User Guide Section**: Getting Started → Starting an Assessment

---

### 5. AI-Powered Media Analysis
**Status**: ✅ Implemented
**Files**:
- `backend/src/routes/ai.ts`
- `src/screens/AssessmentDetailScreen.tsx`

**Description**:
- **Photo Analysis**: Gemini 2.0 Flash identifies hazards, accessibility issues
- **Video Walkthrough**: Frame-by-frame analysis with room detection
- **Audio Transcription**: OpenAI Whisper converts voice notes to text
- **Text-to-Speech**: ElevenLabs reads guidance and alerts

**User Guide Section**:
- Conducting Assessments → Photo Capture, Video Walkthrough, Audio Notes, AI Analysis
- AI-Powered Features (full section)

---

### 6. 3D House Mapping
**Status**: ✅ Implemented
**Files**:
- `src/screens/HouseMappingScreen.tsx`
- `src/screens/VideoWalkthroughScreen.tsx`
- `backend/src/routes/ai.ts` (3D map generation)

**Description**:
- AI analyzes video frames to detect rooms
- Estimates dimensions using reference objects
- Identifies room types, features, safety issues
- Generates 3D property layouts
- Visualizes floor plans with measurements

**User Guide Section**: 3D House Mapping (full section)

---

### 7. IoT Device Recommendations
**Status**: ✅ Implemented
**Files**:
- `src/screens/IoTDeviceLibraryScreen.tsx`
- `src/screens/DevicePlacementScreen.tsx`
- `backend/src/routes/ai.ts` (device placement)

**Description**:
- Browse smart home devices (sensors, alarms, cameras)
- AI suggests optimal placement based on property layout
- Generate technical specifications
- Create placement diagrams for installers
- Track installation status

**User Guide Section**: IoT Device Recommendations (full section)

---

### 8. Equipment Catalog & Recommendations
**Status**: ✅ Implemented
**Files**:
- `src/screens/EquipmentScreen.tsx`
- `src/screens/EquipmentDetailScreen.tsx`
- `src/screens/EquipmentRecommendationsScreen.tsx`

**Description**:
- Comprehensive equipment catalog
- Filter by category (mobility, bathroom, bedroom, assistive tech)
- AI-powered equipment recommendations
- Add equipment to assessments
- Track NDIS item numbers and pricing

**User Guide Section**: Equipment Recommendations (full section)

---

### 9. Quotes & Invoices
**Status**: ✅ Implemented
**Files**:
- `src/screens/GenerateQuoteScreen.tsx`
- `src/screens/GenerateInvoiceScreen.tsx`
- `backend/src/routes/quotes.ts`
- `backend/src/routes/invoices.ts`

**Description**:
- Generate professional quotes with multiple options
- Create itemized invoices
- Uses custom rates from user's professional profile
- Track hourly rates and hours worked
- Include equipment costs (hardware, installation, SaaS)
- Export as PDF (future enhancement)

**User Guide Section**: Quotes & Invoices (full section)

---

### 10. Interactive User Guide with AI Chatbot
**Status**: ✅ Implemented
**Files**:
- `src/screens/UserGuideScreen.tsx`
- `backend/src/routes/ai.ts` (support-chat endpoint)

**Description**:
- 8 comprehensive sections with expandable content
- Real-time AI assistant (GPT-4o-mini)
- Context-aware conversation (last 6 messages)
- Accessible via help icon (?) in header

**User Guide Section**: Self-referencing (mentions itself in footer)

---

## Development Workflow

### When Adding a New Feature:

1. **Implement the feature** in code
2. **Update this file** (FEATURES.md) with:
   - Feature name and status
   - File locations
   - Description
   - User Guide section reference
3. **Update User Guide** (src/screens/UserGuideScreen.tsx):
   - Add new section or subsection
   - Include step-by-step instructions
   - Mention where to find the feature in the app
4. **Update README.md** Recent Updates section
5. **Test the AI chatbot** - Ask it about the new feature to ensure it has context

### Feature Status Legend:
- ✅ **Implemented**: Feature is complete and working
- 🚧 **In Progress**: Feature is partially implemented
- 📋 **Planned**: Feature is planned but not started
- ⚠️ **Needs Update**: Feature exists but documentation is incomplete

---

## Missing Features (Future Enhancements)

### PDF Export
**Status**: 📋 Planned
**Description**: Export quotes, invoices, and assessment reports as PDF

### Settings Screen
**Status**: ✅ Implemented
**Description**: Edit professional profile, rates, and business details after initial setup

### Professional Profile Setup
**Status**: ✅ Implemented
**Description**: Collect AHPRA, business details, rates during onboarding

### Offline Mode
**Status**: 📋 Planned
**Description**: Conduct assessments offline, sync when connected

### Team Collaboration
**Status**: 📋 Planned
**Description**: Share assessments with team members, assign tasks

---

## Quick Reference: Where to Update

| Change Type | Files to Update |
|-------------|-----------------|
| New Feature | 1. Implementation files<br>2. FEATURES.md<br>3. UserGuideScreen.tsx<br>4. README.md |
| Feature Enhancement | 1. Implementation files<br>2. FEATURES.md<br>3. UserGuideScreen.tsx (if UX changes)<br>4. README.md |
| Bug Fix | 1. Implementation files<br>2. README.md (if user-facing) |
| UI/UX Change | 1. Implementation files<br>2. UserGuideScreen.tsx (update instructions)<br>3. README.md (if significant) |

---

## AI Chatbot Context

The AI support chatbot (UserGuideScreen.tsx) uses this system prompt:

```
You are a helpful AI assistant for the OT/AH Assessment App, designed for Occupational Therapists and Allied Health professionals.

Your role is to help users understand and use the app effectively. You can answer questions about:
- How to conduct assessments (Home Environmental, Mobility Scooter, Falls Risk, Movement & Mobility, Assistive Technology)
- Using AI features (image analysis, audio transcription, text-to-speech, equipment recommendations)
- Creating 3D house maps from video walkthroughs
- Recommending IoT devices and assistive technology
- Managing clients and assessment records
- Generating quotes and invoices
- Best practices for documentation and photography

Be concise, professional, and specific to this app's features.
```

When adding new features, ensure the chatbot can answer questions about them by:
1. Adding to User Guide (chatbot references this context)
2. Testing sample questions about the feature
3. Updating the system prompt if needed for major feature categories
