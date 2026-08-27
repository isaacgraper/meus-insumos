---
id: SPEC-0004
title: Fluxo de Notas de Empenho
status: Draft
version: 0.1
owner: Isaac Kleimann Graper
satisfies: [RF13, RF11, RN03, RN08, RN09, RN11]
depends_on: [SPEC-0001, SPEC-0002, SPEC-0003, SPEC-0006, SPEC-0007]
milestone: M2
---

# SPEC-0004 — Fluxo de Notas de Empenho

## 1. Purpose

The NE flow is the core of SIGI. Everything else — ATAs, insumos, saldo, NFs,
the audit trail — exists to serve it. This spec defines the five-stage state
machine, who may move it, what is checked at each transition, and what is
recorded. Mariana's problem ("where is this process right now?") is answered
here or nowhere.

## 2. Scope

**In scope**
- Creating an NE request against an ATA and an item.
- The five-stage sequential machine and its guards.
- Reversal with justification.
- Stage counters for the module header (emitidas / em andamento / total).
- NE numbering.

**Out of scope**
- Saldo computation and reservation semantics → SPEC-0006 (this spec *calls* it).
- NF registration → SPEC-0005.
- E-mail dispatch → SPEC-0008 (this spec *emits the events*).
- Multi-item NEs → post-MVP, see OQ-05. **This is a significant simplification:
  the MVP models one insumo per NE.**

## 3. Domain model touched

`NOTA_EMPENHO` (created), `ATA` (read + row lock), `ITEM_ATA` (read),
`HISTORICO_MOVIMENTACAO` (append).

Invariants this spec owns:
- I1: an NE's `status` only ever moves along the declared transition table.
- I2: an NE always references an `ITEM_ATA`, which determines both its ATA and
  its insumo. `ata_id` and `insumo_id` on `NOTA_EMPENHO` are denormalised copies
  and must be consistent with `item_ata_id` — enforced by a DB trigger. See OQ-06.
- I3: no NE exists without a `processo_sei`.

## 4. Behaviour

### 4.1 The state machine

```
                        ┌──────────────────────────────────────┐
                        │            reversal (gestor)         │
                        ▼                                      │
   ┌─────────┐   ┌──────────────────┐   ┌──────────────┐   ┌────────────────┐   ┌─────────────┐
   │ demanda │──▶│ validacao_saldo  │──▶│ pre_empenho  │──▶│ envio_fornecedor│──▶│ ne_emitida  │
   └─────────┘   └──────────────────┘   └──────────────┘   └────────────────┘   └─────────────┘
        │                 │                                                            │
        │                 └── saldo insuficiente ──▶ blocked, stays in validacao_saldo  │
        │                                                                              │
        └── cancelamento (gestor, com justificativa) ──▶ [cancelada] ◀──────────────────┘
                                                                    (not allowed from ne_emitida)
```

`ne_emitida` is terminal. `cancelada` is terminal and reachable from any
non-terminal state by a `gestor` with a justification. **The RFC does not
mention cancellation; it is added here because an NE opened in error otherwise
has no exit and would permanently hold reserved saldo.** See OQ-07.

**AC-0004-01** — Opening an NE
```gherkin
Given an ATA "ATA 002/2026" that is vigente with saldo disponível of R$ 2.840.000,00
And   an ITEM_ATA for "Notebook corporativo i7 16GB"
When  a gestor opens an NE with processo_sei "00301.000451/2026-12", quantity 10 and estimated value R$ 78.000,00
Then  the NE is created with status "demanda"
And   the response contains a numero matching the pattern "^\d{4}NE\d{6}$"
And   a HISTORICO_MOVIMENTACAO row exists with acao "ne.criada" and the gestor's usuario_id
```

**AC-0004-02** — Mandatory fields (RN09)
```gherkin
Given a gestor
When  an NE is opened without processo_sei, item_ata_id, quantidade or valor_estimado
Then  the response is 422
And   the error body lists each missing field individually by name
And   no NE row is created
```

**AC-0004-03** — Processo SEI format
```gherkin
Given a gestor
When  an NE is opened with processo_sei "12345"
Then  the response is 422 with error code "PROCESSO_SEI_INVALIDO"
And   the message explains the expected format "NNNNN.NNNNNN/AAAA-DD"
```
Rationale: Carlos's transcription errors are the single most cited pain. Format
validation is the cheapest mitigation available (RF08, ADR-0002).

**AC-0004-04** — Sequential advance
```gherkin
Given an NE in status "demanda"
When  the gestor advances it
Then  its status becomes "validacao_saldo"
And   a HISTORICO_MOVIMENTACAO row records the transition with dados_anteriores containing status "demanda"
```

**AC-0004-05** — Skipping is rejected (RN08)
```gherkin
Given an NE in status "demanda"
When  a transition directly to "ne_emitida" is requested
Then  the response is 409 with error code "TRANSICAO_INVALIDA"
And   the NE status is unchanged
And   the attempt is recorded in the audit trail
```
The full transition table below is exhaustive; the test suite asserts every cell.

