## Descrição

<!-- O que muda e por quê. Se houver decisão de arquitetura, referencie o ADR. -->

## Spec relacionada

<!-- Ex.: SPEC-0004 — Fluxo de Nota de Empenho. A spec não pode estar em Draft. -->

- Spec: `SPEC-____`
- Issue: #

## Tipo de mudança

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `chore` — tooling, CI, dependências
- [ ] `docs` — documentação
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] Quebra de contrato de API ou migração irreversível

## Como foi testado

<!-- Comandos executados e critérios de aceite cobertos (AC-XXXX-NN). -->

## Checklist

- [ ] A branch parte de `dev` e este PR aponta para `dev` (não para `main`)
- [ ] A spec referenciada está aprovada (não está em `Draft`)
- [ ] Todo critério de aceite tocado por esta mudança tem teste correspondente
- [ ] Cobertura de testes do backend permanece em 70% ou mais (RNF10)
- [ ] Toda regra de negócio nova ou alterada está registrada na spec **antes** do código
- [ ] Escritas geram registro em `HISTORICO_MOVIMENTACAO` na mesma transação (RN06)
- [ ] `CHANGELOG.md` atualizado na seção `[Unreleased]`
- [ ] Nenhum dado real (CPF, SIAPE, e-mail, token) foi commitado
- [ ] Checks de CI verdes
