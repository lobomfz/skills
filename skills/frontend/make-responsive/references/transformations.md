# Responsive Transformations

Use this reference for direct fixes in `make-responsive`. Keep edits minimal and local.

## Principles

- Base classes are mobile; breakpoint classes restore wider layouts.
- Edit in place. Do not rewrite whole files for mechanical fixes.
- Do not change design tokens, Tailwind config, or shared primitives unless the user asked.
- Avoid hiding required content as a fix. If hiding content is plausible, it is a decision.

## Fixed Pixel Widths

Normal content:

```tsx
// before
className="w-[340px]"

// after
className="w-full max-w-[340px]"
```

Large fixed minimum widths on children usually need `min-w-0` on the flex child plus wrapping/truncation.

Escalate to a decision for tables, charts, canvases, maps, galleries, and intentionally scrollable regions.

## Small Touch Targets

Interactive controls should be at least 44px tall/wide on mobile.

```tsx
className="h-11 px-4"
```

For icon buttons:

```tsx
className="size-11"
```

Do not enlarge dense desktop-only toolbars without checking whether they are actually mobile UI.

## Viewport Height

Use dynamic viewport units for app/page roots:

```tsx
className="min-h-dvh"
```

Remove fixed viewport height from normal content sections. Use `min-h-*` instead of `h-*` unless clipping is intentional.

## Viewport Width

Avoid `w-screen` / `100vw` on normal content because scrollbars can create horizontal overflow.

```tsx
className="w-full"
```

Keep `w-screen` only for deliberate full-bleed hero/media sections.

## Missing Responsive Progression

For desktop-first rows:

```tsx
className="flex flex-col gap-4 md:flex-row"
```

For grids:

```tsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
```

For paired columns:

```tsx
className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]"
```

## Overflow

Remove unjustified `overflow-hidden` from content containers. Move clipping to the media or animation element that needs it.

For intentional horizontal scroll:

```tsx
<div className="overflow-x-auto">
  <div className="min-w-max">...</div>
</div>
```

Use named containers. Never make the page body horizontally scroll.

## Fixed Safe Area

For fixed bottom UI:

```tsx
className="fixed inset-x-0 bottom-0 pb-[env(safe-area-inset-bottom)]"
```

For fixed top UI:

```tsx
className="fixed inset-x-0 top-0 pt-[env(safe-area-inset-top)]"
```

Apply only to fixed UI near screen edges.

## Inputs Below 16px

```tsx
className="text-base"
```

If desktop needs smaller text:

```tsx
className="text-base md:text-sm"
```

## Long Text In Flex

Parent/child pattern:

```tsx
<div className="flex min-w-0">
  <span className="truncate">...</span>
</div>
```

Use `break-words` for free text and `line-clamp-*` for titles/descriptions that may take two or three lines.

## Tables

Only apply scroll wrappers automatically when the user chose "adapt" or the table is clearly compact admin data.

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">...</table>
</div>
```
