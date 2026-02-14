# ExoVote — Coding Standards

## General Rules
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- **Branch naming**: `feature/issue-{N}-description`, `fix/issue-{N}-description`
- **No direct push to main** — always PR from a feature/fix branch
- **All user-facing text uses i18n keys** — never hardcode strings
- **No secrets in code** — environment variables only
- **Default locale**: `de`, supported: `de`, `en`

## Backend (.NET 9)

### Architecture
- **Clean Architecture**: Domain → Application → Infrastructure → Api
- **CQRS pattern** with Mediator (source generator by Martin Othamar)
- **IMPORTANT**: Use `Mediator` package, NOT `MediatR`
- **Minimal APIs** — no Controllers

### Code Style
- C# 12 features (primary constructors, collection expressions)
- `record` types for Commands, Queries, DTOs
- `sealed` classes by default
- Nullable reference types enabled
- 4-space indentation

### Patterns
- **Commands**: `src/backend/Exo.Vote.Application/Features/{Area}/Commands/{Name}/`
  - `{Name}Command.cs` — record implementing `ICommand<TResponse>`
  - `{Name}Handler.cs` — implements `ICommandHandler<TCommand, TResponse>`
  - `{Name}Validator.cs` — FluentValidation rules
- **Queries**: `src/backend/Exo.Vote.Application/Features/{Area}/Queries/{Name}/`
  - `{Name}Query.cs` — record implementing `IQuery<TResponse>`
  - `{Name}Handler.cs` — implements `IQueryHandler<TQuery, TResponse>`
- Always use `AsNoTracking()` for read queries
- Always use `CancellationToken`
- Wrap responses in `ApiResponse<T>`

### Dependencies (NuGet)
- `Mediator.SourceGenerator` + `Mediator.Abstractions` — CQRS
- `FluentValidation` — input validation
- `Microsoft.EntityFrameworkCore` — ORM (Npgsql provider)
- `StackExchange.Redis` — caching
- `RabbitMQ.Client` — message bus
- `Serilog` — structured logging
- `Swashbuckle.AspNetCore` — Swagger/OpenAPI

## Frontend (Next.js 15)

### Architecture
- **App Router** with locale-based routing (`app/[locale]/`)
- **Server Components by default** — `"use client"` only for interactivity
- **BFF Pattern** — Next.js rewrites `/api/*` to backend

### Code Style
- TypeScript strict mode
- Functional components only
- Named exports (no default exports for components)
- 2-space indentation
- Single quotes in TypeScript

### Patterns
- Pages in `app/[locale]/{page}/page.tsx`
- Layout components in `components/layout/`
- UI primitives in `components/ui/`
- Feature components in `components/{feature}/`
- All text via `useTranslations()` from `next-intl`
- Theme via CSS variables in `globals.css` + `next-themes`
- Icons from `lucide-react`

### Dependencies (npm)
- `next` 15 + `react` 19 — framework
- `next-intl` — internationalization
- `next-themes` — dark/light mode
- `tailwindcss` v4 — styling
- `lucide-react` — icons
- `clsx` — conditional classes
- `vitest` + `@testing-library/react` — testing

## Testing

### Backend
- **xUnit** for test framework
- **FluentAssertions** for assertions
- Test behavior, not implementation details
- Name pattern: `{MethodName}_Should{ExpectedBehavior}_When{Condition}`

### Frontend
- **Vitest** for test runner
- **React Testing Library** for component tests
- Test user interactions, not component internals
- Mock API calls, not components

## Compliance (GDPR + NIS2)
- Cookie consent before any tracking/analytics
- Privacy policy available in de + en
- Impressum (legal notice) required by German law
- Data minimization — collect only what's needed
- Audit logging for security events
- HTTPS only in production
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
