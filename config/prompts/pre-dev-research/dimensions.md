# Prompt canonico — Dimensoes de pesquisa (pre-dev-research)

Lido por `pre-dev-researcher`. Cada instancia do agent cobre **uma** das 6
secoes abaixo — o orquestrador diz qual no prompt de invocacao. Leia so a
sua secao, mas o mapeamento inteiro ajuda a entender o pacote.

## Mapeamento arquivo → dimensão

| Arquivo | Dimensão (valor canônico) | Uma frase |
|---|---|---|
| `01-landscape.md` | `landscape` | O que já existe — soluções, produtos, projetos similares |
| `02-stacks.md` | `stacks` | Stacks candidatas com tradeoffs |
| `03-architecture.md` | `architecture` | Padrões arquiteturais aplicáveis |
| `04-workflows.md` | `workflows` | Como times reais trabalham nesse tipo de projeto |
| `05-pitfalls.md` | `pitfalls` | Erros comuns e post-mortems |
| `06-community-pulse.md` | `community-pulse` | O que a comunidade recomenda HOJE |

## Orcamento de busca por profundidade

- `quick` → 3 queries
- `standard` → 6 queries
- `deep` → 12 queries

Distribua as queries entre os padrões abaixo da sua dimensão; se sobrar orçamento, aprofunde no sub-tópico mais relevante ao brief.

---

## `landscape` — 01-landscape.md

**Objetivo**: mapear o que já existe pra não reinventar a roda nem repetir erro já resolvido.

**Padrões de query** (substitua `{{TOPIC}}` pelos termos do brief):
- `{{TOPIC}} alternatives`
- `{{TOPIC}} vs` (comparativos)
- `awesome {{TOPIC}}` (listas curadas)
- `{{TOPIC}} github` (implementações reais)
- `{{TOPIC}} open source`

**Template**:
```
## Existing solutions

### {Name}
- What it does: ...
- Overlap with this project: ...
- Gap it doesn't cover: ...
[source](url) · Tier N · Confidence: High/Medium/Low

(repeat per solution found, 3-8 entries depending on depth)

## Build vs. adopt signal
1-2 sentence read on whether this space is crowded (adopt/extend) or genuinely underserved (build).
```

---

## `stacks` — 02-stacks.md

**Objetivo**: 2-4 stacks candidatas concretas, com tradeoffs, não uma única recomendação prematura.

**Padrões de query**:
- `best stack for {{TOPIC}} 2026`
- `{{TOPIC}} architecture reddit`
- `{{TOPIC}} tech stack production`
- `{{TOPIC}} framework comparison`

**Template**:
```
## Candidate stacks

### Stack A: {name}
- Components: ...
- Why it fits: ...
- Tradeoff: ...
[source](url) · Tier N · Confidence

### Stack B: {name}
(same shape)

## Comparison table
| Dimension | Stack A | Stack B |
|---|---|---|
| Learning curve | ... | ... |
| Time to ship v1 | ... | ... |
| Scaling ceiling | ... | ... |
```

---

## `architecture` — 03-architecture.md

**Objetivo**: padrões estruturais aplicáveis (não código — forma de organizar o sistema).

**Padrões de query**:
- `{{TOPIC}} architecture pattern`
- `{{TOPIC}} system design`
- `{{TOPIC}} scaling architecture`
- `{{TOPIC}} monorepo OR microservice OR modular`

**Template**:
```
## Applicable patterns

### {Pattern name}
- What it solves: ...
- When it fits this project: ...
- When it doesn't: ...
[source](url) · Tier N · Confidence
```

---

## `workflows` — 04-workflows.md

**Objetivo**: como equipes reais organizam o trabalho pra esse tipo de projeto (não tech, processo).

**Padrões de query**:
- `{{TOPIC}} team workflow`
- `how we built {{TOPIC}}` (post-hoc engineering write-ups)
- `{{TOPIC}} engineering blog process`

**Template**:
```
## Real-world workflows

### {Team/company or project}
- Workflow summary: ...
- What made it work: ...
[source](url) · Tier N · Confidence
```

---

## `pitfalls` — 05-pitfalls.md

**Objetivo**: erros conhecidos, post-mortems, o que dá errado em produção.

**Padrões de query**:
- `{{TOPIC}} post-mortem`
- `{{TOPIC}} lessons learned`
- `{{TOPIC}} common mistakes`
- `{{TOPIC}} what went wrong`

**Template**:
```
## Known pitfalls

### {Pitfall name}
- What happens: ...
- Why it happens: ...
- How to avoid it: ...
[source](url) · Tier N · Confidence
```

---

## `community-pulse` — 06-community-pulse.md

**Objetivo**: sentimento e recomendação atual da comunidade — o que muda mais rápido, por isso pesa mais a recência (ver Regra 6 em `anti-hallucination.md`).

**Padrões de query**:
- `{{TOPIC}} reddit`
- `{{TOPIC}} hacker news`
- `{{TOPIC}} site:news.ycombinator.com`
- `{{TOPIC}} 2026 recommendation`

**Template**:
```
## Community sentiment

- **Positive** — {summary}. [source](url) · Tier N · Confidence
- **Skeptical** — {summary}. [source](url) · Tier N · Confidence
- **Mixed** — {summary}. [source](url) · Tier N · Confidence

## What's trending right now
1-2 sentence read on what's changing in this space as of the search date.
```
