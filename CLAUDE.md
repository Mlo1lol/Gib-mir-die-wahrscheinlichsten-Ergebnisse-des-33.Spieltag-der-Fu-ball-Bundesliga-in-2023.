# Arbeitsregeln für dieses Projekt

Zwei Kanzlei-Websites: `website/` (Steuerberater Koop) und `tietmann/` (Rechtsanwalt Tietmann).
Die Einzeldateien `*-komplett.html` werden daraus erzeugt und nie von Hand bearbeitet.

## Abnahme: Pflicht vor jeder Auslieferung

Nach **jeder** Änderung an HTML, CSS oder JavaScript, bevor etwas als fertig gemeldet wird:

1. `python3 qa/bundle.py` (Einzeldateien neu bauen)
2. `node qa/check.js` (muss mit „Alles in Ordnung“ enden)
3. `node qa/a11y.js` (muss mit „Keine Befunde“ enden; braucht `npm i --no-save axe-core`)

Die Prüfung scrollt jede Seite mit echtem Mausrad auf neun Bildschirmgrößen (320 bis 2560 px) durch
und findet: leere Bildschirme, **Lücken über 300 px zwischen zwei Inhalten im selben Bildschirm**,
verschobene gepinnte Kapitel, Inhalte, die aus einer festgehaltenen Bühne ragen, abgeschnittenen
Text in Karten, seitliches Scrollen, Konsolenfehler, fehlende Dateien, Anfragen an fremde Server und
Inhalte, die nie sichtbar werden. Beweisbilder landen in `qa/befunde/`.

Schlägt sie fehl, wird nicht ausgeliefert und der Fehler nicht als „Messartefakt“ abgetan,
bevor er im Screenshot geklärt ist. Screenshots werden vollständig angesehen: Ein leerer oder
halb leerer Bildschirm ist ein Fehler, kein Zwischenzustand.

## Technische Regeln (aus gemachten Fehlern)

- **Gepinnte Kapitel (GSAP ScrollTrigger mit `pin`) immer in Seitenreihenfolge anlegen**, oben
  zuerst, und `refreshPriority` setzen. Sonst rechnet ein Kapitel mit einer falschen Position und
  hinterlässt leere Bildschirme. Nach Inhaltsänderungen `ScrollTrigger.refresh()`.
- Getestet wird mit `page.mouse.wheel`, nicht nur mit `window.scrollTo`.
- **Nur festhalten, was den Bildschirm füllt oder seitwärts läuft.** Ein festgehaltener Block, der
  kürzer ist als der Bildschirm, hinterlässt auf hohen Monitoren zwangsläufig Leerstreifen (beim
  Kernsatz nachgerechnet). Solche Effekte laufen mit dem Scrollen mit, statt festzustehen.
- **Keine bildschirmhohen Bühnen mit mittig schwebendem Inhalt.** Das erzeugt beim Hinein- und
  Herausscrollen halbe Bildschirme Leere. Festgehaltene Bühnen sind so hoch wie ihr Inhalt und
  stehen im optischen Zentrum; Kapitel-Überschriften stehen oben, nicht mittig.
- Ein einziges Abstandsmaß für Abschnitte (`--sec-pad` bei Koop, `section{padding:96px 0}` bei Tietmann).
- Einblendungen starten, sobald der Inhalt unten ins Bild kommt (`top bottom`), nicht erst bei 88 %.
- In der ruhigen Fassung („Bewegung reduzieren“) bekommen Bühnen `top: auto` (sonst wirkt `top` als Versatz) und bleiben `position: relative` (absolut positionierte Bilder brauchen den Rahmen).
- Keine Hilfsklassen mit allgemeinen Namen (Fehler: `.live` im Formular traf auch `.story.live`).
- Keine Verbindung zu fremden Servern (keine Google Fonts, keine CDNs). Alles liegt in `assets/`.
- Inhalte müssen ohne JavaScript und mit „Bewegung reduzieren“ sichtbar bleiben.
- Keine erfundenen Fakten über die Kanzleien. Unbestätigtes bleibt als Platzhalter markiert.
- Nichts im Browser speichern (kein Cookie, kein localStorage, kein sessionStorage): § 25 TDDDG.
- Rechtstexte bleiben Entwürfe, bis der Kanzleiinhaber sie freigibt. Offene Punkte stehen in `RECHTS-CHECK.md`.

## Skills und Agenten von Dritten

Liegen in `.claude/skills/` und `.claude/agents/`. Neue nur nach dieser Regel aufnehmen:

1. Quelle direkt auf GitHub oder skills.sh finden, nicht über Social-Media-Umwege
   (`npx skills find <begriff>` oder der Skill `find-skills`).
2. Vor dem Installieren jede `SKILL.md` lesen. Lizenz prüfen und mit ablegen.
3. **Keine Hooks und keine Installationsskripte von Dritten übernehmen**, nur die Texte. Hooks
   laufen bei jedem Schritt automatisch mit vollen Rechten.

Aktuell übernommen:
- `find-skills` (vercel-labs/skills, MIT)
- `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`
  (DietrichGebert/ponytail, MIT, Stand 96608e0), ohne die Hooks des Repos
- Agenten „Legal Compliance Checker“, „Accessibility Auditor“ (msitarzewski/agency-agents, MIT)
