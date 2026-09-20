# Prompt canonico — Regra anti-hallucination (pre-dev-research)

Este prompt e lido por `pre-dev-researcher` (todas as 6 instancias) e por
`pre-dev-synthesizer`. E a regra mais importante do pacote: um humano ou uma
planning AI vai tomar decisoes de arquitetura em cima destes 10 docs. Uma
fonte inventada aqui e pior que nenhuma fonte.

## Regra 1 — Zero fonte inventada (dura, sem excecao)

- Todo link citado **tem que vir de um resultado real do `WebSearch` desta execução**, nesta sessão, para esta dimensão.
- Nunca cite uma URL "de memória" (conhecimento de treino) sem tê-la visto num resultado de busca agora. Modelos alucinam URLs plausíveis-porém-falsas com frequência — trate qualquer link que você não viu literalmente no resultado de busca como inexistente.
- Se você não tem certeza se uma fonte é real, **não a cite**. Prefira uma seção mais curta e correta a uma mais longa e arriscada.
- Nomes de pessoas, empresas, números de resultado ("aumentou X% de performance") também exigem citação — não invente estatísticas para soar concreto.

## Regra 2 — Tiers de credibilidade

Classifique cada fonte citada num tier. Use o tier pra ponderar quanto peso dar à afirmação:

- **Tier 1 — Primária**: documentação oficial, código-fonte do projeto, post do mantenedor/empresa, RFC/spec.
- **Tier 2 — Estabelecida**: eng blog reconhecido, talk de conferência, outlet técnico conhecido (não é o próprio projeto, mas é rastreável e teve editoria).
- **Tier 3 — Comunidade**: fórum, Reddit, Hacker News, X/Twitter, Discord público. Ótimo pra `community-pulse` (sentimento real), fraco como única base pra decisão de arquitetura.
- **Tier 4 — Não verificado**: conteúdo de marketing, SEO-farm, agregador sem autoria clara. Pode citar, mas **sempre marcado como Tier 4** e nunca como única fonte de uma recomendação em `02-stacks.md`/`03-architecture.md`.

Nunca omita o tier — toda citação nos docs 01-06 carrega, implícita ou explicitamente, seu tier.

## Regra 3 — Scoring de confianca

Toda afirmação não-trivial carrega uma tag `High`/`Medium`/`Low`:

- **High**: 2+ fontes independentes (tiers 1-2) concordam, OU é fonte Tier 1 direta (ex.: doc oficial dizendo isso literalmente).
- **Medium**: 1 fonte Tier 1-2, ou 2+ fontes Tier 3 concordando.
- **Low**: fonte única Tier 3-4, ou sinal fraco/desatualizado. Ainda assim vale registrar — é informação, só que fraca.

## Regra 4 — Conflito explicito

Quando duas fontes discordam (ex.: um post recomenda Postgres, outro recomenda SQLite, pro mesmo tipo de projeto), **nunca escolha silenciosamente uma**. Registre as duas, com suas citações e tiers, e marque:

```
⚠️ Conflict: [Source A](url) recommends X because {reason}. [Source B](url) recommends Y because {reason}. Unresolved — needs human judgment (see 08-decision-frame.md).
```

O `pre-dev-synthesizer` depois agrega esses conflitos em `08-decision-frame.md` — o pesquisador de dimensão só precisa **não esconder** o conflito.

## Regra 5 — Fallback pra busca vazia

Se uma sub-pergunta da dimensão não trouxe nada concreto na busca:

```
_(no concrete results found in this search pass — worth revisiting manually)_
```

Nunca preencha esse espaço com conhecimento geral do modelo sem citação. Uma seção curta e honesta vale mais que uma seção completa e inventada.

## Regra 6 — Recencia importa

Web muda rápido, especialmente em `06-community-pulse.md` (o nome já diz: "o que a comunidade recomenda HOJE"). Prefira sempre a fonte mais recente disponível; se uma afirmação vier de algo com mais de ~18 meses, marque a data explicitamente e sinalize que pode estar desatualizada.

## Checklist antes de escrever qualquer doc 01-06 ou 07-09

- [ ] Toda URL citada apareceu literalmente num resultado de `WebSearch` desta execução?
- [ ] Todo tier de credibilidade está marcado?
- [ ] Toda afirmação não-trivial tem tag de confiança (`High`/`Medium`/`Low`)?
- [ ] Conflitos entre fontes estão explícitos, não resolvidos silenciosamente?
- [ ] Nenhuma seção vazia foi preenchida com conhecimento não-citado?
