## What it does

Flags `x ? x.y : undefined` (and `x ? x() : void 0`) — a ternary that reproduces what optional chaining already expresses.

## Why is this bad?

Optional chaining was designed for this exact shape: "if `x` is nullish, give me `undefined`; otherwise follow the access." The ternary form spells out the same logic in more characters, with `x` repeated on both sides, and without signaling "this is a nullish guard" to the reader. `x?.y` makes the intent obvious at a glance.

The rule only targets the specific alignment: test is a single identifier, the consequent's access root is the same identifier, and the alternate is `undefined`. Other alternates (`null`, domain defaults) represent a different decision and stay untouched — if the fallback matters, that's an `??` problem, not an optional-chain one.

## Examples

Incorrect:

```ts
const expires = session ? session.expiresAt.toISOString() : undefined

const name = user ? user.getName() : void 0

const value = obj ? obj.a.b.c : undefined
```

Correct:

```ts
const expires = session?.expiresAt.toISOString()

const name = user?.getName()

const value = obj?.a.b.c
```
