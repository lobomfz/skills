---
name: kysely
description: "Kysely database queries. Use when writing, reviewing, or debugging Kysely selects, mutations, joins, transactions, filters, or aggregates."
---

# Kysely

Use this skill for any Kysely query: selects, mutations, joins, transactions, filters, aggregates, or query review.

## Core Rules

- SELECT queries use table aliases, including subqueries. Mutations do not need aliases.
- DB operations live in domain/table objects such as `DbUsers`, usually one file per table/domain.
- Put filters, ownership, authorization, and visibility in SQL. Do not fetch first and filter in JS.
- Use joins or `jsonArrayFrom` for related data. Do not fetch rows, build a `Map`, and stitch results by hand.
- `executeTakeFirst()` read contracts return an envelope like `{ data }`; do not publish `T | undefined` or convert absence to `null`.
- Prefer typed expression-builder APIs over raw SQL. Raw `sql` is for expressions the builder cannot express, never whole queries.
- Pass optional `.set()` / `.values()` fields directly. `undefined` means absent; `null` means SQL `NULL`.
- Use `.execute()` for mutations when you do not need returned values. Use `.returning()` only when the returned row matters.
- Batch independent writes. Prefer set-based SQL or batch upsert over sequential loops.
- Do not extract `.values()` into a single-use variable. Inline the mutation input; use `.returning()` for values confirmed by the DB.

## PostgreSQL Types

The `pg` driver returns `bigint`, `numeric`, and `decimal` as strings. `int` and `integer` return numbers. Cast counts and numeric expressions in SQL when the result should be a number:

```typescript
eb.cast<number>(eb.fn.countAll(), "int4").as("count");
```

If an expression is already declared as `sql<number>`, trust that type and do not call `Number()` afterward.

Use database schema types as the source of truth:

| Situation | Use | Do not use |
| --- | --- | --- |
| Fixed values | `CREATE TYPE status AS ENUM (...)` | `VARCHAR` with a manual TS union |
| Typed arrays | `text[]`, `integer[]` | `jsonb` |
| Fixed JSON structure | Separate columns | `jsonb` |

Use typed `jsonb` only for dynamic structures, discriminated unions, or config objects that are genuinely stored as one blob. Override generated types with `interface extends Omit<...>` and `ColumnType`; import `DB` from the override file, not the generated file.

## Expression Builder

Prefer expression-builder APIs when Kysely can express the query. Raw `sql` is for expressions the builder cannot express, not whole queries.

- Use a CTE plus scalar subselects for multiple filtered aggregates over the same base data.
- Use `eb.fn.coalesce(...)` instead of raw `coalesce(...)` when the builder can express it.
- Use `eb.cast<T>(...)` for casts. `eb.cast` accepts string references directly; do not wrap them in `eb.ref()`.
- Use `eb.exists(...)` for relation existence checks. Do not use `count(*) > 0`.

## Query Shape

```typescript
export const DbItems = {
  async listByUserId(user_id: number, filters: ItemFilters) {
    let query = db.selectFrom("items as i").where("i.user_id", "=", user_id);

    if (filters.category_id) {
      query = query.where("i.category_id", "=", filters.category_id);
    }

    const data = await query.selectAll("i").execute();

    return { data };
  },

  async getById(id: number) {
    const data = await db
      .selectFrom("items as i")
      .where("i.id", "=", id)
      .selectAll("i")
      .executeTakeFirst();

    return { data };
  },
};
```

## Decision Map

| Situation | Use |
| --- | --- |
| Parent with children | `jsonArrayFrom` in one query |
| Need fields from another table | JOIN, not fetch + `Map` |
| Conditional selected columns | `.$if()` |
| Conditional WHERE | normal `if` that reassigns `query` |
| Boolean "does relation exist?" | `eb.exists()` |
| WHERE narrowed nullable column | `$narrowType` before `.execute()` |
| Multiple filtered aggregates over same base | CTE + scalar subselects |
| N updates with different row values | INSERT ... ON CONFLICT ... DO UPDATE |

## References

Read the reference that matches the query before writing or judging it:

- `references/joins.md` when related rows, joins, parent/children shapes, or fetch-plus-merge code appears.
- `references/expression-builder.md` when aggregates, `coalesce`, `cast`, `exists`, or raw SQL appears.
- `references/postgres.md` when runtime numeric types, enum schema choices, arrays, or typed `jsonb` appears.
- `references/mutations.md` when insert/update/delete code, optional fields, read envelopes, ownership predicates, batch upsert, `.$if`, or `$narrowType` appears.
- `BATCH-UPDATE.md` when many rows need different update values.
