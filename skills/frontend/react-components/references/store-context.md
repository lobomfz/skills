# Store + Context + Hooks Separation

## Store + Context + Hooks Separation

Three files in `-utils/`:

```
-utils/
  media-dialog.ts          # Pure hooks (queries, utils)
  media-dialog-context.tsx # Context (server state read-only)
  media-dialog-store.ts    # Zustand local store (UI state)
```

**Rules:**
- **Store**: UI state (selections, toggles, inputs)
- **Context**: server state read-only (queries, derived data)
- **Mutations**: in the component that executes the action, or in a shared hook when the mutation owns reused invalidation/toasts
- **No barrel file** - direct imports from each file

```tsx
// -utils/media-dialog.ts - pure hooks and utils
export function useAddMediaQueries(media: MediaInfo) {
  const { data: rootFolders } = useSuspenseQuery(orpc.settings.rootFolders.list.queryOptions());
  return { rootFolder, defaultIndexer, hasRootFolder };
}

export function getIndexerName(indexer: Indexer): string {
  return indexer.data.type;
}
```

```tsx
// -utils/media-dialog-store.ts - UI state
export const { Provider: MediaDialogStoreProvider, useLocalStore: useMediaDialogStore } =
  createLocalStore<MediaDialogStore>((set) => ({
    selectedTorrent: null,
    advancedEnabled: false,
    setSelectedTorrent: (hash) => set({ selectedTorrent: hash }),
    setAdvancedEnabled: (enabled) => set({ advancedEnabled: enabled }),
  }));
```

```tsx
// -utils/media-dialog-context.tsx - Server state (read-only)
export function MediaDialogProvider({ media, onOpenChange, children }: ProviderProps) {
  const queries = useAddMediaQueries(media);
  const { data: torrents } = useQuery(orpc.media.searchTorrents.queryOptions({ ... }));

  // Context exposes server data read-only, not useMutation/server writes.
  // Local UI callbacks such as onClose are okay.
  const value = { media, onClose: () => onOpenChange(false), ...queries, torrents };
  return <MediaDialogContext.Provider value={value}>{children}</MediaDialogContext.Provider>;
}
```

## Components: Store + Context + Mutations

```tsx
export function MediaDialogActions() {
  // Server state from Context
  const { media, torrents, defaultClient } = useMediaDialog();

  // UI state from Store
  const selectedTorrent = useMediaDialogStore((s) => s.selectedTorrent);

  // Mutation in the component that executes the action
  const addMutation = useMutation(orpc.media.add.mutationOptions({
    onSuccess: () => { toast.success("Added"); onClose(); },
    onError: () => toast.error("Error"),
  }));

  return (
    <Button onClick={() => addMutation.mutate({ ... })} disabled={addMutation.isPending}>
      Add
    </Button>
  );
}
```

## Backend Types

Types derived from the Router live in `src/types/<domain>.ts`:

```tsx
// src/types/settings.ts
export type DownloadClient = RouterOutputs["downloads"]["clients"]["list"][number];
export type Indexer = RouterOutputs["indexers"]["list"][number];
export type RootFolder = RouterOutputs["settings"]["rootFolders"]["list"][number];

// src/types/media.ts
export type TorrentResult = RouterOutputs["media"]["searchTorrents"][number];
export type QualityProfile = RouterOutputs["qualityProfiles"]["list"][number];

export interface MediaInfo {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
  media_type: "movie" | "tv";
}
```

**Local types** (props, internal state) stay inline in the component.

**Never** export types from inside hooks. Always centralize them in `src/types/`.
