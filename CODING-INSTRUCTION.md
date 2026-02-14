# ExoVote — Coding Instructions

Copy the relevant section below when starting a new Claude Code / Serena session.

---

## Session Start (Always do this first)

```
Read the GitHub Issue #{ISSUE_NUMBER} for this session:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Then:
1. Read CLAUDE.md to understand the project
2. Read the Serena memories (list_memories → read relevant ones)
3. Create Agent Teams as needed based on the issue scope (see CLAUDE.md → Agent Teams)
4. Create a task list from the issue's acceptance criteria
5. Work through tasks, committing with conventional commits
6. Create a PR when done
```

---

## New Feature

```
You are working on ExoVote — an open-source voting & polling platform.

Read Issue #{ISSUE_NUMBER}:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Follow the project's CLAUDE.md for architecture, coding standards, and agent team setup.
Read Serena memories for coding standards and project structure.

Steps:
1. Create branch: feature/issue-{ISSUE_NUMBER}-{short-description}
2. Read and understand the affected code areas
3. Create agent teams as needed (frontend, backend, infra, qa)
4. Implement the feature following Clean Architecture + CQRS patterns
5. All user-facing text must use i18n keys (de + en)
6. Test dark mode + light mode
7. Test responsive design
8. Add unit tests for new logic
9. Commit with conventional commits (feat: ...)
10. Create PR referencing the issue

Important:
- Mediator (source generator), NOT MediatR
- Server Components by default, "use client" only when needed
- FluentValidation for all commands
- AsNoTracking() for queries
- GDPR compliant (no unnecessary data collection)
```

---

## Bug Fix

```
You are working on ExoVote — an open-source voting & polling platform.

Read Bug Issue #{ISSUE_NUMBER}:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Follow the project's CLAUDE.md for architecture and coding standards.
Read Serena memories for coding standards.

Steps:
1. Create branch: fix/issue-{ISSUE_NUMBER}-{short-description}
2. Reproduce and understand the bug from the issue description
3. Find the root cause (read code, check logs, trace the flow)
4. Write a failing test that reproduces the bug
5. Fix the bug with minimal changes
6. Verify the test passes
7. Check for similar bugs in related code
8. Commit with conventional commits (fix: ...)
9. Create PR referencing the issue

Important:
- Don't refactor unrelated code in a bug fix PR
- Minimal, focused changes only
- Always add a regression test
```

---

## Refactoring

```
You are working on ExoVote — an open-source voting & polling platform.

Read Issue #{ISSUE_NUMBER}:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Follow the project's CLAUDE.md for architecture and coding standards.
Read Serena memories for coding standards.

Steps:
1. Create branch: refactor/issue-{ISSUE_NUMBER}-{short-description}
2. Understand the current code and its tests
3. Plan the refactoring approach (discuss in issue if complex)
4. Ensure existing tests pass before changes
5. Refactor incrementally with small commits
6. Ensure all tests still pass after changes
7. Update tests if behavior intentionally changed
8. Commit with conventional commits (refactor: ...)
9. Create PR referencing the issue

Important:
- No behavior changes unless explicitly requested
- Keep backward compatibility
- Run full test suite before PR
```

---

## Infrastructure / DevOps

```
You are working on ExoVote — an open-source voting & polling platform.

Read Issue #{ISSUE_NUMBER}:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Follow the project's CLAUDE.md for infrastructure standards.

Steps:
1. Create branch: infra/issue-{ISSUE_NUMBER}-{short-description}
2. Understand current Docker/CI/CD setup
3. Make changes to docker-compose, Dockerfiles, or GitHub Actions
4. Test locally with docker-compose up
5. Ensure health checks pass
6. No secrets in code — use GitHub Secrets / env vars
7. Commit with conventional commits (chore: ... or feat: ...)
8. Create PR referencing the issue

Important:
- Multi-stage Docker builds
- Non-root containers
- Health checks on all services
- Test the full stack locally before PR
```

---

