# Backend Structure Document

This document outlines the complete backend setup for the AI Invitation SaaS platform. It covers the architecture, database, API design, hosting, infrastructure, security, monitoring, and more. Anyone should be able to understand how the backend works without needing deep technical knowledge.

## 1. Backend Architecture

**Overview**
- We use Next.js 15 (App Router) to handle both frontend pages and backend API routes in one unified codebase.  
- Server logic lives alongside UI components, making it easy to maintain and update.

**Design Patterns and Frameworks**
- **App Router (Next.js)**: Organizes code by URL path—pages, API routes, and server logic all map to folders under `/app`.
- **Component‐Driven Development**: Breaks UI into reusable pieces. Backend endpoints return data that these components consume.
- **TypeScript**: Ensures consistent data shapes from database through API to UI, reducing runtime errors.
- **Drizzle ORM**: Provides a type‐safe way to write SQL queries in TypeScript.

**Scalability, Maintainability & Performance**
- **Scalability**: Next.js serverless functions automatically scale based on traffic. PostgreSQL can be scaled vertically or via read replicas.
- **Maintainability**: Single codebase for server and client, clear folder structure (`/app`, `/components`, `/db/schema`), and type safety make onboarding and changes straightforward.
- **Performance**: Server‐side rendering (SSR) and edge caching deliver fast page loads. Turbopack speeds up development builds.

## 2. Database Management

**Database Technology**
- Type: Relational (SQL)
- System: PostgreSQL
- ORM: Drizzle ORM for type‐safe data access in TypeScript

**Data Structure & Access**
- Data is stored in tables (`users`, `invitations`, `themes`, `categories`).
- Drizzle ORM maps tables to TypeScript objects for queries, inserts, updates, and deletes.

**Data Management Practices**
- **Migrations**: Use a migration tool (e.g., Drizzle’s migrations) to evolve schema over time without losing data.
- **Backups**: Automated daily snapshots of the PostgreSQL database.
- **Indexing**: Key columns (e.g., `user_id`, `invite_id`) are indexed for fast lookup.
- **Referential Integrity**: Foreign keys enforce relationships (e.g., each invitation belongs to a valid user).

## 3. Database Schema

**Human‐Readable Overview**
- **users**: Stores user accounts and login credentials.
- **invitations**: Stores each invitation’s text, event details, theme choice, and owner.
- **themes**: Defines available invitation themes with styling metadata.
- **categories**: Lists event types (wedding, meeting, birthday).

**SQL Schema (PostgreSQL)**
```sql
-- users table (managed by Better Auth)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- themes table
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  preview_image_url TEXT,
  css_variables JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- invitations table
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  theme_id INTEGER NOT NULL REFERENCES themes(id),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  event_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_category_id ON invitations(category_id);
```  

## 4. API Design and Endpoints

We use RESTful endpoints via Next.js API routes under `/app/api`.

**Authentication**
- `POST /api/auth/signup` — Create a new user account.
- `POST /api/auth/login` — Log in and receive a session token.
- `POST /api/auth/logout` — Invalidate the user session.

**Invitations**
- `GET /api/invitations` — List authenticated user’s invitations.
- `POST /api/invitations` — Create a new invitation.
- `GET /api/invitations/:id` — Get details of a single invitation (owner only).
- `PUT /api/invitations/:id` — Update an invitation (owner only).
- `DELETE /api/invitations/:id` — Delete an invitation (owner only).
- `GET /api/invite/:publicId` — Public read‐only view of an invitation.

**Themes & Categories**
- `GET /api/themes` — List all available themes.
- `GET /api/categories` — List all event categories.

**AI Content Generation**
- `POST /api/ai/generate-text` — Send prompt and context, receive AI‐generated invitation text (uses Vercel AI SDK).

**How Frontend Uses These Endpoints**
- The dashboard calls `/api/invitations` to fetch and manage invites.
- The editor posts form data to `/api/invitations` and `/api/ai/generate-text` for AI assistance.
- Public invites use server‐side rendering with data fetched from `/api/invite/:publicId`.

## 5. Hosting Solutions

**Primary Hosting**
- **Vercel** for Next.js application (pages, API routes).
  - Global CDN for static assets.
  - Serverless functions auto‐scale.

**Database Hosting**
- **Amazon RDS (PostgreSQL)** or **Supabase**
  - Automated backups and failover.
  - Scales with provisioned capacity.

**Benefits**
- **Reliability**: Multi‐region CDN and managed DB failover.
- **Scalability**: Serverless functions and managed DB growth.
- **Cost-Effectiveness**: Pay for usage, scale down during low traffic.

## 6. Infrastructure Components

**Load Balancer & Auto-Scaling**
- Vercel’s built-in load balancing distributes traffic worldwide.

**Caching Mechanisms**
- **Edge Caching**: Static pages and public invites cached at the CDN edge.
- **ISR (Incremental Static Regeneration)**: Automatically re-renders stale pages in the background.

**Content Delivery Network (CDN)**
- Vercel’s global CDN delivers static assets (images, CSS, JS) close to users.

**Containerization** (Local Development)
- **Docker**: Defines a consistent environment for local development and testing.

## 7. Security Measures

**Authentication & Authorization**
- **Better Auth** (session tokens or JWT) protects all private routes.
- API routes check user’s session and resource ownership before performing actions.

**Data Encryption**
- **In‐Transit**: HTTPS/TLS for all client‐server communication.
- **At Rest**: Managed PostgreSQL encryption on AWS RDS or Supabase.

**Input Validation & Sanitization**
- Server-side checks on all user inputs to prevent SQL injection and XSS.
- Escape or strip HTML in user-generated text before public rendering.

**Other Best Practices**
- HTTP security headers (Content Security Policy, X-Frame-Options).
- Rate limiting on API endpoints to prevent abuse.

## 8. Monitoring and Maintenance

**Performance & Error Monitoring**
- **Vercel Analytics** for request rates, latency, error rates.
- **Sentry** or similar for capturing runtime errors in serverless functions and client.

**Logging**
- Structured logs for API requests and database queries.
- Centralized log storage (e.g., Logflare, Datadog).

**Maintenance Strategies**
- **CI/CD Pipeline**: Automatic deployment on `main` branch via Vercel.
- **Database Migrations**: Run Drizzle migrations before deployments.
- **Regular Audits**: Security and dependency updates every month.
- **Backups & Failover Tests**: Verify DB backups and failover procedures quarterly.

## 9. Conclusion and Overall Backend Summary

This backend is built on a modern, unified Next.js platform with type‐safe data access through Drizzle ORM and PostgreSQL. It leverages serverless functions for scale, a global CDN for speed, and a managed database for reliability. Security is enforced at every layer, from authenticated routes to encrypted data. Monitoring, logging, and CI/CD ensure the system stays healthy and up‐to‐date. Altogether, this setup meets the goals of delivering a high‐performance, maintainable, and secure AI-powered invitation SaaS platform.