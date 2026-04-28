---
name: learn
description: "Skill rule extraction and creation. Use when the user says /learn."
disable-model-invocation: true
---

The user wants to encode a behavior into a skill. Use the grill-me skill, one step at a time. Settle each with the user before advancing.

1. Ground the rule in a specific case — what behavior is ideal there.
2. Generalize the rule. The user's example is illustration, not rule — lift it away from the names, the library, the task. Probe for dimensions the rule misses — like an exception or extra rigidity. If the rule loses meaning without that context, it is not a rule yet.
3. Locate the home. Ask the user if they have a specific skill in mind to edit. Otherwise, read their skills and find one whose scope already covers this. Only propose a new skill when none fits.

While reading the existing skills, look for issues that may explain the failure — like a weak trigger to a reference, a duplicated rule, or a misplaced one. The fix may be structural rather than a new rule.

Read EXAMPLES.md just before proposing the final wording. Apply only after the user approves it.

The skill itself follows these principles.

Brevity is load-bearing. Every line earns its place. The LLM default is generic scaffolding — "Quick start", "Workflows", "Review Checklist" — shape without substance.

A skill's description names the trigger, not the content. Its only job is to get the skill loaded at the right moment. Do not summarize what's inside; the agent reads the body once loaded.

Rules respond to observed failures. Every directive traces back to a real failure pattern. Imagined edge cases add surface area while preventing nothing. If you do not have a concrete observation behind a rule, the rule is not ready.

Negative directives come only after positive ones fail. First-pass is positive. Add "do not Y" only after "do X" has been observed failing in practice — specific language the agent cannot reinterpret.

Do not standardize the agent's output. Describe what the agent does, not how to format the response.
