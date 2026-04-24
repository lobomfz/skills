## What it does

Flags aliases that only rename the final property of a shallow access: `const x = obj.prop` where the local name matches the accessed property and the access is fewer than three levels deep.

Chains with real navigation are allowed: dynamic lookups (`map[key].prop`) and bases that are function/constructor calls (`Bun.file(path).size`, `new Foo().bar`). These perform real work — the alias captures the result of a computation, not just a 1:1 rename.

## Why is this bad?

A name is a commitment — it promises to hide complexity worth hiding. Renaming `obj.prop` to `prop` hides nothing: the consumer could have written `obj.prop` directly. The local adds a line, a scope, and a naming decision that wasn't needed. Deep chains (three or more levels), dynamic lookups, and calls earn their slot by hiding real navigation or computation.

## Examples

Incorrect:

```ts
function render(product: Product) {
  const title = product.title

  return `# ${title}`
}
```

Correct:

```ts
function render(product: Product) {
  return `# ${product.title}`
}
```
