# Sunshine Power WhatsApp Automation Platform

## Overview

This project is a WhatsApp-based platform for Sunshine Power, a PM Surya Ghar registered vendor. It automates lead generation and service management for rooftop solar installations in Rajasthan, India. The platform streamlines operations through customer data management, automated WhatsApp campaigns, solar installation lead tracking, and service request handling via an admin dashboard. Key capabilities include Excel-based customer imports, targeted campaigns based on electricity consumption, lead tracking with survey scheduling, and service request management, all with bilingual (Hindi/English) support and integration with government subsidy programs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite.
- **UI Library**: shadcn/ui components on Radix UI, featuring a professional blue color scheme (#3B82F6) with light gray backgrounds (#F9FAFB), professional table-centric design, and custom theme support with light/dark modes.
- **Routing**: Wouter, handling Dashboard, Customers, Campaigns, Leads, and Service Requests pages.
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
    - `messageTemplates`: WhatsApp interactive templates (16 total for campaign_lead and service_request flows in EN/HI), including Meta approval tracking fields (metaStatus, metaTemplateId).
    - `conversationStates`: Tracks active WhatsApp conversation states.
    - `whatsappLogs`: Audit trail of all WhatsApp messages with status tracking.
    - `callback_requests`: Captures callback requests for price/help.
    - `other_issues`: Captures general issue reports.
- **Session Management**: Configured for `connect-pg-simple` (PostgreSQL session store).

### External Dependencies

- **WhatsApp Integration**: Production-ready WhatsApp Business API for interactive messages and automated conversation flows.
    - Supports button and list messages, image headers.
    - Two-way conversation tracking with state machine for automated responses.
    - Language selection (Hindi/English).
    - Secure webhook handling with HMAC-SHA256 signature verification.
    - Automated record creation (Lead, Service Request, Callback Request, Other Issue) upon conversation completion.
    - **Conversation Flow Engine**: Manages multi-step conversations, resolves templates, preserves context, extracts data, and automatically creates database records.
    - **WhatsApp Service**: Handles sending text, button, list messages and webhook processing.
    - **API Endpoints**: `/api/whatsapp/send`, `/api/whatsapp/webhook`, `/api/whatsapp/status`, `/api/whatsapp/upload-media`, `/api/message-templates/:id/submit`, `/api/message-templates/:id/sync-status`, `/api/whatsapp-logs`.
    - **Required Environment Variables**: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`.
- **File Processing**: XLSX library (SheetJS) for Excel parsing and React Dropzone for customer data uploads.
- **Form Management**: React Hook Form with Zod resolvers for validation, and Drizzle-Zod for schema validation.
- **Development Tools**: Replit-specific plugins, TypeScript strict mode, path aliases.
- **Data Visualization**: Chart.js integration via recharts.