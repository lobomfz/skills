---
name: tanstack-router
description: "TanStack Router routes. Use when creating routes, adding route params or search params, validating route inputs, or organizing route-level components and hooks."
---

# TanStack Router

Patterns for TanStack Router with file-based routing.

**Core principle:** `validateSearch` accepts a Standard Schema directly. `params` (path) requires `{ parse, stringify }` — passing a schema directly is silently ignored and `useParams()` returns the raw URL string.

For new frontend projects, Zod is the pragmatic default. In existing projects, follow the schema library already in use.

## Search Params

Pass a Standard Schema directly. Do not invent an empty schema for routes without search state.

```tsx
import * as z from "zod";

const searchSchema = z.object({
  page: z.coerce.number().default(1),
  status: z.enum(["pending", "completed"]).optional(),
});

export const Route = createFileRoute("/app/orders/")({
  component: OrdersPage,
  validateSearch: searchSchema, // never `(x) => schema.parse(x)`
});
```

## Path Params

Coerce inside `params.parse`, never with `Number.parseInt` in the component.

```tsx
import * as z from "zod";

const paramsSchema = z.object({ id: z.coerce.number() });

export const Route = createFileRoute("/items/$id")({
  component: ItemPage,
  params: {
    parse: (raw) => paramsSchema.parse(raw),
    stringify: ({ id }) => ({ id: String(id) }),
  },
});

<Link to="/items/$id" params={{ id: item.id }}>...</Link>;
```

For arktype, use `paramsSchema.assert(raw)` in `parse`. The deprecated top-level `parseParams` / `stringifyParams` are replaced by `params: { parse, stringify }`.

## Folder Structure

Dash-prefixed folders are ignored as routes. Put route components in `-components/` and route hooks in `-utils/`.

## Rules

| Aspect | Rule |
|---------|-------|
| Search params | Pass a Standard Schema directly to `validateSearch` |
| Path params | Use `params: { parse, stringify }`; schema-direct is silently ignored |
| Path param coercion | Inside `params.parse`, never `Number.parseInt` in the component |
| Route components | `-components/` folder |
| Route hooks | `-utils/` folder |
