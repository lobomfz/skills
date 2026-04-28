---
name: skill-linter
description: "Lint and optimize existing skills. Use when the user says /skill-linter."
disable-model-invocation: true
---

The user wants to optimize one or more existing skills. Use the grill-me skill for the dialogue — one step at a time, settling each with the user.

Read the skill-principles skill first, before reading any targets.

1. Scope. Ask which skill(s) and any specific concern. Read the targets.
2. Surface issues against skill-principles — like weak triggers, duplicates, bloat, or misplaced rules.
3. Propose the structural fix for each issue.

Apply only after the user approves the changes.
