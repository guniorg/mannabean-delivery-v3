# Korean Restaurant Ordering System

## Overview

This is a full-stack Korean restaurant ordering system built with React, Express, and PostgreSQL. The application provides a customer-facing ordering interface and an admin panel for managing menu items and orders. It supports both delivery and pickup orders with location-based delivery fees and real-time order management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Korean restaurant theme
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints with JSON responses
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Data Storage Solutions
- **Database**: PostgreSQL 16 (configured via Replit modules)
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver for PostgreSQL connections

## Key Components

### Database Schema
The application uses three main tables:
- **menu_items**: Stores menu items with pricing, categories, and availability
- **orders**: Manages order details including customer info, delivery options, and status
- **order_items**: Junction table linking orders to menu items with quantities

### Authentication & Authorization
- No authentication system implemented (open access)
- Admin panel accessible at `/admin` route without restrictions

### API Endpoints
- `GET /api/menu` - Retrieve all menu items
- `GET /api/menu/:id` - Get specific menu item
- `PATCH /api/menu/:id` - Update menu item (admin only)
- `GET /api/orders` - Retrieve all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Frontend Pages
- **Home** (`/`): Customer ordering interface with menu display and cart
- **Admin** (`/admin`): Management interface for menu items and orders
- **404**: Not found page with helpful error message

## Data Flow

1. **Menu Loading**: Frontend queries `/api/menu` to display available items
2. **Cart Management**: Local state manages shopping cart items before order placement
3. **Order Creation**: Cart contents and customer details sent to `/api/orders`
4. **Order Management**: Admin can view and update order statuses through admin panel
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

## External Dependencies

### UI & Styling
- **shadcn/ui**: Complete component library with accessibility features
- **Radix UI**: Headless UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production

### Database & Backend
- **Drizzle ORM**: Type-safe database toolkit
- **Neon Database**: Serverless PostgreSQL platform
- **Express.js**: Web application framework

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite development server with HMR
- **Database**: Automatic provisioning via Replit modules
- **Port Configuration**: Server runs on port 5000, exposed as port 80

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Express serves built frontend files
- **Database**: Uses DATABASE_URL environment variable for connection

### Build Commands
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build both frontend and backend for production
- `npm start`: Run production server
- `npm run db:push`: Push database schema changes

## Changelog

Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Enhanced UI design with Korean restaurant theme, improved order form with customer information, updated delivery fees (Kalidas/Kyeongnam free, Other 30,000 VND), changed tax rate to 8%, improved payment methods with account details display
- June 26, 2025. Complete design transformation to Mannabean green theme with dropdown menu categories, red pricing in "K" format (140K instead of 140,000원), red "담기" buttons with hover effects, and changed order types to "배달" and "테이블예약"
- June 26, 2025. Implemented Slack integration for automated order notifications - new orders and status updates are automatically sent to #mannabean channel with detailed order information, customer details, and real-time status tracking
- June 26, 2025. Added daily order management system with CSV export functionality - admins can filter orders by date, view daily statistics (total orders, revenue, delivery vs table reservations), and export order data to Excel/CSV files for record keeping and business analysis
- June 26, 2025. Implemented admin page password protection (password: mannabean2025) with secure login screen, logout functionality, and menu item editing capabilities including image upload and name modification
- June 26, 2025. Updated home page background to clean modern gradient design from slate-50 to emerald-100, removing all floating objects for a professional minimalist appearance
- June 26, 2025. Improved mobile header responsiveness with single-line layout, added dynamic cart count badge with color indicators (red background when items added, white badge with red text and pulse animation)
- June 26, 2025. Changed admin password to "0419" and added password change functionality - admins can now update their password through the admin panel interface with proper validation and confirmation
- June 26, 2025. Implemented role-based access control system with two user levels: Manager (password: "0419") has full access to menu management, order management, and statistics; Staff (password: "staff2025") has access only to order management for real-time order processing
- June 27, 2025. Resolved Vercel deployment issues: created dedicated API handler at /api/index.ts for serverless functions, improved error handling with detailed error states for menu loading failures, fixed admin button navigation using wouter Link component instead of window.location, added CORS headers for cross-origin requests, and enhanced order status buttons with larger sizes, distinct colors (confirmed: blue, preparing: orange, ready: green, delivered: purple), status icons, and improved mobile responsiveness

## User Preferences

Preferred communication style: Simple, everyday language.