# Ranch Manager Pro

## Overview

Ranch Manager Pro is a comprehensive livestock and ranch management system built with a modern full-stack architecture. The application provides tools for managing livestock, financial transactions, inventory, partners, and generating reports for ranch operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom ranch-themed color palette
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **API Pattern**: RESTful API design
- **Development**: Hot module replacement with Vite integration
- **Deployment**: Replit with autoscale deployment target

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migration Strategy**: Database push using `drizzle-kit push`

## Key Components

### Data Models
1. **Users/Partners**: User authentication and partner management
2. **Livestock**: Animal tracking with health status, breeding info, and location
3. **Transactions**: Financial record keeping for income and expenses
4. **Inventory**: Supply and equipment management with stock level monitoring
5. **Health Records**: Medical history and treatment tracking for livestock

### Frontend Pages
- **Dashboard**: Overview with key metrics and quick actions
- **Livestock Management**: CRUD operations for animal records
- **Financial Management**: Transaction tracking and financial summaries
- **Inventory Management**: Stock monitoring and supply management
- **Partners**: User and partner status monitoring
- **Reports**: Data export and report generation

### API Endpoints
- `/api/livestock` - Livestock CRUD operations and statistics
- `/api/transactions` - Financial transaction management
- `/api/inventory` - Inventory management and low-stock alerts
- `/api/partners` - Partner/user management

## Data Flow

1. **Client-Side**: React components use TanStack Query for data fetching
2. **API Layer**: Express.js routes handle HTTP requests and validation
3. **Business Logic**: Service layer processes business rules
4. **Data Layer**: Drizzle ORM manages database operations
5. **Database**: PostgreSQL stores all persistent data

The application follows a typical three-tier architecture with clear separation between presentation, business logic, and data layers.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon database client for serverless PostgreSQL
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **zod**: Runtime type validation

### UI/UX Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Server**: Vite development server with Express API
- **Port**: 5000 (configurable)
- **Hot Reload**: Enabled for both client and server code

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Served from built client directory

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Deployment**: Autoscale with automatic builds
- **Port Mapping**: Internal port 5000 mapped to external port 80
- **Environment**: PostgreSQL database automatically provisioned

## Changelog
```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```