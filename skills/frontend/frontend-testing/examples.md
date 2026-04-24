# Examples

Full forms of the three test types. All follow the contract described in `SKILL.md`.

## DOM setup

Every test loads a `setup-dom.ts` that registers jsdom/happy-dom globally:

```ts
// tests/web/setup-dom.ts
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
```

Imported as a side effect at the top of every test file:

```ts
import './setup-dom'
```

## Component test

Isolated render, static assert via `data-*`. No router, no query client, no interaction.

```tsx
import '../../setup-dom'
import { afterEach, describe, expect, test } from 'bun:test'

import { ScanProgress } from '@/web/routes/media.$id/-components/scan-progress'

import { get, slot } from '../../dom'
import { cleanup, render } from '../../testing-library'

afterEach(() => {
  cleanup()
})

describe('ScanProgress', () => {
  test('omits current-step when fileProgress has no step', () => {
    render(
      <ScanProgress
        progress={{ current: 1, total: 3 }}
        fileProgress={{ ratio: 0.42 }}
      />
    )

    const el = get('scan-progress', { ratio: '0.42' })

    expect(el.dataset.currentStep).toBeUndefined()
    expect(slot(el, 'file-bar').dataset.ratio).toBe('0.42')
  })

  test('shows file bar with raw ratio for 0.999', () => {
    render(
      <ScanProgress
        progress={{ current: 1, total: 3 }}
        fileProgress={{ current_step: 'keyframes', ratio: 0.999 }}
      />
    )

    expect(slot(get('scan-progress'), 'file-bar').dataset.ratio).toBe('0.999')
  })
})
```

Notes:

- Filters are strings: `{ ratio: '0.42' }` — DOM attributes are always strings.
- `toBeUndefined()` for absence — the component omitted the attribute.
- `slot(el, 'file-bar')` scopes the search inside the parent.
- `0.999` stays `'0.999'` in `dataset` — raw value, no rounding.

## Flow test

Mounts the whole app, navigates, clicks, waits for effect. Uses `mountApp` (see below) and seeds.

```tsx
import '../../setup-dom'
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { TestSeed } from '../../helpers/seed'
import { get, query, slot } from '../../dom'
import { mountApp } from '../../mount-app'
import { cleanup, waitFor } from '../../testing-library'

beforeEach(() => {
  TestSeed.reset()
})

afterEach(async () => {
  await cleanup()
})

describe('downloads pill', () => {
  test('adding torrent increments counter', async () => {
    await TestSeed.library.matrix()

    const { user } = mountApp(`/media/ABC123`)

    await waitFor(
      () => {
        get('release-row', { 'source-id': 'ABC' })
      },
      { timeout: 5000 }
    )

    await user.click(get('release-row', { 'source-id': 'ABC' }))
    await user.click(slot(get('action-bar'), 'download'))

    await waitFor(() => {
      expect(get('download-pill').dataset.count).toBe('1')
    })
  })

  test('rejected torrent shows toast without phantom entries', async () => {
    await TestSeed.search.matrix()

    const { user } = mountApp(`/media/ABC123`)

    await user.click(get('release-row', { 'source-id': 'ABC' }))
    await user.click(slot(get('action-bar'), 'download'))

    await waitFor(() => {
      expect(get('toast').dataset.code).toBe('TORRENT_REJECTED')
    })

    expect(query('download-pill')).toBeNull()
  })
})
```

Notes:

- `mountApp(path)` returns `{ user, queryClient, router }`.
- `waitFor` re-runs the callback until it doesn't throw, or times out.
- Toast/pill identified by `data-code` / `data-component`, not by text or role.
- `query('download-pill')` returns `null` to confirm absence.

### The `mountApp` helper

```tsx
// tests/web/mount-app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { Suspense } from 'react'

import { routeTree } from '@/web/routeTree.gen'

import { TestQueryClients } from './query-clients'
import { render, userEvent } from './testing-library'

export function mountApp(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, throwOnError: false },
    },
  })

  TestQueryClients.add(queryClient)

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    context: { queryClient },
  })

  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  )

  return { user, queryClient, router }
}
```

### The query client registry

`TestQueryClients` tracks clients created for cleanup between tests:

```ts
// tests/web/query-clients.ts
import type { QueryClient } from '@tanstack/react-query'

const clients = new Set<QueryClient>()

export const TestQueryClients = {
  add(client: QueryClient) {
    clients.add(client)
  },
  clear() {
    for (const client of clients) {
      client.clear()
    }
    clients.clear()
  },
}
```

The wrapper's `cleanup` calls `TestQueryClients.clear()` — see `assets/testing-library.ts`.

## Hook test

Hooks are tested with `renderHook`; asserts on the return value, not the DOM. Providers via `wrapper`.

```tsx
import '../../setup-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, test } from 'bun:test'
import type { ReactNode } from 'react'

import { useScanProgress } from '@/web/routes/media.$id/-utils/use-scan-progress'

import { cleanup, renderHook, waitFor } from '../../testing-library'

afterEach(async () => {
  await cleanup()
})

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useScanProgress', () => {
  test('returns progress data once the scan produces state', async () => {
    const { result } = renderHook(() => useScanProgress('ABC123'), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data?.current).toBe(1)
  })
})
```

Notes:

- `renderHook` returns `{ result }`; `result.current` is the current value.
- `wrapper` provides the providers the hook consumes.
- No DOM, no `data-*` — asserts only on the hook's return.

## Common patterns

### Waiting for an element

```ts
await waitFor(
  () => {
    get('download-pill')
  },
  { timeout: 2000 }
)
```

`waitFor` re-runs the callback until it doesn't throw. `get` throws when not found — they combine naturally.

### Confirming absence

```ts
expect(query('toast')).toBeNull()
```

`query` returns `null` on zero matches and throws on multiple. It's the right helper for negative assertions.

### Identifying multiple items

```ts
get('release-row', { 'source-id': 'ABC' })
get('release-row', { 'source-id': 'DEF' })
```

Each row has its own identity via `data-<entity>-id`. Don't use `getAllByRole('row')` or iterate by index — explicit identity is stable.

### Adding an attribute to the component

When the test needs a value the component doesn't expose:

```tsx
// before
<div data-component="download-pill">{count}</div>

// after — count becomes observable because the test will assert on it
<div data-component="download-pill" data-count={count}>{count}</div>
```

Same change, same commit. If the test is removed and the attribute has no other consumer, remove it from the component as well.
