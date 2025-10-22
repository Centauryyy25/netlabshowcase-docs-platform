# Project Requirements Document: NetLabShowcase Platform

## 1. Project Overview

NetLabShowcase is a web platform for networking students and engineers to browse, upload, and share detailed network lab exercises. Built on a Next.js starter kit, it provides secure user accounts, a modern UI, and a well-structured database schema out of the box. The platform solves the problem of fragmented lab resources by giving users a centralized, searchable hub where each lab includes metadata, topology visuals, and AI-generated summaries.

The key goals are: enable anyone to register and manage their labs; let users discover labs by category or difficulty; display each lab’s topology with a viewer component; and integrate an AI assistant to offer on-the-fly explanations or summaries. Success will be measured by a working registration/login flow, lab upload and listing capabilities, a responsive UI, functioning AI chat on lab pages, and smooth deployment to both local development and production environments.

## 2. In-Scope vs. Out-of-Scope

### In-Scope

- User registration, login, session management (Better Auth)
- Protected dashboard showing published labs and user’s private submissions
- Lab upload page with metadata form and file upload (Next.js Server Actions)
- Lab listing on dashboard with preview cards (title, category, difficulty)
- Lab detail page (`/lab/[id]`) with:
  - Topology viewer for static images (future extension to interactive diagrams)
  - Metadata display (description, difficulty, categories)
  - Configuration tabs for code snippets
  - Embedded AI assistant chat (Vercel AI SDK)
- Database schema for users, labs, categories, file associations (Drizzle ORM + PostgreSQL)
- Theming: built-in dark mode, custom cyan/blue gradients (Tailwind CSS + Radix UI)
- Local development setup (Docker Compose) and production deployment configuration (Vercel)

### Out-of-Scope (Phase 1)

- Real-time collaborative editing of topologies
- Discussion forums or comment threads on labs
- Role-based permissions beyond basic user vs. admin
- Advanced analytics dashboards or usage reports
- Native mobile app or Electron wrapper
- Automated CI/CD pipelines (e.g., GitHub Actions) beyond basic Vercel integrations
- Multi-language or internationalization support

## 3. User Flow

A new visitor lands on the homepage and can explore publicly shared labs without signing up. To unlock full features, they click “Sign Up,” fill out an email/password form, and confirm via email. After logging in, they arrive at a dashboard that lists published labs as cards. Each card shows the lab’s title, category, difficulty, and a thumbnail. The left sidebar offers filters by category (Routing, Switching, Security, etc.) and a button to “Upload New Lab.”

When a user uploads a lab, they click “Upload New Lab,” complete a form with title, description, difficulty, category, and choose their topology file. On submit, a server action processes the file, stores it, and creates a database record. The user is redirected to `/lab/[id]`, where they see the formatted topology image, lab details, and configuration tabs. An AI chat window on the side answers questions or generates a summary. They can return to the dashboard via a navigation link.

## 4. Core Features

- **Authentication & Profiles**: Sign up, log in, log out, session handling using Better Auth.
- **Protected Dashboard**: Lists user’s labs and all published labs; filter by category and difficulty.
- **Lab Upload**: Form-driven file upload with metadata, file type/size validation, cloud storage (Vercel Blob or S3).
- **Lab Listing**: Dashboard cards showing key info; pagination or infinite scroll for large sets.
- **Lab Detail View**: Topology viewer component, metadata section, code/configuration tabs.
- **AI Assistant**: Embedded chat interface for context-aware guidance and automated summaries (Vercel AI SDK).
- **Database Schema**: Drizzle ORM models for users, labs, categories, files; relational integrity.
- **Theming & UI**: Dark mode/default mode toggle, Tailwind CSS design system, Radix UI primitives.
- **Deployment Configuration**: Docker Compose for local dev; Vercel project setup with environment variables and AI SDK keys.
- **Error Handling & Logging**: Graceful error pages, server-side logging, user-friendly messages.

## 5. Tech Stack & Tools

**Frontend**
- Framework: Next.js (App Router) for server-side rendering and routing
- Language: TypeScript for type safety
- Styling: Tailwind CSS for utility-first design
- Components: Radix UI for accessible primitives

**Backend**
- API: Next.js Server Actions and API Routes
- Authentication: Better Auth
- ORM: Drizzle ORM for type-safe PostgreSQL queries
- Database: PostgreSQL

**AI & Libraries**
- Vercel AI SDK (chat assistant) integrating with GPT-4 series models
- Optional: reactflow or mermaid.js for future interactive topology diagrams

**Infrastructure & Storage**
- Local Dev: Docker Compose (Next.js + PostgreSQL)
- Production: Vercel (hosting + AI SDK) with Vercel Blob or AWS S3 for file storage
- Dev Tools: ESLint, Prettier, Husky, lint-staged

## 6. Non-Functional Requirements

- **Performance**: Server responses <500 ms for API calls; initial page load <2 s on 3G; lazy-load images.
- **Security**: All forms and file uploads validated/sanitized; JWT or session cookies; users can only access/edit own labs.
- **Compliance**: GDPR-ready data handling (user consent, data deletion endpoint).
- **Usability**: WCAG-AA accessible UI (ARIA attributes, keyboard navigation); responsive design on mobile/tablet/desktop.
- **Availability**: 99.9% uptime on production; automated health checks.

## 7. Constraints & Assumptions

- The Vercel AI SDK (and underlying GPT-4 or equivalent model) is available and has sufficient quota.
- PostgreSQL running in Docker for local development; production uses a managed PostgreSQL instance.
- Users have modern browsers supporting ES6 and CSS variables.
- Environment: Node.js 18+, Git for version control.
- Cloud storage (Vercel Blob or S3) credentials are set via environment variables.

## 8. Known Issues & Potential Pitfalls

- **Large File Uploads**: Big topology files may hit server limits. Mitigation: enforce file size limits (e.g., 10 MB) and consider chunked uploads.
- **AI Rate Limits**: Excessive prompts could exhaust API quotas. Mitigation: cache common summaries, implement per-user quotas.
- **Schema Migrations**: Drizzle ORM migrations can become complex. Mitigation: use a migration workflow (SQL files or migration tool) and review changes in PRs.
- **Cloud Costs**: File storage and AI calls incur cost. Mitigation: set usage alerts, clean up unused files, optimize prompt lengths.
- **Dark Mode Contrast**: Custom gradients may fail contrast checks. Mitigation: test with accessibility tools (e.g., Lighthouse) and adjust colors.

---

This document describes all essential requirements for the first version of NetLabShowcase. With this PRD as the single source of truth, subsequent technical specifications (tech stack detail, frontend guidelines, backend architecture) can be produced without ambiguity or missing details.