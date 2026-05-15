---
name: skill-principles
description: "Skill writing principles. Use when creating, editing, or reviewing any SKILL.md."
---

Brevity is load-bearing. Every line earns its place. Do not add generic scaffolding — "Quick start", "Workflows", "Review Checklist" — shape without substance.

Do not document obvious competence. “Read first”, “inspect code”, “understand context”, and “think carefully” are noise. Rules should change behavior, not praise the model for having a brain.

A skill's description names the trigger, not the content. Its only job is to get the skill loaded at the right moment, do not summarize what's inside.

Two valid skill shapes: instruction skills produce an artifact when invoked — write commands. Documentation skills inform behavior across many actions — write context, durable facts. Pick consciously: does this skill turn into an artifact each time it runs, or does it shape behavior in the background?

Rules respond to observed failures. Every directive traces back to a real failure pattern. Do not invent guardrails for hypothetical conflicts, blocked states, or edge cases. Imagined problems add surface area while preventing nothing.

EXTREMELY_IMPORTANT: generalize away from the triggering case. The user’s example is evidence, not reusable wording. Picture an entirely different situation where the same rule still holds, then write the rule and any example from that unrelated situation. The original code, names, phrasing, libraries, files, and task shape do not reappear.

Negative directives come only after positive ones fail. First-pass is positive. Only add "do not Y" after "do X" has been observed failing in practice.

Examples are last-resort anchors. Do not add an example only until the abstract rule has been observed failing.

Do not write `unless` clauses. They look precise but smuggle escape hatches into rules. Prefer a direct rule.

Do not standardize the agent's output. Describe what the agent does, not how to format the response.

When a rule bans something, the skill body shouldn't contain what it banned. The skill is the first example.

Cut conversational justifications from skills. Keep only durable context.

Read references/examples.md alongside for wording samples.
