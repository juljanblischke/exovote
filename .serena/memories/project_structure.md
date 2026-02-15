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
│   │   │   ├── Extensions/             # DI helpers, endpoint registration
│   │   │   │   ├── ServiceCollectionExtensions.cs  # CORS, Swagger, SignalR, hosted services
│   │   │   │   └── EndpointExtensions.cs           # Minimal API endpoint mappings
│   │   │   ├── Hubs/                    # SignalR hubs
│   │   │   │   └── PollHub.cs           # Real-time vote broadcasting
│   │   │   ├── Services/               # Background services + implementations
│   │   │   │   ├── PollExpirationService.cs  # Auto-close expired polls (IHostedService)
│   │   │   │   ├── PollArchiveService.cs     # Archive inactive polls after 4 weeks
│   │   │   │   └── VoteNotificationService.cs # IVoteNotificationService → SignalR
│   │   │   └── appsettings.*.json      # Config per environment
│   │   ├── Exo.Vote.Application/       # Business logic (CQRS)
│   │   │   ├── DependencyInjection.cs  # Registers Mediator, validators
│   │   │   ├── Common/                 # Shared: behaviors, interfaces, models
│   │   │   │   ├── Behaviors/          # Validation pipeline behavior
│   │   │   │   ├── Interfaces/         # IAppDbContext, ICacheService, IMessageBus, IVoteNotificationService
│   │   │   │   └── Models/             # ApiResponse, PagedList
│   │   │   └── Features/              # Feature folders (Commands + Queries)
│   │   │       └── Polls/
│   │   │           ├── Commands/
│   │   │           │   ├── CreatePoll/  # CreatePollCommand + Handler + Validator
│   │   │           │   └── CastVote/    # CastVoteCommand + Handler + Validator
│   │   │           └── Queries/
│   │   │               ├── GetPollById/     # GetPollByIdQuery + Handler
│   │   │               └── GetPollResults/  # GetPollResultsQuery + Handler
│   │   ├── Exo.Vote.Domain/           # Pure domain (no deps)
│   │   │   ├── Common/                # BaseEntity, IAuditableEntity
│   │   │   ├── Entities/              # Poll, PollOption, Vote
│   │   │   └── Enums/                 # PollStatus, PollType
│   │   ├── Exo.Vote.Infrastructure/   # External concerns
│   │   │   ├── DependencyInjection.cs # Registers EF, Redis, RabbitMQ
│   │   │   ├── Persistence/           # DbContext, EF configurations
│   │   │   │   ├── AppDbContext.cs
│   │   │   │   ├── Configurations/    # Entity type configs
│   │   │   │   └── Migrations/        # EF Core migrations
│   │   │   └── Services/             # Cache, MessageBus implementations
│   │   └── Exo.Vote.Tests/           # Unit tests (xUnit + FluentAssertions)
│   │       ├── Helpers/               # TestDbContextFactory (InMemory EF)
│   │       └── Features/Polls/        # Handler + Validator tests
│   │
│   └── frontend/                       # Next.js 15 App Router
│       ├── app/
│       │   ├── [locale]/              # Locale-aware pages
│       │   │   ├── layout.tsx         # Root layout (ThemeProvider, fonts)
│       │   │   ├── page.tsx           # Home page
│       │   │   ├── imprint/page.tsx   # Impressum
│       │   │   ├── privacy/page.tsx   # Datenschutz
│       │   │   └── polls/
│       │   │       ├── create/page.tsx  # Poll creation form
│       │   │       └── [id]/page.tsx    # Poll view + voting + results
│       │   └── api/health/route.ts    # Health check
│       ├── __tests__/                 # Vitest + React Testing Library tests
│       │   ├── setup.ts              # Test setup (jest-dom matchers)
│       │   ├── test-utils.tsx        # NextIntlProvider wrapper
│       │   └── components/           # Component tests (ui/, polls/)
│       ├── components/
│       │   ├── layout/                # Header, Footer, ThemeToggle, LangSwitch
│       │   ├── ui/                    # Button, Input, Card, Select, Textarea, Label, FormField
│       │   └── polls/                 # PollHeader, PollResults, PollStatusBadge, VotingForm,
│       │                              # SingleChoiceVoting, MultipleChoiceVoting, RankedVoting, ShareButton
│       ├── lib/
│       │   ├── i18n/                  # next-intl config (routing, request)
│       │   └── types.ts              # TypeScript interfaces matching backend DTOs
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
- **Poll**: Title, Description, Type, Status, ExpiresAt, LastViewedAt, CreatorId, IsActive
- **PollOption**: Text, SortOrder (belongs to Poll)
- **Vote**: PollOptionId, PollId, VoterId, VoterName, Rank, VotedAt (belongs to Poll + PollOption)

## Enums
- **PollStatus**: Draft, Active, Closed, Archived
- **PollType**: SingleChoice, MultipleChoice, Ranked

## API Endpoints
| Method | Path | CQRS | Description |
|--------|------|------|-------------|
| POST | /api/polls | CreatePollCommand | Create a new poll |
| GET | /api/polls/{id} | GetPollByIdQuery | Get poll with options + vote counts |
| POST | /api/polls/{id}/votes | CastVoteCommand | Cast a vote on a poll |
| GET | /api/polls/{id}/results | GetPollResultsQuery | Get aggregated results |
| WS | /hubs/polls | PollHub (SignalR) | Real-time vote updates |

## Background Services
- **PollExpirationService**: Checks every 60s for expired polls, sets Status=Closed
- **PollArchiveService**: Checks every hour for inactive polls (no views for 4 weeks), sets Status=Archived
