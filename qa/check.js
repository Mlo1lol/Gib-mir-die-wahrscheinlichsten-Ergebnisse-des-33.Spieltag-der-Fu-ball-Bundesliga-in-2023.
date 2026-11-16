#!/usr/bin/env node
/* Abnahmeprüfung vor jeder Auslieferung:  node qa/check.js
   Öffnet jede Seite in Chromium und scrollt mit echtem Mausrad von oben bis unten.
   FEHLER, wenn:
     1. ein Bildschirm (fast) leer ist (Leerlauf),
     2. ein gepinntes Kapitel an einer anderen Stelle rechnet, als es tatsächlich steht,
     3. die Seite seitlich scrollt,
     4. die Konsole Fehler meldet oder eine Datei nicht lädt,
     5. eine Anfrage an einen fremden Server geht (DSGVO),
     6. ein Inhalt während des gesamten Durchlaufs nie sichtbar war.
   Zusätzlich: derselbe Lauf mit "Bewegung reduzieren". */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PAGES = [
  { name: 'Koop (Ordner)', dir: 'website', file: 'index.html' },
  { name: 'Tietmann (Ordner)', dir: 'tietmann', file: 'index.html' },
  { name: 'Koop (Einzeldatei)', single: 'koop-website-komplett.html' },
  { name: 'Tietmann (Einzeldatei)', single: 'tietmann-website-komplett.html' },
];
const SIZES = [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [820, 1180], [390, 844], [320, 640]];
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', woff2: 'font/woff2', webp: 'image/webp', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
function serve(dir) {
  return new Promise(res => { const s = http.createServer((q, r) => {
    const f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1', () => res(s)); });
}
const MARK = () => { window.__seen = window.__seen || new Set(); const vh = innerHeight;
  document.querySelectorAll('main h2, main h3, main p, main li, main form, main img').forEach(e => { if (window.__seen.has(e)) return; const b = e.getBoundingClientRect(); if (!b.height || b.bottom < 0 || b.top > vh) return; let o = 1, n = e; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden') { o = 0; break; } o *= +cs.opacity; n = n.parentElement; } if (o >= 0.5) window.__seen.add(e); }); };
async function walk(page, w, h) {
  await page.evaluate(MARK);
  await page.mouse.move(w / 2, h / 2);
  const empties = []; let last = -1, stuck = 0;
  for (let i = 0; i < 600; i++) {
    await page.mouse.wheel(0, h * 0.7); await page.waitForTimeout(260);
    const r = await page.evaluate(() => {
      const vh = innerHeight, vw = innerWidth; let area = 0;
      document.querySelectorAll('h1,h2,h3,p,li,img,a.btn,button,input,label,address,td,small,strong,time,dd,dt,summary,svg text,svg rect,svg path').forEach(e => {
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.1 || e.closest('.nav-bar,.topbar,.menu-panel,.callbar,.loader')) return;
        const b = e.getBoundingClientRect(), x = Math.min(vw, b.right) - Math.max(0, b.left), y = Math.min(vh, b.bottom) - Math.max(0, b.top);
        if (x > 0 && y > 0) area += x * y;
      });
      return { y: Math.round(scrollY), cover: area / (vw * vh), max: document.documentElement.scrollHeight - vh };
    });
    await page.evaluate(MARK);
    if (r.cover < 0.04) empties.push(r.y);
    if (r.y === last) { if (++stuck > 3) break; } else stuck = 0; last = r.y;
    if (r.y >= r.max - 2) break;
  }
  return empties;
}
(async () => {
  const browser = await chromium.launch(); let failures = 0;
  await Promise.all(PAGES.map(async pg => {
    let server = null, url;
    if (pg.single) { const f = path.join(ROOT, pg.single); if (!fs.existsSync(f)) { console.log(`– ${pg.name}: nicht vorhanden, übersprungen`); return; } url = 'file://' + f; }
    else { server = await serve(path.join(ROOT, pg.dir)); url = `http://127.0.0.1:${server.address().port}/${pg.file}`; }
    const origin = pg.single ? 'file:' : url.split('/').slice(0, 3).join('/');
    for (const mode of ['normal', 'reduziert']) {
      for (const [w, h] of (mode === 'normal' && !pg.single ? SIZES : [[1440, 900], [390, 844]])) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: mode === 'normal' ? 'no-preference' : 'reduce' });
        const page = await ctx.newPage(); const errs = [], ext = [];
        page.on('pageerror', e => errs.push('JS: ' + e)); page.on('console', m => { if (m.type() === 'error') errs.push('Konsole: ' + m.text()); });
        page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
        page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith(origin)) ext.push(u); });
        await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(3600);
        const empties = await walk(page, w, h);
        await page.waitForTimeout(800);
        const r = await page.evaluate(() => {
          const de = document.documentElement, W = de.clientWidth;
          const pins = (window.ScrollTrigger ? ScrollTrigger.getAll() : []).filter(t => t.pin && String(t.vars.start).startsWith('top top')).map(t => {
            const sp = t.pin.closest('.pin-spacer') || t.pin; return { n: t.pin.className.split(' ')[0], d: Math.abs(Math.round(t.start - (sp.getBoundingClientRect().top + scrollY))) }; }).filter(p => p.d > 4);
          const order = (window.ScrollTrigger ? ScrollTrigger.getAll() : []).filter(t => t.pin).map(t => t.start); const sorted = order.every((v, i) => !i || v >= order[i - 1]);
          const never = [...document.querySelectorAll('main h2, main h3, main p, main li, main form, main img')].filter(e => e.getBoundingClientRect().height && !e.closest('[hidden],.err,.ok,.field-error,.form-status,.live,output,.ring-wrap,.month-empty') && !window.__seen.has(e)).map(e => (e.textContent || e.alt || e.tagName).trim().slice(0, 32));
          return { over: de.scrollWidth - W, pins, sorted, never, loader: !!document.querySelector('.loader') };
        });
        const problems = [];
        if (empties.length) problems.push(`LEERLAUF bei scrollY ${empties.slice(0, 6).join(', ')}`);
        if (r.pins.length) problems.push('Pin verschoben: ' + r.pins.map(p => `${p.n} um ${p.d}px`).join(', '));
        if (!r.sorted) problems.push('Pins nicht in Seitenreihenfolge');
        if (r.over > 1) problems.push(`seitliches Scrollen ${r.over}px`);
        if (r.never.length) problems.push(`${r.never.length} Elemente waren nie sichtbar: ` + r.never.slice(0, 4).map(t => '"' + t + '"').join(', '));
        if (r.loader) problems.push('Vorspann nicht entfernt');
        if (errs.length) problems.push(...errs.slice(0, 3));
        if (ext.length) problems.push('Fremdanfrage: ' + ext[0]);
        console.log(`${problems.length ? '✗' : '✓'} ${pg.name}  ${w}×${h}  ${mode}${problems.length ? '\n    ' + problems.join('\n    ') : ''}`);
        failures += problems.length; await ctx.close();
      }
    }
    if (server) server.close();
  }));
  await browser.close();
  console.log(failures ? `\nNICHT AUSLIEFERN: ${failures} Problem(e).` : '\nAlles in Ordnung: keine Probleme gefunden.');
  process.exit(failures ? 1 : 0);
})();
