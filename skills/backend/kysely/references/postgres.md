# PostgreSQL

## Runtime Types

The `pg` driver returns `bigint`/`numeric`/`decimal` as strings. `int`/`integer` returns number.

```typescript
const id = BigInt(row.entity_id);
const total = Number(row.total);

eb.cast<number>(eb.fn.countAll(), "int4").as("count");
```

Declared the type? Trust it. If it is `sql<number>`, do not call `Number()` afterward.

## Schema Choices

| Situation | Use | Do not use |
| --- | --- | --- |
| Fixed values | `CREATE TYPE status AS ENUM (...)` | `VARCHAR` |
| Typed arrays | `text[]`, `integer[]` | `jsonb` |
| Fixed JSON structure | Separate columns | `jsonb` |

Use `CREATE TYPE ... AS ENUM` when the possible values of a field are known. Never use `VARCHAR`/`TEXT` with a manual type in code. Enum generates an automatic union type in Kysely: no type assertion, no manual type, no second source of truth.

Native arrays generate `string[]`. Use `jsonb` only when the structure is dynamic/unknown at compile time, or the column stores a discriminated union.

## Typed jsonb Override

When a jsonb column stores a known structure, such as a discriminated union or typed config, override the generated type using `interface extends Omit<...>` with `ColumnType`.

```typescript
// db/types.ts - override generated types
import type { DB as GeneratedDB } from "./generated/types"
import type { ColumnType } from "kysely"

type ItemConfig = VariantA | VariantB

interface ItemsTable extends Omit<GeneratedDB["items"], "config"> {
  config: ColumnType<ItemConfig, ItemConfig, ItemConfig>
}

export interface DB extends Omit<GeneratedDB, "items"> {
  items: ItemsTable
}
```

`ColumnType<SelectType, InsertType, UpdateType>` controls the type in each operation. For typed jsonb, all three are usually the same type.

Every file that uses `DB` as a type parameter imports from the override file, never from the generated file. The generated file is input for the override, not consumed directly.

The schema validates and transforms input. The DB layer receives typed and validated data: no validation, normalization, or extraction in query code. The override ensures Kysely propagates the correct type in selects without manual casts.
