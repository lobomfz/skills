## What it does

Flags `queryOptions().queryKey`.

## Why is this bad?

`queryOptions()` builds the full query options object for query hooks. When the
caller only needs the key, reading it back from the options object adds an
unnecessary detour and hides the direct generated API: `queryKey()`.

## Examples

Incorrect:

```ts
query.invalidateQueries({
  queryKey: orpc.tasks.search.queryOptions({ status: 'open' }).queryKey,
})
```

Correct:

```ts
query.invalidateQueries({
  queryKey: orpc.tasks.search.queryKey({ status: 'open' }),
})
```
