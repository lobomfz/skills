# Expression Builder

Kysely can usually express the query type-safely. If the syntax differs from hand-written SQL, learn the Kysely shape before reaching for raw `sql`.

Raw `sql` is acceptable inside expressions the builder cannot express, such as complex `CASE WHEN` or database-specific functions. Never use raw SQL for entire queries.

## Conditional Aggregations

When one query needs multiple aggregates with different filters over the same base data, use a CTE + `selectNoFrom` with scalar subselects. Do not use `FILTER (WHERE ...)` in raw SQL inside one SELECT.

```typescript
return await db
  .with("base", (eb) =>
    eb
      .selectFrom("source_table as s")
      .where("s.owner_id", "=", ownerId)
      .where("s.deleted_at", "is", null)
      .select(["s.state", "s.created_at", "s.amount"]),
  )
  .selectNoFrom((eb) =>
    eb.selectFrom("base").select(eb.cast<number>(eb.fn.countAll(), "int4").as("total")).as("total"),
  )
  .select((eb) =>
    eb
      .selectFrom("base")
      .where("base.state", "in", ["STATE_A", "STATE_B"])
      .select(eb.cast<number>(eb.fn.countAll(), "int4").as("filtered"))
      .as("filtered"),
  )
  .select((eb) =>
    eb
      .selectFrom("base")
      .where("base.created_at", ">=", cutoffDate)
      .select(sql<number>`sum(base.amount)::int`.as("periodTotal"))
      .as("periodTotal"),
  )
  .executeTakeFirstOrThrow();
```

Each subselect is typed individually and each conditional filter remains visible in the builder.

## coalesce

```typescript
// Bad: raw SQL coalesce
sql<string>`coalesce(t.preferred_name, t.full_name)`.as("display_name")

// Good: expression builder
(eb) => eb.fn.coalesce("t.preferred_name", "t.full_name").as("display_name")
```

## cast

When the inner expression can be expressed by the builder, use `eb.cast`. The generic is required to type the result. `eb.cast` accepts string references directly; no `eb.ref()` wrapper is needed.

```typescript
// Bad: raw SQL cast
sql<number>`count(*)::int`.as("total")
sql<number>`t.raw_amount::float8`.as("amount")

// Good: expression builder cast
eb.cast<number>(eb.fn.countAll(), "int4").as("total")
(eb) => eb.cast<number>("t.raw_amount", "float8").as("amount")

// Bad: redundant eb.ref
(eb) => eb.cast<number>(eb.ref("t.raw_amount"), "float8").as("amount")
```

When the inner expression is already complex SQL, such as `coalesce(sum(...), 0)` or `CASE WHEN`, `sql<T>` with `::type` remains acceptable.

## exists

To check whether a relation exists, use `eb.exists()` with a subquery. Never use `count(*) > 0`; it counts everything when the query only needs to know whether one row exists, and it breaks the type chain.

```typescript
// Bad: count(*) > 0
(eb) =>
  eb
    .selectFrom("related as r")
    .whereRef("r.parent_id", "=", "p.id")
    .select(sql<boolean>`count(*) > 0`.as("has_related"))
    .as("has_related")

// Good: exists
(eb) =>
  eb
    .exists(
      eb
        .selectFrom("related as r")
        .whereRef("r.parent_id", "=", "p.id")
        .selectAll()
    )
    .as("has_related")
```

The subquery inside `exists()` needs `.selectAll()` or any `.select()` to generate valid SQL. The selected content is irrelevant.
