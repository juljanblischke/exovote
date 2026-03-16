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
- Geographic vote visualization (optional, privacy-respecting)
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

## Geographic Vote Map (Optional)

ExoVote can display an interactive world map showing where votes come from. This uses [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) for privacy-respecting, country-level geolocation. **IP addresses are never stored** — they are resolved to a country/region at vote time and immediately discarded.

### Setup

1. Create a free account at [maxmind.com](https://www.maxmind.com/en/geolite2/signup)
2. Generate a license key under **Account > Manage License Keys**
3. Add `MAXMIND_LICENSE_KEY` to your environment:

**Docker (production):** Add to your `.env` file on the server:
```env
MAXMIND_LICENSE_KEY=your_license_key_here
```

**GitHub Actions:** Add `MAXMIND_LICENSE_KEY` as a repository secret if you pass env vars during deploy.

**Local development:** Set in your shell or `appsettings.Development.json`:
```json
{
  "GeoIP": {
    "DatabasePath": "/path/to/GeoLite2-Country.mmdb"
  }
}
```

The database is downloaded automatically on container startup and cached in a Docker volume (`geoip_data`). It re-downloads after 7 days to stay current.

### Without MaxMind

If `MAXMIND_LICENSE_KEY` is not set, geolocation is simply disabled — the map won't appear on poll results pages, and everything else works normally.

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
