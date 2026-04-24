# Time in Tests

When a test manipulates time through `setSystemTime`, capture one reference point and express every moment as a relative offset. Do not use hardcoded ISO dates.

Hardcoded dates hide intent. `'2026-01-16T11:00:00Z'` makes the reader calculate the distance from the previous date. `.add(23, "hours")` communicates the fact that matters.

Hardcoded dates also couple assertions to arbitrary values. If the base date changes, assertions break in a cascade.

```typescript
// Bad: hardcoded dates hide intent
beforeEach(() => { /* ... */ })
afterEach(() => { setSystemTime() })

test("respects grace period", async () => {
  setSystemTime(new Date("2026-01-15T12:00:00Z"))
  await createEntity()
  setSystemTime(new Date("2026-01-16T11:00:00Z"))  // 23h later, but reader must calculate
  await processEntity()
  expect(row.timestamp).toBe("2026-01-15T12:00:00.000Z")
})

// Good: relative offset states intent
const now = dayjs()

beforeEach(() => {
  setSystemTime()
  /* ... */
})

test("respects grace period", async () => {
  await createEntity()
  setSystemTime(now.add(23, "hours").toDate())
  await processEntity()
  expect(row.timestamp).toBeDefined()
})
```

Capture `dayjs()` once in the `describe` scope. Use `.add()` and `.subtract()` to express temporal distance. Call `setSystemTime()` with no arguments in `beforeEach` to reset time; that removes the need for `afterEach` cleanup.
