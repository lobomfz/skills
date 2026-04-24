---
name: arktype
description: "Arktype schemas. Use when defining, composing, validating, deriving types from, or debugging Arktype schemas."
---

# Arktype

Use Arktype as the source of truth for boundary validation and derived types.

## Core Rules
- Group schemas in domain objects such as `OrderSchemas.create`.
- Infer TypeScript types from schemas. Do not declare parallel interfaces.
- Validate with `.assert()`. Avoid `schema(value)` plus manual error checks.
- Use `.or()` for discriminated unions and `.and()` to compose schemas.
- Use `.pick()` when reusing multiple fields from an existing schema. For one field, declare it directly.
- Use `?` in the field name for optional fields.
- Prefer `type.enumerated()` over literal unions wherever possible, including discriminants.
- Prefer broad primitive contracts over hyper-specific checks. Use `"number"` before `"number.integer"` and `"string"` before format/min/max checks unless the boundary truly needs that constraint.
- Endpoints receive typed objects, never JSON strings.

```typescript
const status = type.enumerated("pending", "active", "done");
const OrderSchemas = {
  create: type({
    items: type({ product_id: "number", quantity: "number" }).array(),
    "notes?": "string",
    status,
  }),
  update: type({
    id: "number",
    "status?": status,
  }),
};

export type OrderData = typeof OrderDataSchema.infer;
const payload = OrderSchemas.create.assert(input);
```

## Composition
Discriminated unions use separate schemas with an enumerated discriminant.

```typescript
const stripeType = type.enumerated("stripe");
const paypalType = type.enumerated("paypal");
const stripeConfig = type({
  type: stripeType,
  api_key: "string",
});
const paypalConfig = type({
  type: paypalType,
  client_id: "string",
  secret: "string",
});
export const PaymentConfigSchema = stripeConfig.or(paypalConfig);
const paginatedSearch = searchInput.and(paginationInput);
```

## Field Validation
Schemas should prove the contract needed at the boundary, not encode every possible preference. Add integer, range, length, and format checks only when the domain or downstream operation actually depends on them.

Use field-level `.pipe()` for normalization.

```typescript
type({
  name: type("string").pipe((v) => v.trim()),
  "age?": "number",
  email: "string",
  items: itemSchema.array(),
  status,
});
```

Never use `.pipe()` on a whole schema that will be composed with `.and()`. Whole-schema pipes change the output type and can make intersections lose base fields.

```typescript
const base = type({ id: "number" });
const badExtra = type({ name: "string" }).pipe((v) => ({ ...v, slug: v.name.toLowerCase() }));
const broken = base.and(badExtra);

const goodExtra = type({ name: type("string").pipe((v) => v.toLowerCase()) });
const combined = base.and(goodExtra);
```

## Typed Subsets
When a schema receives a larger object and must extract only declared fields, use `'+': 'delete'`. Undeclared keys are removed. The result contains only what the schema defines.

```typescript
const configSchema = type({
  '+': 'delete',
  threshold: "number",
  enabled: "boolean",
});

const clean = configSchema.assert({ threshold: 10, enabled: true, extra: "ignored" });
// { threshold: 10, enabled: true }
```

Useful when one endpoint input contains data for multiple layers and each layer extracts its own part with its own schema.

## Common Anti-Patterns
- Do not declare manual interfaces for schema outputs.
- Do not validate with `schema(value)` and inspect `type.errors`.
- Do not use literal unions when `type.enumerated()` works.
- Do not use `.pick()` for one field.
- Do not add integer/range/format checks just because Arktype can express them.
- Do not pipe whole schemas that will be composed.
