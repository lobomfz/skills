## What it does

Flags an `if (x) { return x }` immediately followed by `return fallback` — where the `if` returns the same expression it tested.

## Why is this bad?

Returning the value you just tested and falling through to a fallback reads as "the truthy case is the exception." It isn't — the fallback is. Inverting the condition puts the exit for the absent case first and lets the happy path flow unindented below. The shape of the code should match where the weight of the function lives.

## Examples

Incorrect:

```ts
function userOrFallback(user: User | null) {
  if (user) {
    return user
  }

  return DEFAULT_USER
}
```

Correct:

```ts
function userOrFallback(user: User | null) {
  if (!user) {
    return DEFAULT_USER
  }

  return user
}
```
