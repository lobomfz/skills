---
name: external-integration
description: "External service integrations. Use when implementing API clients, webhook handlers, data synchronization, write verification, or reconciliation with external systems."
---

# External Integration

External systems own their current state. The local database owns local relationships, app decisions, and the last confirmed external facts.

Use these patterns when code reads from or writes to an external authority.

## Sync-on-Read

When a use case reads authoritative external state for a durable local record, persist the confirmed facts before returning. A read is a sync opportunity, not just response material.

This does not apply to ephemeral reads with no local owner: token checks, health checks, previews, autocomplete, temporary quotes, dry-runs, webhook signature verification, and similar flows. Name those as preview/verify/ephemeral operations so they do not look like missed sync.

## Write-then-Verify

After a meaningful external write, read back what proves the operation actually took effect. External APIs can accept a request, apply it partially, delay consistency, or fail in a way the first response does not reveal.

Local state changes after external writes should reflect what the confirmation read proved, not what the request intended.

## Lazy Sync

Do not call the external system just to fill data the use case does not need. If local data is complete for the current operation, use it.

If local data is incomplete and the external read is necessary, apply sync-on-read to the returned facts instead of merging them only into the response.

## Reconciliation

Preserve local relationships while refreshing external state. A user linking a local record to an external record is a local business decision; status, price, remote metadata, and deletion/auth failures are external facts.

Reconcile by stable external identifiers. Use set-based database operations or upserts when updating multiple records.

## Ingestion Normalization

Normalize external data at ingress: sync conversion, import parsing, webhook handling, or endpoint schemas. Trim strings, strip formatting, normalize casing, and convert external names before persistence.

Once data is clean in the database, queries should use direct equality and typed fields. Do not move normalization into every `WHERE` clause with `LOWER()`, `TRIM()`, `regexp_replace`, or equivalent query-time cleanup.

If historical data is dirty, clean it with a backfill migration and keep new writes normalized at the boundary.
