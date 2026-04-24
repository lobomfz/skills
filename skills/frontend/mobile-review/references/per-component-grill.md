# Mobile Review Templates

Use these templates for the user-facing flow. Keep language concrete and avoid internal codes.

## Turn 1

```text
Reviewed `<target>` (<N> files).
Found <N> direct fixes and <N> layout decisions.

If you want to provide a component, screenshot, or description as a reference, send it now.

Continue?
```

If the target was truncated:

```text
The target is over 500 lines; I read the first 200 lines and searched the rest for mobile risk patterns.
```

If no red flags were found:

```text
Reviewed `<target>` (<N> files). I did not find mobile responsiveness issues.
If something specific is bothering you, point me at that component and I will review it manually.
```

## Direct Fixes Table

```text
### Direct Fixes - Confirm?

| # | File:Line | Problem | Fix |
|---|---|---|---|
| 1 | Button.tsx:18 | fixed `340px` width | `w-full max-w-[340px]` |
| 2 | Input.tsx:5 | input text below 16px | `text-base` |

Reply `ok` to accept all, or list rows to skip, for example `skip 2`.
```

Rows skipped by the user must appear in the final plan as intentionally left unchanged.

## Individual Decision

```text
### Decision <i> of <N> - `<file:line>`

<One sentence describing the concrete mobile problem.>

**Recommended: <option>.** <short reason>

Alternatives:
- **<option B>** - <tradeoff>
- **<option C>** - <tradeoff>
```

Do not say "registered" after each answer. Move to the next decision or the plan.

## Broad Fix Decision

```text
### Decision <i> of <N> - structural issue in `<file:line>`

This affects <N> components: <short list>.
<One sentence describing the shared mobile problem.>

**Recommended: <upstream fix>.** <short reason>

Alternatives:
- **Local fixes** - keep the parent as-is and resolve each child separately.
- **Skip** - leave this structure unchanged.

Accepting this resolves the affected child findings.
```

## Manual Review Decision

Use this when the user points at a component but static detection found nothing.

```text
### Decision <i> of <N> - `<file>` manual review

I did not find a syntactic red flag here. What breaks or feels wrong on mobile?
You can describe it or send a screenshot path.
```

After the user answers, map the issue to the nearest red-flag family and ask a normal decision.

## Decision Options By Family

### General Layout

Recommended default: stack on mobile and restore the desktop shape at `sm:` or `md:`.

Alternatives:

- Dedicated mobile variant.
- Hide secondary content on mobile.

### Grid

Recommended default: progressive grid, usually `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`.

Alternatives:

- Compact grid starting at two columns for tiny tiles.
- Horizontal carousel for visual feeds or galleries.

### Flex Row

Recommended default: stack semantic blocks on mobile.

Alternatives:

- Wrap chips, tags, or short controls.
- Horizontal scroll only when the row is intentionally browseable.

### Wide Table

Recommended default depends on the table:

- Transactional rows with actions: cards per row.
- Compact admin data: horizontal scroll wrapper.
- Comparison tables: hide secondary columns or accordion details.

Always name the visible tradeoff: density, scanability, scroll, or hidden detail.

### Long Text

Recommended default:

- Truncate identifiers and status-like values.
- Clamp titles.
- Wrap descriptions or free text.

## Too Many Decisions

If there are more than 8 layout decisions:

```text
I found <N> layout decisions. Review all, or focus on the top 7 by severity?
The rest will be listed as pending in the plan.
```

## Plan Format

```markdown
# Mobile Review - <target>

Generated: <ISO date>

## Context

- Target: `<target>`
- Files read:
  - `<file>`
- Assumptions:
  - Minimum width: 360px
  - Breakpoints: Tailwind defaults
  - Horizontal overflow: only in intentional named containers

## Direct Fixes

| Status | File:Line | Problem | Fix |
|---|---|---|---|
| accepted | `Button.tsx:18` | fixed width | `w-full max-w-[340px]` |

## Broad Fixes

| Decision | Affects | Choice | Reason |
|---|---:|---|---|

## Layout Decisions

| File:Line | Problem | Choice | Reason |
|---|---|---|---|

## Pending

- <items skipped or deferred>
```
