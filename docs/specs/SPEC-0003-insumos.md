---
id: SPEC-0003
title: Catálogo de insumos
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF03, RF07, RF11, RN14]
depends_on: [SPEC-0001, SPEC-0002]
milestone: M2
---

# SPEC-0003 — Catálogo de insumos

## 1. Purpose

The insumo catalogue is where nomenclature consistency with DOMS is won or lost.
A.V.'s reported pain — "integração entre plataformas dificulta a nomenclatura e
especificidade dos itens, causando retrabalho" — is addressed here or not at all.

## 2. A resolved contradiction

RF03 says the insumo carries "ATA vinculada". The data model uses `ITEM_ATA` as
an N:N join. Both cannot be true: an insumo owned by one ATA cannot be reused,
and the same paper appearing in three ATAs would be three catalogue entries with
three codes, destroying DOMS correspondence.

**Resolution:** the insumo is a global catalogue entry with a unique DOMS-compatible
`codigo`. Its relationship to ATAs is exclusively through `ITEM_ATA`, which
carries quantity and unit price. Tela 3's "ATA" column shows the ATAs an insumo
participates in, not an ownership field. (OQ-01)

## 3. Behaviour

**AC-0003-01** — A servidor registers an insumo with `codigo`, `descricao`,
`categoria` and `unidade`; `quantidade_referencia` is optional.

**AC-0003-02** — `codigo` matches the DOMS pattern (configurable, default
`^INS-\d{4}$`); a mismatch returns 422 `CODIGO_DOMS_INVALIDO` with a message
showing the expected format and an example (RF07).

**AC-0003-03** — `codigo` is globally unique; a duplicate returns 409 naming the
existing insumo, so the operator reuses it rather than inventing a variant.

**AC-0003-04** — `codigo` is immutable once referenced by any `ITEM_ATA`
(RN14); an edit attempt returns 409 `CODIGO_IMUTAVEL`.

**AC-0003-05** — `quantidade_referencia` is a process-alert threshold only. No
endpoint, report or calculation treats it as stock on hand. A test asserts that
saldo computation is unaffected by any value of this field.

**AC-0003-06** — Importing a DOMS CSV with columns `codigo, nome, categoria,
unidade, estoque, minimo, ata` maps `minimo → quantidade_referencia`, ignores
`estoque` with a warning in the import report, and links `ata` by creating
`ITEM_ATA` rows.

**AC-0003-07** — Import is atomic per file, with a per-row failure report
(same rule as AC-0002-07).

**AC-0003-08** — Import is idempotent: re-uploading the same file updates
existing insumos by `codigo` rather than creating duplicates, and the report
distinguishes created from updated rows.

**AC-0003-09** — `categoria` comes from a controlled list (Expediente, TI, Saúde,
Limpeza, Mobiliário), extensible by a gestor. Free-text categories reintroduce
exactly the nomenclature drift this module exists to prevent.

**AC-0003-10** — An insumo referenced by an `ITEM_ATA` cannot be deleted, only
deactivated.

## 4. Note on the `estoque` column

The DOMS CSV carries a stock figure. SIGI deliberately discards it: the RFC is
explicit that this is not an inventory system, and importing a stock number
creates a second source of truth that nothing keeps current. The import report
states plainly that the column was ignored, so the omission is visible rather
than silent.

## 5. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC §2.3 RF03/RF07, Tela 3, mockup 9.2.2.2, §9.5 CAME mapping |
