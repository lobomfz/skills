---
name: orpc
description: "ORPC APIs. Use when creating procedures, routers, middlewares, scoped errors, endpoint schemas, or route/domain API structure."
---

# ORPC

Use ORPC routers as transport wiring. Domain/database objects own behavior.

## Procedures

Global errors live on the base procedure. Compose middlewares with `.use()`.

Endpoint-specific errors stay scoped to the endpoint with `.errors({ CODE: {} })`. Backend errors expose codes, not human-facing messages. Frontend owns translated/display text.

Use `.input(schema)` for input boundaries. Do not define output schemas by reflex; outputs are inferred from the handler result. No input means no `.input(type({}))`.

## Domain Shape

Use one domain schema object per domain. Router and DB/manager code derive input types from the schema; do not redeclare input shapes.

Typical ownership:

- `schemas.ts`: operation schemas
- `db.ts`: database operations, authorization/visibility predicates in SQL
- `router.ts`: pure transport dispatch
- `manager.ts`: orchestration when user/request context colors multiple operations

Use a Manager/class when identity or request context is reused across several methods. Do not pass user/headers through every function when they are the object identity.

## Router Dispatch

Handlers that only call one owner should stay as bodyless arrow expressions and return the promise directly.

```ts
update: protectedProcedure
  .input(ItemSchemas.update)
  .handler(({ input, context }) => DbItems.update(context.user.id, input)),
```

Do not destructure input just to pass its fields onward. Pass the whole input.

If a handler validates, transforms, branches, catches errors, or coordinates more than one operation, move that logic to the domain owner or Manager.

## Read Contracts

Handlers must not return `undefined`. Suspense clients crash on `undefined` data.

If a DB read uses `executeTakeFirst`, wrap the result in an object such as `{ data }`. The inner field may be absent; the endpoint result itself may not. Use `executeTakeFirstOrThrow` when absence is impossible or exceptional.

Read endpoints should match the visual/use-case contract. If one visual unit needs facts from multiple tables, prefer an aggregate read in the owning domain over assembling the contract in the component.

## Mutations

Use PATCH-like update endpoints with optional fields when fields can coexist.

Avoid `updateName`, `updateStatus`, `updateType` splits unless each operation has different authorization, side effects, or domain meaning.

## Headers And Cookies

Middleware puts request/response headers into context. Classes that manage auth/session behavior receive the relevant `Headers` in the constructor instead of threading headers through every method.

## Testing

Do not test ORPC endpoints with raw `curl`. Use the typed ORPC client or automated tests, because protocol details like headers, serialization, and path encoding matter.
