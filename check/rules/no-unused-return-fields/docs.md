## What it does

Flags fields in an object returned from a function that no caller ever reads.

## Why is this bad?

A returned object declares a contract: these fields are useful to the caller. A field nobody reads breaks the contract in the quiet direction — it still compiles, the caller happily ignores it, and the producer spends cycles computing a value that goes nowhere. Either the caller is incomplete, or the producer is computing something it shouldn't. Either way, the shape is lying.

## Examples

Incorrect:

```ts
// src/producer.ts
function parseSource(input: string) {
  return {
    title: input.split(":")[0],
    content: input.split(":")[1],
  };
}

// src/caller.ts
const result = parseSource(raw);
console.log(result.title);
// result.content is never read by any caller
```

Correct:

```ts
// src/producer.ts
function parseSource(input: string) {
  return {
    title: input.split(":")[0],
  };
}

// src/caller.ts
const result = parseSource(raw);
console.log(result.title);
```
