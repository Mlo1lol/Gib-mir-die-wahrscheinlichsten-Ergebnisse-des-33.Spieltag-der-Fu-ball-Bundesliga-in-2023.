# Rechts-Check der beiden Websites

Stand: 16.11.2026. Geprüft nach deutschem Recht für Kanzlei-Websites.

**Wichtig:** Das ist eine technische und inhaltliche Vorprüfung, keine Rechtsberatung, und keine
Garantie für „Rechtssicherheit“. Verantwortlich für Impressum und Datenschutz ist der jeweilige
Kanzleiinhaber. Beide Seiten gehen erst live, wenn die offenen Punkte unten erledigt sind.

## Zur verlinkten Anleitung (Agency Agents)

Die PDF beschreibt die Installation einer Sammlung von 283 Rollen für Claude Code. Sie enthält
keine Rechtsanleitung. Übernommen wurden zwei Rollen nach `.claude/agents/`: „Legal Compliance
Checker“ und „Accessibility Auditor“ (MIT-Lizenz). Beide sind allgemein und auf US-Recht
ausgerichtet; deutsches Recht (DDG, TDDDG, Berufsrecht) kennen sie nicht. Das Installationsskript
wurde nicht ausgeführt. Die Rollen stehen ab der nächsten Claude-Code-Sitzung zur Verfügung.

## Behoben in diesem Durchgang

| Punkt | Seite | Rechtsgrundlage | Was geändert wurde |
|---|---|---|---|
| Merker im Browser gespeichert („Vorspann gesehen“) | Koop | § 25 TDDDG | Entfernt. Die Seite speichert nichts mehr im Browser; die Datenschutzseite sagt das jetzt ausdrücklich. |
| Kontrast zu gering (Button, vergangene Termine, Logo-Zusatz) | Koop | WCAG 2.1 AA | Farben angehoben; vergangene Termine durchgestrichen statt blass. |
| Logo-Link: Vorlesetext wich vom sichtbaren Text ab | Koop | WCAG 2.5.3 | Abweichenden Text entfernt. |
| Karten-Schiene nicht per Tastatur erreichbar | Koop | WCAG 2.1.1 | Fokussierbar gemacht. |
| Impressum und Datenschutz fehlten | Tietmann | § 5 DDG, Art. 13 DSGVO | Als Entwurf angelegt und verlinkt, Platzhalter markiert. |
| Formular verlangte eine „Einwilligung“ | Tietmann | Art. 6 Abs. 1 lit. b DSGVO | Auf Kenntnisnahme umgestellt. Anfragen brauchen keine Einwilligung; eine Einwilligung wäre widerruflich. |
| Lizenzhinweise der Bibliotheken und Schriften fehlten | beide | MIT-Lizenz, OFL | `LICENSES.txt` in `assets/vendor/` und `assets/fonts/`. |

Schon vorher erledigt: keine Google-Schriften, keine Cookies, kein Tracking, keine Karten von
Drittanbietern, Bildnachweise mit Lizenz (Koop).

## Automatisch geprüft

- `node qa/a11y.js`: axe-core, WCAG 2.1 A und AA, alle Seiten auf 1440 und 390 px: keine Befunde.
  Geprüft mit der Einstellung „Bewegung reduzieren“. Ein automatischer Test findet nur einen Teil
  der Barrieren; ein Test mit Screenreader steht aus.
- `node qa/check.js`: keine Anfrage an fremde Server.

## Offen: muss Herr Koop liefern oder entscheiden

1. **Umsatzsteuer-ID** fürs Impressum (falls vorhanden).
2. **Berufshaftpflicht:** Anschrift der Allianz (DL-InfoV verlangt Name, Anschrift, Geltungsbereich).
3. **Hosting-Anbieter** mit Sitz und Speicherdauer der Protokolle für die Datenschutzseite; Vertrag
   zur Auftragsverarbeitung abschließen.
4. **Fotos der Mitarbeiter:** Die Teamfotos stammen von der alten Seite. Für die neue Seite braucht
   er die Einwilligung von Frau Lackner und Herrn Aust (Art. 6 Abs. 1 lit. a DSGVO, § 22 KUG),
   am besten schriftlich.
5. **Mitarbeiterzahl und Namen** bestätigen (alte Seite widerspricht sich).
6. **Fristenrechner fachlich abnehmen.** Er ist mit „ohne Gewähr“ gekennzeichnet; trotzdem sollte
   der Steuerberater die Termine einmal gegenprüfen.
7. **Berufsrechtliche Werbung** (§ 57a StBerG, § 9 BOStB): Texte sind sachlich gehalten. Aussagen
   wie „Den Bau kennen wir von innen“ sollte er selbst freigeben.
8. **Texte prüfen lassen:** Impressum und Datenschutz von der Steuerberaterkammer oder einem
   Datenschutz-Dienst gegenlesen lassen.

## Offen: muss Herr Tietmann liefern oder entscheiden

1. **Rechtsanwaltskammer** mit Anschrift bestätigen (vermutlich Rechtsanwaltskammer
   Mecklenburg-Vorpommern).
2. **Berufshaftpflicht:** Versicherer, Anschrift, Geltungsbereich.
3. **Umsatzsteuer-ID**, falls vorhanden.
4. **Verbraucherschlichtung** (§ 36 VSBG): bereit oder nicht bereit.
5. **Arbeitsrecht** als Tätigkeitsgebiet bestätigen (im Entwurf markiert).
6. **Erstberatungsgebühr**, Sprechzeiten, Antwortfrist (Platzhalter).
7. **Kontaktformular im Livebetrieb:** Es überträgt im Entwurf nichts. Für den Livebetrieb braucht
   es verschlüsselte Übertragung, einen Hoster in der EU mit Vertrag zur Auftragsverarbeitung und
   eine Regelung für hochgeladene Unterlagen. Mandatsunterlagen über ein Webformular sind wegen der
   Verschwiegenheitspflicht (§ 43a Abs. 2 BRAO, § 2 BORA) heikel; zu überlegen ist, den Upload
   wegzulassen.
8. **E-Mail-Adresse bei t-online:** rechtlich zulässig, für Mandatskommunikation aber zu prüfen.
9. **Terminbuchung und Karte:** nur mit Zwei-Klick-Lösung oder Einwilligung einbinden.
10. **Fristrechner:** rechnet drei Wochen nach § 4 KSchG mit Wochenenden und Feiertagen in
    Mecklenburg-Vorpommern. Als Anwalt sollte er die Berechnung und den Hinweistext selbst abnehmen.
11. Das Banner „Design-Entwurf“ erst entfernen, wenn alle Platzhalter ersetzt sind.

## Nicht geprüft

- Barrierefreiheitsstärkungsgesetz (BFSG): Kleinstunternehmen, die Dienstleistungen erbringen
  (unter 10 Beschäftigte und höchstens 2 Mio. € Umsatz), sind ausgenommen. Ob das auf die
  Kanzleien zutrifft, müssen die Inhaber anhand ihrer Zahlen beurteilen.
- Markenrecht an den Namen, Verträge zwischen dir und den Kanzleien, Urheberrecht an Texten der
  alten Koop-Seite (er ist Rechteinhaber oder sein früherer Dienstleister).
- Dein eigenes Angebot: Wenn du die Seiten betreibst oder hostest, bist du Auftragsverarbeiter
  und brauchst selbst einen Vertrag nach Art. 28 DSGVO mit den Kanzleien.
