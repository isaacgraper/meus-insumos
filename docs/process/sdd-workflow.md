# Spec-Driven Development Workflow

Status: Approved · Owner: Isaac Kleimann Graper

## Principle

The specification is the artifact of record. Code is a derivative of it. An
agent (human or Claude) that changes behaviour without changing a spec has
created undocumented behaviour, which in a public-sector auditability system is
a defect regardless of whether the code works.

## The loop

```
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌────────┐
   │   RFC    │──▶│   SPEC   │──▶│   PLAN   │──▶│ IMPLEMENT  │──▶│ VERIFY │
   └──────────┘   └──────────┘   └──────────┘   └────────────┘   └────────┘
        ▲              │                                             │
        └──────────────┴─────────────  feedback  ─────────────────────┘
```

### 1. RFC (done)

`RFC_SIGI` v1.6 is the frozen problem statement. It is not edited during
implementation. Contradictions found in it go to `docs/open-questions.md`.

### 2. SPEC — *what* the system does

Command: `/spec-new <slug>` · Agent: `spec-author`

One spec per bounded capability. A spec is finished when:

- every acceptance criterion is written Given/When/Then and has an `AC-` ID;
- every criterion is observable from outside the system (an API response, a
  database row, an e-mail, a rendered screen) — "the service should be robust"
  is not a criterion;
- error and permission cases are specified, not just the happy path;
- it lists which `RF`/`RN` it satisfies, and `requirements/traceability.md` is updated.

A spec does **not** contain file names, class names or SQL. That is the plan.

### 3. PLAN — *how* it will be built

Command: `/plan SPEC-XXXX` · Agents: `domain-modeler`, then the implementers

The plan is appended to the spec under `## Implementation plan`. It lists
migrations, modules touched, endpoints added, and the test files that will
prove each `AC-`. Review the plan before any code is written. This is the
cheapest place to catch a wrong design.

### 4. IMPLEMENT

Command: `/implement SPEC-XXXX` · Agents: `backend-implementer`, `frontend-implementer`, `test-author`

Work in this order, and commit at each step:

1. Migration (Alembic) + model.
2. Failing tests derived from the `AC-` list.
3. Service layer until tests pass.
4. API layer.
5. Frontend.

Commit convention: `type(scope): summary [SPEC-XXXX]`, e.g.
`feat(ne): bloqueia avanço com saldo insuficiente [SPEC-0004]`.

### 5. VERIFY

Commands: `/trace`, `/spec-review` · Agents: `traceability-auditor`, `security-reviewer`

Nothing merges until `/trace` reports every `AC-` in the spec mapped to at
least one passing test, and `docs/process/definition-of-done.md` is satisfied.

## Handling drift

When implementation reveals the spec is wrong — which it will, often —

1. Stop coding.
2. Amend the spec, bump its version, add a line to its changelog explaining what
   was learned.
3. Resume.

Never patch the code and leave the spec stale. The moment the two diverge, the
documentation stops being trusted, and once it stops being trusted nobody reads it.

## Working with Claude Code effectively here

- Start a session with the spec, not with the task: `read docs/specs/SPEC-0004 and
  implement AC-0004-07` beats `add saldo validation`.
- Use subagents for context isolation: `traceability-auditor` reads dozens of
  files and should not pollute the main session.
- Use plan mode (`Shift+Tab`) for anything touching the state machine or the audit trail.
- Compact aggressively between specs. Each spec is an independent unit of work.
