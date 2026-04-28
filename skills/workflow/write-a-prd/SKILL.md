---
name: write-a-prd
description: "Product requirement documents. Use when the user wants to write a PRD, create a product requirements document, or plan a new feature through requirements discovery."
disable-model-invocation: true
metadata:
  - key: "source"
    value: "https://github.com/mattpocock/skills"
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

The PRD describes only the feature's end goal in an ideal scenario, with no concern for how it will be implemented or rolled out.

1. Ask the user for a long, detailed description of the problem they want to solve and any potential ideas for solutions.

2. Explore the repo to verify their assertions and understand the current state of the codebase.

3. Interview the user relentlessly about every aspect of this feature until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

4. Once you have a complete understanding of the problem and solution, use the template below to write the PRD. Save it under `./grill/<descriptive-name>.md`. The content should be in english, regardless of the conversation language.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories with checkboxes. Each user story should be in the format of:

1. [ ] As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. [ ] As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature. Checkboxes are filled by execute-slice as user stories are delivered.

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