| from \ to | demanda | validacao_saldo | pre_empenho | envio_fornecedor | ne_emitida | cancelada |
| --- | --- | --- | --- | --- | --- | --- |
| **demanda** | — | ✅ | ❌ | ❌ | ❌ | ✅ gestor |
| **validacao_saldo** | ↩ gestor | — | ✅ guarded | ❌ | ❌ | ✅ gestor |
| **pre_empenho** | ❌ | ↩ gestor | — | ✅ | ❌ | ✅ gestor |
| **envio_fornecedor** | ❌ | ❌ | ↩ gestor | — | ✅ | ✅ gestor |
| **ne_emitida** | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **cancelada** | ❌ | ❌ | ❌ | ❌ | ❌ | — |

↩ = reversal, one step only, gestor with justification (RN03).

**AC-0004-06** — Reversal requires justification (RN03)
```gherkin
Given an NE in status "pre_empenho"
When  a gestor reverses it without a justificativa
Then  the response is 422 with error code "JUSTIFICATIVA_OBRIGATORIA"
And   the NE status is unchanged
```

**AC-0004-07** — Reversal is recorded
```gherkin
Given an NE in status "pre_empenho"
When  a gestor reverses it with justificativa "valor divergente da proposta"
Then  its status becomes "validacao_saldo"
And   a HISTORICO_MOVIMENTACAO row exists with acao "ne.revertida", the justificativa, and dados_anteriores containing status "pre_empenho"
And   the reserved saldo of the ATA is unchanged
```

**AC-0004-08** — Servidor may advance but not reverse
```gherkin
Given an NE in status "demanda"
When  a servidor advances it
Then  the response is 200 and the status becomes "validacao_saldo"
When  the same servidor attempts to reverse it
Then  the response is 403 with error code "PERFIL_NAO_AUTORIZADO"
And   the denial is recorded in the audit log
```

**AC-0004-09** — Auditor is read-only
```gherkin
Given an NE in any status
When  an auditor attempts any transition
Then  the response is 403
```

**AC-0004-10** — Reversal is one step only
```gherkin
Given an NE in status "envio_fornecedor"
When  a gestor requests reversal to "demanda"
Then  the response is 409 with error code "TRANSICAO_INVALIDA"
```
Multi-step reversal must be performed one step at a time, each with its own
justification, so that the audit trail explains each retreat rather than one
unexplained jump.

**AC-0004-11** — `ne_emitida` is terminal
```gherkin
Given an NE in status "ne_emitida"
When  any transition, including cancellation, is requested
Then  the response is 409
```
Once budget is committed and the supplier notified, correction happens through a
new administrative instrument, not by mutating the record.

### 4.2 Saldo guard

**AC-0004-12** — Insufficient saldo blocks pré-empenho (RN10)
```gherkin
Given an ATA with saldo disponível of R$ 50.000,00
And   an NE in status "validacao_saldo" with valor estimado R$ 78.000,00
When  the gestor advances it to "pre_empenho"
Then  the response is 409 with error code "SALDO_INSUFICIENTE"
And   the message states the available saldo and the shortfall in BRL
And   the NE remains in "validacao_saldo"
```

**AC-0004-13** — Concurrency
```gherkin
Given an ATA with saldo disponível of R$ 100.000,00
And   two NEs of R$ 60.000,00 each in status "validacao_saldo"
When  both are advanced to "pre_empenho" simultaneously
Then  exactly one succeeds
And   the other receives 409 "SALDO_INSUFICIENTE"
```
Implementation note: the guard reads the ATA with `SELECT ... FOR UPDATE` inside
the same transaction as the status change. Reading saldo, then writing status,
in separate transactions is the defect this criterion exists to prevent.

**AC-0004-14** — Reservation on entering pré-empenho
```gherkin
Given an ATA with valor contratado R$ 100.000,00 and no NEs
When  an NE of R$ 30.000,00 reaches "pre_empenho"
Then  the ATA's valor_reservado is R$ 30.000,00
And   its valor_empenhado is R$ 0,00
And   its saldo_disponivel is R$ 70.000,00
```

**AC-0004-15** — Commitment on issuance
```gherkin
Given the NE from AC-0004-14 advancing to "ne_emitida"
When  the transition completes
Then  the ATA's valor_reservado is R$ 0,00
And   its valor_empenhado is R$ 30.000,00
And   its saldo_disponivel is still R$ 70.000,00
```

**AC-0004-16** — Cancellation releases reservation
```gherkin
Given an NE of R$ 30.000,00 in "pre_empenho"
When  a gestor cancels it with a justificativa
Then  the ATA's saldo_disponivel returns to its prior value
And   the release is recorded in the audit trail
```

### 4.3 ATA eligibility

**AC-0004-17** — Expired or closed ATA (RN11)
```gherkin
Given an ATA whose vigencia_fim is in the past, or whose status is "encerrada" or "cancelada"
When  an NE is opened against it
Then  the response is 409 with error code "ATA_NAO_ELEGIVEL"
And   the message names the reason (vencida / encerrada / cancelada)
```

