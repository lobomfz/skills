# Mutations

Always destructure `useMutation`, `useQuery`, and `useSuspenseQuery`. Never assign the whole result object to a variable.

```tsx
// Good
const { mutate, isPending } = useMutation(...);
const { data, refetch } = useSuspenseQuery(...);
const { data, isFetching } = useQuery(...);

// Bad
const createMutation = useMutation(...);
const ordersQuery = useSuspenseQuery(...);
```

## Invalidate After Mutation

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

```tsx
// Bad by default
const { mutate } = useMutation(
  orpc.tasks.create.mutationOptions({
    onSuccess: (newTask) => {
      queryClient.setQueryData(
        orpc.tasks.list.queryKey(),
        (old) => [...old, newTask]
      );
    },
  }),
);
```

## Shared Mutation Hook

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
