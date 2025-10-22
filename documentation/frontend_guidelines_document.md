# Frontend Guideline Document

This document outlines the frontend setup for the NetLabShowcase platform built on the `netlabshowcase-docs-platform` starter kit. It covers architecture, design principles, styling, component organization, state management, routing, performance optimizations, testing, and an overall summary. Anyone reading this guide should have a clear understanding of how the frontend works and how to extend it.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js (App Router)**: Provides server-side rendering, file-based routing, and server actions for form handling (e.g., file uploads and AI prompts).
- **TypeScript**: Ensures type safety across components, props, and API calls, reducing runtime errors.
- **Tailwind CSS**: A utility-first CSS framework for rapid styling and responsive design.
- **Radix UI**: Unstyled, accessible primitives (dialogs, tabs, dropdowns) that we wrap in our own styles.
- **Better Auth**: Handles user registration, login, and session management on the frontend.
- **Vercel AI SDK & @ai-sdk/assistant-ui**: Powers the interactive AI assistant chat interface.

### Scalability, Maintainability, and Performance
- **Modular codebase**: Clear separation between pages (`/app`), reusable UI components (`/components`), business logic (`/lib`), and data schemas (`/db`).
- **Type-safe data layer**: Drizzle ORM with PostgreSQL ensures queries match the database schema.
- **Server Actions**: Keep sensitive operations (file handling, AI calls) on the server, reducing bundle sizes and exposing less code to the browser.
- **Incremental adoption**: New pages, components, or services can be added without disrupting existing features.

## 2. Design Principles

### Key Principles
- **Usability**: Interfaces are intuitive—forms are labeled clearly, buttons have distinct states, and users receive feedback (loading spinners, success/error messages).
- **Accessibility**: All components meet WCAG standards. We use Radix primitives, semantic HTML, and appropriate ARIA attributes.
- **Responsiveness**: Layouts adapt from mobile to desktop using Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`).
- **Consistency**: A single source of truth for colors, spacing, and typography ensures a unified look.
- **Minimalism**: The UI focuses on content (lab cards, topology diagrams) with minimal distractions.

### Applying the Principles
- Navigation menus collapse into a hamburger menu on small screens.
- Form fields have clear labels, placeholders, and inline validation messages.
- Buttons use consistent padding, border-radius, and hover/focus styles.
- Modal dialogs trap focus and close on `Esc` or clicking outside.

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS** is our only CSS framework. We avoid custom CSS files and use utility classes (`bg-gray-900`, `text-cyan-400`, `p-4`, etc.).
- We do **not** use BEM or SASS; Tailwind handles variants, states, and responsive styles.

### Theming
- **Dark mode** out of the box using the `class` strategy. We toggle `dark` on the `<html>` element via a React Context hook.
- **Light mode** is available by removing the `dark` class.

### Visual Style
- **Overall Style**: Modern, flat design with subtle glassmorphism touches (semi-transparent modals and cards).
- **Color Palette**:
  • Background Dark: `#0E1A30`
  • Surface Dark: `#142E50`
  • Primary Cyan: `#00BFEF`
  • Secondary Blue: `#0092D1`
  • Accent Teal: `#20C5B0`
  • Text Light: `#F0F0F0`
  • Text Dark: `#1A1A1A`
- **Typography**: We use the **Inter** font family (imported via Google Fonts) for its readability and modern feel.

## 4. Component Structure

### Organization
- **/app**: Page routes (e.g., `/dashboard`, `/upload`, `/lab/[id]`, `/ai-assistant`). Each page lives in its own folder with a `page.tsx` and optional `layout.tsx`.
- **/components**:
  • **/components/ui**: Wrapped Radix primitives (Dialog, Tabs, Dropdown).
  • **/components/lab**: Domain components like `LabCard.tsx`, `TopologyViewer.tsx`, `ConfigTabs.tsx`, `AIChatInterface.tsx`.
  • **app-sidebar.tsx**: Main sidebar with category filters and navigation links.

### Reusability
- Components accept typed props and expose clearly documented APIs.
- Large pages are composed of smaller widgets (e.g., the lab detail page assembles `TopologyViewer`, `ConfigTabs`, and `AIChatInterface`).
- Shared UI patterns (buttons, inputs, cards) live in `/components/ui` for consistency.

## 5. State Management

### Local Component State
- **React Hooks** (`useState`, `useEffect`, `useReducer`) for form inputs, toggles, and local UI state.

### Global State
- **Auth State**: Provided by Better Auth’s React hook (`useSession()`), available to all client components.
- **Theme State**: Managed via a custom React Context (`ThemeContext`) that toggles dark/light mode.

### Data Fetching
- **Server Components** fetch data directly using Drizzle ORM in Next.js server actions or `getServerSideProps` (when needed).
- **Client Components** use React Scraps or a simple Fetch API + `useSWR` pattern for low-latency updates.

## 6. Routing and Navigation

### File-Based Routing
- Next.js App Router maps folders in `/app` to URL paths. For example:
  • `/app/dashboard/page.tsx` → `/dashboard`
  • `/app/lab/[id]/page.tsx` → `/lab/:id`

### Link and Navigation
- Use Next.js `<Link>` for internal navigation to enable prefetching.
- The sidebar (`app-sidebar.tsx`) highlights the active link.
- Breadcrumbs on detail pages help users understand context and navigate back.

## 7. Performance Optimization

- **SSR/SSG**: Use server-side rendering for dynamic pages (dashboard, lab detail) and static generation for landing or help pages.
- **Code Splitting**: Leverage dynamic imports (`next/dynamic`) for heavy components like `TopologyViewer` or `AIChatInterface`.
- **Lazy Loading**: Load images with Next.js `<Image>` and use `loading="lazy"` for large topology graphics.
- **Asset Optimization**: Tailwind’s purge removes unused CSS in production, and Next.js optimizes JS bundles.
- **Caching**: Use HTTP caching headers for static assets and ISR (Incremental Static Regeneration) where appropriate.

## 8. Testing and Quality Assurance

### Unit and Integration Tests
- **Jest** with **React Testing Library** to test components in isolation and small integrations (e.g., form validation, dialog behavior).
- **Mock Service Worker (MSW)** for simulating API calls and server actions.

### End-to-End (E2E) Tests
- **Playwright** to automate critical user flows: sign-up, sign-in, upload a lab, view lab details, and chat with the AI assistant.

### Linters and Formatters
- **ESLint** with Next.js and TypeScript plugins to catch errors and enforce coding standards.
- **Prettier** for consistent code formatting.

### CI/CD Integration
- GitHub Actions pipeline that runs linting, unit tests, and E2E tests on each pull request.
- Automatic deployment to Vercel on merges to the `main` branch.

## 9. Conclusion and Overall Frontend Summary

The NetLabShowcase frontend combines Next.js, TypeScript, Tailwind CSS, and Radix UI to deliver a scalable and maintainable platform. By following these guidelines—consistent design principles, a modular component structure, clear state management, optimized performance techniques, and thorough testing—you can build and extend the application confidently. Unique features like the AI assistant, topology viewer, and server actions for file handling fit neatly into this architecture, ensuring that NetLabShowcase remains responsive, accessible, and easy to develop for years to come.