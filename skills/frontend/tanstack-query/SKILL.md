---
name: tanstack-query
description: "TanStack Query in React. Use when implementing or reviewing queries, mutations, invalidation, or query hooks."
---

## Choosing the hook

- `useSuspenseQuery` when data is required to render the unit. The component assumes `data` exists.
- `useQuery` when the read is optional, lazy, click-triggered, polling, typeahead, or needs `enabled`, `placeholderData`, `isFetching`, `refetch`, or previous data.
- `useMutation` for writes.

Do not use `useQuery` to hand-roll a page loading state that should be a Suspense fallback.

ALWAYS destructure the result. Never assign the whole hook return to a variable.

```tsx
const { mutate, isPending } = useMutation(...);
const { data, refetch } = useSuspenseQuery(...);
```

## Visual contract

One visual unit, one read contract.

If a component needs two queries to render the same block:

1. Same owner, same use case: aggregate in the backend.
2. Independent units: split the component, each with its own boundary.

## Query options

Customize query options through `queryOptions()`. Never spread the generated options.

```tsx
useSuspenseQuery(orpc.status.queryOptions({ staleTime: 30_000 }))

useQuery(
  orpc.search.preview.queryOptions(
    { term },
    { enabled: term.length > 2, placeholderData: keepPreviousData },
  ),
)
```

Wrong:

```tsx
useSuspenseQuery({ ...orpc.status.queryOptions(), staleTime: 30_000 })
```

## Mutations

Invalidate after mutation. Do not default to optimistic `setQueryData` — server state belongs to the server.

```tsx
const { mutate } = useMutation(
  orpc.tasks.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.tasks.list.pathFilter());
    },
  }),
);
```

Extract a hook when the mutation is shared, or owns invalidation/toast behavior used in multiple places. Otherwise inline.

## Suspense boundary

The parent mounts `<Suspense>`, not the component that calls `useSuspenseQuery`. Each independent visual unit gets its own `<ErrorBoundary>` + `<Suspense>` pair. Skeletons live with the data component and mirror its real layout.

```tsx
function HomePage() {
  return (
    <ErrorBoundary fallback={<HeroError />}>
      <Suspense fallback={<HeroSectionSkeleton />}>
        <HeroSection />
      </Suspense>
    </ErrorBoundary>
  );
}

function HeroSection() {
  const { data } = useSuspenseQuery(orpc.home.hero.get.queryOptions());
  return <section>...</section>;
}
```

A route/layout boundary is correct only when the entire route is the visual unit.
