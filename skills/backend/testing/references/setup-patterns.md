# Setup Patterns

When a test needs previous state, the setup calls the most direct domain operation that produces that state. Do not chain intermediate entry points.

Entry points exist to be tested, not to be used as setup tools. If the test is about feature D, and D needs state produced by A, B, and C, do not exercise A -> B -> C through their entry points as setup. Call the domain functions that create the required state.

Entry-point setup has two costs:

- A break in A, B, or C fails the test for D even though D is not the target.
- The setup carries entry-point ceremony: serialization, output parsing, input validation, routing.

```typescript
// Bad: setup chains entry points and carries extra layers
async function createSetupState(input: string) {
  const raw1 = await callEntryPoint(HandlerA, { input })
  const id = parseOutput(raw1).items[0].id
  const raw2 = await callEntryPoint(HandlerB, { input: id })

  return parseOutput(raw2).items[0].id
}

// Good: setup uses domain operations directly
async function createSetupState(input: string) {
  const results = await EntityService.find(input)
  const derived = await RelatedService.process(results[0].id)

  return derived[0].id
}
```

The setup creates preconditions. It does not test the path that creates those preconditions unless that path is the target of the test.
