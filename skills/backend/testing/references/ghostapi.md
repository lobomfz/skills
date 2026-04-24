# GhostAPI

Use `@lobomfz/ghostapi` for any external HTTP integration. Production code makes a real HTTP request; the test controls the server response.

## Quick Start

```typescript
import { Mock } from "@lobomfz/ghostapi";
import { type } from "arktype";

const customerSchema = type({
  id: "string",
  plan: "string",
});

export const StripeMock = new Mock(
  { customers: customerSchema },
  (app, { db }) => {
    app.get("/customers/:id", ({ params }) => {
      return db
        .selectFrom("customers")
        .selectAll()
        .where("id", "=", params.id)
        .executeTakeFirst();
    });

    app.post(
      "/customers/:id/subscription",
      async ({ params, body }) => {
        await db
          .updateTable("customers")
          .set({ plan: body.plan })
          .where("id", "=", params.id)
          .execute();

        return db
          .selectFrom("customers")
          .selectAll()
          .where("id", "=", params.id)
          .executeTakeFirst();
      },
      {
        body: customerSchema,
      },
    );

    return {
      seedCustomer: (id: string, plan: string) =>
        db.insertInto("customers").values({ id, plan }).execute(),
    };
  },
  { port: 4100 },
);
```

```typescript
await StripeMock.helpers.seedCustomer("cus_123", "free");

const customer = await updateSubscription("cus_123", "pro");

expect(customer.plan).toBe("pro");

StripeMock.reset();
```

## Mock Shape

One mock is one exported `const`. No factories, no wrappers, no redundant helpers.

```typescript
// Good
export const SearchApiMock = new Mock(..., { port: 4100 });

// Bad
export function createSearchApiMock() {
  return new Mock(...);
}

// Bad
export class SearchApiMockWrapper {
  private mock = new Mock(...);
}
```

## Rules

- `new Mock()` is already the factory.
- Recurring seeding/cleanup operations are helpers returned by the setup callback.
- The type of `mock.helpers` is inferred from the callback return.
- `.db` remains available for ad-hoc queries in a specific test.
- If an operation appears in more than one test, it belongs in helpers.
- Use `.reset()` instead of creating `resetMock()`.
- For fixed shared ports, pass `{ port }` or `{ base_url }` to the constructor.
- If you need different configuration, change `new Mock(...)`; do not create another layer.
- Do not add `mock.app.stop()` by reflex; in `bun test`, `Mock` listeners usually do not need manual cleanup.

## Handler Body Typing

Type request bodies in the route's third argument. Never use a type assertion.

```typescript
// Bad: loses validation and hides errors
app.post("/endpoint", async ({ body }) => {
  const payload = body as { field: string };
});

// Good: body is validated and typed
app.post(
  "/endpoint",
  async ({ body }) => {
    return body.field;
  },
  {
    body: type({ field: "string" }),
  },
);
```

Use an inline schema when the shape exists only for that handler. Reuse an existing schema when the body matches something already defined in the mock.

## Organization

```text
tests/
  mocks/
    stripe.ts
    search-api.ts
    notifications.ts
  integration/
    billing.test.ts
```

## Notes

- Booleans in SQLite may appear as `0`/`1`.
- `Mock` accepts standard-schema libraries, including ArkType and Zod.
- Production code must read base URLs through env (`STRIPE_API_URL`, etc.).
