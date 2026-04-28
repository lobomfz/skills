Skill rules stay at 1-2 sentences. Cut to the rule.

Verbose:

> Tests should run against a real database whenever possible to catch issues that mocks would hide. When testing code that interacts with the database, prefer integration tests over unit tests with mocked database calls, because mocks can drift from production behavior over time and create false confidence in code paths that would actually fail in production.

Tight:

> Tests run against the real database, never mocks.

Verbose:

> When working with the type system, prefer to derive types from a single authoritative source rather than redeclaring them in multiple places. If the database schema or API response defines a shape, use the inferred type from that source instead of writing a parallel type declaration that duplicates the structure. Duplicated type declarations create a second contract that can drift from the first.

Tight:

> Derive types from their source; do not redeclare shapes that already exist.

Verbose:

> Functions should be named according to what they return rather than what they do internally. A function called `getUserData` is unhelpful because every reader has to look at the implementation to understand what data is returned. Better to name it according to the actual shape of the return value, so callers can predict the result without inspecting the function.

Tight:

> Function names describe what they return, not what they do internally.
