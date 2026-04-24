## What it does

Disallows `await` expressions inside the condition of an `if` statement.

## Why is this bad?

An `if (await ...)` collapses two distinct gestures — resolving an async value and branching on it — into a single line. The resolved value has no name and can't be referenced in the branches that follow; if either branch needs it, the next natural step is a second `await`, and you have the same work twice. Pulling the `await` out and binding it to a `const` before the `if` makes the dependency explicit and reusable, and keeps the condition about branching, not computation.

## Examples

Incorrect:

```ts
async function grant(userId: string) {
  if (await Db.userIsActive(userId)) {
    return allow(userId)
  }

  return deny(userId)
}
```

Correct:

```ts
async function grant(userId: string) {
  const isActive = await Db.userIsActive(userId)

  if (!isActive) {
    return deny(userId)
  }

  return allow(userId)
}
```
