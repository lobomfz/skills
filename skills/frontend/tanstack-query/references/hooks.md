# Hook Extraction

Inline is acceptable for single use. Extract to a hook only when there is more than one use, or when a shared mutation owns invalidation/toast behavior.

## Simple Query, Single Use

Keep it inline in the component. Use `useSuspenseQuery` for required render-blocking data and `useQuery` for interactive or optional reads.

```tsx
function HeroSection() {
  const { data } = useSuspenseQuery(orpc.home.hero.get.queryOptions());

  return <section>...</section>;
}

function SearchPreview({ term }: { term: string }) {
  const { data, isFetching } = useQuery(
    orpc.search.preview.queryOptions(
      { term },
      { enabled: term.length > 2 },
    ),
  );

  return <Preview data={data} isFetching={isFetching} />;
}
```

Do not extract a one-use hook:

```tsx
// Bad
function useHeroData() {
  return useSuspenseQuery(orpc.home.hero.get.queryOptions());
}

function HeroSection() {
  const { data } = useHeroData();

  return <section>...</section>;
}
```

## When to Extract

| Situation | Location |
| --- | --- |
| Simple query, one use | Inline in component |
| Query/mutation used in multiple places | `src/hooks/use-*.ts` |
| Mutation with invalidation and toasts | `src/hooks/use-*.ts` |
| Related queries shared as a reusable behavior | `src/hooks/use-*.ts` |
