# Coding Principles

Before writing, understand what already exists: conventions, owners, schemas, tests, domain language, previous decisions, and applicable skills. When a change touches a technology, library, workflow, or domain covered by a skill, load that skill before implementing or reviewing. If you are unsure whether a skill applies, load it. Skills are accumulated project context. No code starts from zero.

When principles conflict, use this order:

1. Truth before convenience.
2. Ownership before caller comfort.
3. Simplicity before speculation.
4. Real depth before apparent structure.
5. Understanding before production.

The goal is not to obey a checklist. The goal is to write code whose shape can be defended.

# Skill Loading

A skill is the whole directory, not only `SKILL.md`. `SKILL.md` is the entrypoint.

When a skill applies, read `SKILL.md` first, then read the linked sibling files or `references/*` files that match the current task. Those files are as authoritative as `SKILL.md`. "Read only the relevant reference" means skip unrelated references, not skip references entirely.

# Purpose and Simplicity

Every line needs a present reason. "Might be useful" is not a reason. Speculative code is real cost disguised as prudence.

The simplest solution compatible with reality is the correct one. Three direct lines beat a helper that only names them. A `const` beats a factory. A direct export beats a getter. A concrete type beats a generic interface with one implementation.

A layer must hide real complexity. Repository, service, adapter, wrapper, factory, interface, and helper are not architecture by themselves. If the layer forwards, renames, or chains obvious calls, remove it.

In reviews, judge by this principles, applicable skills, and the current codebase. Do not recommend DI, factories, wrappers, repositories, adapters, interfaces, or config/client injection for testability or hypothetical swaps. New layers need a current, concrete job.

Start from usage. The caller knows what it needs. If coordination fits clearly in the caller, it does not need a new owner. Add an abstraction only after the local code proves that directness is worse.

Defaults reflect usage. When most callers override a default the same way, flip the default; add an opt-in for the minority.

Do not create intermediate variables just to use them once. Inline unless reuse or readability justifies the name. Do not destructure only to pass the values immediately to the next call.

Comments, JSDoc, READMEs, PR templates, and TODOs are not proactive output. Add them only when the user asked or the work is genuinely pending. Function names, parameter names, and types should carry the normal explanation.

# Boundaries and Schemas

Edges distrust. Interiors trust.

User input, route params, CLI args, webhooks, database rows with loose constraints, and external API responses arrive outside the type system. A schema crosses that boundary: it validates, translates, and returns the internal shape. After that, internal code should not keep defending against what the boundary already proved.

The boundary owns transformation: trimming, normalization, parsing dates, converting names, coercing values, and filling legitimate defaults. If code calls `.assert()` and then maps the parsed value into the real shape, the schema stopped too early.

Required data that is absent is an error, not a fallback. Before writing `??`, ask whether the code below should still run if the value is missing. If not, fix the schema or return early. Do not launder required absence with `?? undefined`, `?? null`, `?? ""`, `?? 0`, conditional spread, or consumer-side defaults.

Optional fields are omitted, not passed as `undefined`. Object parameters do not default to `{}`; callers say `run({})` when "no options" is intentional.

HTTP clients do not get manual response generics when a schema validates the response. The HTTP data is unknown until the schema proves it.

If a discriminated union crosses a boundary, validate the whole union once and let `switch` narrow it. Do not validate an envelope and then assert each branch payload again.

Handle errors at the edge of the risky call. A `.catch()` on the specific async call says what can fail. A broad `try/catch` around unrelated statements blurs the failure point. In catch clauses, `catch (err: any)` is acceptable; the usual `unknown` plus `instanceof Error` ceremony rarely adds truth.

# Types as Authority

The type system is the only decision record that both humans and the compiler read. Let truth flow from its source.

Prefer inferred return types. Annotate only public library APIs, families of functions sharing a contract, and generics whose return depends on input. Query builders, schemas, and library signatures already know their result; repeating that result manually creates a second contract.

Do not redeclare shapes that already exist. Infer from schemas, derive from source modules, use dependency types directly, and name exported derived utility types next to the source instead of inlining `Awaited<ReturnType<...>>` at the consumer.

`as` is a smell. If the database type is too wide, fix the database type. If an API payload is unknown, validate it. If a library type is hard to express, contain the assertion in one typed boundary instead of scattering confidence through consumers.

Use `interface extends` instead of `type &` when extending object shapes. Interface extension resolves upfront and reads as a declared relationship.

When a class implements an interface, derive the method signature from the interface instead of redeclaring it. The implementation should not become a parallel contract.

When a function only reads a few fields, accept a structural parameter with those fields. Do not pull a whole derived entity type into a private helper that does not need it.

Prefer a single object with optional fields over a discriminated union when fields can coexist. Use a discriminated union when the variants are truly different shapes and branch logic needs narrowing.

Functions with their own behavior are `async` and await async work. Tiny dispatch callbacks that only hand control to another owner may return the promise directly; the point is to keep wiring flat and logic elsewhere.

# Ownership and Data

Data has direction. The owner is the authority; non-owners query. They do not copy, infer, or become backup sources of truth.

Writing is intent. The confirmed state is what the authority returns or what a verification read proves. Databases apply defaults and constraints. External APIs can fail partially or change behavior. After meaningful writes, read back what matters.

Ownership, visibility, and authorization belong in the operation that touches the data. Fetching broadly and filtering later makes security a memory exercise.

