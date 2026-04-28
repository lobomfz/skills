---
name: frontend
description: "Frontend components and Tailwind. Use when creating, reviewing, refactoring, splitting, or organizing React components, shared components, component folders, or Tailwind classes."
---

# Frontend

Build clean JSX with behavior owned by hooks/domain code and UI split by real visual responsibility.

## Component Shape

Prefer simple function components. Use `forwardRef` only for generic primitives, usually under `components/ui/`.

Split around visual/functional responsibility, local state, repeated structure, or clearer parent composition. Past 200 lines, audit against the splitting criteria and split if one fits.

Name subcomponents with the parent prefix plus a responsibility suffix: `DialogHeader`, `DialogBody`, `DialogActions`.

Keep strongly coupled subcomponents in the same file when small. Move them to separate files when they obscure the parent. Use a folder when a component has three or more related subcomponents.

Use `cn()` for class composition. Use CVA only for reusable components with meaningful variants.

Components reused across consumers expose composed parts (`Card`, `CardHeader`, `CardBody`, `CardFooter`) when callers diverge in which zones they need. Each part is a thin shell — split before growing props.

Use Lucide icons directly; do not create icon wrappers.

Search `components/ui/*` for an existing primitive before building one.

Use `memo` only for proven performance issues.

## Tailwind

Use `size-5` over `h-5 w-5` for equal dimensions, `gap-3` over `space-x-3` in flex/grid, and `·` (middle dot) over `•` (bullet) as inline separator.

Use project tokens for color (`bg-card`, `text-muted-foreground`, `border-input`). Semantic utilities, not raw values. Use CSS variables (`var(--chart-teal)`, `var(--chart-height)`) for theme tokens and reused dimensions; not for one-off details. Use `color-mix(in oklch, ...)` for opacity variants over hex with alpha.

Default `rounded-lg` on cards. Use `rounded-xl` only when intentional (modals, hero sections), `rounded-md` for smaller elements (badges, inputs).

Interactive elements use `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`. Never bare `focus:` — always `focus-visible:`.

## State And Logic

Keep formatting/domain helpers in the existing project utility/domain location. Do not create hooks just to derive simple values.

Handlers use names like `handleSubmit` and `handleClick`.

Follow the project schema library.

TanStack Query owns server state. Zustand/local state owns UI state. Context enters complex local trees when it removes real prop drilling.

For complex local trees, the split lives in three `-utils/` files:

- `<feature>.ts` — pure hooks (queries, derived data)
- `<feature>-context.tsx` — read-only server state and local callbacks
- `<feature>-store.ts` — Zustand UI state (selections, toggles, drafts, filters)

Each component owns at most one mutation, in the component presenting that action. Extract reused mutation behavior into a shared hook. Context does not host mutations.

Backend-derived types live in `src/types/<domain>.ts`. Do not export types from hooks. Local props and internal state stay inline.

No barrel files. Import directly from each file.

## File Organization

Route-local components live in `-components/`; route-local hooks and utilities live in `-utils/`. Use consistent names with the feature context.

Complex components get their own folder under `-components/`, prefixed with a term that recalls the route. Inside the folder, files use shorter local names without the prefix:

```
<route>/
  -utils/
    <feature>.ts
    <feature>-context.tsx
    <feature>-store.ts
  -components/
    <route>-<feature>/
      index.tsx
      <feature>-content.tsx
      <feature>-actions.tsx
      <feature>-section/
        index.tsx
        section-list.tsx
        section-item.tsx
```

When a route splits into a folder of sections, each section folder owns its Suspense boundary, skeleton, mutation, and dialog; the parent becomes pure layout.

Shared components grow into folders only when they have related files with a shared responsibility. Group `components/shared/` by function:

```
components/shared/
  dialogs/
  form/
  list/
  layout/
    client-card/
    items/
```

## UI Behavior

Images with loading states need stable container dimensions, a loading placeholder, and a transition that does not shift layout.

Skeletons ship beside the component they shadow — same file for primitives, sibling `skeleton.tsx` for section folders — and match the rendered shape (size, layout, row count).

Truncated text gets a tooltip when the full value matters and is not available nearby. Icon-only buttons use the project tooltip prop/pattern, not the HTML `title` attribute.

Pending submit buttons make pending state explicit. Prefer replacing the icon with a spinner and changing the label when there is room. Compact/icon-only buttons use spinner plus disabled/aria state.

Empty states use a dedicated component with icon, title, and optional description. Use a table row empty state only when preserving headers/columns helps the user understand the empty result.

Prefer `autoFocus` on the first meaningful input in simple create/edit dialogs. Skip it when focus is already managed or would be disruptive.

Use toast only for non-obvious actions.

## Accessibility

Use `<button>` for actions and `<a>` for real navigation. Avoid clickable non-button elements.
