# Project Requirements Document (PRD)

## 1. Project Overview

We’re building an AI-powered digital invitation SaaS platform that lets users create, customize, and share event invitations (weddings, birthdays, meetings, etc.) using modern web technologies and AI-generated content. At its core, the app provides secure user accounts, a guided invitation creation workflow, customizable design themes, and an AI assistant to help craft the invitation text.

This product aims to make invitation design fast and fun by combining a rich library of visual themes with a text-generating AI. Users sign up, pick an event category and style, then either write their own details or ask the AI to suggest wording. Once done, they preview and publish a shareable link that anyone can open without logging in.

**Key objectives / success criteria:**
- Enable new users to sign up and create a basic invitation within 5 minutes.
- Provide at least 5 distinct invitation themes at launch.
- Deliver AI-generated text suggestions in under 3 seconds.
- Ensure public invitation pages load in under 1 second (Server-Side Rendered).
- Maintain 99.9% uptime for the core invitation creation and viewing flows.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- Email/password user authentication and account management.
- Dashboard for listing, creating, editing, and deleting invitations.
- Workflow for selecting event category (e.g., wedding, birthday, meeting).
- Theme selection from a library of at least 5 predefined designs.
- Form-based editor with fields for event title, date/time, location, and custom message.
- AI Assistant panel that generates or refines invitation text via Vercel AI SDK.
- Live preview of invitations as users make changes.
- Public shareable invitation pages (no login required).
- PostgreSQL database with Drizzle ORM models for users, invitations, themes, and categories.
- Basic Docker setup for local development consistency.

### Out-of-Scope (Future Phases)
- Payment integration or subscription management.
- Multi-language or localization support.
- Role-based admin panel for managing themes and categories (planned later).
- Analytics dashboard (e.g., view counts, click tracking).
- Mobile-native apps (iOS / Android).
- Social media integrations (e.g., Facebook events sync).

## 3. User Flow

When a new user lands on the site, they see a home page with a “Sign Up” button. Clicking that opens a registration form (email and password). Once they confirm their email, they land in their dashboard—a central hub with a sidebar. The sidebar has links to “My Invitations,” “Create New,” and “Account Settings.” In “My Invitations,” they see a table listing saved invites (title, date, status) and can click an existing invite to edit or delete it.

To create a new invitation, the user clicks “Create New,” which steps them through selecting an event category, choosing a design theme from a gallery of cards, and then opening the invitation editor. Here they fill in event details via form fields and can open the AI Assistant panel to generate or tweak the invite text. As they type or use AI suggestions, a live preview updates on the right. When ready, they click “Publish,” which saves the invitation and provides a shareable URL. Guests visit that URL to see the fully styled, server-rendered invitation page without needing to log in.

## 4. Core Features

- **Authentication & Authorization**: Secure sign-up, login, password reset, and protected dashboard routes via Better Auth.
- **Dashboard & Navigation**: Sidebar and main content area listing user invitations and offering “Create,” “Edit,” and “Delete” actions.
- **Invitation Creation Wizard**: Multi-step form for picking category, theme, and entering event details.
- **AI Content Assistant**: Embedded panel using `@ai-sdk/react` and `assistant-ui` to generate or refine invitation text.
- **Theme Selector**: Visual gallery of invitation templates powered by a theme database.
- **Live Preview**: Real-time rendering of invitation as user edits fields or applies AI suggestions.
- **Public Invite Page**: Dynamic Next.js route (`/invites/[inviteId]`) that server-side renders the invitation with the selected theme.
- **Data Models & API**: Drizzle ORM schemas and Next.js API routes for CRUD operations on users, invitations, themes, categories.
- **Containerization**: Docker configuration to spin up Postgres and the Next.js app locally.

## 5. Tech Stack & Tools

- **Frontend Framework**: Next.js 15 (App Router, Turbopack) with React and TypeScript.
- **Styling**: Tailwind CSS v4 + CSS variables for theme colors.
- **UI Components**: `shadcn/ui` for buttons, forms, cards, tables, and modals.
- **Auth**: Better Auth for email/password sign-up and session management.
- **Database & ORM**: PostgreSQL with Drizzle ORM (type-safe schemas).
- **AI Integration**: Vercel AI SDK (`@ai-sdk/react`) and `assistant-ui` for streaming prompts and suggestions.
- **Containerization**: Docker & Docker Compose for local dev environment (Next.js + Postgres).
- **Development Tools**: VSCode, optionally Cursor or Windsurf extensions for code completion.

## 6. Non-Functional Requirements

- **Performance**: Public invitation pages must SSR in <1s on a standard Vercel instance. AI suggestions should return in <3s.
- **Security**: Protect API routes; sanitize all user inputs to prevent XSS/SQL injection; use HTTPS for all traffic; store passwords with salted hashing.
- **Scalability**: Design database schemas and API layers to handle at least 10,000 invitations and 5,000 active users initially.
- **Reliability**: Ensure 99.9% uptime; implement retry logic for AI API calls.
- **Usability / Accessibility**: Follow WCAG 2.1 AA guidelines; all forms and controls must be keyboard-navigable and have proper ARIA labels.

## 7. Constraints & Assumptions

- The Vercel AI SDK and underlying AI model (e.g., GPT-4) will be available with reasonable latency and quota.
- Users only require email/password auth (no social logins in v1).
- Invitations are simple HTML/CSS pages—no file uploads (images or attachments) in this phase.
- Hosting on Vercel (Next.js optimized), database hosted on a managed PostgreSQL service.
- Assumes typical modern browser compatibility (Chrome, Firefox, Safari, Edge).

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: AI service quotas may throttle frequent content generation. Mitigation: implement debounce and caching of AI suggestions, and show clear rate-limit errors.
- **Theme Consistency**: Complex CSS variable overrides can conflict. Mitigation: define a strict theming contract and validate theme assets at build time.
- **Database Migrations**: Schema changes in Drizzle require careful rollout. Mitigation: use versioned migrations and test on staging before production.
- **Security of Public Pages**: Risk of XSS if invitation text isn’t sanitized. Mitigation: run all user-generated text through a sanitizer and use React’s `dangerouslySetInnerHTML` sparingly.
- **AI Quality Variability**: Generated text may not always match event tone. Mitigation: provide clear prompt templates and allow manual editing.

---

This PRD outlines all the core requirements, flows, and constraints for building the AI-powered digital invitation SaaS. It should serve as the single source of truth for subsequent technical documents on tech stack, frontend & backend structure, UI guidelines, and deployment configurations.