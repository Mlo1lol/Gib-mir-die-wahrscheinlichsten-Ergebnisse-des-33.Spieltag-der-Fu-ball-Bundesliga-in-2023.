# So überzeugst du Herrn Koop von der neuen Website

**Seine Haltung:** „Wieso brauche ich eine neue Website? Die alte läuft seit 20 Jahren, das passt so.“

**Deine Strategie in einem Satz:** Rede nicht über Design, sondern über **Risiko, Fehler und Zahlen**. Herr Koop war zehn Jahre Finanzcontroller und nennt als Motivation selbst „die Vielfältigkeit der analytischen Tätigkeit“. Er kauft keine schöne Seite, er kauft eine Seite, die ein Risiko beseitigt und sich rechnet.

---

## 1. Verstehe, warum er Nein sagt

„Läuft doch“ heißt meistens nicht „Ich finde die Seite gut“, sondern:

- **„Ich sehe kein Problem.“** Er schaut seine Seite nie an, weil er nicht sein eigener Kunde ist.
- **„Ich will keinen Aufwand.“** Er befürchtet Termine, Texte schreiben, Abstimmungen und Ärger.
- **„Ich habe genug Mandanten.“** Neue Kunden sind gerade nicht sein Engpass.
- **„Was nicht kaputt ist, repariert man nicht.“** Für ihn ist das eine vernünftige Kostenentscheidung.

Deine Aufgabe ist also nicht, ihn zu begeistern. Du musst ihm zeigen: **Die Seite ist kaputt, nur sieht er es nicht.** Und der Wechsel kostet ihn fast keine Zeit.

---

## 2. Deine Beweise (alles auf seiner aktuellen Seite geprüft, Stand 16.11.2026)

Bring diese Punkte ausgedruckt mit. Konkrete Fehler auf seiner eigenen Seite wirken stärker als jedes allgemeine Argument.

### A) Rechtliches Risiko beim Datenschutz (das stärkste Argument)

| Was | Wo | Warum es ein Problem ist |
|---|---|---|
| Die Datenschutzerklärung nennt als zuständige Aufsichtsbehörde den **Eidgenössischen Datenschutzbeauftragten der Schweiz** und vergleicht mit dem „Datenschutzniveau der Schweiz“ | kontakt.html, Abschnitt „Rechtsweg“ und „Weitergabe ins Ausland“ | Für eine Kanzlei in Schwerin ist das falsch. Zuständig ist der Landesbeauftragte für Datenschutz in Mecklenburg-Vorpommern. Eine fehlerhafte Datenschutzerklärung kann abgemahnt werden. |
| Die Seite lädt Programmcode von **Google-Servern** (`ajax.googleapis.com`) | Quelltext jeder Seite | Bei jedem Besuch geht die IP-Adresse des Besuchers ohne Einwilligung an Google. Nach dem Google-Fonts-Urteil des LG München (Januar 2022) gab es für genau so etwas eine Abmahnwelle. |
| Die Anfahrtskarte nutzt **Google Maps** | kontakt.html | Gleiches Problem: Datenübertragung an Google ohne Einwilligung. |
| Die Datenschutzerklärung beschreibt Cookies, Zählpixel und Tracking „in der Regel mittels Third Party Cookies“ | kontakt.html | Steht da, obwohl es niemand braucht. Ein Mandant, der das liest, fragt sich, was mit seinen Daten passiert. |

**So sagst du es:** „Sie haben als Steuerberater eine Verschwiegenheitspflicht. Ihre Website schickt aber die IP-Adresse jedes Besuchers an Google, und Ihre Datenschutzerklärung verweist auf Schweizer Recht. Das ist ein Risiko, das Sie mit einem Tag Arbeit los sind.“

### B) Veraltete und unsichere Technik

