## What it does

Flags typographic unicode characters inside string literals and template strings: smart quotes (`'` `'` `"` `"`), en/em dashes (`-` `--`), horizontal ellipsis (`...`), and invisible whitespace (NBSP, ZWSP, BOM).

## Why is this bad?

These characters almost never get there on purpose. They arrive when copy is pasted from Word, Notion, Google Docs, or a browser that auto-corrects punctuation. Once in source, they look identical to their ASCII counterparts in monospace fonts, so they survive review and ship into URLs, slugs, page titles, comparisons, and serialized output where the difference matters: a slug normalizer that rewrites apostrophes still has to know which apostrophe; a page title concatenated with a separator carries the wrong glyph forever; a non-breaking space inside what looks like a normal string silently breaks `split`/`trim`/equality.

The fix is not normalization at the consumer (slug, render, compare). The fix is to keep these characters out of source so consumers can trust what they receive.

Regex literals are not flagged: a regex that matches smart quotes legitimately needs to contain them. Comments are not covered by this rule.

## Examples

Incorrect:

```ts
const title = 'home — site'
const greeting = "it's me"
const range = '2020 – 2026'
const status = `${name} — ${state}`
const empty = '… empty …'
```

Correct:

```ts
const title = 'home - site'
const greeting = "it's me"
const range = '2020 - 2026'
const status = `${name} - ${state}`
const empty = '... empty ...'

const matchesSmartQuote = /['']/u
```
