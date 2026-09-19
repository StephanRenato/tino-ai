// tests/extract-profile-contract.test.mjs
//
// Contrato entre config/prompts/extract-profile.md (o que o profile-extractor
// deve escrever) e lib/rank-mock.mjs (o que o ranker le). Nao chama LLM: usa
// um _perfil.md fixture que representa a saida esperada do agente seguindo o
// formato definido em extract-profile.md (Regra 4b) e roda pelo parser real
// (lib/frontmatter.mjs), diferente de tests/rank-mock.test.mjs que constroi
// `perfil.meta` direto como objeto JS e por isso nunca exercitou esse contrato.
//
// Regressao coberta: profile-extractor gravava foco_ativo/identidade/evita
// so como texto no corpo (**Chips:** [...]), nunca no frontmatter YAML.
// lib/rank-mock.mjs so le essas 3 chaves do frontmatter -> toda novidade
// recebia a mesma nota base, independente do conteudo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../lib/frontmatter.mjs';
import { rankMock } from '../lib/rank-mock.mjs';

// Simula a saida esperada do profile-extractor no formato de
// config/prompts/extract-profile.md apos a Regra 4b: arrays inline no
// frontmatter espelhando os Chips do corpo.
const FIXTURE_PERFIL_MD = `---
tipo: perfil
modo: final
gerado_em: 2026-09-19
fontes: 3
foco_ativo: [Claude Agent SDK, Managed Agents, MCP]
identidade: [SaaS B2B, Founder, Next.js]
evita: [geracao de video, voice cloning]
---

# Perfil — exemplo-vault

## Identidade
**Chips:** [SaaS B2B, Founder, Next.js]

Stephan e founder de uma SaaS B2B construida em Next.js (fonte: sobre.md).

## Foco ativo
**Chips:** [Claude Agent SDK, Managed Agents, MCP]

- Esta integrando o Claude Agent SDK no pipeline de agentes (fonte: foco-ativo.md)
- Esta testando Managed Agents em producao (fonte: foco-ativo.md)

## Evita
- Geracao de video — nao e o foco do produto (fonte: evita.md)
- Voice cloning — fora de escopo (fonte: evita.md)

## Fontes consideradas
- sobre.md
- foco-ativo.md
- evita.md
`;

// _perfil.md com Evita sem evidencia (Regra 1 de conservadorismo): evita: [].
const FIXTURE_PERFIL_SEM_EVITA_MD = `---
tipo: perfil
modo: final
gerado_em: 2026-09-19
fontes: 1
foco_ativo: [Claude Agent SDK]
identidade: [Founder]
evita: []
---

# Perfil — exemplo-vault-2

## Identidade
**Chips:** [Founder]

Narrativa curta (fonte: sobre.md).

## Foco ativo
**Chips:** [Claude Agent SDK]

- Bullet de foco (fonte: sobre.md)

## Evita
_(sem evidencia nos arquivos-fonte)_

## Fontes consideradas
- sobre.md
`;

function extractChips(body, headerRegex) {
  const re = new RegExp(`##\\s+${headerRegex}[^\\n]*\\n\\*\\*Chips:\\*\\*\\s*\\[([^\\]]*)\\]`, 'i');
  const m = body.match(re);
  if (!m) return null;
  return m[1].split(',').map((s) => s.trim()).filter(Boolean);
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

test('contrato _perfil.md: parse() retorna foco_ativo/identidade/evita como Array', () => {
  const { meta } = parse(FIXTURE_PERFIL_MD);

  assert.ok(Array.isArray(meta.foco_ativo), 'foco_ativo deve ser Array');
  assert.ok(meta.foco_ativo.length > 0, 'foco_ativo nao pode ficar vazio quando ha evidencia');

  assert.ok(Array.isArray(meta.identidade), 'identidade deve ser Array');
  assert.ok(meta.identidade.length > 0, 'identidade nao pode ficar vazio quando ha evidencia');

  assert.ok(Array.isArray(meta.evita), 'evita deve ser Array');
});

test('contrato _perfil.md: arrays do frontmatter nao tem duplicatas', () => {
  const { meta } = parse(FIXTURE_PERFIL_MD);
  for (const key of ['foco_ativo', 'identidade', 'evita']) {
    const arr = meta[key];
    assert.equal(new Set(arr).size, arr.length, `${key} tem termos duplicados: ${JSON.stringify(arr)}`);
  }
});

test('contrato _perfil.md: sem evidencia de Evita -> evita: [] (nao undefined, nao string)', () => {
  const { meta } = parse(FIXTURE_PERFIL_SEM_EVITA_MD);
  assert.ok(Array.isArray(meta.evita), 'evita deve continuar Array mesmo vazio');
  assert.equal(meta.evita.length, 0);
});

test('contrato _perfil.md: Chips do corpo batem com os arrays do frontmatter', () => {
  const { meta, body } = parse(FIXTURE_PERFIL_MD);

  const focoChips = extractChips(body, 'Foco ativo');
  const identChips = extractChips(body, 'Identidade');

  assert.deepEqual(focoChips, meta.foco_ativo, 'Chips de Foco ativo devem ser identicos ao frontmatter foco_ativo');
  assert.deepEqual(identChips, meta.identidade, 'Chips de Identidade devem ser identicos ao frontmatter identidade');
});

test('integracao rankMock: termo de foco_ativo do _perfil.md real eleva a nota (Foca)', () => {
  const { meta, body } = parse(FIXTURE_PERFIL_MD);
  const perfil = { meta, body };
  const novidade = {
    titulo: 'Claude Agent SDK ganha nova versao estavel',
    resumo_bruto: 'Lancamento oficial com hooks e custom tools.',
    data: daysAgo(1),
  };
  const rank = rankMock(perfil, novidade);
  assert.ok(rank.nota >= 9, `esperava nota >= 9 (Foca) por match literal em foco_ativo, obteve ${rank.nota}`);
  assert.equal(rank.veredito, 'Foca');
  assert.match(rank.justificativa, /foco_ativo/);
});

test('integracao rankMock: termo de identidade do _perfil.md real influencia a nota (Considera)', () => {
  const { meta, body } = parse(FIXTURE_PERFIL_MD);
  const perfil = { meta, body };
  const novidade = {
    titulo: 'SaaS B2B Founder relata migracao para Next.js',
    resumo_bruto: 'Estudo de caso de founder de SaaS B2B usando Next.js.',
    data: null, // sem bonus de recencia, isola o efeito de identidade
  };
  const rank = rankMock(perfil, novidade);
  // base 5.0 + identidade (3 termos, cap +3.0) = 8.0
  assert.ok(rank.nota >= 7 && rank.nota < 9, `esperava nota 7-8.9 (Considera), obteve ${rank.nota}`);
  assert.equal(rank.veredito, 'Considera');
  assert.match(rank.justificativa, /identidade/);
});

test('integracao rankMock: termo de evita do _perfil.md real aplica penalidade (Ignore)', () => {
  const { meta, body } = parse(FIXTURE_PERFIL_MD);
  const perfil = { meta, body };
  const novidade = {
    titulo: 'Nova ferramenta de geracao de video com IA',
    resumo_bruto: 'Modelo state-of-the-art de video generation.',
    data: daysAgo(1),
  };
  const rank = rankMock(perfil, novidade);
  // base 5.0 + recencia 1.0 - evita (1 termo) 4.0 = 2.0
  assert.ok(rank.nota < 5, `esperava nota < 5 (Ignore) por match em evita, obteve ${rank.nota}`);
  assert.equal(rank.veredito, 'Ignore');
  assert.match(rank.justificativa, /evita/);
});
