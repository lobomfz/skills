---
name: slice-prd
description: "Next vertical slice from a PRD. Use when the user invokes $slice-prd or wants to decide the next slice to implement from a PRD."
disable-model-invocation: true
---

Read the PRD and explore the project's current state.

Use the grill-me skill to interview the user about scoping and designing this single slice — never about what comes after. Look for opportunities to extract deep modules — components that encapsulate complexity behind a simple, testable interface that rarely changes.

After the interview, recommend a single next vertical slice that delivers value end-to-end, with your reasoning. Prefer thin slices over thick ones — a slice should be narrow in scope and demoable on its own.