When the database stores free text but code asserts a finite set, ownership has split. The constraint belongs where the data is stored, and TypeScript should derive from that truth.

Backend returns structured facts and codes; frontend owns presentation. The frontend sends identifiers and intent, not copied server data. Server state belongs to the server. UI state belongs to the interface.

External integrations should prefer sync-on-read, write-then-verify, lazy sync when local data is incomplete, and reconciliation that preserves local relationships.

Independent operations should be batched or set-based. Do not await a loop when the operations can run together or be expressed as one database operation.

Finite value correspondences are data: `Record` or `Map`. Branch-specific behavior is control flow: use `switch`, especially when a discriminated union needs narrowing.

Mappings carrying domain meaning live with that domain, usually in `constants/[domain].ts`. Inline mappings are only for component-local details with no broader meaning.

# Objects, Classes, and Modules

Objects group independent domain operations. `DbSchedules.listUpcoming()` says the operation belongs to schedules and has no memory between calls. Top-level loose functions hide ownership; domain operations live in the domain object, even when the object has a single method today.

A new feature starts with its domain object, not with a free function waiting for company. The first operation declares the home; later operations join the object instead of accumulating as siblings. `export const FeatureX = { ... }` is the default shape; a top-level `export function` is the exception and needs a cross-cutting reason no domain owns.

The rule governs exports. A helper used only inside one file is local readability, not ownership; non-exported functions inside a module do not need to be wrapped.

Classes are temporary brains with identity. Use a class when constructor context colors many methods: credentials, current user, request context, a long orchestration, or an API client. If many methods repeat the same first parameter, the object probably has hidden identity and should be a class.

A class needs a job: state, identity, or `private` helpers that organize the public surface. Without one, it is a namespace in disguise. An object whose methods all receive the same context is a process in disguise. Pick the shape that tells the truth.

Use constructor parameter properties when fields only store constructor arguments unchanged. Access the context through the stored object instead of splitting it into duplicated fields.

Data that exists only during one method call is not class state. Pass it through the call chain as a parameter.

Do not wrap a library for hypothetical swaps. Use the library directly unless the wrapper hides real complexity today. The library API is the contract and carries the ecosystem's knowledge.

Internal client mappings are private methods, not exported functions. The caller should not learn how a client converts external states.

A class file belongs to the class. Helpers used only by the class are `private` methods, not loose functions sitting beside it. If the helper is part of the class's job, it joins the class; if it is not, it lives in another file.

Do not inject `env`, config, database handles, or clients just for tests. Direct imports are fine unless they hide variable identity or mutable state.

Top-level exports need a cross-cutting reason. If a function name mentions a domain entity, it belongs with that domain. A catch-all `utils.ts` is usually ownership avoidance.

Use path aliases over deep relative imports. No barrel files. Named exports only. Exported constants carry their domain in the name.

# Testing and Tools

Test the system, not a simulation of your understanding.

Internal code runs for real. Do not mock your own modules, database objects, or domain functions. Change the environment, not the production code. A test database uses real schema and migrations. External APIs are simulated at the boundary with realistic HTTP.

Testability comes from boundaries and environment, not dependency-injection scaffolding. If production code needs factories or extra parameters only so tests can replace internals, the test strategy is wrong.

Trust libraries. A library is accumulated production knowledge. Wrapping it isolates the code from the documentation, examples, and edge cases that justified using it.

Bun projects use Bun: top-level await, `bun test`, `bunx`, Bun file/password/hash APIs when available, and `tsgo` for type checking.

Use `new Date()` for a pure current timestamp. Use `djs` when parsing, formatting, diffing, adding, or subtracting dates.

During development, edit an uncommitted migration directly instead of creating a new `ALTER TABLE` migration. Production migrations are incremental; private draft migrations are still drafts.

# Change Discipline

Remove completely or do not touch. Deprecated aliases, compatibility wrappers, commented-out code, and dead endpoints look intentional to the next reader. Git is the archive.

Renaming means updating every reference and deleting the old name. Removing a feature means walking the full chain: endpoint, schema, database method, type, hook, component, test.

When understanding changes, rewrite the shape. A local patch is correct when the structure is still true and one detail was wrong. If you cannot explain why the code has its current form, rewrite it with the knowledge you have now.

Build vertical slices. A working feature validates database, logic, and interface together. Horizontal infrastructure mostly validates guesses.

After each meaningful slice, stop and reread. After editing a file, ask whether each line adds truth, preserves ownership, avoids duplicated contracts, and solves a present problem. Compile, test what matters, and remove what no longer survives scrutiny.

Never write `// @human` yourself. When existing code has `// @human: reason`, treat it as a deliberate human decision and do not report findings inside its scope.

# House Syntax

Syntax should make the true shape obvious.

- Always bracket `if` bodies.
- Prefer early return over `return condition ? a : b`.
- Do not use a ternary to guard nullish access when optional chaining expresses the same thing.
- Do not declare `let` and assign inside conditionals; extract a function that returns the value.
- Group related positional parameters into an object.
- Use `items.at(-1)`, not `items[items.length - 1]`.
- Use `!!value`, not `Boolean(value)`.
- Use `{ id: number }[]`, not `Array<{ id: number }>`.
- Keep blank lines between distinct blocks: declarations, guards, loops, and returns.

`snake_case` belongs to external boundaries and database fields. `camelCase` belongs to internal code. Endpoint inputs and outputs are external shapes; the endpoint schema is the boundary.
