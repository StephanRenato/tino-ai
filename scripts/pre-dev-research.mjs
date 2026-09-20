#!/usr/bin/env node
// scripts/pre-dev-research.mjs
// Orquestrador deterministico da skill tino-pre-dev-research.
// CLI:
//   --vault <path>   (obrigatorio) caminho para vault Obsidian
//   --title <texto>  ideia livre do usuario (usada pra derivar --slug)
//   --slug <slug>    override do slug (senao deriva de --title)
//   --force          sobrescreve 00-brief.md mesmo com modo:final
//
// Contrato de saida: JSON summary no stdout no final.
//
// O que faz: cria {vault}/Tino/research/pre-development/<slug>/ e escreve
// um 00-brief.md placeholder (modo: placeholder) pro agent
// pre-dev-interviewer preencher via entrevista. Nunca faz pesquisa web —
// isso e trabalho dos agents (pre-dev-interviewer, pre-dev-researcher,
// pre-dev-synthesizer), nunca deste script.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse as parseFm, serialize } from '../lib/frontmatter.mjs';

const DIMENSIONS = [
  'landscape',
  'stacks',
  'architecture',
  'workflows',
  'pitfalls',
  'community-pulse',
];

function parseArgs(argv) {
  const out = { vault: null, title: null, slug: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--vault') {
      out.vault = argv[++i];
    } else if (a === '--title') {
      out.title = argv[++i];
    } else if (a === '--slug') {
      out.slug = argv[++i];
    } else if (a === '--force') {
      out.force = true;
    } else if (a === '--help' || a === '-h') {
      out.help = true;
    }
  }
  return out;
}

function printHelp() {
  process.stdout.write(
    [
      'Uso: node scripts/pre-dev-research.mjs --vault <path> --title "<ideia>" [--slug <slug>] [--force]',
      '',
      '  --vault <path>  Caminho para um vault Obsidian (obrigatorio)',
      '  --title <texto> Ideia livre do usuario (deriva o slug se --slug nao vier)',
      '  --slug <slug>   Override do slug do diretorio de research',
      '  --force         Sobrescreve 00-brief.md mesmo se modo:final',
      '',
    ].join('\n'),
  );
}

// Slugify sem deps externas: remove acentos, lowercase, so [a-z0-9-], colapsa
// tracos repetidos, trunca em 60 chars. Fallback pra titulo vazio/so-simbolos.
export function slugify(input) {
  const base = String(input ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base || 'projeto-sem-titulo';
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function buildPlaceholderBrief({ title, slug }) {
  const lines = [];
  lines.push(`# Pre-dev research brief — ${title || slug}`);
  lines.push('');
  lines.push(
    '> Placeholder. Invoke the `pre-dev-interviewer` agent in Claude Code to fill this in.',
  );
  lines.push(
    '> The agent reads `config/prompts/pre-dev-research/archetypes.md` and conducts an archetype-tailored interview.',
  );
  lines.push('');
  lines.push('## Archetype');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Problem');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Goals');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Non-goals');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Target users');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Constraints');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Success criteria');
  lines.push('_(to fill)_');
  lines.push('');
  lines.push('## Open questions');
  lines.push('_(to fill)_');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return 0;
  }

  if (!args.vault) {
    process.stderr.write('erro: --vault e obrigatorio\n');
    printHelp();
    return 2;
  }
  if (!args.title && !args.slug) {
    process.stderr.write('erro: --title ou --slug e obrigatorio\n');
    printHelp();
    return 2;
  }

  const absVault = path.resolve(args.vault);
  let stat;
  try {
    stat = await fs.stat(absVault);
  } catch {
    process.stderr.write(`erro: vault nao encontrado em ${absVault}\n`);
    return 2;
  }
  if (!stat.isDirectory()) {
    process.stderr.write(`erro: ${absVault} nao e um diretorio\n`);
    return 2;
  }

  const slug = args.slug ? slugify(args.slug) : slugify(args.title);
  const researchDir = path.join(absVault, 'Tino', 'research', 'pre-development', slug);
  const briefPath = path.join(researchDir, '00-brief.md');

  await fs.mkdir(researchDir, { recursive: true });

  const briefExisted = await pathExists(briefPath);
  let mode = 'created';
  let existingMeta = null;

  if (briefExisted) {
    const raw = await fs.readFile(briefPath, 'utf8');
    const { meta } = parseFm(raw);
    existingMeta = meta;
    if (meta.modo === 'final' && !args.force) {
      mode = 'exists-final-skipped';
    } else {
      mode = args.force ? 'overwritten' : 'placeholder-refreshed';
    }
  }

  if (mode === 'created' || mode === 'overwritten' || mode === 'placeholder-refreshed') {
    const today = new Date().toISOString().slice(0, 10);
    const meta = {
      tipo: 'pre-dev-brief',
      slug,
      titulo: args.title || slug,
      modo: 'placeholder',
      arquetipo: '',
      profundidade: '',
      dimensoes: DIMENSIONS,
      gerado_em: today,
    };
    const body = buildPlaceholderBrief({ title: args.title, slug });
    await fs.writeFile(briefPath, serialize(meta, body), 'utf8');
  }

  const docsPresent = [];
  for (const name of [
    '00-brief.md',
    '01-landscape.md',
    '02-stacks.md',
    '03-architecture.md',
    '04-workflows.md',
    '05-pitfalls.md',
    '06-community-pulse.md',
    '07-references.md',
    '08-decision-frame.md',
    '09-handoff.md',
  ]) {
    if (await pathExists(path.join(researchDir, name))) docsPresent.push(name);
  }

  const summary = {
    vault: absVault,
    slug,
    researchDir,
    briefPath,
    mode,
    existingMode: existingMeta ? existingMeta.modo ?? null : null,
    dimensions: DIMENSIONS,
    docsPresent,
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  return 0;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main()
    .then((code) => process.exit(code ?? 0))
    .catch((err) => {
      process.stderr.write(`erro inesperado: ${err && err.stack ? err.stack : err}\n`);
      process.exit(1);
    });
}
