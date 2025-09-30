# Design Guidelines: Sunshine Power WhatsApp Automation Platform

## Design Approach
**Selected Approach:** Design System-Based (Material Design influence)  
**Rationale:** Data-heavy admin dashboard requiring efficient information hierarchy, clear data visualization, and professional business tool aesthetics. The platform handles complex workflows (customer filtering, campaign management, lead tracking) requiring proven UI patterns for optimal usability.

## Core Design Principles
- **Efficiency First:** Minimize clicks to complete tasks, prioritize data visibility
- **Solar Energy Context:** Subtle energy/sustainability theming without compromising professionalism
- **Information Hierarchy:** Clear visual distinction between campaign management, lead tracking, and service requests
- **Trust & Reliability:** Professional design befitting a PM Surya Ghar registered vendor

---

## Color Palette

### Light Mode
- **Primary:** 45 92% 45% (Vibrant solar orange-yellow, energy/sunshine association)
- **Primary Hover:** 45 92% 38%
- **Secondary:** 220 15% 25% (Professional slate gray for data tables)
- **Background:** 0 0% 98% (Off-white for reduced eye strain)
- **Surface:** 0 0% 100% (Pure white cards/panels)
- **Text Primary:** 220 15% 15%
- **Text Secondary:** 220 10% 45%
- **Success:** 142 76% 36% (Solar installation complete)
- **Warning:** 38 92% 50% (Pending actions)
- **Error:** 0 84% 60% (Failed messages)
- **Border:** 220 13% 91%

### Dark Mode
- **Primary:** 45 92% 55%
- **Primary Hover:** 45 92% 62%
- **Secondary:** 220 15% 75%
- **Background:** 220 20% 10%
- **Surface:** 220 18% 14%
- **Text Primary:** 0 0% 95%
- **Text Secondary:** 220 10% 70%
- **Border:** 220 15% 25%

---

## Typography
**Font Stack:** Inter (via Google Fonts CDN) for clean, modern readability  
**Hierarchy:**
- **Page Headers:** text-2xl/text-3xl font-semibold
- **Section Titles:** text-xl font-medium
- **Data Tables:** text-sm font-normal (optimal density)
- **Body Text:** text-base font-normal
- **Metadata/Labels:** text-xs/text-sm font-medium text-secondary
- **CTAs:** text-sm font-medium

---

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16  
**Pattern:** Use p-6 for card padding, gap-4 for grid spacing, mb-8 for section separation

**Structure:**
- **Sidebar Navigation:** Fixed 256px width (w-64) with hierarchical menu
- **Main Content:** Full-width with max-w-7xl container, px-6 py-8
- **Dashboard Cards:** Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Data Tables:** Full-width with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Sidebar:** Dark surface with primary-highlighted active state, icon + label menu items
- **Top Bar:** Company branding (left), WhatsApp connection status indicator, user profile (right)
- **Breadcrumbs:** Secondary text with primary current page

### Dashboard Widgets
- **Stat Cards:** Surface background, large numeric value (text-3xl font-bold), label below, subtle icon top-right, optional trend indicator (+/- percentage in success/error color)
- **Quick Actions:** Grid of prominent buttons with icons for "Upload Customers," "New Campaign," "Export Leads"

### Data Display
- **Customer Table:** Striped rows, sortable headers, inline actions (Edit/View/Delete), checkbox selection for bulk operations, consumption threshold displayed with color coding (green ≥300, orange ≥200, gray <200)
- **Lead Cards:** Surface with border-l-4 primary accent, customer info header, captured details list, timestamp footer, status badge
- **Service Requests:** Similar to lead cards but with request type icon and priority indicator

### Forms
- **File Upload:** Drag-and-drop zone with border-2 border-dashed, primary on hover, file preview with validation feedback
- **Campaign Setup:** Step indicator (1-2-3 circles), form sections with clear labels, threshold selector (radio buttons with large touch targets)
- **Filters:** Inline filter bar with dropdown selectors and applied filter chips (removable)

### WhatsApp Components
- **Message Preview:** Chat bubble style preview (right-aligned, primary background, white text) showing campaign message before send
- **Interactive Menu Builder:** Visual editor showing button/list options as they'll appear in WhatsApp
- **Conversation Viewer:** Message thread display (left: customer, right: automated responses)

### Overlays
- **Modal Dialogs:** Centered, max-w-2xl, shadow-xl, with clear header (text-xl font-semibold), content area, footer actions (Cancel + Primary CTA)
- **Confirmation Dialogs:** Warning state for destructive actions (send campaign to X customers)
- **Success Toasts:** Top-right, slide-in animation, success/error color, auto-dismiss

---

## Animations
**Minimal Approach:**
- Table row hover: bg-primary/5 transition
- Button hover: Standard hover states only
- Page transitions: None (instant navigation for data-heavy app)
- Loading states: Simple spinner or skeleton screens for tables

---

## Images
**Hero Section:** No traditional hero. Dashboard-first interface.

**Strategic Image Use:**
- **Empty States:** Illustration of solar panels with "No customers uploaded yet" message (friendly, on-brand)
- **Login/Auth Pages:** Background image of rooftop solar installation (subtle overlay, doesn't interfere with form readability)
- **WhatsApp Connection:** Icon/illustration showing successful WhatsApp Business API connection status

**Icon Library:** Heroicons (via CDN) - outline style for navigation, solid style for status indicators

---

## Accessibility & Responsive Design
- **Mobile Strategy:** Sidebar collapses to hamburger menu, tables scroll horizontally with sticky first column, stat cards stack vertically
- **Touch Targets:** Minimum 44px height for all interactive elements
- **Contrast:** All text meets WCAG AA standards against backgrounds
- **Focus States:** Visible ring-2 ring-primary ring-offset-2 on keyboard navigation

---

## Business-Specific Features
- **Consumption Threshold Visualizer:** Visual scale showing threshold selection with customer count at each level
- **Campaign Status Dashboard:** Timeline view of sent campaigns with delivery/read statistics
- **Lead Funnel Visualization:** Simple bar/funnel chart showing conversion from message sent → interested → service completed
- **WhatsApp Connection Monitor:** Prominent indicator (green pulse animation when active) showing Business API connection health

This design creates a professional, efficient admin platform that streamlines Sunshine Power's WhatsApp-based customer acquisition and service workflows while maintaining brand alignment with solar energy values.