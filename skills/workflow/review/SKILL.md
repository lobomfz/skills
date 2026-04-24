---
name: review
description: "Code review. Use when the user asks to review branch changes, uncommitted changes, a diff, or a pull request."
---

# Code Review

Run a comprehensive code review, then synthesize findings.

## Scope

1. **User specifies scope** — branch name, commit range, or file paths → review that
2. **On a feature branch** — all changes vs main/master, including uncommitted and staged
3. **On main/master with uncommitted changes** — review those
4. **On main/master, clean tree** — review the latest commit

Always include uncommitted working tree changes. Use `git diff <base>` combined with `git diff --cached <base>`, not just `git diff <base>...HEAD`.

## Instructions

Determine the base ref. If the runtime supports parallel agents and the user authorized them, launch focused agents. Otherwise, perform the same review lenses locally.

Each review lens starts from:

```
Base ref: [ref]. Run `git diff [base]` and `git diff --cached [base]` to find changed files and get the diff. Read full files for context but ONLY report findings on lines in the diff. Pre-existing code not in the diff is out of scope.
```

Code marked with `// @human: reason` is a deliberate human decision — silently skip it, don't report findings on it.

Then apply these lenses:

### Lens 1: Correctness & Types

```
Review for correctness problems (logic errors, race conditions, unhandled edge cases, silent error swallowing, missing awaits) AND every type system rule from the project/user instructions applied mechanically. Run the project's type checker.
```

### Lens 2: Design & Project Instructions

```
Review against the project/user instructions, including design principles and operational rules (naming, syntax, imports/exports, runtime, dates, security).
```

### Lens 3: Project Skills

```
Load and read every project skill relevant to the changed code. Review against every rule in every loaded skill. Violations are as serious as bugs.
```

### Lens 4: Tests

```
Review test coverage and quality. Check for mocked internals, implementation-detail testing, missing tests for changed logic, flaky patterns. Run relevant tests.
```

## Synthesize

After every lens is complete:

1. **Deduplicate** — keep the most detailed
2. **Classify** — 🔴 Critical · 🟠 Warning · 🟡 Issue · ⚪ Nitpick
3. **Order by severity**
4. If total findings < 5, state that explicitly

```
## Review: [branch]
🔴 N | 🟠 N | 🟡 N | ⚪ N

1. 🔴 [file:line] Title
   Lens: X | Rule: [specific rule violated]
   `code` → Problem → Consequence

### Clean lenses: [list]
```

Every finding references the specific rule violated. No generic advice. No "looks good overall."
