# ExoVote

Open-source, self-hosted voting & polling platform. Create polls, share links, collect votes with real-time results.

Built with **ASP.NET Core 9**, **Next.js 15**, **PostgreSQL**, **Redis** & **RabbitMQ**.

## Features

- Create polls with multiple choice, ranked choice, and more
- Share via link or QR code
- Real-time vote results
- Dark/light mode
- Multi-language (German, English)
- GDPR compliant
- Self-hosted with Docker

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind v4, next-intl |
| Backend | .NET 9, Mediator (CQRS), EF Core 9, FluentValidation |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Bus | RabbitMQ 3 |
| Deployment | Docker Compose, GitHub Actions |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/juljanblischke/exovote.git
cd exovote

# Copy environment config
cp .env.example .env

# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# RabbitMQ: http://localhost:15672
```

## Development

```bash
# Frontend
cd src/frontend
pnpm install
pnpm dev

# Backend
cd src/backend
dotnet run --project Exo.Vote.Api
```

## Project Structure

```
exovote/
├── src/
│   ├── backend/                    # .NET 9 Clean Architecture
│   │   ├── Exo.Vote.Api/          # Minimal APIs, middleware
│   │   ├── Exo.Vote.Application/  # CQRS commands/queries
│   │   ├── Exo.Vote.Domain/       # Entities, value objects
│   │   └── Exo.Vote.Infrastructure/ # EF Core, Redis, RabbitMQ
│   └── frontend/                   # Next.js 15 App Router
│       ├── app/[locale]/           # Locale-aware pages
│       ├── components/             # React components
│       ├── lib/i18n/               # Internationalization
│       └── messages/               # Translation files
├── .github/                        # CI/CD, issue templates
├── docker-compose.yml              # Development stack
├── docker-compose.prod.yml         # Production stack
├── CLAUDE.md                       # AI agent instructions
└── CODING-INSTRUCTION.md           # Session templates
```

## Contributing

1. Pick an issue (or create one)
2. Create a branch: `feature/issue-{N}-description` or `fix/issue-{N}-description`
3. Follow the coding standards in `CLAUDE.md`
4. Submit a PR — no direct pushes to `main`

## Compliance

This project is designed for deployment in Germany and follows:
- **GDPR** — Cookie consent, privacy policy, data minimization
- **NIS2** — Security logging, access control, incident response

## License

[MIT](LICENSE)
