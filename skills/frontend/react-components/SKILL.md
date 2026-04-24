---
name: react-components
description: "React components. Use when creating, reviewing, refactoring, splitting, or organizing React components and component folders."
---

# React Components

Build clean JSX with behavior owned by hooks/domain code and UI split by real visual responsibility.

## References

- `references/splitting.md`: when/how to split components, folder naming, subcomponent naming.
- `references/structure.md`: route `-components` / `-utils`, shared component organization.
- `references/store-context.md`: Store + Context + Hooks separation and backend-derived types.

Read only the reference needed for the current change.

## Component Shape

Prefer simple function components. Use `forwardRef` only for generic primitives, usually under `components/ui/`.

Split around visual/functional responsibility, local state, repeated structure, or clearer parent composition. Do not split only because JSX is long. Around 150-200 lines is a reread signal, not an automatic refactor.

Use `cn()` for class composition. Use CVA only for reusable components with meaningful variants.

Use Lucide icons directly; do not create icon wrappers.

Use `memo` only for proven performance issues.

## State And Logic

Keep formatting/domain helpers in the existing project utility/domain location. Do not create hooks just to derive simple values.

Handlers use names like `handleSubmit` and `handleClick`.

Follow the project schema library. Zod is only the default for new frontend projects.

TanStack Query owns server state. Zustand/local state owns UI state. Context enters complex local trees when it removes real prop drilling.

## UI Behavior

Images with loading states need stable container dimensions, a loading placeholder, and a transition that does not shift layout.

Truncated text gets a tooltip only when the full value matters and is not available nearby. Icon-only buttons use the project tooltip prop/pattern, not the HTML `title` attribute.

Pending submit buttons make pending state explicit. Prefer replacing the icon with a spinner and changing the label when there is room. Compact/icon-only buttons use spinner plus disabled/aria state.

Empty states use a dedicated component with icon, title, and optional description. Use a table row empty state only when preserving headers/columns helps the user understand the empty result.

Prefer `autoFocus` on the first meaningful input in simple create/edit dialogs. Skip it when focus is already managed or would be disruptive.

Use toast only for non-obvious actions.

## Accessibility

Use `<button>` for actions and `<a>` for real navigation. Avoid clickable non-button elements.

If an existing component constraint makes a clickable non-button unavoidable, add role, tabIndex, aria-label, focus-visible styling, and keyboard handling.
