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

Read only the reference that matches the query you are writing:

- `references/joins.md` - joins, `jsonArrayFrom`, parent/children result shapes.
- `references/expression-builder.md` - conditional aggregates, `coalesce`, `cast`, `exists`, raw SQL policy.
- `references/postgres.md` - `pg` runtime types, enum schema choices, typed `jsonb` overrides.
- `references/mutations.md` - optional fields, read envelopes, ownership predicates, batch upsert, `.$if`, `$narrowType`.
- `BATCH-UPDATE.md` - detailed batch update/upsert patterns.