| Was | Warum es ein Problem ist |
|---|---|
| **jQuery 1.4.2** aus dem Jahr **2010** | Mehrere bekannte Sicherheitslücken (u. a. CVE-2011-4969, CVE-2015-9251, CVE-2019-11358, CVE-2020-11022). Seit über zehn Jahren nicht mehr gepflegt. |
| Das Script wird über **`http://`** statt `https://` geladen | Moderne Browser blockieren das. Die Seite funktioniert nur noch, weil direkt danach eine zweite Kopie derselben alten Bibliothek als Notlösung geladen wird. |
| Ein Verweis auf ein Script bei **googlecode.com** | Den Dienst hat Google 2016 abgeschaltet. Die Seite verweist auf eine Datei, die es nicht mehr gibt. |
| Sonderweichen für **Internet Explorer 6 bis 9** | Diese Browser hat Microsoft schon vor Jahren eingestellt. Das zeigt jedem Fachmann, wie alt die Seite ist. |

**So sagst du es (mit seiner Bau-Erfahrung):** „Das ist wie ein Haus aus den 2000ern, bei dem die Elektrik nie erneuert wurde. Es steht noch, aber Sie würden es keinem Mandanten so finanzieren.“

### C) Widersprüche und Fehler, die Mandanten sehen

| Was | Wo |
|---|---|
| Postleitzahl **19053** statt **19061** | Seite „Aktuelles“, Kasten „Anschrift“ |
| Startseite: Team aus **3 Mitarbeiterinnen**. Team-Seite: **4 Personen**, darunter ein Herr | index.html und team.html |
| Tippfehler „**Mananger**-BWA“ | leistungen.html |
| „Wir **distanziere mich**“ | Haftungshinweis im Impressum |
| Die E-Mail des Inhabers ist eine **t-online-Adresse** statt der Kanzlei-Domain | team.html |

Falsche Adressdaten sind nicht nur peinlich: Google gleicht Name, Adresse und Telefonnummer auf verschiedenen Seiten ab. Widersprüche schwächen die Sichtbarkeit bei der Suche „Steuerberater Schwerin“.

**So sagst du es:** „Ein Steuerberater lebt davon, dass die Zahlen stimmen. Auf Ihrer Seite stimmen sie nicht. Das fällt genau den Leuten auf, die Sie haben wollen.“

---

## 3. Argumente, die zu ihm passen (nicht zu jedem)

1. **Fachkräfte statt Mandanten.** Der größte Engpass in Kanzleien sind heute Steuerfachangestellte, nicht Mandanten. Bewerber schauen sich zuerst die Website an. Eine Seite mit IE6-Code sagt: „Hier arbeitet man auch mit Technik von 2010.“ Frag ihn: *„Wann hat zuletzt jemand gesagt, er bewirbt sich wegen Ihrer Website?“*
2. **Die richtigen Mandanten.** Er will Bau, freie Berufe und Mittelstand, keine Kleinstanfragen. Die neue Seite spricht genau diese Gruppen an und stellt seine Bau-Erfahrung (zehn Jahre Controller einer Baugruppe mit rund 400 Leuten) nach vorn. Das ist sein Alleinstellungsmerkmal, und auf der alten Seite steht es versteckt im Fließtext.
3. **Empfehlungen werden gegoogelt.** „Ich bekomme alles über Empfehlung“ stimmt. Aber wer empfohlen wird, sucht den Namen vorher bei Google. Die Website ist der erste Eindruck nach der Empfehlung.
4. **Wert der Kanzlei.** Nur falls es passt und vorsichtig formuliert: Irgendwann steht eine Übergabe oder ein Verkauf an. Eine gepflegte Außendarstellung gehört zum Kanzleiwert. Er berät selbst zur Unternehmensnachfolge und kennt das Argument.
5. **Die Rechnung.** Lass ihn selbst rechnen, das überzeugt einen Controller am meisten:
   > Was bringt Ihnen ein einziges neues Dauermandat, zum Beispiel eine GmbH mit Buchhaltung und Jahresabschluss, im Jahr? Und über fünf Jahre?
   Die Antwort liegt fast sicher über den Kosten der Website. **Ein einziges zusätzliches Mandat oder eine eingestellte Fachkraft bezahlt die Seite.**

---

