# Domains

This directory is organized around domain-driven design. Each folder under `domains/` represents a bounded context and should function as if it could be extracted into its own package.

## Domain Structure

Each domain folder should contain:

```
domains/<name>/
  CLAUDE.md       # what this domain owns, key concepts, boundaries
  hooks/          # React hooks scoped to this domain
  ui/             # React components scoped to this domain
  api/            # data fetching, server functions, external service calls
```

Not every domain needs all three subdirectories — add `hooks/`, `ui/`, and `api/` as the domain requires them.

## Guidelines

- A domain should only import from `~/lib`, `@bankql/*` packages, and other domains' explicit public exports — never reach into another domain's internals.
- Shared utilities that span multiple domains belong in `~/lib`, not in a domain folder.
- Route files in `app/routes/` compose domain components; they should not contain domain logic themselves.
