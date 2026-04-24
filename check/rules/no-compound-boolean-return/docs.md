## What it does

Flags functions whose entire body is a single `return` of a compound boolean (`&&` or `||` chaining two or more operands).

## Why is this bad?

A boolean return built from `&&` / `||` collapses several independent conditions into a single expression. Each condition has its own reason and its own failure story — hiding them inside a chain of operators erases the story: when the function returns `false`, you can't tell which predicate failed or why. Splitting into early returns makes each gate visible and lets you log, branch, or message per condition later.

## Examples

Incorrect:

```ts
function canDelete(user: User, item: Item) {
  return user.isAdmin && item.authorId === user.id && !item.locked
}
```

Correct:

```ts
function canDelete(user: User, item: Item) {
  if (!user.isAdmin) {
    return false
  }

  if (item.authorId !== user.id) {
    return false
  }

  if (item.locked) {
    return false
  }

  return true
}
```
