---
name: learn
description: "Skill rule extraction. Use when the user says /learn or asks to turn feedback into a reusable skill rule."
disable-model-invocation: true
---

The feedback you just received is concrete. The rule that survives it is not.

Read the `write-a-skill` skill — it defines the format. Read the user's existing skills to find where this rule belongs. If nothing fits, propose a new skill.

Grill the user on the rule until you both agree on its shape.

Write the rule as if you'd never seen the code that triggered it — no library names, no domain nouns, no references to the current task. If removing the context makes the rule incoherent, it's not a rule — keep grilling.

Apply only after the user approves the final wording.
