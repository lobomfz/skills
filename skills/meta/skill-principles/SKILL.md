---
name: skill-principles
description: "Skill writing principles. Use when creating, editing, or reviewing any SKILL.md."
---

Brevity is load-bearing. Every line earns its place. The LLM default is generic scaffolding — "Quick start", "Workflows", "Review Checklist" — shape without substance.

A skill's description names the trigger, not the content. Its only job is to get the skill loaded at the right moment. Do not summarize what's inside; the agent reads the body once loaded.

Rules respond to observed failures. Every directive traces back to a real failure pattern. Imagined edge cases add surface area while preventing nothing. If you do not have a concrete observation behind a rule, the rule is not ready.

Negative directives come only after positive ones fail. First-pass is positive. Add "do not Y" only after "do X" has been observed failing in practice — specific language the agent cannot reinterpret.

Do not standardize the agent's output. Describe what the agent does, not how to format the response.

Read EXAMPLES.md alongside these principles for verbose vs tight wording samples.
