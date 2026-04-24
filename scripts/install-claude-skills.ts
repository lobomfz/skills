#!/usr/bin/env bun

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  symlinkSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const SKILLS_ROOT = join(REPO_ROOT, 'skills')
const CLAUDE_SKILLS_DIR = join(homedir(), '.claude', 'skills')

function requireRealDirectory(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
    return
  }

  const stat = lstatSync(path)

  if (stat.isSymbolicLink()) {
    throw new Error(`${path} is a symlink. Replace it with a real directory before installing flat Claude skills.`)
  }

  if (!stat.isDirectory()) {
    throw new Error(`${path} exists but is not a directory.`)
  }
}

function skillDirs() {
  const skills = new Map<string, string>()

  for (const group of readdirSync(SKILLS_ROOT, { withFileTypes: true })) {
    if (!group.isDirectory()) {
      continue
    }

    const groupPath = join(SKILLS_ROOT, group.name)

    for (const skill of readdirSync(groupPath, { withFileTypes: true })) {
      if (!skill.isDirectory()) {
        continue
      }

      const skillPath = join(groupPath, skill.name)

      if (!existsSync(join(skillPath, 'SKILL.md'))) {
        continue
      }

      const existing = skills.get(skill.name)

      if (existing) {
        throw new Error(`Duplicate Claude skill name "${skill.name}": ${existing} and ${skillPath}`)
      }

      skills.set(skill.name, skillPath)
    }
  }

  return [...skills.entries()]
}

function linkSkill(name: string, skillPath: string) {
  const destination = join(CLAUDE_SKILLS_DIR, name)

  if (!existsSync(destination)) {
    symlinkSync(skillPath, destination, 'dir')
    return 'created'
  }

  const stat = lstatSync(destination)

  if (!stat.isSymbolicLink()) {
    throw new Error(`${destination} already exists and is not a symlink.`)
  }

  const currentTarget = resolve(CLAUDE_SKILLS_DIR, readlinkSync(destination))

  if (currentTarget !== skillPath) {
    throw new Error(`${destination} already points to ${currentTarget}, not ${skillPath}.`)
  }

  return 'unchanged'
}

requireRealDirectory(CLAUDE_SKILLS_DIR)

let created = 0
let unchanged = 0

for (const [name, skillPath] of skillDirs()) {
  const result = linkSkill(name, skillPath)

  if (result === 'created') {
    created++
  } else {
    unchanged++
  }
}

console.log(`Claude skills installed: ${created} created, ${unchanged} unchanged.`)
