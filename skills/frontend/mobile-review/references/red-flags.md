# Mobile Red Flags

Use this reference to classify findings during `mobile-review`.

## Classification Rule

A finding is a direct fix when one change works in normal cases and does not change the layout strategy. A finding is a layout decision when reasonable solutions have visible tradeoffs such as density, scroll, hierarchy, or hidden content.

## Direct Fixes

### Fixed Pixel Widths

Problem: `w-[340px]`, `min-w-[600px]`, inline `style={{ width: 480 }}` on normal content.

Default fix: replace with fluid width plus an optional max width:

```tsx
className="w-full max-w-[340px]"
```

Escalate to a layout decision when the width is part of a data table, canvas, chart, carousel, or intentionally scrollable content.

### Input Font Below 16px

Problem: inputs, selects, or textareas below `16px` on mobile.

Default fix: use `text-base` on the control. This avoids iOS zoom.

### Content Container Uses `h-screen` Or `100vh`

Problem: page content locked to `h-screen`, `min-h-screen`, or `100vh` where mobile browser chrome can hide content.

Default fix: prefer `min-h-dvh` for page roots or remove fixed viewport height from content sections.

### Fixed Top/Bottom Without Safe Area

Problem: `fixed top-*` or `fixed bottom-*` near phone notches/home indicators.

Default fix: add safe-area padding only to that fixed region.

### Missing Viewport Meta

Problem: no `<meta name="viewport" content="width=device-width, initial-scale=1" />`.

Treat as a blocker for implementation plans. Without it, many responsive changes do not behave correctly on iOS.

### Unjustified `overflow-hidden`

Problem: content containers hide overflow without a clear visual reason.

Default fix: remove it or move clipping to the visual element that actually needs it.

Escalate when clipping is part of animation, media crop, or drawer/modal behavior.

### Flex Child Cannot Shrink

Problem: flex row child with `min-w-*`, long text, or missing `min-w-0`.

Default fix: add `min-w-0` to the shrinking child and use `truncate`, `break-words`, or wrapping where appropriate.

### Static `whitespace-nowrap`

Problem: short static labels never wrap and squeeze nearby content.

Default fix: remove `whitespace-nowrap` unless the label is a tiny chip, badge, or icon+label button.

## Layout Decisions

### Layout-Heavy File Has No Responsive Strategy

Problem: a file with many layout classes has no mobile/desktop progression.

Typical options:

- Stack on mobile, restore current layout at `sm:` or `md:`.
- Create a dedicated mobile variant for a central component.
- Hide secondary content on mobile.

Default recommendation: stack on mobile unless the component is core, dense, and worth a dedicated mobile version.

### Fixed Grid Columns

Problem: `grid-cols-3+` used without responsive variants.

Typical options:

- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`.
- `grid-cols-2 lg:grid-cols-N` for tiny visual tiles.
- Horizontal carousel for galleries or feeds.

Default recommendation: progressive grid for cards; carousel only when the interaction is already gallery-like.

### Wide Flex Row

Problem: row with three or more meaningful children and no wrapping or mobile direction.

Typical options:

- Stack on mobile.
- Wrap rows.
- Horizontal scroll.

Default recommendation: stack semantic blocks; wrap chips/tags/actions.

### Wide Table

Problem: table with five or more columns and no mobile treatment.

Typical options:

- Horizontal scroll wrapper.
- Cards per row on mobile.
- Hide secondary columns.
- Accordion row details.

Default recommendation: cards for transactional rows with actions; scroll wrapper for compact admin data; hidden columns for comparisons.

### Dynamic Long Text Cannot Wrap

Problem: names, URLs, titles, or descriptions force horizontal overflow.

Typical options:

- Truncate with `min-w-0`.
- Clamp to two or three lines.
- Allow wrapping with `break-words`.

Default recommendation: truncate IDs/status-like values; clamp human-readable titles; wrap free text.

## Broad Fixes

Create a broad-fix decision when:

- A parent layout constraint causes several child failures.
- The same direct fix appears in three or more sibling components.

Ask the broad decision before child-level decisions. If accepted, remove child findings covered by it.

## Severity

- **Critical**: blocks mobile use or creates severe horizontal overflow.
- **Important**: mobile remains usable but degraded.
- **Low**: mostly mechanical cleanup with low visible impact.
