# Frontend Guidelines for AI Invitation SaaS

This document outlines the frontend architecture, design principles, styling approach, component structure, state management, routing, performance optimizations, and testing strategies for the AI Invitation SaaS project. It is written in everyday language and covers all key technologies and patterns used.

## 1. Frontend Architecture

### Overview
- **Framework**: Next.js 15 (App Router) offers both server-side rendering (SSR) and client-side rendering (CSR) where needed. This helps with SEO for public invitation pages and interactivity in the dashboard.
- **Language**: TypeScript ensures type safety across the UI, server functions, and database layer.
- **Component Library**: `shadcn/ui` provides accessible, pre-built React components (buttons, forms, tables, layouts).
- **Styling**: Tailwind CSS v4 powers utility-first styling, enabling rapid UI development and easy customization.
- **AI Integration**: Vercel’s AI SDK (`@ai-sdk/react`, `assistant-ui`) plugs into React components to generate invitation text.
- **Authentication**: Better Auth secures user sign-up, sign-in, and protects dashboard routes.
- **Data Layer**: Drizzle ORM with PostgreSQL for type-safe database schemas and queries.
- **DevOps**: Docker standardizes the development environment, simplifying setup and deployment.

### Scalability, Maintainability, Performance
- **Separation of Concerns**: UI, data fetching, and business logic live in clear folders (`/app`, `/components`, `/db`).
- **Reusable Components**: Encourages building small, focused UI units that can be combined and updated independently.
- **Type Safety**: Catch errors at compile time, reducing runtime bugs.
- **Hybrid Rendering**: SSR for public invites, CSR for interactive dashboard, balancing performance and user experience.
- **Containerization**: Docker ensures consistent environments across machines and during deployment.

## 2. Design Principles

### Key Principles
1. **Usability**: Intuitive workflows—users sign in, pick a theme, enter details, and generate invitations with minimal friction.
2. **Accessibility**: All interactive elements (buttons, forms, modals) comply with WCAG standards (keyboard navigation, ARIA labels).
3. **Responsiveness**: Layout adapts smoothly from mobile devices to large desktops.
4. **Consistency**: Uniform styling, spacing, and typography across all screens.
5. **Performance**: Fast load times with code splitting, SSR, and optimized assets.

### Application in UI
- Forms use clear labels and inline validation messages.
- Color contrast meets accessibility ratios.
- Navigation and buttons have consistent placement, size, and behavior.
- Components adapt layout (stacked cards on mobile, side-by-side on desktop).

## 3. Styling and Theming

### Styling Approach
- **Utility-First**: Tailwind CSS v4 for quick, atomic styling.
- **CSS Variables**: Define theme tokens (colors, fonts, shadows) in `:root` and switch via data attributes for light/dark and invitation themes.
- **Methodology**: BEM-like naming in custom CSS modules when needed, but primarily Tailwind classes.

### Theming
- **Light & Dark Modes**: Controlled by a `<html data-theme="light|dark">` attribute. Colors swap via CSS variables.
- **Invitation Themes**: Stored in the database (name, preview image, CSS variables). Users pick a theme, and the preview updates in real time.
- **Glassmorphism Accents**: Invitation cards feature frosted backgrounds with subtle shadows and borders.

### Visual Style
- **Overall**: Modern flat design with glassmorphism touches in invitation previews.
- **Color Palette**:
  • Primary Blue: #4F46E5  
  • Accent Teal: #14B8A6  
  • Neutral Gray: #F3F4F6 (light), #1F2937 (dark)  
  • Text Dark: #111827  
  • Text Light: #F9FAFB
- **Fonts**:
  • Headings & Body: Inter, system-ui fallback  
  • AI Assistant Text: Roboto Mono for code-like clarity

## 4. Component Structure

### Organization
- `/components/ui`: Base UI controls from `shadcn/ui` (Buttons, Inputs, Cards).
- `/components/invitation`: Feature-specific components (InvitationEditor, ThemeSelector, AIAssistant, InvitationPreview).
- `/components/layout`: Layout pieces (AppSidebar, DashboardHeader).

### Reusability & Maintenance
- Each component has a single responsibility (e.g., `ThemeSelector` only handles theme browsing).
- Props-driven design allows easy customization (pass in theme tokens, event data).
- Shared UI primitives minimize duplicate styling and behavior.

## 5. State Management

### Approach
- **React State & Context API**: Local component state for form inputs; global context for user session and theme settings.
- **Server State**: Next.js `useRouter` with `fetch`/`axios` or `SWR` for data fetching and caching of invitations, themes, and user info.

### Data Flow
1. **Authentication Context**: Holds user info, login status, and JWT token.
2. **Theme Context**: Tracks light/dark mode and selected invitation theme.
3. **Invitation Editor State**: Local state in `InvitationEditor` for form fields; submit triggers API call to save data.
4. **Shared Caching**: SWR caches API responses, ensuring smooth transitions between pages.

## 6. Routing and Navigation

### Routing
- Next.js App Router handles file-based routing under `/app`:
  • `/app/dashboard/`: Protected dashboard pages.
  • `/app/dashboard/create`: New invitation flow.
  • `/app/dashboard/editor/[inviteId]`: Invitation editing with AI assistant.
  • `/invites/[inviteId]`: Public invitation view (SSR).
  • `/app/auth/...`: Sign-in, sign-up, password recovery.

### Navigation
- **AppSidebar**: Links to Dashboard Home, My Invitations, Create New, Themes, Account Settings.
- **Breadcrumbs**: Show user’s location (e.g., Dashboard > Create Invitation).
- **Mobile Menu**: Collapsible sidebar for screens under 768px.

## 7. Performance Optimization

- **Code Splitting**: Next.js automatically splits code per route.
- **Lazy Loading**: Dynamically import heavy components like `AIAssistant`.
- **Image Optimization**: Next/Image for automatic resizing and modern formats.
- **Asset Caching**: Leverage HTTP caching headers and service workers if needed.
- **CSS Purging**: Tailwind’s purge strips unused styles in production.

## 8. Testing and Quality Assurance

### Strategies
1. **Unit Tests**: Jest + React Testing Library for components (e.g., ensuring `ThemeSelector` lists all themes).
2. **Integration Tests**: Test interactions between components and API routes using MSW (Mock Service Worker).
3. **End-to-End Tests**: Playwright or Cypress to simulate user flows: sign up → create invitation → generate AI text → view public link.

### Tools
- **Jest**: Fast unit tests with snapshot capabilities.
- **React Testing Library**: Encourages testing from the user’s perspective.
- **MSW**: Mock API responses in tests.
- **Cypress/Playwright**: Real browser testing for critical flows.
- **ESLint & Prettier**: Enforce code style and catch errors early.

## 9. Conclusion and Summary

The frontend of the AI Invitation SaaS is built on a modern, type-safe, and scalable foundation using Next.js 15, TypeScript, Tailwind CSS, and `shadcn/ui`. It follows clear design principles—usability, accessibility, responsiveness—and employs a component-based architecture for maximum reusability. Theming is handled via CSS variables, enabling light/dark modes and custom invitation styles. State is managed locally with React and globally via Context and SWR. Routing is intuitive, balancing SSR for public invites with CSR for the dashboard. Performance is optimized through code splitting, lazy loading, and image optimization. Quality is ensured with unit, integration, and end-to-end tests.

By adhering to these guidelines, the team can maintain a consistent, high-quality frontend that aligns with user needs and scales as the SaaS grows.