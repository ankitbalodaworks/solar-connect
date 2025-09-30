# Sunshine Power WhatsApp Automation Platform

## Overview

This is a WhatsApp-based lead generation and service automation platform for Sunshine Power, a PM Surya Ghar registered vendor providing rooftop solar installations in Rajasthan, India. The platform manages customer data, automated WhatsApp campaigns, solar installation leads, and service requests through an admin dashboard.

The application handles complex workflows including customer imports via Excel, targeted campaign creation based on electricity consumption thresholds, lead tracking with survey scheduling, and service request management. The platform is designed to streamline solar business operations with bilingual support (Hindi/English) and integration with government subsidy programs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Library**: shadcn/ui components built on Radix UI primitives
- Professional table-centric design system for data-heavy dashboard requirements
- Custom theme system with light/dark mode support using CSS variables
- Professional blue color scheme (primary: #3B82F6 / 217 91% 60%) with light gray backgrounds (#F9FAFB / 210 20% 98%)
- Clean table layouts across all pages with search, filters, and pagination
- Status badges and urgency indicators with color-coded visual hierarchy

**Routing**: Wouter for client-side routing with five main pages:
- Dashboard (overview statistics and quick actions)
- Customers (bulk upload, filtering, management)
- Campaigns (WhatsApp campaign creation and tracking)
- Leads (solar installation lead management)
- Service Requests (maintenance and support tracking)

**State Management**: TanStack Query (React Query) for server state with custom API utilities

**Styling Approach**: 
- Tailwind CSS with custom configuration
- Inter font family from Google Fonts for modern readability
- Responsive design with mobile-first breakpoints
- Custom elevation system for hover/active states

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Development Server**: Development mode includes Vite middleware integration for HMR (Hot Module Replacement)

**Storage Interface**: Abstracted storage layer with in-memory implementation (`MemStorage`)
- Designed for future database integration
- CRUD operations defined through `IStorage` interface
- Currently implements user management as foundation

**API Design**: RESTful endpoints with `/api` prefix convention
- JSON request/response format
- Error handling middleware with status code normalization
- Request logging with duration tracking for API routes

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL
- Schema defined in shared directory for type safety across client/server
- Migration support configured with drizzle-kit
- Uses Neon serverless driver for PostgreSQL connectivity

**Database Schema**:
- `users`: Admin user authentication (username, password)
- `customers`: Customer profiles with electricity consumption data, Hindi names, and village information for Rajasthan context
- `leads`: Solar installation leads with survey scheduling for PM Surya Ghar installations. **customerId is optional** to support WhatsApp-generated leads where only phone number is initially known
- `serviceRequests`: Service/maintenance requests with issueType (Installation/Service-Repair/Other), urgency (Low/Medium/High), assignedTo, customerVillage, and status tracking. **customerId is optional** to support WhatsApp-generated requests where only phone number is initially known
- `campaigns`: WhatsApp campaign management with targeting thresholds for customer segmentation
- `messageTemplates`: WhatsApp interactive message templates with support for buttons, lists, and bilingual content (Hindi/English). Contains all 16 templates for campaign_lead and service_request flows in both English and Hindi. **Template Status Tracking**: Each template includes metaStatus (draft/pending/approved/rejected), metaTemplateId, metaStatusUpdatedAt, and submissionError fields for Meta approval workflow tracking
- `conversationStates`: Tracks active WhatsApp conversations and their position in automated flows (campaign lead generation or service requests)
- `whatsappLogs`: Complete audit trail of all WhatsApp messages sent/received with status tracking. Supports filtering by customerPhone query parameter for conversation history views

**Session Management**: Configured for connect-pg-simple (PostgreSQL session store)

### External Dependencies

**WhatsApp Integration**: Production-ready interactive message system with automated conversation flows
- **WhatsApp Business account: NOW IN PRODUCTION MODE** - can message any phone number worldwide (no longer restricted to test numbers)
- WhatsApp Business API integration with button and list message support (20-character button text limit enforced)
- Image header support with media upload functionality (Sunshine Power logo: Media ID 4245254242364293)
- Two-way conversation tracking with state machine for automated responses
- Language selection (Hindi/English) at conversation start via button/list/text interactions
- Secure webhook handling with HMAC-SHA256 signature verification using app secret
- Auto-status updates when leads/service requests are created or updated
- Conversation flows: Campaign → Lead generation, Service menu → Request creation
- Database schema allows nullable customer_id for WhatsApp-generated leads and service requests
- **Conversation Flow Engine** (`server/conversationFlow.ts`):
  - State machine tracks customer position in multi-step flows
  - Automatic template resolution based on flowType, language, and stepKey
  - Context preservation across conversation steps - all user responses are captured
  - Supports button, list, and text-based user responses
  - **Automatic record creation**: When conversations reach the "complete" step, the engine automatically creates database records:
    - Campaign leads: Creates lead record with customerPhone, customerName, survey schedule preferences
    - Service requests: Creates service request record with customerPhone, customerName, issueType, description, urgency
  - Data extraction from conversation context: Parses user selections (buttons/lists) and text responses to populate record fields
  - Handles flow completion gracefully without errors
  - Full message logging (inbound/outbound) to whatsappLogs table
  - Campaign flow: language_select → offer → survey_schedule → complete (creates lead)
  - Service flow: language_select → service_menu → problem_description → urgency_select → complete (creates service request)
- **WhatsApp Service** (`server/whatsapp.ts`):
  - Sends text, button, and list interactive messages via WhatsApp Business API
  - Template-based message sending with automatic message type detection
  - Webhook verification for initial setup (GET /api/whatsapp/webhook)
  - Webhook signature validation using HMAC-SHA256 with app secret
  - Parses incoming messages (text, button replies, list replies)
  - Comprehensive error handling and logging
- **API Endpoints**:
  - POST /api/whatsapp/send - Manually send WhatsApp message to start conversation
  - POST /api/whatsapp/webhook - Receive incoming messages from WhatsApp
  - GET /api/whatsapp/webhook - Webhook verification for Meta
  - GET /api/whatsapp/status - Check WhatsApp configuration status
  - POST /api/whatsapp/upload-media - Upload images to WhatsApp and get media IDs
  - POST /api/message-templates/:id/submit - Submit individual template to Meta for approval
  - POST /api/message-templates/:id/sync-status - Sync template status from Meta (APPROVED/PENDING/REJECTED/IN_APPEAL/DISABLED/PAUSED)
  - GET /api/whatsapp-logs?customerPhone=:phone - Fetch message history filtered by customer phone number
- **Required Environment Variables**:
  - WHATSAPP_PHONE_NUMBER_ID - WhatsApp Business phone number ID
  - WHATSAPP_ACCESS_TOKEN - API access token for sending messages
  - WHATSAPP_VERIFY_TOKEN - Custom token for webhook verification
  - WHATSAPP_APP_SECRET - Meta app secret for webhook signature validation

**File Processing**: 
- XLSX library (SheetJS) for Excel file parsing
- React Dropzone for drag-and-drop customer data uploads
- Client-side processing of customer spreadsheets

**Form Management**:
- React Hook Form with Zod resolvers for validation
- Drizzle-Zod for automatic schema validation generation

**Development Tools**:
- Replit-specific plugins for runtime error overlay and development banners
- TypeScript with strict mode enabled
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**Authentication**: Structure present but not yet implemented (user schema exists, no auth flow)

**Data Visualization**: Chart.js integration configured via recharts wrapper components

**UI Components**: Comprehensive shadcn/ui component library including:
- Data tables with sorting/filtering
- Forms with validation
- Dialogs and modals
- Toast notifications
- Badges for status indicators
- Responsive sidebar navigation

## Recent Changes (September 30, 2025)

### Message Template Management Enhancements
- **Per-Template Meta Submission**: Individual templates can now be submitted to Meta for approval via dedicated Submit button
- **Real-time Status Tracking**: Template status syncs from Meta API (APPROVED, PENDING, REJECTED, IN_APPEAL, DISABLED, PAUSED)
- **Status Badge System**: Color-coded status badges (green=approved, yellow=pending, red=rejected, gray=draft) with automatic updates
- **Error Handling**: Comprehensive error recording with submissionError field and numeric HTTP status code propagation
- **UI Improvements**: Loading states with animate-pulse/animate-spin indicators, disabled states prevent duplicate submissions
- **Status Normalization**: All status values normalized to lowercase for consistent comparison

### Message History Improvements
- **Customer Phone Filtering**: WhatsApp logs now filter by customerPhone query parameter for conversation history views
- **ConversationDetails Page**: Fixed to correctly use customerPhone parameter instead of generic phone parameter

### Technical Improvements
- **Case-Insensitive Status Comparison**: All metaStatus comparisons normalized to prevent mixed-case bugs
- **Numeric Error Codes**: Error handling uses HTTP status codes (404, 400, 500) instead of locale-dependent string matching
- **Template Name Validation**: WhatsApp service verifies exact template name matches (case-sensitive) when syncing from Meta
- **Stale State Prevention**: Unknown Meta statuses preserve existing status and record warnings without overwriting approved/pending states
- **Mutation State Management**: Frontend properly disables buttons and shows loading indicators during API calls

### Meta API Integration Fix (September 30, 2025)
- **Root Cause**: Meta WhatsApp Business API was rejecting template submissions with "[100] Invalid parameter" error due to incorrect enum value casing
- **Solution**: Updated all Meta template component definitions in `server/metaTemplates.ts` to use lowercase enum values:
  - Component `type`: Changed from "HEADER"/"BODY"/"FOOTER"/"BUTTONS" to "header"/"body"/"footer"/"buttons"
  - Component `format`: Changed from "TEXT"/"IMAGE"/"VIDEO"/"DOCUMENT" to "text"/"image"/"video"/"document"
- **Impact**: Templates now conform to Meta's official API specifications and submit successfully
- **Enhanced Logging**: Added detailed request/response logging in `submitSingleTemplate` to facilitate debugging of Meta API interactions
- **Verification**: Confirmed via end-to-end testing that "Invalid parameter" errors are resolved; templates now encounter only legitimate business logic errors (e.g., "Content already exists" for duplicate submissions)