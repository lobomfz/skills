import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// oxlint-disable-next-line lobomfz/no-export-function -- rule modules share this file-local docs loader
export function loadDocs(metaUrl: string) {
  return readFileSync(
    join(dirname(fileURLToPath(metaUrl)), 'docs.md'),
    'utf8'
  )
}
