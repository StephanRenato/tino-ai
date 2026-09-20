// tests/pre-dev-research.test.mjs
// Smoke-tests do orquestrador scripts/pre-dev-research.mjs.
// Cobertura:
//   - slugify: acentos, espacos, truncamento, fallback
//   - --title cria research/pre-development/<slug>/00-brief.md placeholder
//   - idempotente: rodar de novo sem --force nao sobrescreve modo:final
//   - --force sobrescreve mesmo com modo:final
//   - --vault inexistente: exit code != 0
//   - sem --title nem --slug: exit code != 0

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parse } from '../lib/frontmatter.mjs';
import { slugify } from '../scripts/pre-dev-research.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'pre-dev-research.mjs');

function run(args) {
  const res = spawnSync('node', [SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

async function makeVault() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'tino-pre-dev-research-test-'));
}

test('slugify normaliza acentos, espacos e trunca', () => {
  assert.equal(slugify('Skill que edita vídeo com Remotion'), 'skill-que-edita-video-com-remotion');
  assert.equal(slugify('  ---Café com Leite!!!  '), 'cafe-com-leite');
  assert.equal(slugify(''), 'projeto-sem-titulo');
  assert.equal(slugify('###'), 'projeto-sem-titulo');
  const long = 'a'.repeat(200);
  assert.ok(slugify(long).length <= 60);
});

test('--title cria diretorio + 00-brief.md placeholder', async () => {
  const vault = await makeVault();
  const { code, stdout } = run(['--vault', vault, '--title', 'Editor de vídeo com Remotion']);
  assert.equal(code, 0, `stdout:\n${stdout}`);

  const summary = JSON.parse(stdout);
  assert.equal(summary.slug, 'editor-de-video-com-remotion');
  assert.equal(summary.mode, 'created');
  assert.deepEqual(summary.docsPresent, ['00-brief.md']);

  const raw = await fs.readFile(summary.briefPath, 'utf8');
  const { meta, body } = parse(raw);
  assert.equal(meta.modo, 'placeholder');
  assert.equal(meta.slug, summary.slug);
  assert.equal(meta.tipo, 'pre-dev-brief');
  assert.deepEqual(meta.dimensoes, [
    'landscape',
    'stacks',
    'architecture',
    'workflows',
    'pitfalls',
    'community-pulse',
  ]);
  assert.match(body, /## Archetype/);
  assert.match(body, /## Open questions/);
});

test('idempotente: rodar de novo sem --force nao sobrescreve modo:final', async () => {
  const vault = await makeVault();
  const first = run(['--vault', vault, '--title', 'CLI de deploy']);
  assert.equal(first.code, 0);
  const summary1 = JSON.parse(first.stdout);

  // Simula o agent tendo preenchido o brief (modo: final).
  const raw = await fs.readFile(summary1.briefPath, 'utf8');
  const { meta, body } = parse(raw);
  meta.modo = 'final';
  const { serialize } = await import('../lib/frontmatter.mjs');
  await fs.writeFile(summary1.briefPath, serialize(meta, body), 'utf8');

  const second = run(['--vault', vault, '--title', 'CLI de deploy']);
  assert.equal(second.code, 0);
  const summary2 = JSON.parse(second.stdout);
  assert.equal(summary2.mode, 'exists-final-skipped');
  assert.equal(summary2.existingMode, 'final');

  const rawAfter = await fs.readFile(summary1.briefPath, 'utf8');
  const { meta: metaAfter } = parse(rawAfter);
  assert.equal(metaAfter.modo, 'final');
});

test('--force sobrescreve mesmo com modo:final', async () => {
  const vault = await makeVault();
  const first = run(['--vault', vault, '--title', 'Data pipeline de logs']);
  const summary1 = JSON.parse(first.stdout);

  const raw = await fs.readFile(summary1.briefPath, 'utf8');
  const { meta, body } = parse(raw);
  meta.modo = 'final';
  const { serialize } = await import('../lib/frontmatter.mjs');
  await fs.writeFile(summary1.briefPath, serialize(meta, body), 'utf8');

  const second = run(['--vault', vault, '--title', 'Data pipeline de logs', '--force']);
  assert.equal(second.code, 0);
  const summary2 = JSON.parse(second.stdout);
  assert.equal(summary2.mode, 'overwritten');

  const rawAfter = await fs.readFile(summary1.briefPath, 'utf8');
  const { meta: metaAfter } = parse(rawAfter);
  assert.equal(metaAfter.modo, 'placeholder');
});

test('--vault inexistente retorna exit code != 0', () => {
  const { code, stderr } = run(['--vault', '/tmp/nao-existe-tino-pre-dev', '--title', 'X']);
  assert.notEqual(code, 0);
  assert.match(stderr, /vault nao encontrado/);
});

test('sem --title nem --slug retorna exit code != 0', async () => {
  const vault = await makeVault();
  const { code, stderr } = run(['--vault', vault]);
  assert.notEqual(code, 0);
  assert.match(stderr, /--title ou --slug/);
});
