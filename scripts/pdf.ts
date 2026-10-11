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
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

/**
 * Whitespace audit of the finished PDF. Per sheet: how much of the printable area is filled (lowest text above the
 * footer). Flags (1) a sheet left partly empty because the next block jumped to the following sheet, and (2) a topic
 * that spans two sheets whose content would fit on one — the cases the authoring rules tell you to fix by moving a
 * margin note into the text, shortening a margin note, trimming words, or splitting a long example.
 */
async function auditWhitespace(pdf: Buffer): Promise<string[]> {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdf), useSystemFonts: false }).promise;
  const fills: number[] = [];
  const starts: boolean[] = [];
  const bare: boolean[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i);
    const H = pg.getViewport({ scale: 1 }).height;
    const items = (await pg.getTextContent()).items.filter((it) => 'str' in it && it.str.trim()) as Array<{ str: string; transform: number[]; height: number }>;
    let lowest = 36;
    let marker = false;
    for (const it of items) {
      if (/TOCMARK-/.test(it.str)) { marker = true; continue; }
      const top = H - it.transform[5] + 2; // baseline → just below the text
      if (top < H - 40) lowest = Math.max(lowest, top);
    }
    fills.push(Math.min(1, (lowest - 36) / (H - 72)));
    starts.push(marker);
    bare.push(items.length === 0 || i === 1);
  }
  await doc.cleanup();
  const out: string[] = [];
  for (let i = 0; i < fills.length - 1; i++) {
    if (bare[i] || starts[0] === undefined) continue;
    const cont = !starts[i + 1];
    const blank = 1 - fills[i];
    if (cont && blank >= 0.2) {
      const combined = fills[i] + fills[i + 1];
      out.push(`whitespace: page ${i + 1} is ${Math.round(blank * 100)}% empty at the bottom because the next block moved to page ${i + 2}` + (combined <= 0.96 ? ` — these two pages hold ${Math.round(combined * 100)}% of one sheet; fit them on one` : ''));
    } else if (cont && fills[i + 1] > 0 && fills[i + 1] < 0.25 && starts[i] !== undefined && (i + 2 >= fills.length || starts[i + 2])) {
      out.push(`whitespace: only a ${Math.round(fills[i + 1] * 100)}% tail spills onto page ${i + 2} — trim about ${Math.round(fills[i + 1] * 900)}px from the topic (a shorter margin note, a shorter example, or fewer words) to keep it on one sheet`);
    } else if (!cont && blank >= 0.6 && fills[i] > 0.02) {
      out.push(`whitespace: page ${i + 1} is only ${Math.round(fills[i] * 100)}% full (a short topic; consider letting it share a sheet)`);
    }
  }
  return out;
}

/**
 * Area-based whitespace per printed sheet: render each PDF page in the browser (pdf.js on a canvas), lay an 8pt grid over
 * the printable area (0.5in margins) and count the cells with no ink. Empty side margins count, as the rule intends.
 * Returns the empty fraction (0–1) per page.
 */
