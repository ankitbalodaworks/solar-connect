# Sunshine Power WhatsApp Automation Platform

## Overview

This project is a WhatsApp-based platform for Sunshine Power, a PM Surya Ghar registered vendor. It automates lead generation and service management for rooftop solar installations in Rajasthan, India. The platform streamlines operations through customer data management, automated WhatsApp campaigns, solar installation lead tracking, and service request handling via an admin dashboard. Key capabilities include Excel-based customer imports, targeted campaigns based on electricity consumption, lead tracking with survey scheduling, and service request management, all with bilingual (Hindi/English) support and integration with government subsidy programs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite.
- **UI Library**: shadcn/ui components on Radix UI, featuring a professional blue color scheme (#3B82F6) with light gray backgrounds (#F9FAFB), professional table-centric design, and custom theme support with light/dark modes.
- **Routing**: Wouter, handling Dashboard, Customers, Campaigns, Leads, Service Requests, Status, Conversations, and Message Templates pages.
- **State Management**: TanStack Query (React Query) for server state.
- **Styling**: Tailwind CSS, Inter font, responsive design, and custom elevation system.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Storage**: Abstracted storage layer with an in-memory implementation (`MemStorage`), designed for future database integration and managing user authentication.
- **API**: RESTful endpoints (`/api` prefix), JSON format, error handling, and request logging.

### Data Storage Solutions
- **ORM**: Drizzle ORM for PostgreSQL, with schema defined in a shared directory and migration support via drizzle-kit. Uses Neon serverless driver.
- **Database Schema**:
    - `users`: Admin authentication.
    - `customers`: Profiles with electricity consumption, Hindi names, village info.
    - `leads`: Solar installation leads (customerId optional).
    - `serviceRequests`: Service/maintenance requests (issueType, urgency, customerId optional).
    - `campaigns`: WhatsApp campaign management.
    - `messageTemplates`: WhatsApp interactive templates (53+ templates for campaign flow in EN/HI), including Meta approval tracking fields (metaStatus, metaTemplateId, metaStatusUpdatedAt, submissionError). **Template Update Behavior**: When a template is updated, metaStatus is automatically reset to "draft" to allow re-submission to Meta for approval.
    - `conversationStates`: Tracks active WhatsApp conversation states.
    - `whatsappLogs`: Audit trail of all WhatsApp messages with status tracking.
    - `events`: Append-only log of customer journey events (campaign_sent, delivered, read, replied, language_selected, menu choices, form_submitted).
    - `forms`: Stores complete form submission data for all conversation completions.
    - `callback_requests`: Captures callback requests for price/help.
    - `other_issues`: Captures general issue reports.
- **Session Management**: Configured for `connect-pg-simple` (PostgreSQL session store).

### External Dependencies

- **WhatsApp Integration**: Production-ready WhatsApp Business API for interactive messages and automated conversation flows.
    - Supports button and list messages, image headers. **WhatsApp Limit**: Maximum 3 buttons per message.
    - Two-way conversation tracking with state machine for automated responses.
    - Language selection (Hindi/English).
    - Secure webhook handling with HMAC-SHA256 signature verification.
    - Automated record creation (Lead, Service Request, Callback Request, Other Issue) upon conversation completion.
    - **Campaign Entry Template**: Trust-first welcome message (SP_CAMPAIGN_TRUST_V1) with image header, 3 buttons (हिंदी, English, Visit Website). Body: "Hello, We are a PM Surya Ghar registered vendor and Class-B Electrical Contractor. We use ALMM/BIS-compliant modules. (Subsidy as per portal; subject to eligibility & updates.) To Continue, Choose:" Footer: "Licensed PM Surya Ghar Solar Vendor"
    - **Main Menu Structure** (3 buttons): "Book Site Survey" (book_site_survey), "Request Callback" (request_callback), "Why Sunshine Power?" (why_sunshine_power). Trust-first design emphasizing credentials before sales.
    - **Trust Flow** (TRUST_FLOW): Interactive flow showing credentials/licenses, warranties/materials, or recent installs based on user selection. Includes "Book Site Survey" CTA after viewing trust content.
    - **Eligibility Flow** (ELIGIBILITY_FLOW): Bill-based eligibility checker that suggests kW capacity based on average monthly electricity bill input.
    - **Conversation Flow Engine**: Manages multi-step conversations, resolves templates, preserves context, extracts data, and automatically creates database records. Flow mapping: book_site_survey→survey flow, request_callback→callback flow, why_sunshine_power→trust flow, check_eligibility→eligibility flow.
    - **WhatsApp Service**: Handles sending text, button, list messages and webhook processing.
    - **WhatsApp Flow Encryption**: Full end-to-end encryption implementation for WhatsApp Flows using RSA-OAEP (2048-bit) for AES key exchange and AES-128-GCM for payload encryption/decryption. Supports encrypted PING, INIT, and DATA_EXCHANGE actions with automatic response encryption. **Critical parameters**: RSA-OAEP with SHA-256 hash **WITHOUT oaepLabel** (WhatsApp does NOT use a label for session key encryption), AES-128-GCM (16-byte key, NOT AES-256), **IV FLIPPING for responses** (each byte XOR'd with 0xFF), plain text base64 response format (Content-Type: text/plain), and automatic PEM key reformatting to handle improperly stored multi-line keys (converts space-separated single-line format to proper PEM with newlines). Public key upload script available at `scripts/upload-public-key.ts` (run with `tsx scripts/upload-public-key.ts`). **IMPORTANT**: WhatsApp clients cache public keys for ~30 minutes. After uploading a new public key, the code returns HTTP 421 error to force clients to refresh their cached key. Wait 30 minutes after first 421 error before testing again.
    - **WhatsApp Flow Field Mappings**: All four flow handlers (survey, price, service, callback) correctly map `formData.full_name` (from Flow JSON) to `customerName` (database field). Survey handler uses `formData.interested_in || "site_survey"` with fallback. Service handler uses `formData.description || \`${formData.issue_type} issue\`` with fallback. These defensive mappings preserve current functionality while honoring future payload fields if added to Flow JSON definitions.
    - **Hindi WhatsApp Flows**: Complete Hindi language support with separate Flow JSON definitions (`SURVEY_FLOW_HI`, `PRICE_FLOW_HI`, `SERVICE_FLOW_HI`, `CALLBACK_FLOW_HI`, `TRUST_FLOW_HI`, `ELIGIBILITY_FLOW_HI`) featuring Devanagari labels, dropdown options, and success messages. Conversation engine automatically routes to language-specific flows based on user's selected language (Hindi/English). Field names remain in English for consistency, only labels are translated.
    - **API Endpoints**: 
        - Core: `/api/whatsapp/send`, `/api/whatsapp/webhook`, `/api/whatsapp/status`, `/api/whatsapp/upload-media`, `/api/whatsapp/data-exchange`
        - English Flows: `/api/flows/survey`, `/api/flows/price`, `/api/flows/service`, `/api/flows/callback`, `/api/flows/trust`, `/api/flows/eligibility` (GET for JSON, POST for handlers)
        - Hindi Flows: `/api/flows/survey-hi`, `/api/flows/price-hi`, `/api/flows/service-hi`, `/api/flows/callback-hi`, `/api/flows/trust-hi`, `/api/flows/eligibility-hi` (GET for JSON, POST for handlers)
        - Templates: `/api/message-templates/:id/submit`, `/api/message-templates/:id/sync-status`, `/api/message-templates/bulk-submit`
        - Logs & Status: `/api/whatsapp-logs`, `/api/contact-status`, `/api/contact-status/:customerPhone/forms`, `/api/contact-status/export/csv`
    - **Template Management**: Message Templates page includes "Submit All to Meta" button for bulk template submission. Individual templates show Submit button when in "draft" status. Template seed script available at `scripts/seed-templates.ts` (run with `tsx scripts/seed-templates.ts`). Includes campaign_entry, main_menu (EN/HI), and help_submenu (EN/HI) templates.
    - **Status Tracking System**: Comprehensive event tracking captures customer journey stages (campaign_sent → delivered → read → replied → language_selected → menu choice → form_submitted) with Status Page UI for monitoring, searching, filtering, and CSV export.
    - **Required Environment Variables**: 
        - Core: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_FLOW_PRIVATE_KEY`
        - English Flows: `WHATSAPP_FLOW_ID_SURVEY`, `WHATSAPP_FLOW_ID_PRICE`, `WHATSAPP_FLOW_ID_SERVICE`, `WHATSAPP_FLOW_ID_CALLBACK`, `WHATSAPP_FLOW_ID_TRUST`, `WHATSAPP_FLOW_ID_ELIGIBILITY`
        - Hindi Flows (optional, fallback to English if not set): `WHATSAPP_FLOW_ID_SURVEY_HI`, `WHATSAPP_FLOW_ID_PRICE_HI`, `WHATSAPP_FLOW_ID_SERVICE_HI`, `WHATSAPP_FLOW_ID_CALLBACK_HI`, `WHATSAPP_FLOW_ID_TRUST_HI`, `WHATSAPP_FLOW_ID_ELIGIBILITY_HI`
- **File Processing**: XLSX library (SheetJS) for Excel parsing and React Dropzone for customer data uploads.
- **Form Management**: React Hook Form with Zod resolvers for validation, and Drizzle-Zod for schema validation.
- **Development Tools**: Replit-specific plugins, TypeScript strict mode, path aliases.
- **Data Visualization**: Chart.js integration via recharts.