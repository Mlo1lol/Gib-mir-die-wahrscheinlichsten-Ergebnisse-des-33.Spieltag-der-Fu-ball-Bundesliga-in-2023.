#!/usr/bin/env node
/* Abnahmeprüfung vor jeder Auslieferung:  node qa/check.js
   Öffnet jede Seite in Chromium und scrollt mit echtem Mausrad von oben bis unten.
   FEHLER, wenn:
     1. ein Bildschirm (fast) leer ist (Leerlauf),
     2. ein gepinntes Kapitel an einer anderen Stelle rechnet, als es tatsächlich steht,
     3. die Seite seitlich scrollt,
     4. die Konsole Fehler meldet oder eine Datei nicht lädt,
     5. eine Anfrage an einen fremden Server geht (DSGVO),
     6. ein Inhalt während des gesamten Durchlaufs nie sichtbar war,
     7. zwischen zwei Inhalten im selben Bildschirm eine Lücke über 300 px klafft,
     8. Text in einer Karte abgeschnitten wird,
     9. in einer festgehaltenen Bühne etwas unten aus dem Bild ragt.
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
const SIZES_ALL = [[2560, 1440], [1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [820, 1180], [390, 844], [320, 640]];
// Eingrenzen für schnelle Einzelprüfungen:  ONLY=Koop SIZES=1920x1080 node qa/check.js
const SIZES = process.env.SIZES ? process.env.SIZES.split(',').map(x => x.split('x').map(Number)) : SIZES_ALL;
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', woff2: 'font/woff2', webp: 'image/webp', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg' };
function serve(dir) {
  return new Promise(res => { const s = http.createServer((q, r) => {
    const f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1', () => res(s)); });
}
const MARK = () => { window.__seen = window.__seen || new Set(); const vh = innerHeight, vw = innerWidth;
  // sichtbar = im Bild (senkrecht UND waagerecht) und nicht von einem Elternelement mit overflow abgeschnitten
  const shown = e => { let r = e.getBoundingClientRect(); let L = Math.max(0, r.left), T = Math.max(0, r.top), R = Math.min(vw, r.right), B = Math.min(vh, r.bottom);
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); const c = a.getBoundingClientRect();
      // hidden/clip schneidet ab; auto/scroll (Wisch-Karussell) ist für Besucher erreichbar und zählt nicht als abgeschnitten
      if (/hidden|clip/.test(cs.overflowX)) { L = Math.max(L, c.left); R = Math.min(R, c.right); }
      if (/hidden|clip/.test(cs.overflowY)) { T = Math.max(T, c.top); B = Math.min(B, c.bottom); } }
    return R - L > 4 && B - T > 4; };
  document.querySelectorAll('main h2, main h3, main p, main li, main form, main img').forEach(e => { if (window.__seen.has(e)) return; const b = e.getBoundingClientRect(); if (!b.height || !shown(e)) return; let o = 1, n = e; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden') { o = 0; break; } o *= +cs.opacity; n = n.parentElement; } if (o >= 0.5) window.__seen.add(e); }); };
const GAP_MAX = 300; // größte erlaubte Lücke zwischen zwei Inhalten im selben Bildschirm (px)
async function walk(page, w, h, shotPrefix) {
  await page.evaluate(MARK);
  await page.mouse.move(w / 2, h / 2);
  const empties = [], gaps = [], outs = []; let last = -1, stuck = 0;
  for (let i = 0; i < 1200; i++) {
    // kleine Schritte: jede Lücke bis 65 % Bildschirmhöhe liegt in mindestens einem Bild vollständig
    await page.mouse.wheel(0, h * 0.35); await page.waitForTimeout(240);
    const r = await page.evaluate(() => {
      const vh = innerHeight, vw = innerWidth; let area = 0; const iv = [];
      const skip = e => e.closest('.nav-bar,.topbar,.menu-panel,.callbar,.loader,.skip');
      const visible = e => { const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && +cs.opacity >= 0.1; };
      const add = (b) => { const t = Math.max(0, b.top), u = Math.min(vh, b.bottom); if (u > t && b.right > 0 && b.left < vw) iv.push([t, u]); };
      // Jedes Element mit eigenem Text zählt (auch große Wortmarken in <span>)
      const own = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      const els = new Set(document.querySelectorAll('h1,h2,h3,h4,p,li,img,a,button,input,select,textarea,label,address,td,small,strong,time,dd,dt,summary,figure,svg text,svg rect,svg path'));
      document.querySelectorAll('main *, footer *').forEach(e => { if (own(e)) els.add(e); });
      els.forEach(e => {
        if (skip(e) || !(visible(e) || e.closest('[data-reveal].is-in'))) return;
        const b = e.getBoundingClientRect(), x = Math.min(vw, b.right) - Math.max(0, b.left), y = Math.min(vh, b.bottom) - Math.max(0, b.top);
        if (x > 0 && y > 0) { area += x * y; add(b); }
      });
      // Flächen (Karten, Formulare, Bilder-Rahmen) zählen als Inhalt, ganze Abschnittsflächen nicht
      document.querySelectorAll('main *, footer *').forEach(e => {
        if (skip(e)) return; const b = e.getBoundingClientRect(); if (b.width >= vw * 0.95 || b.height < 40 || b.width < 40) return;
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
        if ((cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) || cs.backgroundImage !== 'none') add(b);
      });
      const top = (() => { const n = document.querySelector('.nav-bar,.topbar'); return n ? Math.max(0, n.getBoundingClientRect().bottom) : 0; })();
      iv.sort((x, y) => x[0] - y[0]); let gap = 0, gapAt = 0, end = null;
      for (const [t, u] of iv) { if (u <= top) continue; const tt = Math.max(t, top); if (end !== null && tt - end > gap) { gap = tt - end; gapAt = end; } end = end === null ? u : Math.max(end, u); }
      // Festgehaltene Bühnen: nichts darf unten aus dem Bild ragen
      const out = [...document.querySelectorAll('.pin-spacer > *')].filter(p => getComputedStyle(p).position === 'fixed').flatMap(p => [...p.querySelectorAll('h2,h3,p,li,.panel,.month,.btn')].filter(e => { const b = e.getBoundingClientRect(); return b.height && b.bottom > vh + 1 && b.left < vw && b.right > 0; }).map(e => (e.textContent || '').trim().slice(0, 24)));
      return { y: Math.round(scrollY), cover: area / (vw * vh), max: document.documentElement.scrollHeight - vh, gap: Math.round(gap), gapAt: Math.round(gapAt), out };
    });
    await page.evaluate(MARK);
    if (r.cover < 0.04) empties.push(r.y);
    if (r.out.length) outs.push(...r.out);
    if (r.gap > GAP_MAX) { if (!gaps.length && shotPrefix) await page.screenshot({ path: `${shotPrefix}-luecke-${r.y}.png` }); gaps.push(`${r.gap}px bei scrollY ${r.y}`); }
    if (r.y === last) { if (++stuck > 3) break; } else stuck = 0; last = r.y;
    if (r.y >= r.max - 2) break;
  }
  return { empties, gaps, outs: [...new Set(outs)] };
}
(async () => {
  const browser = await chromium.launch(); let failures = 0;
  await Promise.all(PAGES.filter(pg => !process.env.ONLY || pg.name.includes(process.env.ONLY)).map(async pg => {
    let server = null, url;
    if (pg.single) { const f = path.join(ROOT, pg.single); if (!fs.existsSync(f)) { console.log(`– ${pg.name}: nicht vorhanden, übersprungen`); return; } url = 'file://' + f; }
    else { server = await serve(path.join(ROOT, pg.dir)); url = `http://127.0.0.1:${server.address().port}/${pg.file}`; }
    const origin = pg.single ? 'file:' : url.split('/').slice(0, 3).join('/');
    for (const mode of ['normal', 'reduziert']) {
      for (const [w, h] of (mode === 'normal' && !pg.single ? SIZES : [[1920, 1080], [390, 844]])) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: mode === 'normal' ? 'no-preference' : 'reduce' });
        const page = await ctx.newPage(); const errs = [], ext = [];
        page.on('pageerror', e => errs.push('JS: ' + e)); page.on('console', m => { if (m.type() === 'error') errs.push('Konsole: ' + m.text()); });
        page.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
        page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith(origin)) ext.push(u); });
        await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(3600);
        const shotDir = path.join(ROOT, 'qa', 'befunde'); fs.mkdirSync(shotDir, { recursive: true });
        const { empties, gaps, outs } = await walk(page, w, h, path.join(shotDir, `${(pg.single || pg.dir).replace(/[^a-z]/gi, '')}-${w}x${h}-${mode}`));
        // Zweiter Durchgang: jedes noch nie gesehene Element gezielt ansteuern und dort warten.
        const SEL = 'main h2, main h3, main p, main li, main form, main img', SKIP = '[hidden],.scard,.err,.ok,.field-error,.form-status,.live,output,.ring-wrap,.month-empty';
        const pending = await page.evaluate(([SEL, SKIP]) => { const all = [...document.querySelectorAll(SEL)]; return all.map((e, i) => (e.getBoundingClientRect().height && !e.closest(SKIP) && !window.__seen.has(e)) ? i : -1).filter(i => i >= 0); }, [SEL, SKIP]);
        for (const i of pending.slice(0, 60)) {
          // Mit dem Mausrad hinfahren (kein Sprung: der würde mit dem weichen Scrollen kollidieren)
          for (let k = 0; k < 120; k++) {
            const pos = await page.evaluate(([SEL, i]) => { const b = document.querySelectorAll(SEL)[i].getBoundingClientRect(); return { mid: b.top + Math.min(b.height, innerHeight) / 2, vh: innerHeight, seen: window.__seen.has(document.querySelectorAll(SEL)[i]) }; }, [SEL, i]);
            if (pos.seen) break;
            const off = pos.mid - pos.vh * 0.5;
            if (Math.abs(off) < pos.vh * 0.2) { await page.waitForTimeout(1300); await page.evaluate(MARK); break; }
            await page.mouse.wheel(0, Math.max(-pos.vh * 0.6, Math.min(pos.vh * 0.6, off))); await page.waitForTimeout(240); await page.evaluate(MARK);
          }
        }
        await page.waitForTimeout(300);
        const r = await page.evaluate(() => {
          const de = document.documentElement, W = de.clientWidth;
          const pins = (window.ScrollTrigger ? ScrollTrigger.getAll() : []).filter(t => t.pin && String(t.vars.start).startsWith('top top')).map(t => {
            const sp = t.pin.closest('.pin-spacer') || t.pin; return { n: t.pin.className.split(' ')[0], d: Math.abs(Math.round(t.start - (sp.getBoundingClientRect().top + scrollY))) }; }).filter(p => p.d > 4);
          const order = (window.ScrollTrigger ? ScrollTrigger.getAll() : []).filter(t => t.pin).map(t => t.start); const sorted = order.every((v, i) => !i || v >= order[i - 1]);
          const never = [...document.querySelectorAll('main h2, main h3, main p, main li, main form, main img')].filter(e => e.getBoundingClientRect().height && !e.closest('[hidden],.scard,.err,.ok,.field-error,.form-status,.live,output,.ring-wrap,.month-empty') && !window.__seen.has(e)).map(e => (e.textContent || e.alt || e.tagName).trim().slice(0, 32));
          const clipped = [...document.querySelectorAll('.panel, .month, .card, .tile, .cost')].filter(c => getComputedStyle(c).overflow !== 'visible').flatMap(c => { const cb = c.getBoundingClientRect(); return [...c.querySelectorAll('h3, p, li')].filter(e => { const b = e.getBoundingClientRect(); return b.height && b.bottom > cb.bottom + 1; }).map(e => e.textContent.trim().slice(0, 24)); });
          return { over: de.scrollWidth - W, pins, sorted, never, clipped, loader: !!document.querySelector('.loader') };
        });
        const problems = [];
        if (empties.length) problems.push(`LEERLAUF bei scrollY ${empties.slice(0, 6).join(', ')}`);
        if (gaps.length) problems.push(`LÜCKE über ${GAP_MAX}px: ${[...new Set(gaps)].slice(0, 4).join('; ')} (Bild in qa/befunde/)`);
        if (outs.length) problems.push('Ragt aus festgehaltener Bühne: ' + outs.slice(0, 3).map(t => '"' + t + '"').join(', '));
        if (r.clipped.length) problems.push('Text in Karte abgeschnitten: ' + r.clipped.slice(0, 3).join(', '));
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
