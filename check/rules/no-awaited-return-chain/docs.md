# no-awaited-return-chain

Do not chain from an awaited value directly in a return.

```ts
return (await query.execute()).map((row) => mapRow(row))
```

Prefer naming the awaited result first.

```ts
const rows = await query.execute()

return rows.map((row) => mapRow(row))
```
