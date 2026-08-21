# Open Questions

Contradictions, gaps and decisions that need a human — mostly the stakeholder at
PROCON/CAC or the orientador. Each has a proposed answer so the project is never
blocked waiting for one, and a blast radius so you know which ones to chase first.

**Do not silently resolve these in code.** If you implement the proposal, say so
in the spec's changelog and mark the question `Assumed`.

| ID | Question | Blocks | Proposed answer | Status |
| --- | --- | --- | --- | --- |
| OQ-01 | Is an insumo owned by one ATA (RF03: "ATA vinculada") or shared across ATAs via `ITEM_ATA` (data model)? | SPEC-0003 | Catalogue-global insumo; ATA link only via `ITEM_ATA`. Ownership would break DOMS code uniqueness. | Assumed |
| OQ-02 | Does e-Publica import work by process-number lookup (RF04) or CSV upload (mockup 9.2.2.1)? | SPEC-0002 | CSV upload. No API exists. | Assumed |
| OQ-03 | Saldo is validated at `validacao_saldo` but deducted at `ne_emitida`. What happens in between? | SPEC-0004, SPEC-0006 | Three-state model: reserved from `pre_empenho`, committed at `ne_emitida`. | Assumed |
| OQ-04 | RN07 requires an "área de competência" that exists on no entity. What is it — órgão, setor, categoria de insumo? | SPEC-0001, RN07 | Defer. Profile-based RBAC only in MVP; RN07 unenforced and documented as such. **Needs stakeholder answer** — it is a least-privilege claim the system currently cannot make. | **Open** |
| OQ-05 | Can one NE cover multiple insumos? Real empenhos usually do. | SPEC-0004 | MVP: one item per NE. Confirm with Anderson Viebranz — if real NEs are multi-item, this is a data-model change, and it is far cheaper now than in M4. | **Open — highest priority** |
| OQ-06 | `NOTA_EMPENHO` carries `ata_id`, `insumo_id` and `item_ata_id`. Keep the redundancy? | data-model | Keep for query convenience, guarded by a consistency trigger. | Assumed |
| OQ-07 | The RFC has no way to cancel an NE opened in error. Is cancellation permitted administratively? | SPEC-0004 | Add `cancelada`, gestor-only, justification mandatory. Without it, an erroneous NE holds reserved saldo forever. | **Open** |
| OQ-08 | What is the entity's reajuste policy (index, window, who approves)? | RF16 | Unspecified; RF16 deferred until answered. | **Open** |
| OQ-09 | Will the entity register with Gov.br for OAuth, and by when? | SPEC-0001, RF01 | Institutional credentials for MVP; Gov.br additive in M4. Lead time is outside the team's control. | **Open** |
| OQ-10 | Why does the profile screen collect CPF? | SPEC-0001, LGPD | Do not collect. No requirement needs it, and it raises the LGPD burden. | **Open** |
| OQ-11 | Can an ATA have more than one fornecedor? | data-model | Model assumes one. Confirm. | **Open** |
| OQ-12 | The NF entity has no status, but Tela 7 shows four. | SPEC-0005 | Add `status` + `justificativa_devolucao`. | Assumed |
| OQ-13 | Is an external e-mail SaaS (Resend) acceptable for a state entity, and can it reach internal `.gov.br` addresses? | SPEC-0008 | Institutional SMTP as default, transport behind a port interface. | Assumed |
| OQ-14 | The `servidor` persona (Carlos) is inferred, not observed; research covered two gestor/auditor users. | vision | Interview one receiving clerk before M3. The whole UX argument rests on this persona. | **Open** |
| OQ-15 | Three KPIs are relative to a baseline that has never been measured. | vision, KPIs | Run a timed observation of the current spreadsheet flow during M1–M2. | **Open** |
| OQ-16 | RFC §7.2 says "não há cronograma", while §7.1 defines 16 weeks across five milestones. Which governs? | roadmap | §7.1 governs; §7.2 appears to be an editing leftover. Fix in the next RFC revision. | **Open** |
| OQ-17 | The RFC appendix publishes a live prototype JWT. | security | Revoke it. Do not copy it into the repository. | **Open — act now** |
| OQ-18 | Who is the entity's DPO for LGPD data-subject requests? | LGPD | Required before go-live. | **Open** |

## How to use this file

- Bring the four highest-impact items (OQ-05, OQ-04, OQ-07, OQ-17) to the next
  stakeholder meeting; the rest can travel in writing.
- When one is answered, update the row to `Resolved`, record the answer, and
  amend the affected spec with a changelog entry.
- New contradictions found during implementation are added here, not fixed in
  passing. A quietly resolved contradiction is a decision nobody made.
