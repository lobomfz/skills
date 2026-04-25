#!/usr/bin/env bun

import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { runUnusedReturnFieldsCheck } from '../rules/no-unused-return-fields/rule.ts'

type CpdReport = {
  duplicates: {
    firstFile: { name: string; start: number; end: number }
    secondFile: { name: string; start: number; end: number }
    lines: number
  }[]
}

const ROOT = process.cwd()
const PACKAGE_ROOT = resolve(import.meta.dirname, '../..')
const FIX = process.argv.includes('--fix')
const LINT_DIRS = ['src', 'tests', 'check'].filter((dir) =>
  existsSync(join(ROOT, dir))
)
const OXLINT_CONFIG = existsSync(join(ROOT, '.oxlintrc.json'))
  ? join(ROOT, '.oxlintrc.json')
  : join(PACKAGE_ROOT, '.oxlintrc.json')
const KNIP_CONFIGS = [
  'knip.json',
  'knip.jsonc',
  'knip.ts',
  'knip.js',
  'knip.config.ts',
  'knip.config.js',
]

async function run(args: string[]) {
  const proc = Bun.spawn(args, {
    cwd: ROOT,
    stdout: 'inherit',
    stderr: 'inherit',
  })

  return await proc.exited
}

async function text(args: string[]) {
  const proc = Bun.spawn(args, {
    cwd: ROOT,
    stdout: 'pipe',
    stderr: 'ignore',
  })
  const output = await new Response(proc.stdout).text()
  const exitCode = await proc.exited

  return { output, exitCode }
}

async function hasHead() {
  const result = await text(['git', 'rev-parse', '--verify', 'HEAD'])
  return result.exitCode === 0
}

async function changedSourceFiles() {
  const changedArgs = (await hasHead())
    ? ['git', 'diff', '--name-only', '--diff-filter=ACMR', 'HEAD']
    : ['git', 'ls-files', '--cached', '--others', '--exclude-standard']
  const tracked = await text(changedArgs)
  const untracked = await text([
    'git',
    'ls-files',
    '--others',
    '--exclude-standard',
  ])

  return new Set(
    `${tracked.output}\n${untracked.output}`
      .split('\n')
      .filter(
        (f) => f.startsWith('src/') && (f.endsWith('.ts') || f.endsWith('.tsx'))
      )
  )
}

async function runTypes() {
  const code = await run([
    'bunx',
    '--package',
    '@typescript/native-preview',
    'tsgo',
  ])

  if (code === 0) {
    console.log('Type check passed.')
  }

  return code
}

async function runLint() {
  if (LINT_DIRS.length === 0) {
    return 0
  }

  const fixArgs = FIX ? ['--fix', '--fix-suggestions'] : []

  return await run([
    'bunx',
    '--package',
    'oxlint',
    '--package',
    'oxlint-tsgolint',
    'oxlint',
    '--config',
    OXLINT_CONFIG,
    '--type-aware',
    ...fixArgs,
    ...LINT_DIRS,
  ])
}

async function runKnip() {
  const config = KNIP_CONFIGS.find((file) => existsSync(join(ROOT, file)))

  if (!config) {
    console.error(
      'Knip config missing. Add knip.json before running lobomfz-check.'
    )

    return 1
  }

  return await run(['bunx', '--package', 'knip', 'knip', '--config', config])
}

async function runCpd() {
  const changedFiles = await changedSourceFiles()

  if (changedFiles.size === 0) {
    return 0
  }

  const outDir = mkdtempSync(join(tmpdir(), 'jscpd-'))
  const code = await run([
    'bunx',
    'jscpd',
    '--reporters',
    'json',
    '--output',
    outDir,
    'src',
  ])

  if (code !== 0) {
    return code
  }

  const report = (await Bun.file(
    join(outDir, 'jscpd-report.json')
  ).json()) as CpdReport

  const relevantClones = report.duplicates.filter(
    (d) =>
      changedFiles.has(d.firstFile.name) || changedFiles.has(d.secondFile.name)
  )

  if (relevantClones.length === 0) {
    return 0
  }

  console.error(
    `\n[cpd] Found ${relevantClones.length} duplicate(s) involving changed files:\n`
  )

  for (const clone of relevantClones) {
    console.error(
      `  ${clone.firstFile.name} [lines ${clone.firstFile.start}-${clone.firstFile.end}]`
    )
    console.error(
      `  ${clone.secondFile.name} [lines ${clone.secondFile.start}-${clone.secondFile.end}]`
    )
    console.error(`  ${clone.lines} lines duplicated\n`)
  }

  return 1
}

const exits = await Promise.all([
  runTypes(),
  runLint(),
  runKnip(),
  runCpd(),
  Promise.resolve(runUnusedReturnFieldsCheck(ROOT)),
])

process.exit(exits.some((code) => code !== 0) ? 1 : 0)
