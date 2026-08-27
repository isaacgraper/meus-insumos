---
id: SPEC-0005
title: Notas Fiscais e conferência
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF05, RF11, RF17, RN02, RN05, RN12]
depends_on: [SPEC-0004]
milestone: M4
---

# SPEC-0005 — Notas Fiscais e conferência

## 1. Purpose

The NF closes the cycle: it is the evidence that what was committed was
delivered. Carlos registers it, and Carlos mistypes, so validation quality here
determines whether the −70% error-reduction KPI is achievable.

## 2. Behaviour

**AC-0005-01** — A servidor registers an NF with número, data de emissão, valor,
fornecedor and the NE it belongs to (RN05); any missing field returns 422 naming
it individually.

**AC-0005-02** — The NF binds to `nota_empenho_id` only. There is no route,
schema field or column allowing a direct ATA link (RF05, RN02). The ATA is read
through the NE.

**AC-0005-03** — Binding to an NE whose status is not `ne_emitida` returns 409
`NE_NAO_EMITIDA`, with a test for each of the four non-terminal statuses.

**AC-0005-04** — `data_emissao` may not be in the future; 422 if it is.

**AC-0005-05** — `data_emissao` earlier than the NE's issuance date produces a
warning, not a rejection: the operator confirms explicitly, and the confirmation
is audited. This is a data-quality signal, and blocking it would make legitimate
back-dated documents impossible to register.

**AC-0005-06** — The supplier on the NF must match the supplier on the NE's ATA;
a mismatch returns 409 `FORNECEDOR_DIVERGENTE` naming both.

**AC-0005-07** — The sum of NF values bound to one NE may not exceed the NE
value; exceeding returns 409 `VALOR_ACIMA_DO_EMPENHO` stating both figures (RN12).

**AC-0005-08** — An NF moves through conference statuses `aguardando →
em_conferencia → aprovada | devolvida` (RF17); `devolvida` requires a
justification and permits re-submission.

**AC-0005-09** — A gestor may approve or return an NF; a servidor may register
and submit but not approve their own registration.

**AC-0005-10** — Approving an NF does not alter the ATA saldo. Saldo is deducted
by the NE, never twice. A test asserts the saldo is byte-identical before and
after NF approval — the double-deduction bug this criterion prevents would be
invisible until an audit.

**AC-0005-11** — Every NF mutation writes a `HISTORICO_MOVIMENTACAO` row.

## 3. Gap noted

The RFC's data model gives `NOTA_FISCAL` no status column, while Tela 7 shows
four statuses. This spec adds `status` and `justificativa_devolucao` to the
entity. Recorded as OQ-12.

## 4. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC §2.3 RF05, §2.5 RN02/RN05, Tela 7 |
