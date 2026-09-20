---
name: tino-pre-dev-research
description: Especialista em pesquisa pré-desenvolvimento do Tino. Use quando o usuário faz um pedido vago de criar software — "quero criar uma skill/agente/app/CLI que faça X", "preciso pesquisar antes de começar Y", "qual a melhor stack para Z", "ajuda a planejar um projeto novo". Faz uma entrevista direcionada por arquétipo (skill/agent, SaaS web, CLI, mobile, library, data pipeline, automação interna, content creation), despacha pesquisa web real em paralelo por dimensão (landscape, stacks, architecture, workflows, pitfalls, community-pulse) com regra anti-hallucination dura (zero fonte inventada), e produz 10 documentos .md em inglês em {vault}/Tino/research/pre-development/<slug>/ prontos como input universal pra planning AIs (/octo:prd, /idea-to-execution, AIOS master, /octo:plan). Conversa sempre em PT-BR.
---

# tino-pre-dev-research — Pesquisa pré-desenvolvimento

Você vai conduzir o usuário do pedido vago ("quero criar X") até um pacote de
10 documentos `.md` de pesquisa real, prontos pra alimentar uma planning AI.
Execute os passos abaixo **nesta ordem**. Conversa com o usuário sempre em
**PT-BR**; todo arquivo escrito em `research/pre-development/` sempre em **EN**.

## Passo 1 — Obter o vault

Se o usuário já está num projeto com vault Tino configurado, use-o. Caso
contrário, **pergunte**: `Qual o caminho absoluto do seu vault Obsidian? (é lá que vou salvar a pesquisa, em Tino/research/pre-development/)`.

Fallback de demo: `tino-vault-sample/perfil-raw` (relativo ao repo Tino).

## Passo 2 — Capturar a ideia crua

Se o pedido que disparou a skill já contém a ideia (ex.: "quero criar uma
skill que edita vídeo automaticamente com Remotion"), use esse texto como
`$IDEIA`. Se disparou de forma genérica ("ajuda a planejar um projeto novo"),
pergunte: `Me conta em 1-2 frases o que você quer construir.`

## Passo 3 — Rodar o scaffold determinístico

Execute via Bash:

```bash
tino pre-dev-research --vault "$VAULT" --title "$IDEIA"
```

Isso vai:
- Derivar um `slug` a partir de `$IDEIA` (ou usar um passado explicitamente com `--slug`)
- Criar `{vault}/Tino/research/pre-development/<slug>/`
- Escrever um `00-brief.md` **placeholder** (`modo: placeholder`) — a não ser que já exista um brief com `modo: final`
- Imprimir um JSON summary no stdout com `slug`, `researchDir`, `mode`, `docsPresent`

Leia o `mode` retornado:
- `created` / `placeholder-refreshed` → siga pro Passo 4 (entrevista)
- `exists-final-skipped` → já existe uma pesquisa pra esse slug. Mostre o resumo (`docsPresent`) e **pergunte**: `Já existe pesquisa pra "{titulo}" ({N}/10 docs prontos). Quer retomar de onde parou, refazer a entrevista do zero (--force), ou é um projeto diferente (me dá outro nome/slug)?`
  - "retomar" → pule pro Passo 5, só rodando as dimensões que faltam em `docsPresent`
  - "refazer" → rode de novo com `--force` e siga pro Passo 4
  - "projeto diferente" → volte ao Passo 3 com `--slug` explícito

## Passo 4 — Entrevista (subagent `pre-dev-interviewer`)

Invoque o subagent `pre-dev-interviewer` (definido em
`.claude/agents/pre-dev-interviewer.md`), passando: `researchDir`, `slug`, e
a ideia crua (`$IDEIA`). Ele vai:

1. Ler `config/prompts/pre-dev-research/archetypes.md`
2. Classificar o arquétipo e confirmar com o usuário
3. Perguntar a profundidade (`quick`/`standard`/`deep`)
4. Fazer as perguntas do arquétipo + as universais, uma por vez
5. Escrever `00-brief.md` final (EN, `modo: final`) em `researchDir`

Confirme que ele terminou (`[PRE-DEV-RESULT] brief_ok ...`) antes de seguir.

## Passo 5 — Pesquisa paralela (6× subagent `pre-dev-researcher`)

Leia o `00-brief.md` final pra pegar `profundidade` e confirmar `dimensoes`.
Para cada dimensão que **ainda não tem doc** em `researchDir` (`landscape`,
`stacks`, `architecture`, `workflows`, `pitfalls`, `community-pulse`),
invoque o subagent `pre-dev-researcher` (definido em
`.claude/agents/pre-dev-researcher.md`).

**Invoque todas as instâncias faltantes em paralelo, no mesmo turno** — não
uma de cada vez. Passe pra cada uma: a dimensão específica que ela cobre,
`researchDir`, e a `profundidade`.

Cada uma vai:
1. Ler `config/prompts/pre-dev-research/dimensions.md` (só a sua seção) e `config/prompts/pre-dev-research/anti-hallucination.md`
2. Ler `00-brief.md` pra contexto
3. Rodar WebSearch (orçamento de queries conforme a profundidade)
4. Escrever `0N-<dimensao>.md` com citações reais e tags de confiança

Espere todas as 6 confirmarem (`[PRE-DEV-RESULT] dimension_ok ...`) antes de seguir.

## Passo 6 — Síntese (subagent `pre-dev-synthesizer`)

Invoque o subagent `pre-dev-synthesizer` (definido em
`.claude/agents/pre-dev-synthesizer.md`), passando `researchDir`. Ele vai ler
`00-brief.md` + `01-06` (sem pesquisar de novo) e escrever:
- `07-references.md` — bibliografia agregada por tier de credibilidade
- `08-decision-frame.md` — trade-offs em aberto e conflitos explícitos
- `09-handoff.md` — brief universal pra planning AIs

Confirme (`[PRE-DEV-RESULT] synthesis_ok ...`).

## Passo 7 — Apresentar ao usuário

Mostre, em PT-BR:
1. Caminho: `{vault}/Tino/research/pre-development/<slug>/`
2. Lista dos 10 docs gerados
3. Quantas referências foram agregadas e em qual tier predominante
4. Quantos conflitos ficaram em aberto em `08-decision-frame.md` (se houver, cite 1-2 pra dar contexto)
5. Convite: `O 09-handoff.md tá pronto pra alimentar uma planning AI (/octo:prd, /idea-to-execution, AIOS master, /octo:plan). Quer que eu abra algum dos docs, ou já seguimos pro planning?`

## Observações

- O Tino **nunca** escreve fora de `{vault}/Tino/research/pre-development/<slug>/` durante essa skill.
- Conversa sempre PT-BR; os 10 docs sempre EN (planning AIs performam melhor em EN).
- Um brief com `modo: final` só é sobrescrito com confirmação explícita do usuário (Passo 3).
- Docs de dimensão (`01`-`06`) já existentes não são refeitos automaticamente — se o usuário quiser refazer só uma dimensão (ex.: pra aprofundar depois), apague o arquivo correspondente e rode o Passo 5 de novo só pra ela.
- Se uma dimensão voltar com poucas ou nenhuma fonte concreta (ver `_(no concrete results found...)_` no doc), avise o usuário no Passo 7 em vez de esconder a lacuna.
