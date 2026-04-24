## What it does

Flags `type X = Named & { inline }` — intersection types that combine a named reference with an inline object literal — and asks for `interface X extends Named { inline }` instead.

## Why is this bad?

Interfaces resolve statically; intersection types are evaluated lazily on use. In practice that means slower type-checking, harder errors to read, and messier hover output. For the same structural shape, `interface X extends Y { ... }` is the cheaper form — both for the compiler and for whoever reads the type.

Intersections are still the right tool when combining two named types (`type Merged = A & B`) or in generic positions where `extends` can't go. The rule targets only the specific pattern the rule ships against: adding inline fields on top of a named base.

## Examples

Incorrect:

```ts
type CreateInput = BaseInput & {
  name: string
  email: string
}

type WithMetadata<T> = T & {
  created_at: Date
}
```

Correct:

```ts
interface CreateInput extends BaseInput {
  name: string
  email: string
}

interface WithMetadata<T> extends Base<T> {
  created_at: Date
}

// fine — pure composition, no inline additions
type Merged = A & B
```
