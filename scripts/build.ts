import { $ } from 'bun'
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

const sourceRoot = 'check'
const distRoot = 'dist'

await rm(distRoot, { recursive: true, force: true })
await $`bun tsgo -p tsconfig.build.json`

async function copyDocs(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      await copyDocs(path)
      continue
    }

    if (entry.name !== 'docs.md') {
      continue
    }

    const target = join(distRoot, relative(sourceRoot, path))
    await mkdir(dirname(target), { recursive: true })
    await copyFile(path, target)
  }
}

await copyDocs(sourceRoot)
