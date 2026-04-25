# skills

personal agent skills, shared rules, linting, and custom check scripts.

## Project Check

install the package in each project that should use the shared check runner and oxlint config.

```sh
bun add -d @lobomfz/check
```

add a project-local `.oxlintrc.json`:

```json
{
  "extends": ["./node_modules/@lobomfz/check/.oxlintrc.json"],
  "rules": {
    "lobomfz/no-trivial-alias": "off"
  }
}
```

add a check script:

```json
{
  "scripts": {
    "check": "lobomfz-check"
  }
}
```

Run it with:

```sh
bun run check
bun run check --fix
```

`lobomfz-check` expects a project-local `knip.json`.

## Agent Rules And Skills

clone this repo when installing the global agent rules and skill files on a machine.

```sh
git clone git@github.com:lobomfz/skills.git
cd skills
bun install
```

symlink `RULES.md` into the global instructions file for each agent:

```sh
ln -s "$PWD/RULES.md" ~/.codex/AGENTS.md
ln -s "$PWD/RULES.md" ~/.claude/CLAUDE.md
```

codex can load the nested `skills/` tree directly:

```sh
ln -s "$PWD/skills" ~/.codex/skills
```

claude needs flat skill links:

```sh
bun run install:claude-skills
```
