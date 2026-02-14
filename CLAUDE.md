# ExoVote

Open-source, self-hosted voting & polling platform. Create polls, share links, collect votes with real-time results.

## Quick Reference
- **Frontend**: `src/frontend/` — Next.js 15, React 19, Tailwind v4, next-intl (de/en), next-themes
- **Backend**: `src/backend/` — .NET 9, Mediator (NOT MediatR!), EF Core 9, CQRS, FluentValidation
- **Database**: PostgreSQL 16 | **Cache**: Redis 7 | **Message Bus**: RabbitMQ 3
- **Deploy**: Docker Compose on Hetzner (auto-deploy on `main` via GitHub Actions)
- **Compliance**: GDPR + NIS2 (Germany)

## Commands
```bash
# Frontend dev
cd src/frontend && pnpm dev

# Backend dev
cd src/backend && dotnet run --project Exo.Vote.Api

# Full stack
docker-compose up -d

# Run backend tests
cd src/backend && dotnet test

# Run frontend tests
cd src/frontend && pnpm test

# Install frontend deps
cd src/frontend && pnpm install
```

> **IMPORTANT**: Always use `pnpm`, never `npm` or `yarn`.

## Architecture

### Backend — Clean Architecture + CQRS
```
Exo.Vote.Domain          → Entities, Value Objects, Enums (zero dependencies)
Exo.Vote.Application     → Commands, Queries, Interfaces, Behaviors (references Domain)
Exo.Vote.Infrastructure  → EF Core, Redis, RabbitMQ implementations (references Application)
Exo.Vote.Api             → Minimal APIs, Middleware, DI (references Application + Infrastructure)
```

- **BFF Pattern**: Next.js rewrites `/api/*` to .NET backend
- **CQRS**: Commands (writes) and Queries (reads) via Mediator source generator
- **Auto-migration**: EF Core migrations run on startup
- **Message Bus**: RabbitMQ for async events (vote submitted, poll closed, etc.)

### Frontend — Next.js 15 App Router
```
app/[locale]/             → Pages (locale-aware routing)
components/layout/        → Header, Footer, ThemeToggle, LangSwitch, CookieConsent
components/ui/            → Reusable UI primitives
components/polls/         → Poll-specific components
lib/i18n/                 → Internationalization config
messages/                 → Translation files (de.json, en.json)
styles/                   → Global CSS with Tailwind v4 theme
```

## Coding Rules

### General
- All user-facing text uses i18n keys (never hardcoded strings)
- Default locale is `de`, supported: `de`, `en`
- Every feature needs an Issue + PR (no direct push to main)
- Branch naming: `feature/issue-{N}-description` or `fix/issue-{N}-description`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- No secrets in code — use environment variables

### Frontend
- Server Components by default, `"use client"` only when needed
- Tailwind design tokens from `globals.css` (Exostruction brand theme)
- Mobile-first responsive design
- All interactive elements must be keyboard accessible
- Use `lucide-react` for icons

### Backend
- Minimal APIs, not Controllers
- Mediator (source generator by Martin Othamar), NOT MediatR
- FluentValidation for all command validation
- `AsNoTracking()` for all query operations
- Structured logging with Serilog
- All public endpoints need rate limiting

### Compliance (GDPR + NIS2)
- Cookie consent required before any tracking
- Privacy policy and imprint pages required (de + en)
- Data minimization: only collect what's needed
- User data export and deletion capabilities
- Audit logging for security events
- HTTPS only in production
- Security headers (CSP, HSTS, X-Frame-Options)

## Color Theme (Exostruction Brand)
- Primary: Rose/Red `hsl(346.8 77.2% 49.8%)`
- Dark BG: Deep Navy `hsl(224 71% 4%)`
- Dark mode via `next-themes` with CSS variables
- Font: Inter

## Agent Teams

When starting a session, read the assigned GitHub Issue first. Then create agent teams as needed:

### Team Frontend (`@frontend`)
**Focus**: Next.js app, React components, styling, animations, i18n
**Scope**: `src/frontend/`
**Key tasks**:
- Poll creation/voting UI components
- Real-time results visualization (charts, progress bars)
- Layout components (Header, Footer, ThemeToggle, LangSwitch)
- Legal pages (Impressum, Datenschutz)
- Cookie consent banner
- Responsive design, accessibility
- Share links and embed widgets

**Standards**:
- Server Components by default
- Tailwind v4 with design tokens
- All text via next-intl (de + en)
- Mobile-first responsive
- Test with Vitest + React Testing Library

### Team Backend (`@backend`)
**Focus**: .NET 9 API, CQRS, database, caching, messaging
**Scope**: `src/backend/`
**Key tasks**:
- Domain entities and value objects (Poll, PollOption, Vote)
- CQRS commands/queries with Mediator
- EF Core entity configurations and migrations
- Redis caching layer
- RabbitMQ event publishing/consuming
- API endpoints (Minimal APIs)
- Input validation (FluentValidation)
- Security middleware

**Standards**:
- Clean Architecture layers
- Mediator (source-gen), NOT MediatR
- FluentValidation for all commands
- `AsNoTracking()` for queries
- Structured logging with Serilog

### Team Infra (`@infra`)
**Focus**: Docker, CI/CD, deployment, security
**Scope**: Root configs, `.github/`, Dockerfiles
**Key tasks**:
- Docker Compose optimization
- GitHub Actions CI/CD pipelines
- Hetzner deployment configuration
- Security headers and CSP
- Rate limiting setup
- Environment configuration
- Health checks and monitoring
- SSL/TLS certificate management

**Standards**:
- Multi-stage Docker builds
- Non-root containers
- Secrets via environment variables
- Health checks on all services

### Team QA (`@qa`)
**Focus**: Testing, code quality, compliance
**Scope**: All test files, compliance docs
**Key tasks**:
- Backend unit tests (xUnit + FluentAssertions)
- Frontend component tests (Vitest + React Testing Library)
- Integration tests
- GDPR compliance audit
- NIS2 security checklist
- Accessibility testing (WCAG 2.1 AA)
- Performance testing

**Standards**:
- Test behavior, not implementation
- FluentAssertions for C#
- React Testing Library for frontend
- Maintain compliance documentation

## Issue Labels
| Label | Color | Description |
|-------|-------|-------------|
| `frontend` | #3B82F6 | Frontend/Next.js work |
| `backend` | #10B981 | Backend/.NET work |
| `infra` | #8B5CF6 | Infrastructure/DevOps |
| `bug` | #EF4444 | Something is broken |
| `enhancement` | #F59E0B | New feature or improvement |
| `compliance` | #EC4899 | GDPR/NIS2 related |
| `design` | #06B6D4 | UI/UX design work |
| `good-first-issue` | #22C55E | Easy entry point |

## Project Phases
1. **Phase 1**: Project scaffolding, repo setup, CI/CD
2. **Phase 2**: Core UI layout, theme, navigation, legal pages
3. **Phase 3**: Poll creation (first vertical slice: create → vote → results)
4. **Phase 4**: Real-time vote updates (SignalR/WebSocket)
5. **Phase 5**: Poll types (multiple choice, ranked choice)
6. **Phase 6**: Share links, embeds, QR codes
7. **Phase 7**: User accounts, poll management dashboard
8. **Phase 8**: Polish, animations, SEO, performance
9. **Phase 9**: Production deploy, monitoring, compliance audit
