# QueryClient

Default config:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Only propagate errors to ErrorBoundary on the first load.
      // Refetch with existing data does not trigger ErrorBoundary.
      throwOnError: (_error, query) => query.state.data === undefined,
    },
  },
});
```

The important behavior: initial load errors reach the ErrorBoundary; refetch errors with existing data do not blank the already-rendered UI.
