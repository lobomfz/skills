# skills

my personal agent skills, workflows, linting and custom check scripts

## check script

```sh
git clone git@github.com:lobomfz/skills.git

cd skills

bun install
bun link
```

in your project

```sh
bun link @lobomfz/check
```

## Rules

symlink `RULES.md` into the global instructions file for the agent

```sh
ln -s "$PWD/RULES.md" ~/.codex/AGENTS.md
ln -s "$PWD/RULES.md" ~/.claude/CLAUDE.md
```

## Skills

Codex can load the nested `skills/` tree directly. Claude needs flat skill links.

```sh
ln -s "$PWD/skills" ~/.codex/skills

bun run install:claude-skills
```

## Check

```sh
lobomfz-check
lobomfz-check --fix
```

`lobomfz-check` requires a project-local `knip.json`

## Extend Oxlint

create a project-local `.oxlintrc.json` that extends the shared config

```json
{
  "extends": ["./node_modules/@lobomfz/check/.oxlintrc.json"],
  "rules": {
    "lobomfz/no-trivial-alias": "off"
  }
}
```
