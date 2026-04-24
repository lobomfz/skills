---
name: report
description: "Bug reports. Use when the user reports a bug, asks for a reproduction-first investigation, or invokes /report."
disable-model-invocation: true
---

<REQUIRED>
Load every relevant skill before starting
</REQUIRED>

The user is reporting a bug. Read the code involved, understand the problem, and write a RED test that reproduces it. The test must fail for the right reason — it captures the bug, not a typo in the test.

Stop after the test fails. Show the failure and ask permission to fix.
