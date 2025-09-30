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
- `leads`: Solar installation leads with survey scheduling for PM Surya Ghar installations
- `serviceRequests`: Service/maintenance requests with issueType (Installation/Service-Repair/Other), urgency (Low/Medium/High), assignedTo, customerVillage, and status tracking
- `campaigns`: WhatsApp campaign management with targeting thresholds for customer segmentation
- `messageTemplates`: WhatsApp interactive message templates with support for buttons, lists, and bilingual content (Hindi/English)
- `conversationStates`: Tracks active WhatsApp conversations and their position in automated flows (campaign lead generation or service requests)
- `whatsappLogs`: Complete audit trail of all WhatsApp messages sent/received with status tracking

**Session Management**: Configured for connect-pg-simple (PostgreSQL session store)

### External Dependencies

**WhatsApp Integration**: Interactive message system with automated conversation flows
- WhatsApp Business API integration with button and list message support
- Two-way conversation tracking with state machine for automated responses
- Language selection (Hindi/English) at conversation start
- Auto-status updates when leads/service requests are created or updated
- Conversation flows: Campaign → Lead generation, Service menu → Request creation

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