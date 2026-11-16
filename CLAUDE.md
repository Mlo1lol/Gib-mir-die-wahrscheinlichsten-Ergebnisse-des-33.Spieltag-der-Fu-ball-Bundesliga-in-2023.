# Arbeitsregeln für dieses Projekt

Zwei Kanzlei-Websites: `website/` (Steuerberater Koop) und `tietmann/` (Rechtsanwalt Tietmann).
Die Einzeldateien `*-komplett.html` werden daraus erzeugt und nie von Hand bearbeitet.

## Abnahme: Pflicht vor jeder Auslieferung

Nach **jeder** Änderung an HTML, CSS oder JavaScript, bevor etwas als fertig gemeldet wird:

1. `python3 qa/bundle.py` (Einzeldateien neu bauen)
2. `node qa/check.js` (muss mit „Alles in Ordnung“ enden)

Die Prüfung scrollt jede Seite mit echtem Mausrad auf sieben Bildschirmgrößen durch und findet:
leere Bildschirme (Leerlauf), verschobene gepinnte Kapitel, seitliches Scrollen, Konsolenfehler,
fehlende Dateien, Anfragen an fremde Server und Inhalte, die unsichtbar bleiben.

Schlägt sie fehl, wird nicht ausgeliefert und der Fehler nicht als „Messartefakt“ abgetan,
bevor er im Screenshot geklärt ist. Screenshots werden vollständig angesehen: Ein leerer oder
halb leerer Bildschirm ist ein Fehler, kein Zwischenzustand.

## Technische Regeln (aus gemachten Fehlern)

- **Gepinnte Kapitel (GSAP ScrollTrigger mit `pin`) immer in Seitenreihenfolge anlegen**, oben
  zuerst, und `refreshPriority` setzen. Sonst rechnet ein Kapitel mit einer falschen Position und
  hinterlässt leere Bildschirme. Nach Inhaltsänderungen `ScrollTrigger.refresh()`.
- Getestet wird mit `page.mouse.wheel`, nicht nur mit `window.scrollTo`.
- Keine Verbindung zu fremden Servern (keine Google Fonts, keine CDNs). Alles liegt in `assets/`.
- Inhalte müssen ohne JavaScript und mit „Bewegung reduzieren“ sichtbar bleiben.
- Keine erfundenen Fakten über die Kanzleien. Unbestätigtes bleibt als Platzhalter markiert.
