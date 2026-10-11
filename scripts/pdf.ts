/**
 * Render notes documents to PDF.
 *
 *   npm run pdf                         build, then render every document in notes/
 *   npm run pdf -- week-03-preference   build, then render only documents whose name contains the filter
 *   npm run pdf:only -- …               same, skipping the build (reuse dist/)
 *
 * Output: out/<document>.pdf (US Letter, mixed portrait/landscape, footers with page numbers, PDF bookmarks).
 *
 * Two passes per document: the first PDF is scanned for invisible TOCMARK-n- markers to learn which printed
 * page each Contents entry starts on, then the document is re-rendered with those page numbers filled in.
 *
 * Browser: uses $CHROMIUM_PATH if set, then a Playwright-managed Chromium (e.g. /opt/pw-browsers), then an
 * installed Google Chrome.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { preview } from 'vite';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out');

async function launchBrowser(): Promise<Browser> {
  const candidates: string[] = [];
  if (process.env.CHROMIUM_PATH) candidates.push(process.env.CHROMIUM_PATH);
  const pwRoot = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (existsSync(pwRoot)) {
    for (const d of readdirSync(pwRoot).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      for (const rel of ['chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) {
        const p = join(pwRoot, d, rel);
        if (existsSync(p)) candidates.push(p);
      }
    }
  }
  for (const executablePath of candidates) {
    try {
      return await chromium.launch({ executablePath });
    } catch {
      /* try next */
    }
  }
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    throw new Error('No Chromium found. Install Google Chrome, or set CHROMIUM_PATH to a Chromium/Chrome executable.');
  }
}

async function waitReady(page: Page) {
  await page.waitForFunction(() => window.__NOTES_READY__ === true, null, { timeout: 30_000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
  });
}

/** Content wider than the page's printable area gets clipped in print — find it while on screen, where each .page is exactly sheet-sized. */
async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = [];
    document.querySelectorAll<HTMLElement>('.page').forEach((pg, i) => {
      const body = pg.querySelector<HTMLElement>('.page-body');
      if (!body) return;
      const box = body.getBoundingClientRect();
      const seen = new Set<Element>();
      body.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || el.classList.contains('toc-marker')) return;
        if (r.right > box.right + 1 || r.left < box.left - 1) {
          // report only the outermost offender
          for (let p = el.parentElement; p; p = p.parentElement) if (seen.has(p)) return;
          seen.add(el);
          const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
          issues.push(`page template ${i + 1}: <${el.tagName.toLowerCase()}> overflows by ${Math.round(Math.max(r.right - box.right, box.left - r.left))}px — "${text}"`);
        }
      });
      if (pg.dataset.page === 'cover' && body.scrollHeight > body.clientHeight + 1) issues.push(`page template ${i + 1}: cover content is taller than one sheet`);
    });
    return issues;
  });
}

async function printPdf(page: Page) {
  return page.pdf({ preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
}

async function readMarkers(pdf: Buffer) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdf), useSystemFonts: false }).promise;
  const pages: Record<number, number> = {};
  for (let i = 1; i <= doc.numPages; i++) {
    const text = (await (await doc.getPage(i)).getTextContent()).items.map((it) => ('str' in it ? it.str : '')).join('');
    for (const m of text.matchAll(/TOCMARK-(\d+)-/g)) pages[Number(m[1])] ??= i;
  }
  const numPages = doc.numPages;
  await doc.cleanup();
  return { pages, numPages };
}

async function main() {
  const filters = process.argv.slice(2);
  if (!existsSync(join(root, 'dist', 'index.html'))) throw new Error('dist/ is missing — run `npm run pdf` (which builds first) or `npm run build`.');
  const slugs = readdirSync(join(root, 'notes'))
    .filter((f) => f.endsWith('.tsx') && !f.startsWith('_'))
    .map((f) => f.replace(/\.tsx$/, ''))
    .filter((s) => filters.length === 0 || filters.some((f) => s.includes(f)));
  if (slugs.length === 0) throw new Error(`No documents in notes/ match ${filters.join(', ')}`);

  const server = await preview({ root, preview: { port: 0, host: '127.0.0.1', open: false }, logLevel: 'error' });
  const base = server.resolvedUrls?.local[0] ?? 'http://127.0.0.1:4173/';
  const browser = await launchBrowser();
  mkdirSync(outDir, { recursive: true });
  let failed = false;

  try {
    for (const slug of slugs) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      const url = `${base}?doc=${encodeURIComponent(slug)}`;

      await page.goto(url);
      await waitReady(page);
      if (process.env.PAGE_HEIGHTS) console.log(await page.evaluate(() => [...document.querySelectorAll('section.page')].map((pg, i) => { const b = pg.querySelector('.page-body')!; const t = b.getBoundingClientRect().top; let m = t; b.querySelectorAll(':scope > *').forEach((c) => { m = Math.max(m, c.getBoundingClientRect().bottom); }); return `${i + 1}:${Math.round(m - t)}${pg.hasAttribute('data-join') ? 'J' : ''}`; }).join(' ')));
      const overflow = await findOverflow(page);

      let pdf = await printPdf(page);
      let { pages: tocPages, numPages } = await readMarkers(pdf);

      if (Object.keys(tocPages).length > 0) {
        await page.addInitScript((p) => { window.__TOC_PAGES__ = p; }, tocPages);
        await page.reload();
        await waitReady(page);
        pdf = await printPdf(page);
        const second = await readMarkers(pdf);
        if (JSON.stringify(second.pages) !== JSON.stringify(tocPages)) overflow.push('Contents page numbers shifted between passes — re-run to confirm.');
        numPages = second.numPages;
      }

      const file = join(outDir, `${slug}.pdf`);
      writeFileSync(file, pdf);
      console.log(`✓ ${slug}.pdf — ${numPages} pages`);
      for (const w of overflow) console.warn(`  ⚠ ${w}`);
      for (const e of errors) console.error(`  ✗ ${e}`);
      if (errors.length) failed = true;
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise<void>((r) => server.httpServer.close(() => r()));
  }
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
