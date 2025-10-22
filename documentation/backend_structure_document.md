# Backend Structure Document for NetLabShowcase

## Backend Architecture

Our backend is built on a modern, full-stack TypeScript foundation using Next.js. It follows a modular, separation-of-concerns design to ensure clear boundaries between routing, business logic, and data access.

• Framework & Patterns:
  - Next.js API Routes and Server Actions for server-side logic (file uploads, AI calls, database operations)
  - Layered design: routing layer → service layer → data access layer
  - Type-safe database interactions using Drizzle ORM

• Scalability & Performance:
  - Serverless deployment on Vercel’s edge network handles auto-scaling under load
  - Caching with Next.js ISR (Incremental Static Regeneration) and built-in CDN support
  - Horizontal scaling of stateless API functions—each request spins up an isolated instance

• Maintainability:
  - Clear directory structure (`/app`, `/components`, `/lib`, `/db`)
  - TypeScript across all layers to catch errors at compile time
  - Modular service files (e.g., `auth.ts`, `upload-handler.ts`, `ai.ts`) for focused responsibilities

## Database Management

We use PostgreSQL, a reliable SQL database, accessed via Drizzle ORM for type-safe queries and migrations.

• Database Type:
  - SQL (PostgreSQL)

• ORM & Tooling:
  - Drizzle ORM for schema definitions, migrations, and type-safe queries
  - Docker Compose for local development (Next.js + PostgreSQL)
  - Automated migration scripts to evolve schema safely

• Data Practices:
  - Referential integrity enforced via foreign keys
  - Environment-controlled credentials and connection pooling
  - Optional data seeding scripts for test/dev environments

## Database Schema

Below is a human-readable overview, followed by SQL definitions.

Entities & Relationships:
• Users: platform accounts (id, name, email, password hash)
• Categories: lab categories (id, name)
• Labs: lab entries linked to users and categories (title, description, difficulty, timestamps)
• Files: file records linked to labs (file path, upload time)

SQL Schema (PostgreSQL):

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Labs table
CREATE TABLE labs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Design and Endpoints

We use RESTful patterns via Next.js API routes and Server Actions.

Key Endpoints:

• Authentication (Better Auth)
  - POST `/api/auth/signup`: register new user
  - POST `/api/auth/signin`: authenticate and receive session cookie
  - POST `/api/auth/signout`: end session

• Labs & Categories
  - GET `/api/labs`: list all published labs (with optional filters by category or difficulty)
  - GET `/api/labs/[id]`: fetch details of a single lab
  - POST `/api/labs`: create a new lab record (protected)
  - PATCH `/api/labs/[id]`: update lab (owner only)
  - DELETE `/api/labs/[id]`: delete lab (owner only)
  - GET `/api/categories`: list all categories

• File Uploads
  - POST `/api/upload`: handle multipart file upload, store in cloud, return file metadata

• AI Assistant
  - POST `/api/ai/chat`: send user prompt to Vercel AI SDK and stream responses
  - POST `/api/ai/summarize`: generate a summary of a lab configuration via background job

These endpoints use middleware to check authentication, validate inputs, and enforce ownership rules.

## Hosting Solutions

• Local Development:
  - Docker Compose orchestrates Next.js app and PostgreSQL database

• Production Deployment:
  - Vercel (serverless functions) for APIs and frontend
  - Vercel’s Global CDN for static assets
  - Optional object storage: Vercel Blob or AWS S3 for uploaded files

Benefits:
  - Automatic scaling based on traffic
  - Minimal ops overhead—no manual server management
  - Built-in TLS, zero-config CDN, and analytics
  - Cost-effective pay-as-you-go model

## Infrastructure Components

• Load Balancing & CDN:
  - Vercel’s edge network performs global load balancing
  - Automatic static asset caching at CDN edge

• Caching & Performance:
  - ISR (Incremental Static Regeneration) for frequently accessed pages
  - HTTP cache headers configured on serverless responses

• Storage:
  - PostgreSQL managed by cloud provider (connections via pool)
  - Cloud object storage for large file assets

• Background Jobs:
  - Simple job queue using serverless functions (for AI summary generation)

## Security Measures

• Authentication & Authorization:
  - Better Auth to manage user sessions, password hashing, secure cookies
  - Route guards and ownership checks on resource-modifying endpoints

• Data Encryption:
  - TLS for all in-transit traffic
  - Encryption at rest for database and object storage (provider-managed)

• Input Validation & Sanitization:
  - Zod or built-in checks for expected fields
  - File type and size validation on uploads

• Compliance & Best Practices:
  - Secure HTTP headers (HSTS, Content Security Policy)
  - Least-privilege database roles
  - Regular dependency updates and vulnerability scans

## Monitoring and Maintenance

• Logging & Metrics:
  - Vercel function logs aggregated in their dashboard
  - PostgreSQL performance metrics via provider console
  - Optional integration with Sentry or Datadog for error tracking

• Alerts:
  - Automated alerts on function errors or database connection issues

• Maintenance:
  - Scheduled backups of PostgreSQL
  - Automated schema migrations via CI/CD pipelines
  - Dependency updates and security patching via GitHub Actions

## Conclusion and Overall Backend Summary

Our backend uses a clean, modular Next.js and TypeScript architecture, backed by PostgreSQL and Drizzle ORM, to handle user authentication, lab management, file uploads, and AI interactions. Deployed serverlessly on Vercel with Docker Compose for local development, the system is both scalable and maintainable.

Key strengths:
• Type-safe, modular code organization 
• Secure authentication and fine-grained access control
• Production-ready deployment with global CDN and automatic scaling
• Clear API surface for labs, uploads, and AI features

This structure meets NetLabShowcase’s goals of reliability, performance, and ease of future expansion (forums, analytics, enhanced AI features). It provides a solid foundation for building a professional, responsive documentation hub for networking students and engineers.