---
id: SPEC-0006
title: Saldo por ATA (visão derivada)
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF14, RN10]
depends_on: [SPEC-0002, SPEC-0004]
milestone: M2
---

# SPEC-0006 — Saldo por ATA

## 1. Purpose

Saldo is the number every stakeholder in the RFC's research asked for, and it is
the number most likely to be wrong. This spec defines it as a pure function of
the NE cycle, so that "wrong saldo" becomes impossible by construction rather
than something a reconciliation job fixes after the fact.

## 2. Definition

```
saldo_disponivel(ata) =
      valor_contratado(ata)          -- ATA total + approved aditivos
    - valor_reservado(ata)           -- Σ NEs in pre_empenho, envio_fornecedor
    - valor_empenhado(ata)           -- Σ NEs in ne_emitida
```

NEs in `demanda`, `validacao_saldo` and `cancelada` contribute nothing.
Reservation begins at `pre_empenho` — the first stage past the saldo guard — and
converts to commitment at `ne_emitida`.

**There is no `saldo` column.** There is no endpoint that writes a saldo. The
only way to change a saldo is to change an ATA's contracted value or move an NE
through its state machine. This is the single most important architectural
constraint in the system; see ADR-0003.

## 3. Behaviour

**AC-0006-01** — With no NEs, `saldo_disponivel` equals `valor_contratado` and
`consumo_percentual` is 0.

**AC-0006-02** — The worked example from Tela 5 reproduces exactly: ATA 002/2026
at R$ 2.840.000,00 with one NE of R$ 78.000,00 in `ne_emitida` yields
saldo R$ 2.762.000,00 and consumo 3% (rounded to the nearest whole percent).

**AC-0006-03** — Consumption at or above 80% flags the ATA as
`alto_consumo = true` (RF14); a test at 79.9%, 80.0% and 80.1% pins the boundary.

**AC-0006-04** — Aditivos raise `valor_contratado` and therefore lower
`consumo_percentual` without any NE changing.

**AC-0006-05** — Cancelling an NE in a reserving state releases its value in the
same transaction.

**AC-0006-06** — Saldo is computed from the NE ledger on every read; a test
mutates NE rows directly in the database and asserts the next read reflects it
with no refresh step. This is what distinguishes a derived value from a cached one.

**AC-0006-07** — The saldo endpoint for 500 ATAs and 10.000 NEs responds under
300 ms p95 (RNF01), using an indexed aggregate or a materialised view refreshed
in the same transaction as the NE write — never a stale asynchronous job.

**AC-0006-08** — Money arithmetic uses `Decimal` throughout; a test summing 1.000
NEs of R$ 0,01 asserts exactly R$ 10,00 (RNF15).

**AC-0006-09** — A saldo response states the instant it was computed, so an
exported report can be reproduced and defended in an audit.

## 4. Post-MVP hook: runway projection

The colleague contribution in the RFC appendix (burn-rate projection: "at this
rate the saldo runs out in ~40 days, but vigência ends in 90") is a pure
read-model addition over the same ledger — `Σ valor_empenhado / elapsed days`
against `vigencia_fim`. It requires no schema change, which is precisely why the
derived-saldo design is worth its cost. Tracked as RF21.

## 5. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC §2.3 RF14, §2.5 RN10, Tela 5 |
