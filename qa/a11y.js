#!/usr/bin/env node
/* Barrierefreiheits-Prüfung mit axe-core (WCAG 2.1 A/AA):  node qa/a11y.js
   Braucht axe-core:  npm i --no-save axe-core   (oder AXE=/pfad/zu/axe.min.js) */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const axePath = process.env.AXE || [path.join(ROOT, 'node_modules/axe-core/axe.min.js'), '/tmp/claude-0/npmw/node_modules/axe-core/axe.min.js'].find(fs.existsSync);
if (!axePath) { console.error('axe-core nicht gefunden'); process.exit(2); }
const FILES = ['koop-website-komplett.html', 'tietmann-website-komplett.html', 'website/impressum.html', 'website/datenschutz.html', 'tietmann/impressum.html', 'tietmann/datenschutz.html'].filter(f => fs.existsSync(path.join(ROOT, f)));
(async () => { const b = await chromium.launch(); let total = 0;
  for (const f of FILES) for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await p.goto('file://' + path.join(ROOT, f)); await p.waitForTimeout(1500);
    await p.addScriptTag({ path: axePath });
    // .foot-mark ist reine Dekoration (aria-hidden, WCAG 1.4.3 nimmt Dekoration aus)
    const r = await p.evaluate(() => axe.run({ exclude: [['.foot-mark']] }, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
    console.log(`${r.violations.length ? '✗' : '✓'} ${f} ${w}px`);
    for (const v of r.violations) { total++; console.log(`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}×)`); v.nodes.slice(0, 3).forEach(n => console.log('       ' + n.target.join(' ') + (n.any[0] && n.any[0].data && n.any[0].data.contrastRatio ? `  Kontrast ${n.any[0].data.contrastRatio}` : ''))); }
    await p.close(); }
  await b.close(); console.log(total ? `\n${total} Befund(e).` : '\nKeine Befunde.'); process.exit(total ? 1 : 0); })();
