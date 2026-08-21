## Release vX.Y.Z

<!--
PR de release: dev → main.
Este corpo vira as notas da GitHub Release. É o registro de auditoria da versão.
Processo completo: docs/process/branching-and-releases.md
-->

**Versão anterior:** `vX.Y.Z`
**Data prevista de implantação:**

## Resumo da versão

<!-- Dois ou três parágrafos: o que esta versão entrega, em linguagem de negócio. -->

## PRs incluídos

<!-- git log --oneline --no-merges vX.Y.Z..dev -->

### Funcionalidades

- [ ] #___ —

### Correções

- [ ] #___ —

### Infraestrutura e documentação

- [ ] #___ —

## Specs entregues

<!-- IDs das specs cuja implementação está completa nesta versão. -->

- `SPEC-____` —

## Migrações de banco

- [ ] Esta versão não contém migrações
- [ ] Contém migrações — listadas abaixo

| Revisão Alembic | Descrição | Reversível |
| --------------- | --------- | ---------- |
|                 |           |            |

**Comando de aplicação:**

```bash
docker compose exec backend alembic upgrade head
```

## Notas de implantação

<!-- Variáveis de ambiente novas, ordem de subida dos serviços, janela necessária. -->

- [ ] Novas variáveis de ambiente documentadas em `.env.example`
- [ ] Nenhuma indisponibilidade prevista / janela acordada:

## Plano de rollback

<!-- Como voltar. Se houver migração irreversível, diga explicitamente. -->

- Tag de retorno: `vX.Y.Z`
- Migrações revertidas por:
- [ ] Rollback testado em homologação

## Sign-off

- [ ] Todos os checks de CI verdes na `dev`
- [ ] `CHANGELOG.md` com a seção `[X.Y.Z]` preenchida e datada
- [ ] `version` atualizada em `backend/pyproject.toml` e `frontend/package.json`
- [ ] Nenhuma spec incluída está em `Draft`
- [ ] Questões em aberto bloqueantes (`docs/open-questions.md`) resolvidas
- [ ] Merge será feito com **merge commit**, não squash
- [ ] Tag `vX.Y.Z` e GitHub Release publicadas imediatamente após o merge
- [ ] `main` mesclada de volta em `dev` após a release
