/**
 * `npm run new -- week-04-segmentation "Segmentation" --with cover,contents,map,cheat` → notes/week-04-segmentation.tsx
 * from the template.
 *
 * Only the Notes pages are core. Every other page is optional and is included only when you ask for it with `--with`
 * (a comma-separated list, or `all`): cover, contents, map, cheat, formulas, quiz, glossary, appendix. Decide per packet
 * whether each one adds value to what the notes are for (see docs/AUTHORING.md, "What to include").
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OPTIONAL = ['cover', 'contents', 'map', 'cheat', 'formulas', 'quiz', 'glossary', 'appendix'] as const;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const withAt = args.indexOf('--with');
const wanted = withAt >= 0 ? (args[withAt + 1] ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
const positional = withAt >= 0 ? [...args.slice(0, withAt), ...args.slice(withAt + 2)] : args;
const [slug, ...titleWords] = positional;
const include = new Set<string>(wanted.includes('all') ? OPTIONAL : wanted);

const unknown = [...include].filter((w) => !(OPTIONAL as readonly string[]).includes(w));
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug) || unknown.length) {
  if (unknown.length) console.error(`Unknown page(s) in --with: ${unknown.join(', ')}`);
  console.error(`Usage: npm run new -- <file-name-in-kebab-case> ["Title"] [--with ${OPTIONAL.join(',')}|all]\n  Only the Notes pages are core; every --with page is an optional supplement.`);
  process.exit(1);
}
const file = join(root, 'notes', `${slug}.tsx`);
if (existsSync(file)) {
  console.error(`notes/${slug}.tsx already exists`);
  process.exit(1);
}
const title = titleWords.join(' ') || slug.replace(/^week-\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Keep an optional block's content (dropping its marker lines) when requested, drop the whole block otherwise.
let src = readFileSync(join(root, 'notes', '_template.tsx'), 'utf8');
for (const name of OPTIONAL) {
  const block = new RegExp(`[ \\t]*\\{/\\* @optional ${name} \\*/\\}\\n([\\s\\S]*?)[ \\t]*\\{/\\* @end ${name} \\*/\\}\\n`, 'g');
  src = src.replace(block, (_m, body: string) => (include.has(name) ? body : ''));
}
src = src.replace(/\n{3,}/g, '\n\n');

writeFileSync(file, src.replace('__TITLE__', title.replace(/'/g, "\\'")));
const left = OPTIONAL.filter((o) => !include.has(o));
console.log(`Created notes/${slug}.tsx with the Notes pages${include.size ? ` + ${[...include].join(', ')}` : ' only'}.`);
if (left.length) console.log(`  Left out (optional): ${left.join(', ')} — copy a block from notes/_template.tsx if one turns out to add value.`);
console.log(`  preview: npm run dev  →  ?doc=${slug}\n  pdf:     npm run pdf -- ${slug}`);
