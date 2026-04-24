# Complex Responsive Components

Use this reference when `make-responsive` finds a component whose mobile treatment is a product/layout decision.

## Detection

Treat these as complex:

- `<table>` with more than three columns.
- `<form>` with more than six fields.
- Grid with more than three columns where each item has multiple data fields.
- Data-grid libraries: `@tanstack/react-table`, `ag-grid`, `@mui/x-data-grid`, `mantine-datatable`.
- Lists where each item renders like several columns of data plus actions.

## Decision Template

```text
### Decision <i> of <N> - `<file>` (<plain descriptor>)

<Concrete mobile problem in one sentence.>

**Recommended: <concrete action>.** <short reason>

Alternatives:
- **<action B>** - <tradeoff>
- **<action C>** - <tradeoff>
```

Do not repeat shortcut instructions after every answer. Apply the chosen decision and move on.

## Tables

Options:

- **Adapt**: wrap in horizontal scroll.
- **Rewrite as cards**: one card per row with key facts and actions.
- **Hide secondary columns**: keep table structure, hide less important cells on mobile.
- **Accordion rows**: collapsed summary with expandable details.
- **Skip**: leave unchanged.

Recommendations:

- More than five columns or row actions: rewrite as cards.
- Four or five compact columns: adapt with scroll.
- Comparison/spec tables: hide secondary columns or accordion rows.
- Data-grid library: adapt with scroll only, unless the user explicitly asks for a deeper refactor.

## Forms

Options:

- **Adapt**: stack fields, full-width controls, mobile spacing.
- **Rewrite as steps**: split sections into a multi-step flow.
- **Skip**: leave unchanged.

Recommendations:

- More than eight fields with clear sections: rewrite as steps.
- Six to eight fields: adapt.
- Admin-only forms: consider skipping unless mobile use is required.

## Dense Grids

Options:

- **Adapt**: progressive columns.
- **Rewrite as vertical list**: one item per row/card.
- **Rewrite as carousel**: horizontal snap list.
- **Skip**.

Recommendations:

- Dense cards with text/stats/actions or four-plus columns: vertical list.
- Simple tiles: progressive columns.
- Visual gallery/feed: carousel.

## Dense Lists

Options:

- **Adapt**: wrapping, truncation, or scroll where intentional.
- **Rewrite as compact cards**: information grouped vertically with actions below.
- **Skip**.

Recommendation: compact cards when each row has several fields plus right-aligned actions.

## Rewrite Sub-Flow

When the user chooses rewrite, give one short proposal before editing:

```text
I will rewrite this as cards per row:
- primary: name + status
- secondary: date + amount
- actions: menu button in the card footer

Reply `ok`, `show snippet`, or describe an adjustment.
```

Only show the TSX snippet if the user asks `show snippet`.

## File Shape

Choose silently unless the user asks:

- Under 30 lines of new JSX: inline in the original file.
- 30-80 lines: sibling mobile component.
- Over 80 lines or several named subcomponents: folder split.

Use existing project component patterns. Do not add a new UI abstraction just for the rewrite.

## Data-Grid Libraries

Do not rewrite library configuration automatically. Recommend a scroll wrapper as the safe change:

```text
This table is managed by <library>. Rewriting it would touch column/state configuration.

**Recommended: adapt with a horizontal scroll wrapper.** This is the only safe automatic change.

Alternatives:
- **Skip** - leave it for a manual table redesign.
```

## Style Reminders

- Avoid jargon in user-facing descriptors.
- Name concrete actions, not categories.
- Keep decisions in code order so the diff is easy to follow.
- After an answer, apply and continue; no "registered" filler.
