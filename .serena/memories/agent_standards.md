# ExoVote — Agent Standards

## Session Workflow

Every Serena / Claude Code session follows this workflow:

### 1. Read the Issue
```
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}
```
Understand what needs to be done, acceptance criteria, and labels.

### 2. Read Project Context
- Read `CLAUDE.md` for architecture and coding rules
- Read Serena memories: `coding_standards`, `project_structure`, `agent_standards`
- Check current branch and recent commits

### 3. Create Agent Teams (if complex task)
Based on the issue labels and scope, create teams:
- **@frontend** — for `src/frontend/` changes
- **@backend** — for `src/backend/` changes
- **@infra** — for Docker, CI/CD, deployment changes
- **@qa** — for testing and compliance

Not every issue needs all teams. A frontend-only issue just needs @frontend.

### 4. Create Task List
Break the issue into concrete, actionable tasks. Each task should:
- Have a clear acceptance criterion
- Be assignable to a specific team
- Be small enough to complete in one focused session

### 5. Implement
Follow the coding standards from `coding_standards.md`. Key reminders:
- **ALWAYS use `pnpm`** — never `npm` or `yarn`
- **Mediator**, not MediatR
- Server Components by default
- i18n for all user-facing text
- Conventional commits

### 6. Create PR
```
gh pr create --title "feat: description" --body "Closes #{ISSUE_NUMBER}"
```

## Agent Team Responsibilities

### @frontend Agent
- **Reads**: `src/frontend/` code, `messages/*.json`, `styles/globals.css`
- **Writes**: React components, pages, styles, translations
- **Tests with**: Vitest + React Testing Library
- **Key rule**: Server Components default, `"use client"` only for interactivity, always `pnpm`

### @backend Agent
- **Reads**: `src/backend/` code, entity configs, migrations
- **Writes**: Commands, Queries, Handlers, Validators, Entities, API endpoints
- **Tests with**: xUnit + FluentAssertions
- **Key rule**: Clean Architecture layers, Mediator source generator

### @infra Agent
- **Reads**: Dockerfiles, docker-compose, GitHub Actions, nginx configs
- **Writes**: Infrastructure configs, deployment scripts
- **Key rule**: Non-root containers, health checks, no secrets in code

### @qa Agent
- **Reads**: All code (for review), test files, compliance docs
- **Writes**: Tests, compliance documentation
- **Key rule**: Test behavior not implementation, maintain GDPR/NIS2 compliance

## Branching Strategy
```
main (protected — no direct push)
├── feature/issue-{N}-description
├── fix/issue-{N}-description
├── refactor/issue-{N}-description
├── infra/issue-{N}-description
└── compliance/issue-{N}-description
```

## Commit Convention
```
feat: add poll creation form (#12)
fix: correct vote count race condition (#15)
refactor: extract cache service interface (#18)
chore: update Docker base images (#20)
docs: add API documentation (#22)
test: add poll creation integration tests (#25)
```

Format: `{type}: {description} (#{issue})`

## PR Checklist (verify before creating)
- [ ] Code follows coding standards
- [ ] All text uses i18n (de + en)
- [ ] Dark/light mode works
- [ ] Responsive design verified
- [ ] No secrets in code
- [ ] Tests added/updated
- [ ] GDPR/NIS2 compliance maintained
- [ ] Conventional commit messages used

## Communication
- Use GitHub Issues for all feature requests and bugs
- Use PR comments for code review discussion
- Reference issues in commits and PRs with `#{number}`
- Label issues appropriately: frontend, backend, infra, bug, enhancement, compliance
