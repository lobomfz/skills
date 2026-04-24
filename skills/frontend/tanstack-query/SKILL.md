---
name: tanstack-query
description: "TanStack Query in React. Use when implementing, reviewing, or refactoring queries, mutations, query options, invalidation, or query hooks."
---

# TanStack Query

Patterns for TanStack Query with oRPC.

Core principle: use Suspense for required render-blocking reads, use `useQuery` for interactive or optional reads, and invalidate after mutations.

## Core Rules

- Use `useSuspenseQuery` when data is required to render a visual unit. The component can assume `data` exists.
- Use `useQuery` when the read is optional, lazy, click-triggered, polling/background-driven, typeahead/search-as-you-type, or needs local access to `enabled`, `placeholderData`, `isFetching`, `isPending`, `isError`, `refetch`, or previous data.
- Do not use `useQuery` just to hand-roll a page loading state that should be a Suspense fallback.
- A component that calls `useSuspenseQuery` does not mount its own `<Suspense>`; the parent does.
- Each independent visual unit has its own `<ErrorBoundary>` + `<Suspense>` pair when it uses Suspense.
- Skeletons are colocated with the data component and mirror the real layout.
- One visual unit depends on one read contract. Aggregate in the backend when the visual payload has the same owner.
- Multiple queries in the same unit are acceptable when they represent facts with independent owners that should refresh together.
- After mutation, use `invalidateQueries`; do not default to optimistic `setQueryData`.
- Always destructure `useMutation`, `useQuery`, and `useSuspenseQuery`. Never assign the whole result object to a variable.
- Simple one-use queries stay inline in the component. Extract hooks only for multiple uses or shared mutations with invalidation/toasts.
- Customize `staleTime`, `enabled`, `placeholderData`, `refetchInterval`, and similar options through `queryOptions()`. Do not spread query options manually.

## Visual Contract

If a component needs two queries to render the same block, pause before implementing:

1. Same visual use case and same owner: the endpoint is too small. Create an aggregated backend query.
2. Independent visual units: the component is too large. Split into smaller components, each with its own query and boundary/state.
3. Multiple queries hidden in a hook do not fix missing ownership. The hook only removes syntax.

Read contract does not always mean one network call. `media.get` + `watchlist.status` can be correct in one card if they are independent facts that should refresh together.

## Choosing the Hook

| Situation | Hook |
| --- | --- |
| Data required to render the unit | `useSuspenseQuery` |
| Lazy/disabled/click-triggered query | `useQuery` |
| Polling or background refresh with inline status | `useQuery` |
| Optional panel or typeahead/search-as-you-type | `useQuery` |
| Needs `placeholderData`, previous data, `refetch`, or local status flags | `useQuery` |
| Mutation/write | `useMutation` |

## Query Options

```tsx
useSuspenseQuery(orpc.status.queryOptions({ staleTime: 30_000 }))

useQuery(
  orpc.search.preview.queryOptions(
    { term },
    {
      enabled: term.length > 2,
      placeholderData: keepPreviousData,
    },
  ),
)
```

Never spread generated options:

```tsx
useSuspenseQuery({
  ...orpc.status.queryOptions(),
  staleTime: 30_000,
})
```

## Mutations

Always destructure query and mutation hooks:

```tsx
const { mutate, isPending } = useMutation(...);
const { data, refetch } = useSuspenseQuery(...);
const { data, isFetching } = useQuery(...);
```

Never assign the whole hook result to a variable:

```tsx
const createMutation = useMutation(...);
const ordersQuery = useSuspenseQuery(...);
```

Invalidate after mutations:

```tsx
const { mutate } = useMutation(
  orpc.tasks.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.tasks.list.pathFilter());
    },
  }),
);
```

Do not default to optimistic `setQueryData`. Server state belongs to the server; invalidate and refetch unless there is a concrete reason not to.

Use a dedicated hook when the mutation is shared, or when it owns invalidation/toast behavior used in multiple places.

```tsx
export function useSetRootFolder(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation(
    orpc.settings.rootFolders.set.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.settings.rootFolders.list.queryOptions().queryKey,
        });
        toast.success("Root folder saved");
        options?.onSuccess?.();
      },
      onError: (error) => {
        if (isDefinedError(error) && error.code === "INVALID_PATH") {
          toast.error("Invalid path");

          return;
        }

        toast.error("Could not save");
      },
    }),
  );
}

const { mutateAsync, isPending } = useSetRootFolder({
  onSuccess: () => {
    setIsEditing(false);
  },
});
```

## Hook Extraction

| Situation | Location |
| --- | --- |
| Simple query, one use | Inline in component |
| Query or mutation used in multiple places | `src/hooks/use-*.ts` |
| Mutation with shared invalidation/toasts | `src/hooks/use-*.ts` |
| Related queries shared as reusable behavior | `src/hooks/use-*.ts` |

## Suspense Boundary

`useSuspenseQuery` interrupts rendering by throwing a Promise. React walks up the tree and uses the first ancestor `<Suspense>`. Any `<Suspense>` inside the suspended component's return does not exist yet.

The nearest boundary above a `useSuspenseQuery` defines the visual unit for that data: the block that should refresh together.

1. The parent mounts `<Suspense>`, not the component that calls `useSuspenseQuery`.
2. Independent units do not share one ancestor boundary that wraps all of them.
3. Queries that feed the same unit share the boundary.
4. A route/layout boundary is correct only when the entire route is the visual unit.

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

Check when writing `useSuspenseQuery`:

1. Which ancestor `<Suspense>` will catch this?
2. Does that boundary cover only the visual unit for this data?
3. If it wraps independent siblings, mount a dedicated boundary in the immediate parent.

## Query Client

Default query clients should let first-load errors reach the nearest ErrorBoundary, while refetch errors with existing data keep the current UI visible.

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      throwOnError: (_error, query) => query.state.data === undefined,
    },
  },
});
```
