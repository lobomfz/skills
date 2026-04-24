# Component Structure and Organization

## Complex Components

Complex components should be split into **their own folder** with subcomponents.

### Folder Structure

```
search/
  -utils/
    media-dialog.ts               # Pure hooks (queries)
    media-dialog-context.tsx      # Context (server state read-only)
    media-dialog-store.ts         # Zustand local store (UI state)
  -components/
    search-add-media-dialog/
      index.tsx
      media-dialog-content.tsx
      media-dialog-poster.tsx
      media-dialog-header.tsx
      media-dialog-actions.tsx    # Mutations live here
      media-dialog-settings/
        index.tsx
        settings-root-folder-select.tsx
        settings-quality-profile-select.tsx
      media-dialog-torrent-section/
        index.tsx
        torrent-list.tsx
        torrent-list-state.tsx
        empty-state.tsx
        torrent-item/
          index.tsx
          item-selection-indicator.tsx
          item-torrent-badge.tsx
          item-torrent-badges.tsx
        advanced-download/
          index.tsx
          download-audio-provider-select.tsx
          download-audio-status.tsx
```

### Naming

| Location | Pattern | Example |
|---------|---------|---------|
| `-utils/` (hooks) | `<feature>.ts` | `media-dialog.ts` |
| `-utils/` (context) | `<feature>-context.tsx` | `media-dialog-context.tsx` |
| `-utils/` (isolated hook) | `use-<name>.ts` | `use-media-details.ts` |
| Component folder | `<route-prefix>-<feature>/` | `search-add-media-dialog/` |
| Inside the folder | Short name without prefix | `media-dialog-content.tsx` |
| Subfolder | Even shorter names | `torrent-list.tsx` |

### When to Split Hooks + Context

| Scenario | Approach |
|---------|----------|
| Hooks used by Context | `feature.ts` + `feature-context.tsx` |
| Isolated hook (1 component uses it) | `use-<name>.ts` |
| Small file (<150 lines) | May stay together |

### File Naming in `-components/` and `-utils/`

Consistent prefix that names the parent context/feature:

```
search/-components/
  search-input.tsx
  search-results.tsx
  search-result-card.tsx

search/-utils/
  media-dialog.tsx
```

### Colocation with `-` Prefix

```
src/routes/_app/
├── index.tsx
├── -components/
│   └── downloads-sheet.tsx
├── -utils/
│   └── downloads-sheet.ts
└── settings/
    ├── -components/
    └── -utils/
```
