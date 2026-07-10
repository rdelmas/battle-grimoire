# Coding Standards

## General principles
- Prefer simple and explicit code.
- Follow existing project patterns before introducing new ones.
- Keep files focused and reasonably small.
- Avoid premature abstraction.

## Naming
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE only for true constants
- Files: [kebab-case / camelCase / PascalCase selon ton choix]

## TypeScript
- Avoid `any` unless justified.
- Prefer explicit types on public interfaces.
- Narrow types as close as possible to usage.
- Handle nullable values explicitly.

## React conventions
- Keep components focused on one responsibility.
- Extract reusable logic into hooks only after a real duplication appears.
- Avoid deeply nested JSX when a small subcomponent improves clarity.

## State and data fetching
- Define where server state lives.
- Define where UI state lives.
- Avoid duplicate sources of truth.

## Error handling
- Never swallow errors silently.
- Return or display user-safe error messages.
- Keep logs useful and concise.

## Comments
- Do not comment obvious code.
- Comment non-obvious business logic or technical constraints.

## Testing
- Add or update tests for business-critical behavior when relevant.
- Do not add fragile tests with low value.

## Performance
- Avoid unnecessary re-renders.
- Avoid premature optimization.
- Optimize only measured or clearly problematic paths.