async function measureWhitespace(browser: Browser, pdf: Buffer): Promise<number[]> {
  const page = await browser.newPage();
  try {
    await page.goto('about:blank');
    const lib = readFileSync(join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs'), 'utf8');
    const worker = readFileSync(join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'), 'utf8');
    return await page.evaluate(async ({ lib, worker, data }) => {
      const mod = await import(URL.createObjectURL(new Blob([lib], { type: 'text/javascript' })));
      mod.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([worker], { type: 'text/javascript' }));
      const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      const doc = await mod.getDocument({ data: bytes }).promise;
      const out: number[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const pg = await doc.getPage(i);
        const vp = pg.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        await pg.render({ canvasContext: ctx, viewport: vp }).promise;
        const m = 36, cell = 24;
        const x0 = m, y0 = m, x1 = vp.width - m, y1 = vp.height - m - 2;
        const bg = ctx.getImageData(2, 2, 1, 1).data;
        let total = 0, empty = 0;
        for (let y = y0; y + cell <= y1; y += cell) for (let x = x0; x + cell <= x1; x += cell) {
          const d = ctx.getImageData(x, y, cell, cell).data;
          let ink = false;
          for (let k = 0; k < d.length; k += 4) if (Math.abs(d[k] - bg[0]) + Math.abs(d[k + 1] - bg[1]) + Math.abs(d[k + 2] - bg[2]) > 36) { ink = true; break; }
          total++; if (!ink) empty++;
        }
        out.push(empty / total);
      }
      return out;
    }, { lib, worker, data: pdf.toString('base64') });
  } finally {
    await page.close();
  }
}

/**
 * The whitespace rule: no printed sheet may waste more than 30% of its printable area (empty side margins count).
 * Cover and Contents are exempt. A topic sheet over the limit is an error (exit code 1, the PDF is still written);
 * the other templates (cheat sheet, quiz, glossary…) are reported as warnings because their length comes from the data.
 */
const WS_LIMIT = 0.3;
function enforceWhitespace(ws: number[], tocPages: Record<number, number>, numPages: number): string[] {
  const out: string[] = [];
  const ns = Object.keys(tocPages).map(Number).sort((a, b) => a - b);
  ws.forEach((v, i) => {
    const pageNo = i + 1;
    if (pageNo <= 2 || v <= WS_LIMIT) return;
    out.push(`whitespace rule: page ${pageNo} wastes ${Math.round(v * 100)}% of the sheet (limit ${Math.round(WS_LIMIT * 100)}%) — merge the topic with a neighbour, add content, or move its elements so it fills the sheet`);
  });
  void ns; void numPages;
  return out;
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
  const chromeMajor = Number(/\d+/.exec(browser.version())?.[0] ?? 0);
  if (chromeMajor && chromeMajor < 128) console.warn(`  ⚠ Chromium ${chromeMajor} found; card density uses CSS zoom, which needs Chrome/Chromium 128 or newer for exact layout. Update Chrome (or set CHROMIUM_PATH) if cards look off.`);
  mkdirSync(outDir, { recursive: true });
  let failed = false;

  try {
    for (const slug of slugs) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); else if (process.env.FIT_DEBUG && m.text().startsWith('[dbg]')) console.log(m.text()); });
      const url = `${base}?doc=${encodeURIComponent(slug)}`;

      if (process.env.FIT_DEBUG) await page.addInitScript(() => { (window as unknown as { __FIT_DEBUG__: boolean }).__FIT_DEBUG__ = true; });
      await page.goto(url);
      await waitReady(page);
      if (process.env.PAGE_HEIGHTS) console.log(await page.evaluate(() => [...document.querySelectorAll('section.page')].map((pg, i) => { const b = pg.querySelector('.page-body')!; const t = b.getBoundingClientRect().top; let m = t; b.querySelectorAll(':scope > *').forEach((c) => { m = Math.max(m, c.getBoundingClientRect().bottom); }); return `${i + 1}:${Math.round(m - t)}${pg.hasAttribute('data-join') ? 'J' : ''}`; }).join(' ')));
      const overflow = await findOverflow(page);

      let pdf = await printPdf(page);
      let { pages: tocPages, numPages } = await readMarkers(pdf);

      // The fitter predicts each topic's sheet count from the screen layout; if the print needs more, make that topic's
      // prediction more conservative (extra safety margin) and lay out again. A few rounds settle it.
      const bias: number[] = [];
      for (let round = 0; round < 4; round++) {
        const pred = await page.evaluate(() => window.__FIT_PRED__ ?? {});
        const ns = Object.keys(tocPages).map(Number).sort((a, b) => a - b);
        let changed = false;
        for (const [k, n] of ns.entries()) {
          const entry = pred[n];
          if (!entry) continue;
          const printed = (ns[k + 1] != null ? tocPages[ns[k + 1]] : numPages + 1) - tocPages[n];
          if (printed > entry.sheets) { bias[entry.index] = Math.min(48, (bias[entry.index] ?? 0) + 16); changed = true; }
        }
        if (!changed) break;
        await page.addInitScript((b) => { window.__FIT_BIAS__ = b; }, [...bias]);
        await page.reload();
        await waitReady(page);
        pdf = await printPdf(page);
        ({ pages: tocPages, numPages } = await readMarkers(pdf));
      }

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
      for (const l of (await page.evaluate(() => window.__FIT_LOG__ ?? []))) console.log(`  ↳ fitted — ${l}`);
      const ws = await measureWhitespace(browser, pdf);
      if (process.env.WS_DEBUG) console.log(ws.map((v, i) => `${i + 1}:${Math.round(v * 100)}`).join(' '));
      overflow.push(...(await auditWhitespace(pdf)));
      errors.push(...enforceWhitespace(ws, tocPages, numPages));
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
