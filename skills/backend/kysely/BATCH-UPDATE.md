When you need to update N rows with different values per row, the first option is batch upsert (`INSERT ... ON CONFLICT ... DO UPDATE SET`) documented in `SKILL.md`. But batch upsert requires passing a complete row compatible with `Insertable<table>`. If the table has `NOT NULL` columns without defaults and you do not have values for them, the INSERT fails before reaching `ON CONFLICT`.

In those cases, use `UPDATE ... FROM (VALUES ...)` through the `values` helper in `@Api/helpers/values.ts`.

The helper receives an array of objects plus an alias, and returns a Kysely subexpression that can be used in `.from()`. It generates SQL equivalent to:

```sql
UPDATE target
SET col = v.col
FROM (VALUES (...), (...)) AS v(col1, col2)
WHERE target.id = v.id
```

Usage:

```typescript
import { values } from "@Api/helpers/values";

const result = await db
  .updateTable("target_table")
  .from(values(items, "v"))
  .set({
    status: "processed",
    related_id: (eb) => eb.ref("v.related_id"),
  })
  .whereRef("target_table.id", "=", "v.item_id")
  .where("target_table.status", "=", "pending")
  .executeTakeFirst();
```

Here, `items` is an array of objects whose keys correspond to the names used in the alias, for example `{ item_id: string; related_id: string }`.

Rules:

- The alias (second argument) defines the ref prefix. If the alias is `"v"`, the columns are `v.col1`, `v.col2`.
- Literal values in `.set()` go directly. Values that come from the array use `(eb) => eb.ref("v.field")`.
- `.whereRef()` (not `.where()`) connects the target table to the alias. It is an implicit join.
- Add extra `.where()` clauses on the target table to restrict affected rows, such as a status guard.
- Every object in the array must have the same keys. The helper uses `Object.keys(records[0])` to define the columns.
- PostgreSQL types every `VALUES` column as `text`. If the target join/where column is `uuid`, `integer`, or another non-text type, use `eb.cast` on the alias reference to match the types. Without the cast, Postgres rejects the comparison with a type mismatch.

```typescript
// Bad: type mismatch. v.item_id is text, target.id is uuid.
.where("target_table.id", "=", sql<SqlBool>`v.item_id::uuid`)

// Bad: redundant eb.ref inside eb.cast.
.where("target_table.id", "=", (eb) => eb.cast(eb.ref("v.item_id"), "uuid"))

// Good: eb.cast accepts a string reference directly.
.where("target_table.id", "=", (eb) => eb.cast("v.item_id", "uuid"))
```

When to use batch upsert vs `UPDATE FROM VALUES`:

- Batch upsert: you have every field needed for a valid INSERT, or the table accepts defaults for missing columns.
- `UPDATE FROM VALUES`: you only have the fields to update plus the join key, and the table has `NOT NULL` columns you cannot fill.

Do not use sequential loops of individual UPDATEs in either case.
