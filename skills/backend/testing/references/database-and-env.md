# Database and Environment

`bun test` loads `.env.test` automatically.

```bash
DATABASE_URL=:memory:
STRIPE_API_URL=http://127.0.0.1:4100
SEARCH_API_URL=http://127.0.0.1:4101
NOTIFICATIONS_API_URL=http://127.0.0.1:4102
```

Do not use manual dotenv loading, extra bootstrap, or env parameters passed through production code.

## Production Exports Stay Direct

Use the real database export. Tests change the environment, not the production code.

```typescript
// Good: direct production export
export const database = new Database({ path: envVariables.DATABASE_URL, ... });
export const db = database.kysely;

// Bad: factory for tests
export function createDatabase(path: string) {}

// Bad: reset wrapper
export function resetConnection() {}
```

In tests, `.env.test` already changes `DATABASE_URL` to `:memory:`. Do not invent another infrastructure path.

## Isolation

Use the real schema in memory. Reset through the project or library's real reset mechanism, not through a test-only production abstraction.