### 4.4 Indicators

**AC-0004-18** — Stage counters (RF13)
```gherkin
Given 1 NE in "ne_emitida", 4 NEs in intermediate stages and 0 cancelled
When  the NE module is loaded
Then  it reports emitidas = 1, em andamento = 4, total = 5
And   cancelled NEs are excluded from "em andamento" and included in "total"
```

## 5. Errors and edge cases

| Condition | HTTP | Error code | Message (pt-BR) |
| --- | --- | --- | --- |
| Missing mandatory field | 422 | `CAMPO_OBRIGATORIO` | "Informe o campo {campo} para abrir a NE." |
| Malformed Processo SEI | 422 | `PROCESSO_SEI_INVALIDO` | "Número de processo inválido. Formato esperado: NNNNN.NNNNNN/AAAA-DD." |
| Skipped or backward transition | 409 | `TRANSICAO_INVALIDA` | "Não é possível ir de {origem} para {destino}. O fluxo é sequencial." |
| Insufficient saldo | 409 | `SALDO_INSUFICIENTE` | "Saldo insuficiente na {ata}. Disponível: {saldo}. Necessário: {valor}. Ajuste o valor ou solicite aditivo." |
| Ineligible ATA | 409 | `ATA_NAO_ELEGIVEL` | "A {ata} está {motivo} e não pode receber novos empenhos." |
| Reversal without justification | 422 | `JUSTIFICATIVA_OBRIGATORIA` | "Informe a justificativa da reversão. Ela ficará registrada no histórico." |
| Wrong role | 403 | `PERFIL_NAO_AUTORIZADO` | "Seu perfil não permite esta ação." |
| Concurrent modification | 409 | `CONFLITO_DE_VERSAO` | "Esta NE foi alterada por outro usuário. Recarregue a página." |

## 6. Permissions

| Action | gestor | servidor | auditor |
| --- | --- | --- | --- |
| Open an NE | ✅ | ❌ | ❌ |
| Advance a stage | ✅ | ✅ | ❌ |
| Reverse a stage | ✅ | ❌ | ❌ |
| Cancel | ✅ | ❌ | ❌ |
| View | ✅ | ✅ | ✅ |

RFC §6.2 grants NE creation to gestor only; a servidor advancing an NE they
cannot create is intentional — it mirrors the real division of labour.

## 7. API surface

| Method | Path | Purpose | AC |
| --- | --- | --- | --- |
| POST | `/api/v1/notas-empenho` | Open an NE | 01–03, 17 |
| GET | `/api/v1/notas-empenho` | List with filters `etapa`, `ata_id`, `processo_sei` | 18 |
| GET | `/api/v1/notas-empenho/{id}` | Detail with full transition history | 07 |
| POST | `/api/v1/notas-empenho/{id}/avancar` | Advance one stage | 04, 05, 08, 12, 13 |
| POST | `/api/v1/notas-empenho/{id}/reverter` | Reverse one stage; body requires `justificativa` | 06, 07, 10 |
| POST | `/api/v1/notas-empenho/{id}/cancelar` | Cancel; body requires `justificativa` | 16 |
| GET | `/api/v1/notas-empenho/indicadores` | Stage counters | 18 |

Transitions are explicit sub-resource actions rather than `PATCH {status}`, so
that guards and the required justification are part of the contract instead of
depending on the client sending the right next value.

## 8. Audit events

| Action | `entidade_tipo` | `acao` | `dados_anteriores` |
| --- | --- | --- | --- |
| Open | `nota_empenho` | `ne.criada` | `null` |
| Advance | `nota_empenho` | `ne.avancada` | `{status, valor_reservado_ata}` |
| Reverse | `nota_empenho` | `ne.revertida` | `{status, justificativa}` |
| Cancel | `nota_empenho` | `ne.cancelada` | `{status, justificativa, valor_liberado}` |
| Blocked attempt | `nota_empenho` | `ne.bloqueada` | `{status, motivo, saldo_disponivel}` |

Blocked attempts are recorded deliberately: a pattern of repeated
`SALDO_INSUFICIENTE` against one ATA is exactly the "gargalo" the RFC's
stakeholders said they wanted to detect.

## 9. NE numbering

Format `AAAANEnnnnnn` (e.g. `2026NE000045`), matching SIAFI-style numbering
shown in Tela 6. The sequence is per calendar year, allocated by a PostgreSQL
sequence at the moment of creation and never reused, even on cancellation.
Gaps in the sequence are acceptable; reuse is not.

## 10. Open questions

OQ-05 (multi-item NEs), OQ-06 (denormalised FKs), OQ-07 (cancellation absent
from the RFC), OQ-03 (reservation semantics). None block the criteria above.

## 11. Implementation plan

_Filled by `/plan SPEC-0004`._

## 12. Changelog

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-08-17 | Initial draft from RFC v1.6 §2.3 RF13, §2.5 RN03/RN08/RN09/RN10, §3.1, §4.2 Tela 6 |
