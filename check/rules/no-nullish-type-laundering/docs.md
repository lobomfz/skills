## What it does

Flags `?? null` and `?? undefined` (including `?? void 0`) — using nullish coalescing to translate one absence value to another.

## Why is this bad?

`x ?? null` and `x ?? undefined` do one of two things: translate `undefined` to `null` (or vice versa), or are noop when the type already matches. Either way, the fallback isn't handling absence — it's reshaping the type to hide an incompatibility that lives upstream.

If the value can legitimately be absent, that's a domain fact: make the shape consistent upstream and the consumer handles absence explicitly (if, early-return) when it matters. If it can't be absent, the fallback is dead code and the assertion belongs in the type.

Other `??` uses (e.g. `?? 0`, `?? ''`, `?? defaultObject`) are left to human judgment — they can be legitimate defaults for domain-valid absence, or laundering of required data. A linter can't tell the difference statically.

## Examples

Incorrect:

```ts
function buildProfile(input: { avatar?: string }) {
  return {
    avatar: input.avatar ?? null,
  }
}
```

Correct:

```ts
function buildProfile(input: { avatar?: string }) {
  return {
    avatar: input.avatar,
  }
}
```
