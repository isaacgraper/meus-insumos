# Contribuindo com o SIGI

O SIGI é um sistema de uso governamental. O histórico do repositório é parte da
prestação de contas do projeto: cada mudança em produção precisa ser rastreável
até um Pull Request revisado. Por isso o fluxo abaixo não é opcional.

## Branches

| Branch          | Papel                                                                 |
| --------------- | --------------------------------------------------------------------- |
| `main`          | Somente release. Protegida. Avança exclusivamente via PR de release.  |
| `dev`           | Branch de integração. Todo trabalho é mesclado aqui primeiro.         |
| `feature/*`     | Nova funcionalidade. Criada a partir de `dev`.                        |
| `fix/*`         | Correção de bug. Criada a partir de `dev`.                            |
| `chore/*`       | Tooling, documentação, CI, dependências. Criada a partir de `dev`.    |
| `hotfix/*`      | Correção urgente em produção. Criada a partir de `main`.              |

**Nunca faça push direto em `main` ou `dev`.** Ambas são protegidas e exigem PR.

## Fluxo de trabalho

```bash
# 1. Parta sempre de dev atualizada
git checkout dev
git pull origin dev

# 2. Crie sua branch
git checkout -b feature/cadastro-de-ata

# 3. Trabalhe e faça commits
git commit -m "feat(ata): adiciona endpoint de cadastro [SPEC-0002]"

# 4. Publique e abra o PR
git push -u origin feature/cadastro-de-ata
```

O Pull Request **sempre** aponta para `dev` — nunca para `main`.

## Antes de escrever código

Este repositório segue desenvolvimento orientado a especificação
(*spec-driven development*). Nenhum código de produção é escrito sem uma spec
com ID estável. Leia [`docs/process/sdd-workflow.md`](docs/process/sdd-workflow.md)
antes do primeiro PR, e verifique a
[definição de pronto](docs/process/definition-of-done.md).

## Padrão de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/) com
referência à spec:

```
feat(ne): valida saldo antes do pré-empenho [SPEC-0004]
fix(nf): corrige vínculo de NF órfã [SPEC-0005]
chore(ci): adiciona workflow de lint do frontend
docs(adr): registra decisão sobre importação CSV
```

Tipos aceitos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`.

## Checklist do Pull Request

O template é preenchido automaticamente ao abrir o PR. Em resumo:

- A branch parte de `dev` e o PR aponta para `dev`.
- A spec correspondente está referenciada e não está em `Draft`.
- Todos os checks de CI estão verdes.
- `CHANGELOG.md` foi atualizado na seção `[Unreleased]`.
- Nenhum dado real (CPF, SIAPE, e-mail, token) foi commitado.

## Releases

Releases são um evento deliberado: `dev` → `main` em um único PR de release que
agrega todos os PRs mesclados desde a versão anterior. O processo completo está
em [`docs/process/branching-and-releases.md`](docs/process/branching-and-releases.md).
