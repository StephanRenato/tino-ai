# Prompt canonico — Template do 09-handoff.md (pre-dev-research)

Lido por `pre-dev-synthesizer`. Define a estrutura exata do documento final
do pacote — o input universal pra planning AIs. Ele precisa ser autocontido:
uma planning AI que so le este arquivo (sem abrir os outros 9) ja consegue
gerar um PRD/plano razoavel. Os links pros outros docs sao pra quem quiser
profundidade ou citacao.

## Por que "universal"

Este doc não assume nenhuma ferramenta de planning específica — funciona como
input pra `/octo:prd`, `/idea-to-execution`, AIOS master, `/octo:plan`, ou
qualquer outra planning AI, porque segue a forma padrão de um brief de
produto (Context → Goals → Constraints → Approach → Risks → Open questions),
que é o mínimo denominador comum que essas ferramentas esperam.

## Formato exato

```
---
tipo: pre-dev-handoff
slug: <slug>
arquetipo: <arquétipo>
profundidade: <quick|standard|deep>
gerado_em: YYYY-MM-DD
---

# Pre-development handoff — <title>

> Universal input for planning AIs. Self-contained; links to `01-09` in this
> folder for depth and full citations.

## Context
2-4 sentences: what this project is, who it's for, why it matters. Pulled from `00-brief.md`.

## Goals
- goal 1
- goal 2
(from `00-brief.md`)

## Non-goals
- explicitly out of scope
(from `00-brief.md`)

## Constraints
- budget / timeline / team / tech comfort / hosting
(from `00-brief.md`)

## Recommended approach
2-4 sentences synthesizing the strongest signal from `02-stacks.md` and
`03-architecture.md`. If there's an unresolved conflict, say so explicitly
and point to `08-decision-frame.md` instead of picking arbitrarily.

**Confidence**: High/Medium/Low (roll-up from the underlying docs)

## Key risks to design around
- top 3-5 items from `05-pitfalls.md`, prioritized by how likely + how costly

## What the competition/prior art looks like
1-2 sentence summary from `01-landscape.md`, with a pointer to the full doc.

## Open decisions requiring human input
Numbered list of every unresolved conflict from `08-decision-frame.md` —
these are the things a planning AI should ask the human about, not decide on
its own.

1. ...
2. ...

## Success criteria
- from `00-brief.md`, unchanged

## Supporting documents
| Doc | What's in it |
|---|---|
| `00-brief.md` | Interview capture |
| `01-landscape.md` | Existing solutions |
| `02-stacks.md` | Candidate stacks with tradeoffs |
| `03-architecture.md` | Architectural patterns |
| `04-workflows.md` | How real teams work in this space |
| `05-pitfalls.md` | Common mistakes and post-mortems |
| `06-community-pulse.md` | Current community sentiment |
| `07-references.md` | Full bibliography by credibility tier |
| `08-decision-frame.md` | Open tradeoffs and explicit conflicts |
```

## Regras inviolaveis

- **Autocontido**: alguém lendo só `09-handoff.md` entende o projeto o suficiente pra planejar — não force o leitor a abrir os outros docs pra entender o básico.
- **Não resolva conflitos**: se `08-decision-frame.md` tem um conflito em aberto, ele aparece em "Open decisions requiring human input" — nunca escondido dentro de "Recommended approach" como se fosse consenso.
- **Sem pesquisa nova aqui**: tudo neste doc vem de síntese dos outros 9, nunca de conhecimento novo do `pre-dev-synthesizer`.
- **Idioma**: inglês.
