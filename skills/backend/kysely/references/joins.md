# Joins and Relationship Shapes

Use joins or SQL subqueries for related data. Do not fetch rows separately, build a `Map`, and stitch results in JavaScript.

## Never: Fetch + Map Lookup

```typescript
// Bad: separate fetch + Map lookup
const items = await db.selectFrom("items as i").selectAll("i").execute();
const entities = await db
  .selectFrom("entities as e")
  .where(
    "e.id",
    "in",
    items.map((i) => i.entity_id),
  )
  .selectAll("e")
  .execute();
const entityMap = new Map(entities.map((e) => [e.id, e]));
return items.map((item) => ({ ...item, entity: entityMap.get(item.entity_id) }));

// Good: one query with JOIN
return await db
  .selectFrom("items as i")
  .innerJoin("entities as e", "e.id", "i.entity_id")
  .select(["i.id", "i.status", "e.name as entity_name"])
  .execute();
```

## Join Syntax

```typescript
.innerJoin("users as u", "u.id", "o.user_id")

.leftJoin("downloads as d", (join) =>
  join.onRef("d.order_id", "=", "o.id").on("d.status", "=", "completed")
)
```

## Parent + Children

When fetching an entity with a 1:N relationship, use `jsonArrayFrom` in one query. The expected shape is `{ ...parent, children: [...] }`. `jsonArrayFrom` returns `[]` when there are no children, never `null`.

```typescript
// Bad: two sequential queries + manual merge
async getById(id: string) {
  const parent = await db.selectFrom("parents as p").where("p.id", "=", id).selectAll("p").executeTakeFirst();

  if (!parent) {
    return null;
  }

  const children = await db.selectFrom("children as c").where("c.parent_id", "=", id).selectAll("c").execute();

  return { ...parent, children };
}

// Good: one query with jsonArrayFrom
async getById(id: string) {
  const data = await db
    .selectFrom("parents as p")
    .where("p.id", "=", id)
    .selectAll("p")
    .select((eb) =>
      jsonArrayFrom(
        eb
          .selectFrom("children as c")
          .whereRef("c.parent_id", "=", "p.id")
          .orderBy("c.created_at", "desc")
          .selectAll("c"),
      ).as("children"),
    )
    .executeTakeFirst();

  return { data };
}
```
