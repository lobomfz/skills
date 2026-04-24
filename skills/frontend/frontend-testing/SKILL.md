---
name: frontend-testing
description: "React frontend tests. Use when writing, editing, or reviewing component, flow, or hook tests in *.test.tsx files."
---

# Frontend Testing

Components publish observable state through raw `data-*` attributes. Tests consume that contract through DOM-first helpers.

No role/text queries, no assertions on formatted text, no CSS/class assertions.

## Observable Contract

Components with tests publish `data-component="kebab-name"` on the root element.

Observable state becomes raw `data-*` attributes:

- numbers are unrounded values
- dates are ISO strings
- booleans are boolean values
- enums are literal domain strings
- absence omits the attribute

Pass values directly unless conversion is genuinely required by the source value. Do not stringify booleans or numbers manually. Do not turn absence into `null`, `"null"`, `"undefined"`, or `""`.

```tsx
data-active={response.active}
data-id={response?.id}
```

Visual formatting stays in JSX. Tests assert on raw `dataset` values.

Use entity-specific IDs: `data-media-id`, `data-download-id`, `data-release-id`. Never `data-id`.

Interactive children publish `data-slot="semantic-name"` scoped by the parent.

Only publish attributes a test consumes. Add a new attribute in the same change as the test that uses it. If the last consumer disappears, remove the attribute.

## Test Helpers

Use the project DOM helpers, usually `get`, `query`, and `slot` from `tests/web/dom.ts`.

- `get(component, filters?)`: returns exactly one element or throws.
- `query(component, filters?)`: returns one element, `null`, or throws on many.
- `slot(parent, name)`: returns a named child slot.

DOM attributes are strings in filters: `{ ratio: "0.65" }`, not `{ ratio: 0.65 }`.

Use the project testing-library wrapper, usually `tests/web/testing-library.ts`. It should expose only approved APIs such as `render`, `renderHook`, `waitFor`, `fireEvent`, `userEvent`, `cleanup`, and `act`.

Do not import directly from `@testing-library/react` or `@testing-library/user-event`.

## Ownership

Harnesses provide context, not behavior: providers, router, query client, stores, seeded data, and boundary HTTP.

Do not duplicate production ownership in a harness. If behavior belongs to a hook, route, store, or parent, test through that owner. Test a leaf directly only for behavior the leaf owns.

HTTP mocking is project-specific. Use the project boundary strategy.

## Bans

Do not use:

- `document.querySelector` / `document.querySelectorAll`
- `screen.*`
- `getByRole`, `findByText`, `getByLabelText`, or any `*By*` query
- formatted text assertions, regex copy assertions, or CSS class assertions

If you miss a `*By*` query, the component is missing an observable `data-*` contract.

## Examples

See `examples.md` for component, flow, hook, waiting, absence, and multiple-element examples.
