---
name: make-responsive
description: "Responsive implementation. Use when editing a page or component for phones/tablets, making desktop-first UI responsive, or applying a mobile-review plan."
---

# Make Responsive

Apply responsive changes in place. Prefer mobile-first code: base classes describe mobile, larger breakpoints restore wider layouts.

This skill is for implementation, not just review. Check the git state before editing and call out dirty target files.

## References

- `references/transformations.md`: mechanical fixes and Tailwind transforms.
- `references/complex-components.md`: tables, large forms, dense grids, and rewrite choices.
- `references/plan-mode.md`: applying a markdown plan created by `mobile-review`.

Read only the reference needed for the current mode.

## Modes

### Standalone

Use when the user points at a component/page and asks you to make it responsive.

1. Resolve the target.
2. Read the target, direct local imports, nearest layout parent, Tailwind config, and global CSS.
3. Detect direct fixes and complex components.
4. Show gates and a short summary.
5. Apply confirmed direct fixes.
6. Ask complex component decisions one at a time and apply each immediately.
7. Summarize changes and assumptions.

### Plan Mode

Use when the input is a markdown plan from `mobile-review`.

1. Parse the plan.
2. Check for stale files or decisions that no longer map cleanly to code.
3. Show what will be applied.
4. After `ok`, apply decided fixes and rewrites without re-asking.
5. If the user says `review X`, reopen only those items as individual decisions.

## Target Resolution

An explicit file, route, component, URL, screenshot, or plan path wins.

If no target is explicit, infer from recent conversation, dirty files, then the latest diff. Confirm inferred targets before reading:

```text
I found `Checkout.tsx` in the current diff. Is that the component you want made responsive?
```

If there is no strong candidate, ask for the page, component, route, or plan.

## What To Read

For each target, read:

- The target file.
- Direct local imports. Stop after one level unless a child is trivial.
- The nearest parent that controls layout.
- `tailwind.config.*` when present.
- Global CSS such as `globals.css`, `app.css`, or equivalent.

For files over 500 lines, read the first 200 lines fully and search the rest for responsive risk patterns. Mention this in the first summary.

## Assumptions

Infer silently and include in the summary:

- Mobile-first strategy.
- Minimum width: 360px unless project evidence says otherwise.
- Touch target: 44px for interactive controls.
- Breakpoint for mobile/desktop switch: usually `md:`.
- Horizontal overflow: never on `body`; only intentional named containers may scroll.
- Safe area: only when fixed top/bottom UI exists.

If the user gives a concrete constraint, use it and say so.

## Gates

Show gates before edits:

- Target already looks mobile-first: ask whether to continue.
- Missing viewport meta: treat as a blocker or add it if the user approves.
- Target has uncommitted changes: ask whether to apply on top.

Do not edit through an unresolved gate.

## Direct Fixes

Use `references/transformations.md`.

Direct fixes include:

- Fixed pixel widths on normal content.
- Small touch targets.
- `h-screen` / `100vh` in content containers.
- `w-screen` / `100vw` outside deliberate bleed/hero areas.
- Unjustified `overflow-hidden`.
- Fixed top/bottom UI missing safe-area padding.
- Inputs below 16px.
- Flex children missing `min-w-0` when long content can overflow.

Show all direct fixes in one table. Apply only approved rows. Keep diffs small and edit in place.

## Complex Components

Use `references/complex-components.md`.

Complex components are decisions, not automatic fixes:

- Tables with more than three columns.
- Forms with more than six fields.
- Dense grids with many data fields.
- Data-grid libraries.
- Lists where each row acts like several columns.

Ask one decision at a time. Each answer is applied immediately before moving to the next item.

Accepted shortcuts:

- `ok` / `default`: accept recommendation.
- `adapt`: keep structure and add responsive containment.
- `rewrite`: create a mobile-specific structure.
- `skip`: leave unchanged.
- `finish` / `use defaults`: apply recommendations to remaining items.
- `show snippet`: only inside a rewrite sub-flow.

## Plan Mode User Flow

Turn 1 lists what the plan will apply:

```text
Read `<plan>` generated on <date>.

Will apply:
- <N> direct fixes
- <N> broad fixes
- <N> complex component decisions

Reply `ok` to apply, or `review X` to reopen specific items.
```

If there are stale files, unmappable decisions, or missing code matches, list them before asking for `ok`. Those items enter the individual decision flow.

## Summary

End with:

- Files changed.
- Direct fixes applied or skipped.
- Complex decisions applied.
- Assumptions used.
- Verification run, or why it was not run.
