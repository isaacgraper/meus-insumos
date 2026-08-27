# Functional Requirements

Verbatim intent from RFC v1.6 §2.3, with the implementing spec and an
implementability note where the RFC is ambiguous. **Do not edit the "Requirement"
column** — it is the frozen contract. Clarifications go in the notes column and
in `open-questions.md`.

| ID | Requirement | Spec | Note |
| --- | --- | --- | --- |
| RF01 | Secure authentication with institutional credentials or Gov.br | SPEC-0001 | Gov.br OAuth requires entity registration with the federal portal; treat as M4 risk. |
| RF02 | Gestor registers and manages entity members/servidores | SPEC-0001 | |
| RF03 | Servidor registers insumos referenced in ATAs with DOMS-compatible `codigo`, linked ATA, name, category, unit; reference quantity optional, for process alerts only | SPEC-0003 | **Conflict:** RF03 puts an ATA on the insumo, but the data model uses `ITEM_ATA` for the N:N. Resolved in SPEC-0003: insumo is catalogue-global; the ATA link is `ITEM_ATA`. See OQ-01. |
| RF04 | Gestor registers an ATA manually or by importing via e-Publica process number | SPEC-0002 | Mockup 9.2.2.1 shows a **CSV upload**, not a lookup by process number. Resolved as CSV. See OQ-02. |
| RF05 | Servidor registers NFs bound to an NE (not directly to an ATA); the ATA link is inherited | SPEC-0005 | |
| RF06 | Any authenticated user views the current cycle status of an insumo (ATA → NE → NF) | SPEC-0007 | Subject to RN07 scoping. |
| RF07 | Operational consistency with DOMS by validating item codes; no automatic API integration | SPEC-0003 | Format validation + in-app guidance only. ADR-0002. |
| RF08 | Operational consistency with e-Publica by validating process numbers; no automatic API integration | SPEC-0002 | Format validation only. ADR-0002. |
| RF09 | E-mail notification to the responsible party on supply status change | SPEC-0008 | |
| RF10 | Immutable auditable history of all insumo, NE and NF movements | SPEC-0007 | Enforced at database level, not application level. |
| RF11 | Validate mandatory fields on insumo, ATA, NE and NF registration | SPEC-0002/3/4/5 | |
| RF12 | Auditor consults exportable reports (PDF/CSV): insumo lifecycle, budget execution per ATA, consolidated balance, supplier indicators | SPEC-0009 | |
| RF13 | Manage the NE flow through five sequential steps, with indicators for issued, in-progress and total | SPEC-0004 | The core requirement. |
| RF14 | Show current saldo per ATA derived from issued NEs, deducting automatically and flagging ATAs ≥ 80% consumed | SPEC-0006 | **Gap:** deduction timing vs. RN10 validation timing. Resolved via reservation semantics in SPEC-0006. See OQ-03. |

## Requirements implied by the mockups but absent from RF01–RF14

The RFC's screens describe behaviour no requirement covers. These are real scope
and must be either specified or explicitly deferred — silently implementing them
is how a 16-week plan becomes a 24-week one.

| ID | Behaviour | Evidence | Disposition |
| --- | --- | --- | --- |
| RF15 | Register an **aditivo** to an ATA (quantity/value increase, max 25%) | Tela 4 "Ações: Aditivo"; alternative flow "solicitar aditivo à ATA" | **Must specify** — it changes saldo, so SPEC-0006 is incomplete without it. |
| RF16 | Register a **reajuste** of ATA prices with an availability window | Tela 4 "Reajuste (disponível/expirado + dias)" | **Must specify** — changes unit prices and therefore future consumption. |
| RF17 | NF conference workflow with statuses (Aprovada, Em conferência, Aguardando, Devolvida) | Tela 7 status badges | **Must specify** — the data model has no NF status field. |
| RF18 | Invite a user by e-mail with a pending-activation state; block/unblock accounts | Mockup 9.2.3 (Pendente, Bloqueado, "Convidar usuário") | **Must specify** — SPEC-0001 covers it. |
| RF19 | Renewal alert for ATAs expiring within 90 days without an aditivo | Tela 4 alert banner | Specified in SPEC-0002. |
| RF20 | Coverage-profile alerts ("sem demanda há ≥ X meses", "cobertura < X dias") | Tela 8 sliders | **Defer to post-MVP.** Requires consumption-rate history that will not exist at launch. |
| RF21 | Saldo runway projection per ATA (burn-rate to exhaustion vs. days of vigência) | Colleague contribution, Appendix | **Defer to post-MVP**, but design SPEC-0006 so it is a pure read-model addition. |
