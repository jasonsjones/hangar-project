# hangar-project

A small flight-sim companion app, kept as a personal **learning side-project**. The point of the project — alongside shipping a working app — is for the author to deepen their understanding of full-stack development. Treat that as a first-class goal in everything below.

## Repo shape

Monorepo with two packages:

- `packages/server` — Java 21, Spring Boot, Spring Data JDBC, Postgres in prod / H2 in tests, Maven (`./mvnw`).
- `packages/client` — React 19 + TypeScript + Vite, Vitest + React Testing Library for unit tests, Playwright for e2e.

CI is per-package: `.github/workflows/server-ci.yml` and `client-ci.yml`. Server CI runs `./mvnw -B verify` against H2; client CI runs lint + Vitest + Playwright + a Docker build, all self-contained (no live API).

See `README.md` for project setup, architecture overview, and contributor docs.

## How to collaborate here

### Explain the *why*, not just the *what*

This is a learning project. When implementing or recommending something non-obvious, explain the reasoning alongside the code: design tradeoffs, why a pattern was chosen over alternatives, the relational/framework reasoning behind a structural choice. A working diff without the rationale is a missed opportunity.

This applies even when the code is "obvious" to an experienced engineer — surfacing the *why* is often where the learning happens. Err toward more explanation, not less.

### Test after each meaningful change

Treat tests as the checkpoint between steps, not a phase tacked on at the end:

1. After each meaningful change, run the existing test suite (`./mvnw test` for server, `npm test` for client).
2. If anything fails, fix it until green — and make sure each pass is for a *known, understood* reason. A coincidentally-green test or a silently-skipped test is a regression in disguise.
3. Add tests covering any new behavior that isn't already exercised, before moving on to the next change.

Don't claim a step is "done" until the suite is green and new behavior is covered.

### Branch conventions

For non-trivial work, cut a branch before starting rather than committing to `main`:

- `feat/<short-name>` — new features or feature work spanning multiple files/commits.
- `chore/<short-name>` — meta changes (CI, docs, repo conventions, dependency bumps).
- `fix/<short-name>` — bug fixes.

Push and open a PR when ready; CI runs on PRs to `main`. Trivial single-file tweaks may go straight to `main` if the user asks for that.

### Commits

Match the existing commit style: `feat(scope): subject` / `chore: subject` / `fix(scope): subject`, lowercase subject, present tense. Use the body to explain the *why* of the change, not the *what* (the diff covers what).
