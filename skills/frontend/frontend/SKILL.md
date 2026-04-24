---
name: frontend
description: "Frontend code organization. Use when creating, refactoring, or reviewing component structure, shared components, Tailwind usage, or frontend constants."
---

# Frontend

Conventions for frontend code that don't belong to a specific library skill.

## Tailwind

See skill `tailwind` for class conventions and design tokens.

## Shared Components Organization

Shared components grow into subdirectories grouped by function:

```
components/shared/
  dialogs/          # dialog footers, skeletons, confirmation dialogs
  form/             # form sections, selectors, comboboxes
  list/             # search inputs, pagination
  layout/
    client-card/    # related subcomponents colocated
    items/          # table headers, cells, empty states, summaries
```

When a shared component accumulates related files (3+), it becomes a folder. Route-local helpers live in `-utils/` colocated with the route.

## Constants Location

Config Records that map domain values to labels, styles, or icons belong in `constants/[domain].ts`. A component that defines its own config inline is acceptable only when the config has no domain meaning and is used nowhere else.

Re-exported constants from `constants/` into route-local `-utils/` files are fine when the route also adds local formatting helpers alongside them.

## File Splitting

Around 300 lines is a reason to reread the file, not an automatic split trigger. Extract only when there is a nameable visual section, local state or handlers, real repetition, or a clearer parent composition. Do not extract just because JSX became long.

No barrel files — import directly from each file.

```
feature.tsx (large)
→ feature/
   ├── feature-content.tsx   # main composition
   ├── feature-section.tsx   # visual section
   ├── feature-form.tsx      # form logic
   └── feature-empty.tsx     # empty/edge state
```
