---
name: write-a-skill
description: "Agent skills. Use when creating, writing, reviewing, or updating a skill."
metadata:
  - key: "source"
    value: "https://github.com/mattpocock/skills"
---

# Writing Skills

## Process

1. **Gather requirements** - ask user about:
   - What task/domain does the skill cover?
   - What specific use cases should it handle?
   - Does it need executable scripts or just instructions?
   - Any reference materials to include?

2. **Draft the skill** - create:
   - SKILL.md with concise instructions
   - Additional reference files if content exceeds 500 lines
   - Utility scripts if deterministic operations needed

3. **Review with user** - present draft and ask:
   - Does this cover your use cases?
   - Anything missing or unclear?
   - Should any section be more/less detailed?

## Skill Structure

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── REFERENCE.md       # Detailed docs (if needed)
├── EXAMPLES.md        # Usage examples (if needed)
└── scripts/           # Utility scripts (if needed)
    └── helper.js
```

## SKILL.md Template

```md
---
name: skill-name
description: Brief description of capability. Use when [specific triggers].
---

# Skill Name

## Quick start

[Minimal working example]

## Workflows

[Step-by-step processes with checklists for complex tasks]

## Advanced features

[Link to separate files: See [REFERENCE.md](REFERENCE.md)]
```

## Description Requirements

The description has one job: telling the agent **when** to trigger the skill. Nothing else.

It is not a summary of the skill's rules or content. The agent reads the full SKILL.md once triggered — the description only needs to get it there. Every word spent describing _what's inside_ is a word not spent on triggers.

**Format**:

- Max 1024 chars
- Third person
- Name the domain/context + specific triggers (keywords, file types, user phrases, situations)

**Good — names the trigger context**:

```
Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when user mentions PDFs, forms, or document extraction.
```

**Bad — summarizes the rules inside**:

```
Use async/await everywhere, prefer interface over type, never use any, camelCase for variables, snake_case at external boundaries.
```

The bad example tells the agent _what's inside_ the skill — useless for deciding whether to load it. It just needs to know: this is the TypeScript skill, trigger it on .ts/.tsx work.

**Bad — too vague to distinguish**:

```
Helps with documents.
```

Gives no way to pick this over other document skills.

## When to Add Scripts

Add utility scripts when:

- Operation is deterministic (validation, formatting)
- Same code would be generated repeatedly
- Errors need explicit handling

Scripts save tokens and improve reliability vs generated code.

## When to Split Files

Split into separate files when:

- SKILL.md exceeds 100 lines
- Content has distinct domains (finance vs sales schemas)
- Advanced features are rarely needed

## Review Checklist

After drafting, verify:

- [ ] Description includes triggers ("Use when...")
- [ ] SKILL.md under 100 lines
- [ ] No time-sensitive info
- [ ] Consistent terminology
- [ ] Concrete examples included
- [ ] References one level deep