## 4. Der Gesprächsablauf (etwa 20 Minuten)

**Vorbereitung**
- Die neue Seite auf deinem Laptop und auf deinem Handy öffnen (Ordner `website`, Datei `index.html`).
- Die Tabellen aus Abschnitt 2 auf einer Seite ausdrucken.
- Wenn möglich: seine alte Seite auf **seinem eigenen Handy** öffnen lassen.

**1. Anerkennung (2 Minuten)**
> „Ihre Seite hat 20 Jahre durchgehalten, das schafft kaum eine. Ich habe sie mir genau angesehen, und mir sind ein paar Dinge aufgefallen, die Sie wissen sollten.“

Nie „altmodisch“, „hässlich“ oder „nicht mehr zeitgemäß“ sagen. Damit greifst du seine Entscheidung an, und er verteidigt sie.

**2. Fragen statt behaupten (5 Minuten)**
- „Wie kommen neue Mandanten heute zu Ihnen?“
- „Schauen die sich vorher Ihre Website an?“
- „Suchen Sie gerade Mitarbeiter?“
- „Wer kümmert sich, wenn eine Abmahnung wegen Datenschutz kommt?“

Lass ihn reden. Jede Antwort ist dein Aufhänger für einen Beweis aus Abschnitt 2.

**3. Die Beweise zeigen (5 Minuten)**
Fang mit **Datenschutz** an (Risiko), dann **Fehler** (PLZ, Mitarbeiterzahl), dann **Technik**. Zeig auf das Papier, nicht auf Bildschirme voller Code.

**4. Die neue Seite zeigen (5 Minuten)**
Fang auf dem Handy an. Zeig in dieser Reihenfolge:
- Den **Fristen-Zettel** oben: Er berechnet die nächsten Steuertermine automatisch, mit Feiertagen in Mecklenburg-Vorpommern, und zeigt die Abgabefrist mit Steuerberater (aktuell 1. März 2027 für 2025). So etwas bietet die Konkurrenz selten, und es passt zu einem Zahlenmenschen.
- Den **Bau-Abschnitt**: seine Geschichte als Alleinstellungsmerkmal.
- Das **Team mit Werdegang**: alles aus seinen eigenen Texten, nichts erfunden.
- Den **Kontaktbereich**: Telefonnummer zum Antippen und die Anzeige, ob das Büro gerade besetzt ist.
- **Datenschutz**: keine Cookies, kein Google, kein Tracking. Die Schriften liegen auf dem eigenen Server.

Sag ausdrücklich: **„Die Texte sind Ihre. Ich habe nur sortiert und Fehler korrigiert.“** Das nimmt die Angst vor Werbesprache.

**5. Risiko rausnehmen und abschließen (3 Minuten)**
> „Ich schlage vor: Die neue Seite läuft zwei Wochen parallel unter einer Testadresse. Sie und Ihr Team schauen drüber, ich ändere, was Ihnen nicht passt. Erst wenn Sie Ja sagen, schalten wir um. Domain, E-Mail-Adressen und Telefonnummer bleiben genau gleich.“

Dann eine konkrete, kleine Frage stellen, keine große:
> „Passt es Ihnen, wenn ich Ihnen nächste Woche den Testlink schicke?“

---

## 5. Einwände und deine Antworten

