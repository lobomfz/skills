## What it does

Flags two patterns in `catch` clauses:

1. `catch (err: unknown)` — forcing narrowing at every use site.
2. `err instanceof Error` checks against the catch parameter inside the `catch` body.

## Why is this bad?

In practice, 99% of thrown values are `Error` instances. The ritual of `err instanceof Error ? err.message : String(err)` never changes behavior — it translates a rare edge case (someone threw a string or number) into the same message the default path would produce. The check is noise that competes with the real error-handling logic.

`catch (err: unknown)` forces that ritual on every access. `catch (err: any)` is the narrow exception where `any` is the right tool: the type of a thrown value is genuinely unknown at the language level, and reaching for `err.message` is the correct default. If a specific thrown type matters (custom error classes, library-specific errors), narrow explicitly against that class — `err instanceof AxiosError`, `err instanceof ValidationError`. That narrowing is useful; narrowing against the universal base is theater.

## Examples

Incorrect:

```ts
try {
  await fetchUser()
} catch (err: unknown) {
  log(err instanceof Error ? err.message : String(err))
}

try {
  await fetchUser()
} catch (err) {
  if (err instanceof Error) {
    log(err.message)
  } else {
    log('Unknown')
  }
}
```

Correct:

```ts
try {
  await fetchUser()
} catch (err: any) {
  log(err.message)
}

// specific subtype — legitimate narrowing
try {
  await api.get('/users')
} catch (err: any) {
  if (err instanceof AxiosError) {
    return handleAxios(err)
  }

  throw err
}
```
