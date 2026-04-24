---
name: zustand
description: "Zustand state management. Use when implementing, reviewing, or refactoring global stores, local scoped stores, persisted state, selectors, or shared component state."
---

# Zustand

Use Zustand for UI state that outgrows one component. TanStack Query owns server state; Zustand owns client/UI state.

## Store Shape

Keep stores simple: state and actions in the same module.

Separate state and actions types when the store is non-trivial:

```ts
interface SearchStoreState {
  query: SearchQueryInput;
}

interface SearchStoreActions {
  setQuery: (query: Partial<SearchQueryInput>) => void;
  clearQuery: () => void;
}

interface SearchStore extends SearchStoreState, SearchStoreActions {}
```

Use `use[Feature]Store` for global stores. Put them where the project already keeps shared state; do not introduce a new store folder just because this skill says Zustand.

## Selectors

Always select only the fields used by the component.

```ts
const query = useSearchStore((state) => state.query);
const setQuery = useSearchStore((state) => state.setQuery);
```

For multiple fields, use `useShallow`.

Never destructure the whole store result.

## Persistence

Use `persist` only for state that must survive reload/session boundaries. Pick the storage intentionally: `localStorage` for durable preferences, `sessionStorage` for tab/session state.

Persist the smallest useful state shape. Do not persist derived data, server state, or values that can be recomputed.

## Local Scoped Stores

Use a local scoped store when several children need shared UI state and prop drilling or Context+useReducer would become ceremony.

Do not create a local store for one component. Use `useState`.

If the project already has a local store helper, use it. If not, create one only when repeated local-store setup proves the helper has a real job.

## Boundaries

Mutations live near the UI action or in a shared hook when reused.
Context may expose read-only server data to a complex local tree.
Zustand should not copy backend data as a second source of truth.