## Compliance (GDPR / NIS2)

```
You are working on ExoVote — an open-source voting & polling platform deployed in Germany.

Read Issue #{ISSUE_NUMBER}:
gh api repos/juljanblischke/exovote/issues/{ISSUE_NUMBER}

Compliance requirements:
- GDPR: Cookie consent, privacy policy, data minimization, right to erasure, data export
- NIS2: Security logging, incident response, access control, encryption at rest/transit
- Legal: Impressum (German law), Datenschutzerklarung

Steps:
1. Create branch: compliance/issue-{ISSUE_NUMBER}-{short-description}
2. Audit the affected area against requirements
3. Implement necessary changes
4. Document compliance measures
5. Commit with conventional commits
6. Create PR referencing the issue
```

---

## Create a Bug Issue

```
You are working on ExoVote — an open-source voting & polling platform.
Repository: juljanblischke/exovote

I found a bug. Create a GitHub Issue for it:

Bug description: {DESCRIBE THE BUG}
Steps to reproduce: {STEPS}
Expected behavior: {WHAT SHOULD HAPPEN}
Actual behavior: {WHAT ACTUALLY HAPPENS}
Affected area: {Frontend / Backend / Infrastructure / Database}

Use gh to create the issue:
gh issue create --repo juljanblischke/exovote \
  --title "[Bug]: {SHORT TITLE}" \
  --label "bug" \
  --label "{frontend|backend|infra}" \
  --body "$(cat <<'EOF'
## Description
{description}

## Steps to Reproduce
1. ...
2. ...

## Expected Behavior
{expected}

## Actual Behavior
{actual}

## Environment
- Browser: ...
- OS: ...

## Screenshots / Logs
<!-- if applicable -->
EOF
)"
```

---

## Create a Feature Issue

```
You are working on ExoVote — an open-source voting & polling platform.
Repository: juljanblischke/exovote

I want a new feature. Create a GitHub Issue for it:

Feature description: {DESCRIBE THE FEATURE}
Acceptance criteria: {WHAT NEEDS TO BE TRUE WHEN DONE}
Area: {Frontend / Backend / Full Stack / Infrastructure / Compliance}
Priority: {Low / Medium / High / Critical}

Use gh to create the issue:
gh issue create --repo juljanblischke/exovote \
  --title "[Feature]: {SHORT TITLE}" \
  --label "enhancement" \
  --label "{frontend|backend|infra|compliance}" \
  --body "$(cat <<'EOF'
## Description
{description}

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Area
{area}

## Priority
{priority}

## Technical Notes
{any implementation hints, affected files, dependencies}

## Design / Mockups
<!-- if applicable -->
EOF
)"
```

---

## Create a Compliance Issue

```
You are working on ExoVote — an open-source voting & polling platform deployed in Germany.
Repository: juljanblischke/exovote

I need a compliance task. Create a GitHub Issue for it:

Description: {DESCRIBE THE COMPLIANCE REQUIREMENT}
Regulation: {GDPR / NIS2 / Both}
Acceptance criteria: {WHAT NEEDS TO BE TRUE WHEN DONE}

Use gh to create the issue:
gh issue create --repo juljanblischke/exovote \
  --title "[Compliance]: {SHORT TITLE}" \
  --label "compliance" \
  --body "$(cat <<'EOF'
## Description
{description}

## Regulation
{GDPR / NIS2 / Both}

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## References
<!-- Links to relevant regulation articles, documentation -->
EOF
)"
```

---

## Session Workflow Summary

```
For every session:
1. Read the issue → understand what needs to be done
2. Read CLAUDE.md → understand project conventions
3. Read Serena memories → understand coding standards, structure
4. Create agent teams → @frontend, @backend, @infra, @qa as needed
5. Create task list → break the issue into actionable tasks
6. Implement → follow the patterns above
7. Test → run relevant tests
8. Commit → conventional commits (feat:, fix:, refactor:, chore:)
9. PR → reference the issue, fill out the PR template
```
