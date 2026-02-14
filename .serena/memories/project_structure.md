# ExoVote — Project Structure

## Overview
ExoVote is an open-source, self-hosted voting & polling platform.
Deployed on Hetzner (Germany) with Docker Compose.

## Directory Layout
```
exovote/
├── src/
│   ├── backend/                         # .NET 9 Clean Architecture
│   │   ├── Exo.Vote.sln                # Solution file
│   │   ├── Exo.Vote.Api/               # Entry point — Minimal APIs
│   │   │   ├── Program.cs              # App bootstrap, DI, pipeline
│   │   │   ├── Dockerfile              # Multi-stage build
│   │   │   ├── Middleware/              # Exception handling, etc.
│   │   │   ├── Extensions/             # DI helpers
│   │   │   └── appsettings.*.json      # Config per environment
│   │   ├── Exo.Vote.Application/       # Business logic (CQRS)
│   │   │   ├── DependencyInjection.cs  # Registers Mediator, validators
│   │   │   ├── Common/                 # Shared: behaviors, interfaces, models
│   │   │   │   ├── Behaviors/          # Validation pipeline behavior
│   │   │   │   ├── Interfaces/         # IAppDbContext, ICacheService, IMessageBus
│   │   │   │   └── Models/             # ApiResponse, PagedList
│   │   │   └── Features/              # Feature folders (Commands + Queries)
│   │   │       └── {Area}/
│   │   │           ├── Commands/{Name}/ # Command + Handler + Validator
│   │   │           └── Queries/{Name}/  # Query + Handler
│   │   ├── Exo.Vote.Domain/           # Pure domain (no deps)
│   │   │   ├── Common/                # BaseEntity, IAuditableEntity
│   │   │   ├── Entities/              # Poll, PollOption, Vote
│   │   │   └── Enums/                 # PollStatus, PollType
│   │   └── Exo.Vote.Infrastructure/   # External concerns
│   │       ├── DependencyInjection.cs # Registers EF, Redis, RabbitMQ
│   │       ├── Persistence/           # DbContext, EF configurations
│   │       │   ├── AppDbContext.cs
│   │       │   └── Configurations/    # Entity type configs
│   │       └── Services/             # Cache, MessageBus implementations
│   │
│   └── frontend/                       # Next.js 15 App Router
│       ├── app/
│       │   ├── [locale]/              # Locale-aware pages
│       │   │   ├── layout.tsx         # Root layout (ThemeProvider, fonts)
│       │   │   ├── page.tsx           # Home page
│       │   │   ├── imprint/page.tsx   # Impressum
│       │   │   └── privacy/page.tsx   # Datenschutz
│       │   └── api/health/route.ts    # Health check
│       ├── components/
│       │   ├── layout/                # Header, Footer, ThemeToggle, LangSwitch
│       │   ├── ui/                    # Buttons, inputs, cards
│       │   └── polls/                 # Poll-specific components
│       ├── lib/i18n/                  # next-intl config (routing, request)
│       ├── messages/                  # de.json, en.json
│       ├── styles/globals.css         # Tailwind v4 theme (Exostruction brand)
│       ├── middleware.ts              # Locale redirect middleware
│       ├── Dockerfile                 # Multi-stage production build
│       └── package.json
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # Build + test on PR
│   │   └── deploy.yml                 # Deploy to Hetzner on main
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   └── feature.yml
│   └── pull_request_template.md
│
├── .serena/                           # Serena AI config
│   ├── project.yml
│   └── memories/                      # Persistent knowledge
│
├── docker-compose.yml                 # Dev stack (all services)
├── docker-compose.prod.yml            # Production stack
├── .env.example                       # Environment template
├── .editorconfig                      # Editor settings
├── .gitignore
├── CLAUDE.md                          # AI agent project guide
├── CODING-INSTRUCTION.md              # Session templates
└── README.md
```

## Services (Docker Compose)
| Service | Port (dev) | Purpose |
|---------|-----------|---------|
| frontend | 3000 | Next.js dev server |
| backend | 5000 | .NET API |
| postgres | 5432 | Database |
| redis | 6379 | Cache |
| rabbitmq | 5672 / 15672 | Message bus / management UI |

## Key Domain Entities
- **Poll**: Title, Description, Type, Status, ExpiresAt
- **PollOption**: Text, SortOrder (belongs to Poll)
- **Vote**: PollOptionId, VoterId, VotedAt (belongs to Poll)

## Enums
- **PollStatus**: Draft, Active, Closed, Archived
- **PollType**: SingleChoice, MultipleChoice, Ranked
