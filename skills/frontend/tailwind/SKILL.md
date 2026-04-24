---
name: tailwind
description: "Tailwind CSS classes. Use when writing, reviewing, or refactoring Tailwind class names, design tokens, colors, spacing, or responsive utilities."
---

# Tailwind

## Class Preferences

- `size-5` over `h-5 w-5` for equal dimensions
- `gap-3` over `space-x-3` when using flex/grid
- `·` (middle dot) over `•` (bullet) as inline text separator

## Design Tokens

- Prefer project tokens and semantic utilities over hardcoded hex values
- Use CSS variables (`var(--chart-teal)`) for reusable theme/domain colors, not one-off local details
- `color-mix(in oklch, ...)` for opacity variants over hex with alpha

## Border Radius

- `rounded-lg` as default on cards
- `rounded-xl` only when intentional (modals, hero sections)
- `rounded-md` for smaller elements (badges, inputs)

## Focus Styles

Interactive elements use `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`. Never bare `focus:` — always `focus-visible:`.
