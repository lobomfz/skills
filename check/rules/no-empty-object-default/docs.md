## What it does

Flags `= {}` as a default for any assignment pattern — function parameters, destructuring, object property shorthand.

## Why is this bad?

An empty object default hides whether the caller passed nothing or forgot. When the function signature says `(filters = {})`, `fn()` and `fn({})` become indistinguishable — the call site can no longer communicate intent, and the empty object isn't a real choice, it's a placeholder for "I don't know what the caller meant."

Primitive defaults (`timeout = 5000`, `retries = 3`) are different — they express a concrete decision. `{}` doesn't. The fix is to drop the default: if the parameter is genuinely optional at the domain level, the type should say so (`filters?: Input`) and the function should handle absence explicitly.

## Examples

Incorrect:

```ts
function stats(filters: Input = {}) {
  return db.query(filters)
}

const getConfig = (opts = {}) => ({ ...defaults, ...opts })

function render({ title, subtitle } = {}) {
  return `${title} — ${subtitle}`
}
```

Correct:

```ts
function stats(filters: Input) {
  return db.query(filters)
}

const getConfig = (opts: Options) => ({ ...defaults, ...opts })

function render({ title, subtitle }: Props) {
  return `${title} — ${subtitle}`
}
```
