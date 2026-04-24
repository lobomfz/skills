---
name: testing
description: "Bun and ghostapi tests. Use when writing tests, setting up test infrastructure, mocking external HTTP, or reviewing test quality."
---

# Testing

Test the system, not a simulation.

Internal project code runs for real in tests. The environment changes: external HTTP becomes a real mock server, the database uses the real schema in memory, and `.env.test` swaps process URLs/config.

## Core Rules

- Never mock internal project modules.
- If code calls external HTTP, use `@lobomfz/ghostapi`.
- If code uses a database, use the real database with `DATABASE_URL=:memory:`.
- Do not create DI, factories, wrappers, or extra parameters for "testability".
- Test real flows, real business rules, and states that exist in production.
- Do not spend test budget on invented edge cases that do not belong to the domain.
- Setup creates preconditions through the most direct domain path, not chains of entry points.
- `bun test` loads `.env.test` automatically; do not use manual dotenv/bootstrap.
- Tests change environment, not production exports. Keep real database/client exports direct; do not add factories, reset wrappers, or env parameters for tests.
- Never use `.resolves` or `.rejects` for promise errors. In Bun tests, assert async failures with `expect(() => asyncCall()).toThrow(...)`; Bun observes rejected promises and this is the preferred concrete style.

## Decision Map

| Situation | Use |
| --- | --- |
| Internal code | Run the real code |
| External HTTP | `references/ghostapi.md` |
| Database/env | `references/database-and-env.md` |
| Previous data/seeding | `references/setup-patterns.md` |
| Time with `setSystemTime` | `references/time.md` |
| Promise assertions | `references/assertions.md` |

## Boundaries

```typescript
// Bad: tests the simulation
vi.mock("@/billing", () => ({
  updateSubscription: vi.fn(),
}));

// Good: tests the system
const result = await updateSubscription("cus_123", "pro");
```

When code talks to something you do not own, simulate the boundary, not the internal client:

- External API -> `@lobomfz/ghostapi`
- Database -> real schema with `:memory:`
- Project modules -> never mock

## GhostAPI Shape

One external service mock is one exported `const`. `new Mock()` is already the factory; do not wrap it in a factory, class, reset helper, or configuration layer.

Recurring setup/cleanup operations are helpers returned by the setup callback. The type of `mock.helpers` is inferred from that return value. Use `.reset()` directly.

Use `.db` for ad-hoc queries in a specific test. If an operation appears in more than one test, move it into helpers.

Pass fixed shared ports with `{ port }` or `{ base_url }` in the constructor. If configuration differs, change `new Mock(...)`; do not add another layer.

Type request bodies in the route's third argument. Never assert handler bodies with `as`.

## What to Test

Good test categories:

- authentication and session persistence
- real state transitions
- user isolation
- synchronization with external services
- database write effects
- expected external error handling

Pathological cases only belong when they are real product risks: huge paths, impossible files, exotic unicode, concurrency storms, etc.

## Checklist

- [ ] internal code runs for real
- [ ] external HTTP uses `@lobomfz/ghostapi`
- [ ] database uses the real schema with `:memory:`
- [ ] `.env.test` changes the environment without DI
- [ ] mock is `export const XMock = new Mock(...)`
- [ ] recurring seeding/cleanup is in helpers
- [ ] mock route bodies are typed through handler options, not `as`
- [ ] no factories, wrappers, or `vi.mock()` for internal modules
- [ ] setup uses the direct domain path, not intermediate entry points
- [ ] time uses relative offsets, not hardcoded dates
- [ ] never `.resolves` or `.rejects`

## References

Read the reference that matches the test before writing or judging it:

- `references/ghostapi.md` when external HTTP appears.
- `references/database-and-env.md` when database, env, `.env.test`, or production exports appear.
- `references/setup-patterns.md` when a test seeds or creates previous state.
- `references/time.md` when `setSystemTime`, current time, relative dates, or temporal assertions appear.
- `references/assertions.md` when promise values, async errors, `.resolves`, or `.rejects` appear.
