# Glossary

Domain terms stay in Portuguese everywhere: code, database, API, UI. This table
is the authority on spelling and meaning. If a term is not here, it is not a
domain term yet — add it before using it.

| Term | Code identifier | Meaning |
| --- | --- | --- |
| **ATA de Registro de Preços** | `ATA`, `ata_id` | Price-registration agreement fixing supplier, items, unit prices and a total contracted value for a validity period. The root of every supply cycle. |
| **Vigência** | `vigencia_inicio`, `vigencia_fim` | The period during which an ATA can generate new empenhos. Distinct from lifecycle status. |
| **Aditivo** | `aditivo` | Amendment increasing an ATA's quantity/value, capped at 25% of the original quantity under Brazilian procurement practice. Changes available `saldo`. |
| **Reajuste** | `reajuste` | Price revision of an ATA's items within a window. Changes unit prices, therefore future `saldo` consumption. |
| **Item da ATA** | `ITEM_ATA` | A specific `insumo` inside an ATA, with quantity and unit price. The join entity between ATA and Insumo. |
| **Insumo** | `INSUMO`, `insumo_id` | A catalogued supply item (paper, toner, gloves). Identified by a `codigo` compatible with DOMS. |
| **Nota de Empenho (NE)** | `NOTA_EMPENHO` | The commitment of budget against an ATA for a given item and quantity. The core entity of SIGI. |
| **Empenhar / Empenhado** | `valor_empenhado` | To commit budget. The cumulative committed value of an ATA. |
| **Nota Fiscal (NF)** | `NOTA_FISCAL` | The supplier's invoice, evidencing delivery. Always bound to an NE, never directly to an ATA. |
| **Liquidação** | — | The administrative act of verifying delivery against the NF. Modelled here as the NF conference status; payment itself is out of scope. |
| **Saldo** | `saldo_disponivel` | ATA total value minus committed NEs. **Derived, never stored as mutable state.** |
| **Processo SEI** | `processo_sei` | Identifier of the administrative process in the SEI system, e.g. `00301.000451/2026-12`. Mandatory on every NE. |
| **Fornecedor** | `FORNECEDOR` | Supplier, identified by CNPJ. |
| **Servidor** | `USUARIO` with `perfil='servidor'` | Public employee. Registers insumos and NFs, advances NE steps. Cannot reverse. |
| **Gestor** | `perfil='gestor'` | Manager. Full CRUD on ATAs/NEs/members; the only role that may reverse a step or close an ATA. |
| **Auditor** | `perfil='auditor'` | Read-only. History, reports, exports. |
| **DOMS** | — | Third-party platform whose item nomenclature SIGI must remain compatible with. **No API integration**; compatibility via `codigo` format validation and CSV import. |
| **e-Publica** | — | State government platform for processes and ATAs. **No API integration**; ATAs enter SIGI through CSV export from e-Publica. |
| **Histórico de movimentação** | `HISTORICO_MOVIMENTACAO` | Append-only audit trail of every mutation, with actor, timestamp, action and prior state. |
| **Prestação de contas** | — | Public accountability reporting. The reason the audit trail must be immutable. |
| **CAME** | — | The legacy spreadsheet ("Controle CAME 2026") SIGI replaces. Source of the insumo field mapping. |

## Terms deliberately avoided

| Avoid | Because | Use instead |
| --- | --- | --- |
| "Estoque" as a module name | SIGI does not manage physical stock; RFC §1.3 is explicit that the balance view is derived from the empenho cycle | "Saldo por ATA" |
| "Integração" for DOMS/e-Publica | Implies an API contract that does not exist | "Consistência operacional" / "importação CSV" |
| "Quantidade mínima" as a stock threshold | It is a process alert, not a reorder point | "Quantidade de referência" |
| "Inventory", "invoice", "purchase order" | English translations of legal instruments create ambiguity in audit | `insumo`, `nota fiscal`, `nota de empenho` |
