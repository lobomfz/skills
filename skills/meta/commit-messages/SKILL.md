---
name: commit-messages
description: "Commit messages. Use when generating, suggesting, editing, or writing a git commit message."
disable-model-invocation: true
---

# Commit Messages

This skill defines how to write commit messages. Every commit message you generate must follow these rules.

## Structure

Every message has a **verb** and a **target**. Never a bare noun. The verb says what happened, the target says to what.

There is no formal prefix system. No `feat():`, `fix():`, `chore():`, `refactor():` — none of that. The verb is just a natural word at the start.

## Tone

- Lowercase, no period, no capitalization
- Short and direct — aim for 20-50 characters, hard ceiling at 70
- Informal — write like you'd describe the change to a coworker in three seconds
- No filler words, no "improvements", no "various changes"

## Only the *what*, never the *how*

A commit message describes what changed at the behavior level. The technique, strategy, or mechanism used to achieve the change belongs in the diff, not in the message.

## When the diff touches multiple things

Summarize with commas. Each piece still gets a verb when possible.

## What to avoid

- Bare nouns: "paths", "router", "types", "schema" — always pair with a verb
- AI-sounding messages: verbose, formal, capitalized, with periods and scopes
- Conventional commit prefixes: `feat(scope):`, `fix(scope):`, `chore:`

## Examples

```
# wrong: bare noun
schema
# right
fix schema validation

# wrong: AI-sounding, verbose, capitalized
Add comprehensive error handling for payment webhook endpoint.
# right
handle payment webhook errors

# wrong: conventional commit prefix
feat(auth): implement session refresh
# right
add session refresh

# wrong: includes implementation detail
fix duplicate entries, use Set to deduplicate
# right
fix duplicate entries

# wrong: leaks file paths, route patterns, or internal names
move config loading to src/lib/bootstrap.ts
# right
extract config loading

# wrong: explains why
update timeout because upstream is slow
# right
increase timeout

# wrong: filler words
various improvements to the sync flow
# right
fix sync flow
```
