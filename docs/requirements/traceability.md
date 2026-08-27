# Traceability Matrix

Maintained by `/trace` (agent: `traceability-auditor`). Every row must resolve
to a passing test before its spec can move to `Implemented`. An empty Tests cell
on an `Approved` spec is a merge blocker.

## Requirement → Spec

| RF/RN | Spec | Acceptance criteria | Tests | Status |
| --- | --- | --- | --- | --- |
| RF01, RN01 | SPEC-0001 | AC-0001-01..09 | _pending_ | Draft |
| RF02, RF18 | SPEC-0001 | AC-0001-10..14 | _pending_ | Draft |
| RN04, RN07 | SPEC-0001 | AC-0001-15..18 | _pending_ | Draft |
| RF04, RF08, RF19 | SPEC-0002 | AC-0002-01..12 | _pending_ | Draft |
| RN11, RN13, RN15 | SPEC-0002 | AC-0002-13..17 | _pending_ | Draft |
| RF03, RF07, RN14 | SPEC-0003 | AC-0003-01..10 | _pending_ | Draft |
| RF13, RN03, RN08, RN09 | SPEC-0004 | AC-0004-01..18 | _pending_ | Draft |
| RF05, RN02, RN05, RN12, RF17 | SPEC-0005 | AC-0005-01..11 | _pending_ | Draft |
| RF14, RN10 | SPEC-0006 | AC-0006-01..09 | _pending_ | Draft |
| RF06, RF10, RN06 | SPEC-0007 | AC-0007-01..08 | _pending_ | Draft |
| RF09 | SPEC-0008 | AC-0008-01..06 | _pending_ | Draft |
| RF12 | SPEC-0009 | AC-0009-01..07 | _pending_ | Draft |

## Unmapped

Requirements with no spec. This list must be empty before M5.

| Item | Reason |
| --- | --- |
| RF16 (reajuste) | Not yet specified — needs the entity's price-revision policy. OQ-08. |
| RF20, RF21 | Deliberately deferred post-MVP. |
| RN07 | Blocked on OQ-04 (no area/setor attribute exists). |

## Spec → NFR

| NFR | Verified by |
| --- | --- |
| RNF01 | `tests/perf/k6_hot_endpoints.js` |
| RNF03 | `tests/test_auth_tokens.py` |
| RNF05 | `tests/perf/k6_concurrency.js` |
| RNF06 | `frontend/e2e/responsive.spec.ts` |
| RNF08 | `tests/test_audit_immutability.py` |
| RNF09 | CI job `compose-smoke` |
| RNF10 | CI job `coverage` |
| RNF15 | `tests/test_money_precision.py` |
