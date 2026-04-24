---
name: redaxios
description: "HTTP clients with redaxios. Use when making HTTP requests, building API clients, or fetching external services in TypeScript."
---

# Redaxios

Import as `axios`. Always call with one object argument, never `.get()` / `.post()`.

```typescript
import axios from "redaxios";

const { data } = await axios<ResponseType>({
  method: "GET",
  baseURL: "https://api.example.com",
  url: "/endpoint",
  params: { key: "value" },
  headers: { Authorization: "Bearer token" },
});
```

## Response Types

Inline response generics are fine for trivial responses. Use a named `type` when the response has domain meaning, is reused, has nested objects/lists, or no longer fits as a short one-line shape.

```typescript
// Good
const { data } = await axios<SearchResponse>({ ... });

type SearchResponse = {
  results: { id: number; title: string; year: number }[];
  total: number;
};

// Bad: complex response inline in the generic
const { data } = await axios<{
  results: { id: number; title: string; year: number }[];
  total: number;
}>({ ... });
```
