# Prompt canonico — Arquetipos e entrevista (pre-dev-research)

Este prompt e lido pelo agent `pre-dev-interviewer`. Define os 8 arquetipos de
projeto, o banco de perguntas de cada um, as perguntas universais, e a
definicao de profundidade.

## Os 8 arquetipos

Classifique o pedido vago do usuario em UM destes tipos. Use as palavras-chave
como heuristica, mas confirme sempre com o usuario antes de seguir.

| # | Arquetipo (valor canonico) | Sinal tipico |
|---|------|---------------|
| 1 | `skill-agent` | "skill", "subagent", "Claude Code", "MCP server", "automatizar dentro do Claude" |
| 2 | `saas-web` | "app web", "SaaS", "dashboard", "produto que usuarios pagam", "landing page + backend" |
| 3 | `cli` | "linha de comando", "CLI", "ferramenta de terminal", "script que rodo local" |
| 4 | `mobile` | "app", "iOS", "Android", "React Native", "Flutter" |
| 5 | `library` | "biblioteca", "pacote npm/pip", "SDK", "algo que outros devs importam" |
| 6 | `data-pipeline` | "pipeline", "ETL", "processar dados em lote", "ingestao", "warehouse" |
| 7 | `automacao-interna` | "automatizar processo da empresa", "bot interno", "integracao entre sistemas internos" |
| 8 | `content-creation` | "gerar video", "gerar imagem", "gerar texto em massa", "ferramenta de criacao de conteudo" |

Se o pedido nao casar claramente com nenhum, pergunte diretamente: `"Isso e mais parecido com [opcao A] ou [opcao B]? Me dá um exemplo do que você imagina rodando."`

## Profundidade (orcamento de busca por dimensao)

Pergunte sempre, com esta explicacao:

```
Quanto fundo você quer que eu pesquise em cada uma das 6 dimensões (soluções existentes, stacks, arquitetura, workflows, erros comuns, comunidade)?

1. quick    — ~3 buscas por dimensão. Rápido, bom pra validar uma ideia.
2. standard — ~6 buscas por dimensão. Equilíbrio (recomendado pra maioria).
3. deep     — ~12 buscas por dimensão. Mais lento, bom pra decisões caras/difíceis de reverter.
```

## Perguntas universais (sempre, todo arquetipo)

Depois das perguntas especificas do arquetipo:

1. "Qual é o critério de sucesso? Como você vai saber que deu certo?" → `Success criteria`
2. "Tem algo que você já decidiu que NÃO quer fazer (non-goal)?" → `Non-goals`
3. "Alguma restrição de tempo, orçamento, equipe ou tecnologia que eu deva considerar?" → `Constraints`

## Bancos de pergunta por arquetipo

### 1. `skill-agent`
1. "Essa skill/agent roda dentro do Claude Code, como MCP server, ou como serviço separado?"
2. "Ela precisa de acesso a rede/web, sistema de arquivos, ou só processa o que já está no contexto?"
3. "Já existe alguma skill/plugin parecida que você conhece (mesmo que incompleta)?"
4. "Quem mais vai usar isso — só você, seu time, ou é pra publicar pra outros?"

### 2. `saas-web`
1. "Quem paga por isso — é B2B, B2C, ou uso interno mesmo?"
2. "Você já tem alguma stack em mente (frontend/backend/banco) ou está em aberto?"
3. "Precisa de autenticação/multi-tenant desde o dia 1, ou pode começar single-user?"
4. "Tem expectativa de escala (quantos usuários em 6 meses)?"

### 3. `cli`
1. "Roda em qual(is) SO — Linux/Mac/Windows, ou só o seu ambiente?"
2. "É uma ferramenta que você vai distribuir (npm/pip/homebrew) ou só uso pessoal?"
3. "Precisa de modo interativo (prompts) ou é sempre flags + argumentos?"

### 4. `mobile`
1. "iOS, Android, ou os dois? Nativo ou cross-platform?"
2. "Precisa de recursos de hardware (câmera, GPS, notificações push)?"
3. "Vai pra loja de apps ou é uso interno/TestFlight?"

### 5. `library`
1. "Qual linguagem/ecossistema (npm, PyPI, crates.io, etc.)?"
2. "Vai substituir ou complementar alguma lib existente que você já usa?"
3. "Import de terceiros importa (peso do bundle, zero-deps) ou não é prioridade?"

### 6. `data-pipeline`
1. "Qual o volume e a frequência dos dados (batch diário, streaming, etc.)?"
2. "De onde vem o dado e pra onde vai (fontes e destinos)?"
3. "Já existe infraestrutura de dados (warehouse, orquestrador) que isso precisa se encaixar?"

### 7. `automacao-interna`
1. "Quais sistemas precisam se conectar (nomes das ferramentas/APIs envolvidas)?"
2. "Quem é afetado se essa automação falhar — tem coisa crítica dependendo dela?"
3. "Precisa rodar em algum horário/gatilho específico, ou é sob demanda?"

### 8. `content-creation`
1. "Que tipo de conteúdo (vídeo, imagem, texto, áudio) e em que formato de saída?"
2. "É geração do zero, edição/remix de material existente, ou os dois?"
3. "Tem restrição de licenciamento/direitos que eu deva levar em conta nas fontes?"

## Checklist antes de escrever o brief

- [ ] Arquétipo confirmado explicitamente pelo usuário (não só inferido)?
- [ ] Profundidade escolhida?
- [ ] Todas as perguntas específicas do arquétipo foram feitas uma a uma?
- [ ] As 3 perguntas universais foram feitas?
- [ ] Nenhuma resposta foi inventada — campos sem resposta usam `_(not specified by user)_`?
- [ ] O brief final está em inglês?
