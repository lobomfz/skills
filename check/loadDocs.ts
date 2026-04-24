import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function loadDocs(metaUrl: string) {
  return readFileSync(
    join(dirname(fileURLToPath(metaUrl)), 'docs.md'),
    'utf8'
  )
}
