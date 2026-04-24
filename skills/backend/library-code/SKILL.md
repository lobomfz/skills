---
name: library-code
description: "Publishable npm packages. Use when designing exports, public API types, package entrypoints, dependencies, tests, or release-facing library code."
---

# Library Code

Public libraries are contracts. Prefer explicit public surfaces, boring packaging, and zero import-time surprises.

This skill overrides the general preference for inferred return types on exported APIs.

## Public API

Annotate return types on exported functions and methods that are part of the package API. Internal non-exported functions may rely on inference.

Use controlled named exports. Do not use `export *`.

Keep one public export point at the package root when the package is small. Internal modules should not add barrel files.

Export public types deliberately. Do not leak internal helper types through convenience exports.

## Package Boundaries

Importing the package must not perform work: no network calls, file reads, config loading, global initialization, timers, listeners, or mutable singleton setup.

Expose constructors, factories, or explicit setup functions so the consumer controls initialization.

Independent features should be independently importable/tree-shakeable when the package has meaningful subdomains. Do not split entrypoints before there is a real public boundary.

## Dependencies

Dependencies the consumer must share with the library, such as React, are peer dependencies.

Runtime implementation dependencies are regular dependencies.

Build/test/type tooling stays in devDependencies.

Use optional peer dependencies only when the package can run without that peer and gates the feature at runtime.

## Tests

Test the public API as consumers use it. Do not test private helpers just to preserve implementation shape.

Every public export should have at least one behavior test or an explicit reason it is type-only.

Edge cases should come from the contract: absent input, empty collections, invalid values, and boundary conversions. Do not invent edge cases unrelated to the domain.

## Packaging

`package.json` exports must match the intended public surface.

Do not publish files that are not part of runtime, type declarations, docs, or intentional examples.
