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

Use the skill-principles skill just before proposing the final wording.

EXTREMELY_IMPORTANT: picture an entirely different situation where the rule still holds. The code that triggered /learn does not reappear. Any example illustrates the rule through an unrelated case. You MUST generalize the rule itself AND the example.

Apply only after the user approves it.
