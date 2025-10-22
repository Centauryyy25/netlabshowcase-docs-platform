# NetLabShowcase Tech Stack Document

This document explains, in everyday language, the technology choices behind the NetLabShowcase platform. You’ll learn what we use to build the user interface, power the backend, deploy the application, integrate with external services, and keep everything secure and fast.

## 1. Frontend Technologies

Our frontend is everything you see and interact with in your browser. We’ve chosen tools that let us build a responsive, accessible, and polished interface quickly:

- **Next.js (App Router)**
  - A React-based framework that handles page routing, server-side rendering, and data fetching for us.
  - Helps pages load faster by pre-rendering content on the server when needed.
- **TypeScript**
  - Adds type-checking on top of JavaScript, so we catch errors early and write more predictable code.
- **Tailwind CSS**
  - A utility-first styling tool that lets us build custom, responsive designs without writing a lot of CSS from scratch.
  - Makes it easy to implement our dark mode and cyan/blue gradient theme.
- **Radix UI**
  - A library of unstyled, accessible components (like dialogs and dropdowns) that we can style to match our look and feel.
- **@ai-sdk/assistant-ui**
  - A ready-made component kit for building the AI chat interface, so we can drop in a conversation window without reinventing the wheel.

Together, these tools enable us to create a clean, modern interface that works well on desktops, tablets, and phones.

## 2. Backend Technologies

The backend powers your actions behind the scenes—things like signing in, storing lab files, and chatting with the AI assistant:

- **Next.js API Routes & Server Actions**
  - Let us write server code right alongside our pages.
  - Handle file uploads, AI prompt processing, and database operations securely.
- **Better Auth**
  - A full-featured authentication solution for user registration, login, session management, and access control.
- **Drizzle ORM**
  - A type-safe library to define our database schema and write queries in TypeScript.
  - Ensures we don’t make mistakes when reading or writing data.
- **PostgreSQL**
  - A reliable, industry-standard relational database where we store users, labs, categories, and file metadata.
- **File Storage (Vercel Blob or AWS S3)**
  - A cloud storage service to securely save and serve uploaded lab files and images.

These pieces work together to keep data consistent, secure, and easy to manage as the platform grows.

## 3. Infrastructure and Deployment

To develop and ship updates smoothly, we’ve set up an infrastructure that’s both reliable and scalable:

- **Docker Compose (Local Development)**
  - Runs the Next.js app and PostgreSQL database together on your machine with a single command.
- **Vercel (Production Deployment)**
  - Hosts our Next.js application, automatically building and deploying on each code change.
  - Offers built-in support for environment variables and the Vercel AI SDK.
- **Git & GitHub**
  - Version control to track code changes, collaborate with the team, and roll back if needed.
- **GitHub Actions (CI/CD)**
  - Automates testing and deployment, so every code update is validated and pushed live without manual steps.

These tools make it easy to onboard new developers, maintain high uptime, and scale the platform as traffic grows.

## 4. Third-Party Integrations

We rely on a few external services to extend our capabilities without building everything from scratch:

- **Vercel AI SDK**
  - Powers our AI assistant by connecting to large language models for summaries and chat responses.
- **Cloud Storage (Vercel Blob or AWS S3)**
  - Safely stores uploaded lab files, ensuring fast downloads and reliable backups.

These integrations let us focus on delivering a smooth user experience while leveraging best-in-class services.

## 5. Security and Performance Considerations

Keeping user data safe and pages fast is a top priority. Here’s how we handle it:

Security Measures:
- **Authenticated Routes**
  - Users must sign in via Better Auth to upload labs or view personal dashboards.
- **Access Control**
  - Only the owner of a lab can edit or delete it.
- **Input Validation & Sanitization**
  - We check file types, limit sizes, and clean text inputs to prevent injection attacks.
- **Environment Variables**
  - Secrets (like database credentials and API keys) are stored securely, not in code.

Performance Optimizations:
- **Server-Side Rendering & Caching**
  - Next.js pre-renders pages and reuses cached data to speed up load times.
- **Tailwind CSS**
  - Generates only the CSS we use, keeping bundle sizes small.
- **TypeScript & Drizzle ORM**
  - Early error detection and optimized database queries prevent slowdowns.
- **Lazy Loading & Code Splitting**
  - Loads heavy components (like the AI chat) only when needed.

## 6. Conclusion and Overall Tech Stack Summary

We’ve chosen a modern, full-stack setup that aligns perfectly with NetLabShowcase’s goals:

- Frontend: Next.js, TypeScript, Tailwind CSS, Radix UI, @ai-sdk/assistant-ui  
- Backend: Next.js API Routes, Server Actions, Better Auth, Drizzle ORM, PostgreSQL, Cloud Storage  
- Infrastructure: Docker Compose, Vercel, GitHub, GitHub Actions  
- Integrations: Vercel AI SDK, Vercel Blob/AWS S3  
- Security & Performance: Authentication, access controls, input sanitization, server-side rendering, caching

This combination gives us a solid, scalable foundation with minimal setup overhead. It lets us focus on the unique features—like the topology viewer and AI assistant—while relying on proven tools to handle the heavy lifting behind the scenes.