# Mutations and Result Contracts

## Optional Fields

Kysely treats `undefined` as "do not pass this field" and `null` as SQL `NULL`. Pass the value directly, with no conditional spread and no ternary.

```typescript
// Bad: unnecessary spread/ternary
.set({
  status,
  ...(note == null ? {} : { note }),
})

// Good: undefined = field ignored by Kysely
.set({
  status,
  note,
})
```

This also applies when mapping external SDK data to `Insertable<T>`. Do not manually convert `undefined` to `null`.

```typescript
// Bad
.values({
  external_id: sdk.id,
  description: sdk.optionalField ?? null,
})

// Good
.values({
  external_id: sdk.id,
  description: sdk.optionalField,
})
```

## Defaults in INSERTs

In `.values()`, omit fields equal to the column default. Pass only when overriding.

## Read Contracts

`executeTakeFirst()` returns `T | undefined`. Do not convert it to `null`. If the method is a read contract consumed outside the DB layer, return an envelope like `{ data }`.

```typescript
// Bad
async getById(id: number) {
  const result = await db.selectFrom("items as i").where("i.id", "=", id).selectAll("i").executeTakeFirst();

  return result ?? null;
}

// Good
async getById(id: number) {
  const data = await db.selectFrom("items as i").where("i.id", "=", id).selectAll("i").executeTakeFirst();

  return { data };
}
```

Internal queries that keep composing another query or feed a local transformation may carry raw `T | undefined`. The point is not to publish `undefined` as the final return of a read function.

## Mutations

Prefer `.execute()` without a return when you do not need the returned value. Use `.returning()` when the returned row matters.

```typescript
await db.insertInto("items").values(data).execute();

return await db.insertInto("items").values(data).returning("id").executeTakeFirstOrThrow();
```

Do not define an object only to pass it once into `.values()`. If the object only exists to feed the mutation, keep it inline. If you need fields from the row after the mutation, keep `.values()` inline and use `.returning()`.

```typescript
// Bad: extracted object used once
const values = { name: input.name, token: crypto.randomUUID(), status: "active" };
await db.insertInto("items").values(values).execute();

// Good: single use stays inline
await db
  .insertInto("items")
  .values({ name: input.name, token: crypto.randomUUID(), status: "active" })
  .execute();

// Good: use returning for inserted data
const row = await db
  .insertInto("items")
  .values({ name: input.name, token: crypto.randomUUID(), status: "active" })
  .returning(["name", "token"])
  .executeTakeFirstOrThrow();
return { name: row.name, token: row.token };
```

## Ownership in SQL

Validate ownership in the query:

```typescript
// Good
await db
  .updateTable("configs as c")
  .set(data)
  .where("c.id", "=", id)
  .where("c.user_id", "=", user_id)
  .execute();

// Bad
const config = await db.selectFrom("configs").where("id", "=", id).executeTakeFirst();

if (config.user_id !== user_id) {
  throw new Error("NOT_FOUND");
}
```

## Batch Upsert

When you need to update N rows with different values per row, use INSERT ... ON CONFLICT ... DO UPDATE SET with `excluded` refs. Never run a sequential loop of individual UPDATEs.

```typescript
// Bad: sequential update loop
async sync(updates: { id: string; progress: number; status: string }[]) {
  for (const update of updates) {
    await db.updateTable("items").set({ progress: update.progress, status: update.status })
      .where("id", "=", update.id).execute();
  }
}

// Good: batch upsert
async sync(updates: Insertable<DB["items"]>[]) {
  await db.insertInto("items").values(updates)
    .onConflict((oc) => oc.column("id").doUpdateSet({
      progress: (eb) => eb.ref("excluded.progress"),
      status: (eb) => eb.ref("excluded.status"),
    })).execute();
}
```

## .$if()

Use `.$if()` for conditional selected columns, not conditional WHERE clauses.

```typescript
query.$if(includeDetails, (qb) => qb.select(["o.details"]));

if (status) {
  query = query.where("o.status", "=", status);
}

// Bad
query.$if(status, (qb) => qb.where("o.status", "=", status));
```

## $narrowType

Kysely does not automatically narrow types with `.where("col", "is not", null)`. Use `$narrowType` before `.execute()`.

```typescript
const rows = await db
  .selectFrom("orders as o")
  .where("o.entity_id", "is not", null)
  .select(["o.entity_id"])
  .$narrowType<{ entity_id: string }>()
  .execute();
```
