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
    - **Campaign Entry Template**: Professional welcome message with image header, 3 buttons (हिंदी, English, Visit Website). Body: "Hello, We are a PM Surya Ghar registered Solar Vendor. From application to net-metering and installation-we handle it all. To Continue, Choose:" Footer: "Licensed PM Surya Ghar Solar Vendor"
    - **Main Menu Structure** (3 buttons): "Book Site Survey", "Price Estimate", "Service & Support". Service & Support routes to help submenu.
    - **Help Submenu** (3 buttons): "Maintenance Request" (→service flow), "Request Callback" (→callback flow), "Register Other Issue" (→old conversation system).
    - **Conversation Flow Engine**: Manages multi-step conversations, resolves templates, preserves context, extracts data, and automatically creates database records. Flow mapping: site_survey→survey flow, price_estimate→price flow, help→help_submenu→(maintenance→service flow OR callback→callback flow).
    - **WhatsApp Service**: Handles sending text, button, list messages and webhook processing.
    - **WhatsApp Flow Encryption**: Full end-to-end encryption implementation for WhatsApp Flows using RSA-OAEP (2048-bit) for AES key exchange and AES-128-GCM for payload encryption/decryption. Supports encrypted PING, INIT, and DATA_EXCHANGE actions with automatic response encryption. **Critical parameters**: RSA-OAEP with SHA-256 hash **WITHOUT oaepLabel** (WhatsApp does NOT use a label for session key encryption), AES-128-GCM (16-byte key, NOT AES-256), **IV FLIPPING for responses** (each byte XOR'd with 0xFF), plain text base64 response format (Content-Type: text/plain), and automatic PEM key reformatting to handle improperly stored multi-line keys (converts space-separated single-line format to proper PEM with newlines). Public key upload script available at `scripts/upload-public-key.ts` (run with `tsx scripts/upload-public-key.ts`). **IMPORTANT**: WhatsApp clients cache public keys for ~30 minutes. After uploading a new public key, the code returns HTTP 421 error to force clients to refresh their cached key. Wait 30 minutes after first 421 error before testing again.
    - **WhatsApp Flow Field Mappings**: All four flow handlers (survey, price, service, callback) correctly map `formData.full_name` (from Flow JSON) to `customerName` (database field). Survey handler uses `formData.interested_in || "site_survey"` with fallback. Service handler uses `formData.description || \`${formData.issue_type} issue\`` with fallback. These defensive mappings preserve current functionality while honoring future payload fields if added to Flow JSON definitions.
    - **API Endpoints**: `/api/whatsapp/send`, `/api/whatsapp/webhook`, `/api/whatsapp/status`, `/api/whatsapp/upload-media`, `/api/flows/survey`, `/api/flows/price`, `/api/flows/service`, `/api/flows/callback`, `/api/whatsapp/data-exchange`, `/api/message-templates/:id/submit`, `/api/message-templates/:id/sync-status`, `/api/message-templates/bulk-submit`, `/api/whatsapp-logs`, `/api/contact-status`, `/api/contact-status/:customerPhone/forms`, `/api/contact-status/export/csv`.
    - **Template Management**: Message Templates page includes "Submit All to Meta" button for bulk template submission. Individual templates show Submit button when in "draft" status. Template seed script available at `scripts/seed-templates.ts` (run with `tsx scripts/seed-templates.ts`).
    - **Status Tracking System**: Comprehensive event tracking captures customer journey stages (campaign_sent → delivered → read → replied → language_selected → menu choice → form_submitted) with Status Page UI for monitoring, searching, filtering, and CSV export.
    - **Required Environment Variables**: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_FLOW_PRIVATE_KEY`.
- **File Processing**: XLSX library (SheetJS) for Excel parsing and React Dropzone for customer data uploads.
- **Form Management**: React Hook Form with Zod resolvers for validation, and Drizzle-Zod for schema validation.
- **Development Tools**: Replit-specific plugins, TypeScript strict mode, path aliases.
- **Data Visualization**: Chart.js integration via recharts.