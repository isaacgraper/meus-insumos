# Data Model

Status: Draft · Source: RFC v1.6 §5.2, with corrections noted inline.

## Entities

### USUARIO
`id UUID PK`, `nome`, `email UNIQUE`, `senha_hash`, `perfil ENUM(gestor,
servidor, auditor)`, `ativo BOOL`, `status ENUM(pendente, ativo, bloqueado,
desativado)`, `criado_em TIMESTAMPTZ`, `anonimizado_em TIMESTAMPTZ NULL`.

`status` is added: the mockup shows Pendente and Bloqueado, which a single
boolean cannot express. `ativo` is retained as a derived convenience.

### FORNECEDOR
`id UUID PK`, `cnpj UNIQUE`, `razao_social`, `email`, `ativo BOOL`.
CNPJ validated including check digits.

### ATA
`id UUID PK`, `numero UNIQUE`, `objeto`, `orgao`, `fornecedor_id FK`,
`data_emissao DATE`, `vigencia_inicio DATE`, `vigencia_fim DATE`,
`valor_total NUMERIC(15,2)`, `data_orcamento_planilhado DATE`,
`status ENUM(rascunho, vigente, suspensa, encerrada, cancelada)`,
`responsavel_id FK → USUARIO`.

Changes from the RFC: `fornecedor_id` added (Tela 5 shows a supplier per ATA but
the model had no link); `status` values replaced (`em_andamento/concluida/
cancelada` could not express the five badges in Tela 4); `situacao_vigencia` is
**not** a column — it is derived (SPEC-0002 §2).

`CHECK (vigencia_fim > vigencia_inicio)`, `CHECK (valor_total > 0)`.

### ATA_ADITIVO *(new)*
`id UUID PK`, `ata_id FK`, `tipo ENUM(quantidade, valor, prazo)`,
`percentual NUMERIC(5,2)`, `valor_acrescimo NUMERIC(15,2)`,
`nova_vigencia_fim DATE NULL`, `justificativa TEXT`, `criado_por FK`, `criado_em`.

Required by RF15/RN15 and by the alternative flow "solicitar aditivo à ATA".
`valor_contratado` is `ATA.valor_total + Σ aditivos`.

### INSUMO
`id UUID PK`, `codigo UNIQUE`, `descricao`, `categoria`, `unidade`,
`quantidade_referencia NUMERIC NULL`, `ativo BOOL`.

**No `ata_id`.** RF03's "ATA vinculada" is realised through `ITEM_ATA` (SPEC-0003 §2).

### ITEM_ATA
`id UUID PK`, `ata_id FK`, `insumo_id FK`, `quantidade NUMERIC`,
`valor_unitario NUMERIC(15,4)`, `UNIQUE(ata_id, insumo_id)`.

Unit price uses four decimals: unit prices for consumables are frequently
sub-centavo, and rounding at storage time compounds across thousands of units.

### NOTA_EMPENHO
`id UUID PK`, `numero UNIQUE`, `processo_sei VARCHAR`, `data_emissao DATE`,
`quantidade NUMERIC`, `valor NUMERIC(15,2)`,
`status ENUM(demanda, validacao_saldo, pre_empenho, envio_fornecedor,
ne_emitida, cancelada)`, `item_ata_id FK`, `ata_id FK`, `insumo_id FK`,
`responsavel_id FK`, `criado_em`, `atualizado_em`, `versao INT`.

`cancelada` is added (SPEC-0004 §4.1). `versao` supports optimistic locking for
`CONFLITO_DE_VERSAO`.

**Denormalisation warning:** `ata_id` and `insumo_id` are derivable from
`item_ata_id`. The RFC carries all three. They are retained for query
convenience, guarded by a trigger asserting consistency on insert and update. An
unconstrained denormalised FK is a future data-integrity incident with a
scheduled date. See OQ-06.

### NOTA_FISCAL
`id UUID PK`, `numero`, `data_emissao DATE`, `valor NUMERIC(15,2)`,
`nota_empenho_id FK`, `fornecedor_id FK`, `servidor_id FK`,
`status ENUM(aguardando, em_conferencia, aprovada, devolvida)`,
`justificativa_devolucao TEXT NULL`,
`UNIQUE(numero, fornecedor_id)`.

`status` and `justificativa_devolucao` added (Tela 7 has statuses the RFC model
lacks — OQ-12). No `ata_id`: the ATA is reached through the NE (RN02).

### HISTORICO_MOVIMENTACAO
`id UUID PK`, `entidade_tipo`, `entidade_id UUID`, `acao`, `usuario_id FK`,
`timestamp TIMESTAMPTZ`, `dados_anteriores JSONB`, `justificativa TEXT NULL`,
`correlation_id UUID`.

Partitioned by year. `REVOKE UPDATE, DELETE` from the application role plus a
`BEFORE UPDATE OR DELETE` trigger. Index on
`(entidade_tipo, entidade_id, timestamp DESC)` and on `(usuario_id, timestamp DESC)`.

## Relationships

```
USUARIO 1─────* ATA                (responsável)
USUARIO 1─────* HISTORICO_MOVIMENTACAO
FORNECEDOR 1──* ATA
FORNECEDOR 1──* NOTA_FISCAL
ATA 1─────────* ITEM_ATA *─────────1 INSUMO
ATA 1─────────* ATA_ADITIVO
ITEM_ATA 1────* NOTA_EMPENHO
NOTA_EMPENHO 1* NOTA_FISCAL
```

## Invariants enforced in the database

| # | Invariant | Mechanism |
| --- | --- | --- |
| DB1 | An NF's NE must be `ne_emitida` | Trigger on insert/update |
| DB2 | `NOTA_EMPENHO.ata_id` and `insumo_id` agree with `item_ata_id` | Trigger |
| DB3 | Audit rows are immutable | Privileges + trigger |
| DB4 | An ATA cannot be `encerrada` with non-terminal NEs | Trigger |
| DB5 | Monetary columns are `NUMERIC`, never `FLOAT` | Column types |
| DB6 | `Σ NF.valor` per NE ≤ `NE.valor` | Trigger (RN12) |

Application-level enforcement is the first line, not the only one. Every rule an
auditor may one day rely on is also expressed where a buggy migration script or
a well-meaning `psql` session cannot bypass it.

## What is deliberately absent

- **No `saldo` column anywhere.** ADR-0003.
- **No `estoque` / stock quantity.** SIGI is not an inventory system.
- **No `area`/`setor` on USUARIO or INSUMO** — so RN07 is unimplementable as
  written. Adding these fields is a product decision, not a schema decision. OQ-04.
