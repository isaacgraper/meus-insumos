# Branching e Releases

> Como o código sai do editor e chega em produção. Este documento é normativo.

O SIGI atende uma entidade governamental estadual. Uma mudança em produção
precisa ser auditável: quem escreveu, quem revisou, quando entrou, e em qual
versão. O modelo abaixo existe para garantir isso.

## Modelo de branches

```
feature/*  fix/*  chore/*
        \    |    /
         \   |   /          PR + CI  (revisão contínua)
          v  v  v
            dev             integração — sempre verde, sempre implantável
             |
             |              PR de release  (evento deliberado)
             v
            main            somente release — cada commit é uma versão marcada
             |
             v
          tag vX.Y.Z + GitHub Release
```

### `main`

- Contém apenas código liberado. Todo commit em `main` corresponde a uma versão.
- Protegida: exige PR, exige checks verdes, não aceita force-push nem deleção.
- Avança **exclusivamente** por PR de release vindo de `dev` (ou por `hotfix/*`,
  ver abaixo). Nunca por commit direto, nunca por merge de uma feature isolada.

### `dev`

- Branch de integração. É o alvo padrão de todo Pull Request.
- Deve estar sempre verde e implantável em homologação.
- Protegida: exige PR e checks verdes.

### Branches de trabalho

Criadas a partir de `dev`, nomeadas por tipo:

- `feature/<descrição-curta>` — nova funcionalidade
- `fix/<descrição-curta>` — correção de bug
- `chore/<descrição-curta>` — tooling, CI, dependências, documentação

Vida curta: quanto menor o PR, mais efetiva a revisão. Uma branch de trabalho
que sobrevive semanas acumula conflito e deixa de ser revisável.

## Versionamento

[Semantic Versioning 2.0.0](https://semver.org/lang/pt-BR/): `vMAJOR.MINOR.PATCH`.

| Incremento | Quando                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| `MAJOR`    | Quebra de contrato de API, ou migração de dados irreversível.              |
| `MINOR`    | Nova funcionalidade compatível com a versão anterior.                      |
| `PATCH`    | Correção de bug, sem mudança de contrato.                                  |

Antes da primeira entrega em produção o projeto permanece em `0.x.y`, onde
`MINOR` absorve quebras de contrato.

## O PR de release

Quando `dev` acumula um conjunto de mudanças pronto para entrega:

### 1. Abrir o PR de release

De `dev` para `main`, com título `Release vX.Y.Z`, usando o template de release:

```
https://github.com/isaacgraper/sigi/compare/main...dev?template=release.md
```

O corpo do PR lista **todos** os PRs incluídos desde a última release. Ele é o
registro de auditoria daquela versão — vale o esforço de preenchê-lo bem.

Para levantar o que entrou desde a última tag:

```bash
git log --oneline --no-merges v0.1.0..dev
```

### 2. Preparar a versão

Em uma branch `chore/release-vX.Y.Z` criada a partir de `dev`, e mesclada em
`dev` antes do PR de release:

- Mover as entradas de `[Unreleased]` do `CHANGELOG.md` para uma seção
  `[X.Y.Z] - AAAA-MM-DD`.
- Atualizar `version` em `backend/pyproject.toml` e `frontend/package.json`.

### 3. Revisar e mesclar

- Todos os checks de CI verdes.
- Notas de migração e plano de rollback preenchidos no PR.
- Merge com **merge commit** (nunca squash): o PR de release precisa preservar
  o histórico individual dos PRs que ele agrega.

### 4. Marcar e publicar

Logo após o merge, na `main`:

```bash
git checkout main
git pull origin main
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

Em seguida publique a GitHub Release apontando para a tag, reaproveitando o
corpo do PR de release como notas da versão.

### 5. Sincronizar

`main` e `dev` devem estar idênticas logo após a release. Se o merge gerou
commit apenas em `main`, traga-o de volta:

```bash
git checkout dev
git merge --no-ff main
git push origin dev
```

## Hotfix

Correção urgente que não pode esperar o ciclo normal:

1. `hotfix/<descrição>` criada a partir de `main`.
2. PR para `main` — mesmas exigências de revisão e CI de qualquer PR.
3. Após o merge, marcar imediatamente uma nova versão `PATCH` (`v0.2.1`).
4. Mesclar `main` de volta em `dev`, para que a correção não se perca na próxima
   release.

Hotfix é exceção. Se está virando rotina, o problema está na cobertura de testes
ou no tamanho das releases, não no processo.

## Regras invioláveis

1. Ninguém faz push direto em `main` ou `dev`.
2. `main` só recebe merge de um PR de release ou de um `hotfix/*`.
3. Todo commit em `main` é marcado com uma tag e tem uma GitHub Release.
4. Nenhum PR é mesclado com CI vermelho.
5. Nenhuma tag é reescrita ou movida. Uma versão publicada é imutável.
