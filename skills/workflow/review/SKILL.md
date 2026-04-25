---
name: review
description: "Code review. Use when the user asks to review branch changes, uncommitted changes, a diff, or a pull request."
disable-model-invocation: true
---

# Code Review

Run a delegated code-quality review and synthesize the findings.

## Scope

1. If the user specifies a branch, commit range, pull request, or file paths, review that scope.
2. On a feature branch, review changes against the default base branch, including staged and unstaged changes.
3. On `main`/`master` with uncommitted changes, review the uncommitted changes.
4. On `main`/`master` with a clean tree, review the latest commit.

Resolve the base ref before delegation. For dirty-tree-only reviews, use `HEAD`. If the repository has no commits, use Git's empty tree hash.

Always include staged and unstaged changes in scope. The reviewers will inspect both `git diff <base>` and `git diff --cached <base>`.

## Delegation

Always spawn exactly three subagents in parallel with the same `cwd`, base ref, and scope. Use `fork_context: false` for all reviewers. If the user specifies a model or reasoning effort, use it; otherwise inherit the current defaults.

Pass each subagent only:

- `cwd`
- base ref
- user-requested scope, if any
- the path to its reviewer file

Do not review locally while the subagents are running. The parent owns routing and synthesis, not independent review.

Use these reviewer files:

- [IMPLEMENTATION_REVIEWER.md](IMPLEMENTATION_REVIEWER.md)
- [SKILL_REVIEWER.md](SKILL_REVIEWER.md)
- [VERIFICATION_REVIEWER.md](VERIFICATION_REVIEWER.md)

## Parent Prompt Shape

Implementation reviewer:

```text
Review implementation quality in [cwd] against base [base].
Scope: [scope or "all changes in scope"].
Follow [absolute path]/IMPLEMENTATION_REVIEWER.md.
```

Skill reviewer:

```text
Review project skill compliance in [cwd] against base [base].
Scope: [scope or "all changes in scope"].
Follow [absolute path]/SKILL_REVIEWER.md.
```

Verification reviewer:

```text
Review verification quality in [cwd] against base [base].
Scope: [scope or "all changes in scope"].
Follow [absolute path]/VERIFICATION_REVIEWER.md.
```

## Synthesis

After all three subagents finish:

1. Deduplicate overlapping findings, keeping the clearest evidence.
2. Do not invent findings that neither subagent reported.
3. Classify and order findings by severity: Critical, Warning, Issue, Nitpick.
4. If total findings are fewer than five, say so explicitly.

Use this output shape:

```text
## Review: [scope]
Critical N | Warning N | Issue N | Nitpick N

1. [severity] [file:line] Title
   Rule: [specific rule, when applicable]
   Problem -> Consequence
```

Every finding must reference a concrete changed line. Avoid generic advice and broad "looks good overall" summaries.