| Er sagt | Du antwortest |
|---|---|
| „Die alte läuft doch.“ | „Sie läuft, aber sie lädt Code von 2010 mit bekannten Sicherheitslücken und schickt Besucherdaten an Google. Eine Heizung läuft auch, bis die Abgasmessung kommt.“ |
| „Ich habe genug Mandanten.“ | „Dann geht es nicht um mehr, sondern um die richtigen, und um Mitarbeiter. Bewerber sehen zuerst Ihre Seite.“ |
| „Das kostet nur Geld.“ | „Rechnen wir: Was bringt ein Dauermandat im Jahr? Die Seite ist eine einmalige Ausgabe und hält wieder viele Jahre.“ |
| „Ich habe keine Zeit dafür.“ | „Sie müssen nichts schreiben. Die Seite ist fertig, mit Ihren Texten. Sie lesen einmal 15 Minuten Korrektur.“ |
| „Meine Mandanten kommen über Empfehlung.“ | „Genau die googeln Ihren Namen, bevor sie anrufen. Dann ist die Website der erste Eindruck.“ |
| „Ich will nicht so werblich wirken.“ | „Schauen Sie selbst: keine Werbesprüche, keine Bilder von lachenden Menschen am Laptop. Sachlich, ruhig, Ihre Fakten.“ |
| „Wer pflegt das dann?“ | „Die neue Seite ist einfacher als die alte: keine Datenbank, kein WordPress, keine Plugins, die man ständig aktualisieren muss. Weniger Wartung als heute.“ |
| „Was ist mit den News und Merkblättern?“ | „Die bleiben. Den News-Dienst, den Sie heute nutzen, binde ich in die neue Seite ein.“ (Das ist noch zu tun, siehe Abschnitt 6.) |
| „Ich überlege es mir.“ | „Gern. Darf ich Ihnen den Testlink trotzdem schicken? Dann überlegen Sie anhand der echten Seite.“ |

---

## 6. Was du vor dem Livegang noch klären musst

Damit du im Gespräch nichts versprichst, was nicht stimmt:

- **Impressum:** Umsatzsteuer-ID (falls vorhanden) und Anschrift der Berufshaftpflicht (Allianz) ergänzen. Beides ist im Quelltext als Kommentar markiert.
- **Datenschutz:** Namen und Sitz des Hosting-Anbieters eintragen. Am besten lässt Herr Koop beide Texte kurz von seiner Kammer oder einem Datenschutz-Dienst prüfen.
- **Team:** Wie viele Personen arbeiten heute wirklich in der Kanzlei? Die Seite übernimmt die vier Namen von der Team-Seite, die Startseite sagt aber „3 Mitarbeiterinnen“.
- **Ablauf-Abschnitt:** Bestätigen lassen, dass die Kanzlei den Wechsel vom alten Berater übernimmt und Daten per Vollmacht beim Finanzamt abruft. Das ist üblich, steht aber nicht auf der alten Seite.
- **Fotos:** Die neue Seite kommt ohne Fotos aus, weil ich die Bilder der alten Seite nicht laden konnte. **Ein halber Tag mit einer Fotografin oder einem Fotografen aus Schwerin** (Porträts vom Team, das Büro, das Gebäude von außen) macht die Seite deutlich persönlicher. Gute Gelegenheit, ihn mit einzubeziehen: Wer will, kommt aufs Foto.
- **News, Videos, Merkblätter:** Die alte Seite hat dafür eigene Unterseiten mit einem externen Nachrichtendienst. Die neue Seite hat sie noch nicht. Vor dem Umschalten einbinden oder verlinken.
- **Kontaktformular:** Es öffnet derzeit eine fertige E-Mail im E-Mail-Programm des Besuchers. Wenn er lieber ein Formular will, das direkt sendet, braucht es ein kleines Skript beim Hoster.
- **Fristen-Zettel:** Die Berechnung ist im Browser getestet (z. B. Gewerbesteuer am 16.11.2026, weil der 15. ein Sonntag ist; Sozialversicherung Dezember 2025 am 23.12.). Herr Koop sollte die Termine trotzdem einmal fachlich abnicken. Das ist auch ein guter Moment, ihn mitreden zu lassen.

---

## 7. Spickzettel für die Hosentasche

1. Loben, nicht kritisieren.
2. Fragen stellen: Mandanten, Mitarbeiter, Abmahnung.
3. Beweise auf Papier: Schweizer Datenschutz, Google, PLZ, Technik von 2010.
4. Neue Seite auf dem Handy: Fristen, Bau, Team, Datenschutz ohne Google.
5. „Ihre Texte, nur sortiert.“
6. Rechnung: ein Mandat bezahlt die Seite.
7. Kleines Ja holen: „Darf ich Ihnen den Testlink schicken?“
