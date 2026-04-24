---
name: tanstack-router
description: "TanStack Router routes. Use when creating routes, adding route params or search params, validating route inputs, or organizing route-level components and hooks."
---

# TanStack Router

Patterns for TanStack Router with file-based routing.

**Core principle:** pass schemas directly to `validateSearch` and `params`. Do not wrap them with `(x) => schema.parse(x)` and do not add separate `stringifyParams`. The router accepts Standard Schema and handles bidirectional parsing + serialization. Wrappers break serialization and force manual conversion in every `Link`.

For new frontend projects, Zod is the pragmatic default. In existing projects, follow the schema library already used there (Arktype, Zod, Valibot, etc.). Do not introduce Zod only because this skill uses Zod in examples.

## Search Params

If a route reads or owns search params, define a `validateSearch` schema directly. If the route has no search-state contract, do not invent an empty schema.

```tsx
// Good: direct schema
import * as z from "zod";

const searchSchema = z.object({
  page: z.coerce.number().default(1),
  status: z.enum(["pending", "completed"]).optional(),
  from: z.coerce.date().optional(),
});

export const Route = createFileRoute("/app/orders/")({
  component: OrdersPage,
  validateSearch: searchSchema,
});

function OrdersPage() {
  const { page, status } = Route.useSearch(); // type-safe
}
```

```tsx
// Bad: manual wrapper around an existing schema
export const Route = createFileRoute("/app/orders/")({
  component: OrdersPage,
  validateSearch: (search) => searchSchema.parse(search),
});

// Bad: route uses search params without a schema
export const Route = createFileRoute("/app/orders/")({
  component: OrdersPage,
});
```

## Path Params

```tsx
// Good: direct schema in `params`
export const Route = createFileRoute('/items/$id')({
  component: ItemPage,
  params: z.object({
    id: z.coerce.number(),
  }),
})

// In Link, pass the native type. No String(id).
<Link to="/items/$id" params={{ id: item.id }}>...</Link>
```

```tsx
// Bad: manual parseParams + stringifyParams
export const Route = createFileRoute('/items/$id')({
  component: ItemPage,
  parseParams: (params) => paramsSchema.parse(params),
  stringifyParams: ({ id }) => ({ id: String(id) }),
})
```

## Folder Structure

```
routes/app/orders/
├── index.tsx           # Main route
├── -components/        # Route components (dash = ignored by router)
│   ├── OrderList.tsx
│   └── OrderFilters.tsx
└── -utils/             # Route hooks and utils
    └── useOrderFilters.ts
```

Dash-prefixed folders such as `-components` and `-utils` are ignored as routes by TanStack Router.

## Rules

| Aspect | Rule |
|---------|-------|
| Search params | If search params exist, use direct `validateSearch: schema`; never manual wrappers |
| Path params | Direct `params: schema`; never manual `parseParams` / `stringifyParams` |
| Route components | `-components/` folder |
| Route hooks | `-utils/` folder |
