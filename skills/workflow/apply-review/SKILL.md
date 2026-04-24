---
name: apply-review
description: "Interactive review application. Use when the user invokes $apply-review or wants to triage review findings one by one before applying fixes."
disable-model-invocation: true
---

Load every relevant project skill for the code being touched. Do not delegate this to another agent.

Inspect all findings before starting the review session, discard the ones completely out of scope (e.g user asked for uncommited changes review and the finding is from another commit), UNQUESTIONABLY false, or targeting code marked with `// @human: reason` (deliberate human decision — skip silently).

Categorize each finding as either **quick fix** (mechanical, localized change) or **refactor** (structural change, needs design discussion).

Do not touch any code during the review. The entire presentation phase is about collecting decisions — no edits, no fixes, no file writes until explicitly told to apply.

Then present each finding one at a time, highest severity first. Always prefix each finding with its position and total count in the format `N/TOTAL` (e.g. `3/17`). For each one, explain the problem, say whether you agree with the finding, state its category (quick fix or refactor), and recommend a possible fix.

If a finding is a clear, unambiguous violation of a skill or AGENTS.md rule AND the fix is mechanical, mark it as approved — just state the finding and note it will be applied at the end. For everything else, ask: "apply (a) or skip (s)?" and wait for the user's decision.

After all findings are reviewed, apply approved quick fixes locally. For each approved refactor, use the grill-me skill to discuss the approach with the user until they explicitly approve the final shape.

Ask the user for permission to fix, then apply everything at once. Verify the code compiles and tests pass.

After everything is applied and verified, emit the exact literal `[APPLY_REVIEW_COMPLETE]` as the final line of your response.
