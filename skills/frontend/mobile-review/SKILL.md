---
name: mobile-review
description: "Mobile responsiveness review. Use when auditing pages or components on phones/tablets, finding responsive breakage, or producing a per-component mobile correction plan."
---

# Mobile Review

Review a page or component for mobile responsiveness and guide the user through the choices that actually need human judgment. The output is a markdown plan that `make-responsive` can consume later.

Use this for read-only analysis. Do not edit application code.

## References

- `references/red-flags.md`: detection rules, severity, direct fixes vs layout decisions.
- `references/per-component-grill.md`: user-facing question templates and plan format.

Read only the reference needed for the current step.

## Workflow

1. Resolve the target.
2. Read the target, direct local imports, the nearest layout parent, Tailwind config, and global CSS.
3. Detect red flags and split them into direct fixes, broad fixes, and layout decisions.
4. Show a short summary and pause.
5. Ask for confirmation on direct fixes as one table.
6. Ask layout decisions one at a time.
7. Save a markdown plan.

## Target Resolution

An explicit file, route, component, URL, or screenshot wins.

If no target is explicit, infer from recent conversation, dirty files, then the latest diff. When inference finds a strong candidate, confirm it before reading code:

```text
I found `Checkout.tsx` in the current diff. Is that the component you want reviewed?
```

If there is no strong candidate, ask for the page, component, or route. Never silently guess the target.

## What To Read

For each target, read:

- The target file.
- Direct local imports. Stop after one level unless a child is trivial.
- The nearest parent that controls layout: flex, grid, container, max width, or viewport sizing.
- `tailwind.config.*` when present.
- Global CSS such as `globals.css`, `app.css`, or equivalent.

For files over 500 lines, read the first 200 lines fully and search the rest for red-flag patterns. Mention the truncation in the first summary.

## Classification

Use `references/red-flags.md`.

- **Direct fix**: one obvious change with no meaningful UX tradeoff.
- **Broad fix**: one parent or repeated pattern fixes several children.
- **Layout decision**: multiple valid mobile treatments with visible tradeoffs.

Broad fixes come before individual decisions. Accepting a broad fix removes the affected child decisions.

## Assumptions

Infer these silently and include them in the final plan:

- Minimum width: 360px unless the codebase clearly targets smaller screens.
- Breakpoints: `tailwind.config.theme.screens`, otherwise Tailwind defaults.
- Horizontal overflow: never on `body`; allowed only in named containers with clear intent.

Do not make the user choose breakpoints or device baselines unless they volunteer a constraint.

## User Flow

Turn 1:

```text
Reviewed `<target>` (<N> files).
Found <N> direct fixes and <N> layout decisions.

If you want to provide a component, screenshot, or description as a reference, send it now.

Continue?
```

Turn 2 lists all direct fixes in one table and asks for approval. The user can approve all or skip specific rows.

Then ask one layout decision at a time:

```text
### Decision <i> of <N> - `<file:line>`

<Concrete mobile problem in one sentence.>

**Recommended: <option>.** <short reason>

Alternatives:
- **<option B>** - <tradeoff>
- **<option C>** - <tradeoff>
```

Accepted shortcuts:

- `ok` / `default`: accept the recommendation.
- `skip`: leave this item unchanged in the plan.
- `finish` / `use defaults`: accept recommendations for all remaining decisions and save the plan.

If there are more than 8 decisions, ask whether to review all or focus on the top 7 by severity. Put skipped lower-priority items in the plan as pending.

## Degenerate Cases

- No red flags: say that nothing needs mobile adjustment and stop. Do not write a plan.
- Only direct fixes: show the table, confirm, then write the plan without individual decisions.

## Plan Output

Save the plan under `reviews/` unless the user gives another path. Include:

- Target and files read.
- Assumptions used.
- Direct fixes accepted or skipped.
- Broad fixes accepted or rejected.
- Layout decisions with the chosen option and rationale.
- Pending items.

The plan must be specific enough for `make-responsive` to apply without re-asking decisions.
