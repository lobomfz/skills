# no-nullish-coalescing

Do not use nullish coalescing.

```ts
const name = input.name ?? "Anonymous";
```

```ts
options.timeout ??= 1000;
```

Absence is a domain fact. If the value is required, the boundary should reject it
or the caller should return early. If the value is optional, branch where that
absence matters so the fallback stays visible as behavior instead of becoming a
silent type/value rewrite.

Prefer explicit control flow.

```ts
if (!input.name) {
  return "Anonymous";
}

return input.name;
```
