# Assertions

Never pass a promise directly to `expect()` with `.resolves` or `.rejects`. Resolve the promise yourself with `await`, then assert on the concrete value.

`.resolves` and `.rejects` create an implicit chain that hides the resolution moment, makes debugging harder, and breaks the test's linear reading. A test should read like normal code: await, then assert.

```typescript
// Bad: .resolves hides the await inside the matcher
await expect(service.process(input)).resolves.toBeDefined()
await expect(service.process(input)).resolves.toEqual({ id: "123" })

// Good: explicit await, assertion on value
const result = await service.process(input)
expect(result).toBeDefined()
expect(result).toEqual({ id: "123" })

// Bad: .rejects hides the catch inside the matcher
await expect(service.process(input)).rejects.toThrow(/pattern/)

// Good in Bun: arrow function + toThrow handles thrown errors and promise rejections
expect(() => service.process(input)).toThrow(/pattern/)
```
