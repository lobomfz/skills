# Query Options

To customize options such as `staleTime`, `refetchInterval`, `enabled`, or `placeholderData`, pass them to `queryOptions()`. Do not spread query options manually.

```tsx
// Good
useSuspenseQuery(orpc.status.queryOptions({ staleTime: 30_000 }))

useSuspenseQuery(
  orpc.status.queryOptions({
    refetchInterval: isPolling ? 3000 : false,
    staleTime: 30_000,
  })
)

useQuery(
  orpc.search.preview.queryOptions(
    { term },
    {
      enabled: term.length > 2,
      placeholderData: keepPreviousData,
    },
  )
)

// Bad
useSuspenseQuery({
  ...orpc.status.queryOptions(),
  staleTime: 30_000,
})
```
