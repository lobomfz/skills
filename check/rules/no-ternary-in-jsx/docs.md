## What it does

Flags ternaries that render JSX children — `{cond ? <A /> : <B />}` inside elements or fragments. Ternaries in attribute values (`value={muted ? 0 : volume}`) are allowed.

## Preferred pattern

Use two separate `&&` expressions, one per branch:

```tsx
{!!cond && <A />}
{!cond && <B />}
```

The `!!` coerces the guard to boolean so falsy non-boolean values (e.g. `0`) don't render as text.

## Examples

Incorrect:

```tsx
return <div>{user ? <Profile user={user} /> : <SignIn />}</div>

return (
  <Card>
    {items.length > 0 ? <List items={items} /> : <EmptyState />}
  </Card>
)
```

Correct:

```tsx
return (
  <div>
    {!!user && <Profile user={user} />}
    {!user && <SignIn />}
  </div>
)

return (
  <Card>
    {items.length > 0 && <List items={items} />}
    {items.length === 0 && <EmptyState />}
  </Card>
)

// ternary in props: allowed
return <audio volume={muted ? 0 : volume} />
```
