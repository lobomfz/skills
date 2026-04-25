# no-export-function

Do not export loose functions.

```ts
export function calculateOrderTotal(order: Order) {
  return order.items.reduce((total, item) => total + item.price, 0)
}
```

```ts
export const calculateOrderTotal = (order: Order) => {
  return order.items.reduce((total, item) => total + item.price, 0)
}
```

Default exports are outside this rule's scope.

TSX files are outside this rule's scope.

Prefer putting behavior on the owning object.

```ts
export const Orders = {
  calculateTotal(order: Order) {
    return order.items.reduce((total, item) => total + item.price, 0)
  },
}
```

Do not rewrite a function declaration into an exported arrow function only to
silence this rule. If the code genuinely needs to remain a loose exported
function, ask the human to approve a local lint disable with a reason.

```ts
// oxlint-disable-next-line lobomfz/no-export-function -- public API requires a function declaration
export function loadDocs(metaUrl: string) {
  return readDocs(metaUrl)
}
```
