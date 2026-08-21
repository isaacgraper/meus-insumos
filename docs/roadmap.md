# Roadmap

16 weeks from kickoff, per RFC §7.1. Note that §7.2 states there is no schedule,
contradicting §7.1 — treated as an editing leftover (OQ-16).

Milestones are reframed here as spec sequences, so progress is measurable as
"specs Implemented" rather than "weeks elapsed".

## M1 — Setup and PoC (weeks 1–2)

Repository, Docker Compose, CI, `/health`, `/auth` skeleton, Alembic baseline,
testcontainers harness.

Specs: none implemented. **Deliverable: this `docs/` tree reviewed and at least
SPEC-0001 and SPEC-0004 promoted to `Approved`.** Also: revoke the leaked
prototype token (OQ-17), add `gitleaks`, and take OQ-05 and OQ-04 to the stakeholder.

## M2 — Backend core (weeks 3–6)

SPEC-0001 (auth, RBAC, members) → SPEC-0002 (ATAs) → SPEC-0003 (insumos) →
SPEC-0007 (audit trail) → SPEC-0006 (saldo) → SPEC-0004 (NE flow).

Order matters: the audit trail lands **before** the NE flow, because
retrofitting transactional history onto an existing state machine means
revisiting every write path. Saldo lands before the NE flow because the NE guard
depends on it.

Exit criteria: every AC in these specs has a passing test; `/trace` reports no
unmapped criteria; coverage ≥ 70%.

## M3 — Frontend MVP (weeks 7–10)

Login, Dashboard, ATAs, Insumos, Saldo por ATA, Notas de Empenho.

Ship the NE pipeline screen first, not the dashboard. It is the core of the
product and the screen most likely to reveal a wrong model, and finding that in
week 7 is survivable in a way that finding it in week 12 is not.

Prerequisite: interview a receiving clerk (OQ-14) and take the baseline
measurements the KPIs depend on (OQ-15).

## M4 — Complete features (weeks 11–13)

SPEC-0005 (NFs + conference) → SPEC-0008 (notifications) → SPEC-0009 (reports) →
LGPD conformance pass → Gov.br OAuth **if** OQ-09 resolved; otherwise it is cut,
not delayed.

## M5 — Testing and deploy (weeks 14–16)

UAT with PROCON/CAC users, OWASP checklist, load tests (RNF01, RNF05), backup and
**rehearsed restore** (RNF11), technical documentation, production deploy with
monitoring.

## Schedule risks

| Risk | Effect | Response |
| --- | --- | --- |
| OQ-05 answered "NEs are multi-item" after M2 | Data-model change through the system's core | Resolve in M1. This is the single most expensive question to answer late. |
| Gov.br registration lead time | M4 slips | Treat as optional scope from the start; institutional login is the MVP path. |
| On-premise operations (TLS, backups, uptime) | Invisible in the plan; consumes M5 | Budget explicitly in M1 and M5, not as a rounding error. |
| Single developer, two stacks | Frontend and backend compete for the same weeks | The vertical-slice order above keeps a working system at every milestone rather than a complete backend and no UI. |
| RF15/RF16/RF17 (aditivo, reajuste, NF conference) appear only in mockups | Hidden scope discovered mid-build | Already surfaced in `requirements/functional.md`; decide in/out at M1. |
