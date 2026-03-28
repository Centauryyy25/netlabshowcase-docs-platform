<p align="center">
  <img src="public/_next/static/media/EtherDocs-Logo.693b3dd5.png" alt="Ether Docs" width="80" />
</p>

<h1 align="center">Ether Docs</h1>

<p align="center">
  <b>Open-source network lab documentation & showcase platform with AI-assisted config analysis</b><br/>
  <sub>Document, share, and explore verified networking lab topologies across Cisco, MikroTik, Fortinet, and Ruijie.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</p>

<p align="center">
  <a href="https://ether-docs.vercel.app"><b>🔗 Live Demo</b></a> · <a href="https://discord.gg/netlabshowcase"><b>💬 Discord Community</b></a> · <a href="#getting-started">Quick Start</a>
</p>

<!--
🖼️ SCREENSHOTS — Uncomment after adding

<p align="center">
  <img src="docs/screenshots/landing.png" width="70%" alt="Landing Page" />
</p>
<p align="center">
  <img src="docs/screenshots/lab-detail.png" width="45%" alt="Lab Detail"/>
  &nbsp;
  <img src="docs/screenshots/ai-assist.png" width="45%" alt="AI Assistant"/>
</p>
-->

---

## About

Ether Docs is a community-driven platform built for network engineers and students to document, share, and explore hands-on networking lab configurations. It supports multi-vendor environments and includes AI-powered tools for automated documentation and config analysis.

**Why this exists:** Network lab documentation is typically scattered across PDFs, personal notes, and unstructured wikis. Ether Docs centralizes this into a searchable, verified, and interactive platform — making it easier to learn, teach, and collaborate on networking topics.

## Key Features

| Feature | Description |
|---------|-------------|
| **Lab Showcase** | Browse 48+ verified lab topologies covering routing, switching, security, and automation |
| **Multi-Vendor Support** | Labs spanning Cisco, MikroTik, Fortinet, and Ruijie in a single platform |
| **AI Lab Assistant** | Auto-generate documentation, analyze configurations, and get optimization recommendations |
| **Interactive Documentation** | 350+ searchable technical docs with topology diagrams |
| **Authentication** | User accounts via Better Auth (email/password) with role-based access |
| **Dark Mode** | System-aware theme with manual toggle |
| **Docker Support** | Full containerization with multi-stage builds for production deployment |
| **Community** | Integrated Discord community (355+ members) for collaboration and support |

## Lab Categories

| Category | Topics |
|----------|--------|
| **Routing** | BGP, RIP, OSPF, Segment Routing, DHCP |
| **Switching** | VLAN, Trunking, Spanning Tree Protocol |
| **Security** | Zero Trust, Firewall HA, Router Hardening |
| **Data Center** | EVPN Fabric, Hybrid Cloud Topologies |
| **Automation** | Campus Automation, Observability Pipelines |
| **Edge** | LTE Failover, SASE |

## Architecture

```
Client (Browser)
    │
    ▼
┌──────────────────────────────────────────────┐
│  Next.js 15 (App Router + Turbopack)         │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Pages   │  │  API      │  │ Middleware  │ │
│  │  (RSC)   │  │  Routes   │  │ (Auth)     │ │
│  └────┬─────┘  └────┬─────┘  └────────────┘ │
│       │              │                        │
│  ┌────▼──────────────▼──────────┐             │
│  │     Shared Lib Layer         │             │
│  │  (Drizzle ORM, Better Auth,  │             │
│  │   AI integration, utils)     │             │
│  └──────────────┬───────────────┘             │
└─────────────────┼─────────────────────────────┘
                  │
      ┌───────────▼──────────┐
      │  PostgreSQL (Docker)  │
      └──────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, RSC, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Better Auth (email/password) |
| UI | Tailwind CSS v4 + shadcn/ui (40+ components) |
| Theme | next-themes (dark mode) |
| Icons | Lucide React |
| Containerization | Docker + Docker Compose |
| Deployment | Vercel / Docker (VPS) |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for database)

### Installation

```bash
git clone https://github.com/Centauryyy25/netlabshowcase-docs-platform.git
cd netlabshowcase-docs-platform
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### Database

```bash
# Start PostgreSQL via Docker
npm run db:up

# Push schema
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Full Docker Stack (Alternative)

```bash
# Start app + database together
npm run docker:up

# View logs
npm run docker:logs
```

## Project Structure

```
netlabshowcase-docs-platform/
├── app/                # Next.js App Router (pages, layouts, API routes)
├── components/         # UI components (40+ shadcn/ui)
├── context/            # React context providers
├── db/
│   ├── index.ts        # Database connection
│   └── schema/         # Drizzle schemas
├── docker/
│   └── postgres/       # PostgreSQL init scripts
├── drizzle/            # Migrations
├── hooks/              # Custom React hooks
├── lib/                # Auth config, utilities
├── settings/           # App settings/config
├── types/              # TypeScript definitions
├── utils/              # Helper functions
├── Dockerfile          # Multi-stage production build
└── docker-compose.yaml # Service orchestration
```

## Deployment

**Vercel + Managed DB (recommended):**
```bash
vercel
# Add DATABASE_URL and auth env vars in Vercel dashboard
npm run db:push
```

**Docker on VPS:**
```bash
npm run docker:up
```

See the full deployment guide for production considerations (managed PostgreSQL, SSL, health checks, backups).

## Roadmap

- [ ] Topology diagram editor (drag-and-drop)
- [ ] Lab version history and diff view
- [ ] Export labs to PDF / Markdown
- [ ] Community voting and lab rankings
- [ ] Integration with GNS3 / EVE-NG lab files
- [ ] API for third-party integrations

## Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Open a Pull Request with a clear description. Join the [Discord](https://discord.gg/netlabshowcase) to discuss ideas.

## License

All rights reserved.

---

<p align="center">
  Built by <a href="https://www.linkedin.com/in/ilham-ahsan-saputra/"><b>Ilham Ahsan Saputra</b></a><br/>
  <sub>Computer Science Student · Junior Network Engineer</sub>
</p>
