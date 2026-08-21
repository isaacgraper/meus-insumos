---
id: SPEC-0002
title: ATAs de Registro de Preços
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF04, RF08, RF11, RF19, RN04, RN11, RN13, RN15]
depends_on: [SPEC-0001]
milestone: M2
---

# SPEC-0002 — ATAs de Registro de Preços

## 1. Purpose

The ATA is the root of every supply cycle. Without it there is no item, no
saldo and no NE. This spec covers its lifecycle, its import from e-Publica, and
the renewal alert that gives Mariana warning before an ATA lapses.

## 2. Lifecycle vs. vigência

The RFC conflates two orthogonal concepts: the ENUM `(em_andamento, concluida,
cancelada)` in the data model, and the badges `Vigente / A vencer / Vencida /
Encerrada / Suspensa` in Tela 4. These are separated here.

- **`status`** (stored, explicit lifecycle): `rascunho → vigente → encerrada`,
  with `suspensa` and `cancelada` reachable from `vigente`.
- **`situacao_vigencia`** (derived, never stored): `vigente` |
  `a_vencer` (≤ 90 days remaining) | `vencida`, computed from
  `vigencia_fim` against the current date.

Storing a derived date state guarantees it goes stale the moment nobody runs the
job that refreshes it.

## 3. Behaviour

**AC-0002-01** — A gestor registers an ATA with número, objeto, fornecedor,
órgão, vigência início/fim, valor total and data de orçamento planilhado.

**AC-0002-02** — `numero` is unique; a duplicate returns 409 `ATA_DUPLICADA`.

**AC-0002-03** — `vigencia_fim` must be after `vigencia_inicio`; otherwise 422.

**AC-0002-04** — `valor_total` must be greater than zero, `NUMERIC(15,2)`; a
value with more than two decimals is rejected rather than silently rounded.

**AC-0002-05** — Only a gestor may create, edit or close an ATA (RN04); servidor
and auditor receive 403.

**AC-0002-06** — A gestor uploads a CSV exported from e-Publica with columns
`numero, objeto, fornecedor, orgao, vigenciaInicio, vigenciaFim, valorTotal,
dataOrcamentoPlanilhado, status`; valid rows are imported and a per-row report
of failures is returned.

**AC-0002-07** — Import is atomic per file: if any row fails validation, nothing
is persisted and the report lists every failing row with its line number and
reason. A half-imported ATA file is worse than a rejected one, because the
operator cannot tell which half.

**AC-0002-08** — A `processo_sei`-style e-Publica process number is validated by
format only; no HTTP request is made to e-Publica (RF08, ADR-0002).

**AC-0002-09** — An ATA within 90 days of `vigencia_fim` with no aditivo appears
in the renewal alert (RF19), ordered by days remaining ascending.

**AC-0002-10** — Closing an ATA sets `status = encerrada` and records the actor
and timestamp.

**AC-0002-11** — Closing is refused with 409 `ATA_COM_NE_PENDENTE` while any NE
against it is in a non-terminal state (RN13); the message names the blocking NEs.

**AC-0002-12** — A suspended ATA accepts no new NEs but retains its history.

**AC-0002-13** — An aditivo increases `quantidade` and/or `valor_total`, is
recorded as its own entity with its own justification, and immediately raises
`saldo_disponivel` (RF15).

**AC-0002-14** — An aditivo exceeding 25% of the original quantity is rejected
with 422 `ADITIVO_ACIMA_DO_LIMITE` (RN15).

**AC-0002-15** — `situacao_vigencia` is computed at read time; a test freezes the
clock at three dates and asserts all three values without any write occurring.

**AC-0002-16** — Every ATA mutation writes a `HISTORICO_MOVIMENTACAO` row with
`dados_anteriores` containing the full prior state.

**AC-0002-17** — Deleting an ATA is not possible through any route; only
cancellation, which preserves history.

## 4. Open questions

OQ-02 (import is CSV, not lookup by process number — confirm with the entity),
OQ-08 (reajuste policy undefined, so RF16 is unspecified), OQ-11 (does the
entity ever run an ATA with multiple fornecedores? The model assumes one).

## 5. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC §2.3 RF04/RF08, Tela 4, mockup 9.2.2.1 |
