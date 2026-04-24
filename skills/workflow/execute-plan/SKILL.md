---
name: execute-plan
description: "Plan execution. Use when the user invokes $execute-plan or asks to execute the next phase of a PRD implementation plan."
disable-model-invocation: true
---

<REQUIRED>
Load every relevant skill before starting.
</REQUIRED>

Read the plan file in `./grill/`. Read the source PRD referenced in the plan before starting. Implement only the next incomplete phase. After finishing, mark it done in the plan file and stop — wait for user approval before starting the next phase.

When following TDD within a phase, skip the RED-to-GREEN pause. The plan approval already covers the implementation — run the full Red-Green-Refactor cycle autonomously within each phase. The only pause point is between phases.
