# Übergabe — Stand 28.08.2026

## Wo die Seite steht

Etappen 1–6 sind durch. Das Metaphern-Register ist live, die sieben neuen
Adressen sind bei Google eingereicht.

- **6 Einträge** im Register, alle veröffentlicht, alle mit eigenem Motiv
- **12 Links auf 12 Seiten** — die Metaphern stehen dort, wo das Denkbild
  wirklich im Spiel ist, nicht überall
- **49 Auslöse-Phrasen** in den Listen, davon **27 ohne Fundstelle**: Vorrat,
  der greift, sobald ein neuer Text die Formulierung benutzt
- 83 Adressen in der Sitemap, alle mit echtem Änderungsdatum

## Was am 28.08. noch dazukam

Diese drei Punkte standen morgens noch auf „offen" und sind erledigt:

1. **Die Änderungsmessung läuft am sichtbaren Text**, nicht mehr am
   Dateistand. Verglichen wird der Fließtext plus `title`, `untertitel` und
   `description` — die drei Felder, die auf der Seite gerendert werden.
   Anführungszeichen werden vor dem Vergleich vereinheitlicht. Nicht
   gezählt: `keyword`, `metaTitel`, `metaBeschreibung`, Bildpfade,
   Auslöser-Listen, `draft`. Wirkung: Die Typografie-Bereinigung vom 27.08.
   ist aus der Sitemap verschwunden — statt 41 Adressen an einem Tag sind
   es 5. Code in `plugins/stand-aus-git.mjs`.

2. **`dateModified` und `datePublished` sind in den Article-Blöcken
   gefüllt**, aus derselben Quelle — erst nach Punkt 1, nicht davor. 61
   Artikel tragen beide Felder. Die beiden Comic-Seiten nur
   `datePublished`: Bei einer Template-Seite lässt sich kein
   Änderungsdatum ehrlich messen.

3. **Alle internen Adressen mit Schrägstrich.** 29 Stellen in 13 Dateien.
   Kein Klick läuft mehr über eine Weiterleitung, kein interner Link zeigt
   ins Leere.

## Offen

- **31 Artikel tragen als `datePublished` den 27.07.2026** — den Commit, mit
  dem die Seite in heutiger Form ins Repo kam. Das ist das echte Erstdatum
  in diesem Repo, aber nicht zwingend der Tag der ersten Veröffentlichung.
  Dennys Entscheidung: so lassen oder für diese 31 weglassen.
- **18 der 83 Adressen sind weiter am Dateistand gemessen** — die Seiten,
  die aus einem Template statt aus Markdown entstehen (Startseite,
  Rubriken, Comic, Über, Sticker, Impressum). Dort gibt es keinen
  Fließtext, den man vom Beiwerk trennen könnte. Gemeldet, nicht genähert.
- **Ratgeber „Hochausschüttende ETFs": Teil 2 und 3** fehlen, ebenso das
  zweite Bild zu Teil 1.
- **Etappe 2 (Startseite neu bauen)** bleibt zurückgestellt, bis mehr
  Artikel da sind.
- **bitcoinaera.de:** Typografie-Prüfung steht aus (dieselbe Regel wie
  hier), und die 25 Umzüge stehen an. Dort **vor** dem ersten Umzug die
  Textmessung einbauen und mit `git mv` arbeiten — sonst reißt die
  Historie ab und ein alter Text meldet sich als neu.

## Regeln, die gelten

**Zurückhaltung bei Auslösern: im Zweifel einer weniger.** Ein falsch
gesetzter Metapher-Link behauptet einen Zusammenhang, den der Text nicht
meint. Das ist schlechter als ein fehlender Link. Bewusst **nicht**
aufgenommen: „Fundament", „Rakete" allein, „Symptom", „zu spät". Fällt
dadurch ein guter Link weg, wird er von Hand gesetzt — die Liste wird
nicht aufgeweicht.

**Drei Wachen laufen bei jedem Build** und melden, statt eigenmächtig zu
reparieren:

| Wache | prüft |
|---|---|
| Keyword | zwei Seiten auf derselben Suchanfrage ohne Kurzfassungs-Regel |
| Typografie | falsche Schlusszeichen (deutsch ist „…") |
| Metaphern | doppelt vergebene Auslöser, Kollision mit dem Nachschlagewerk, Einträge ohne eigenes Motiv |

**Bei breiten Ersetzungen über viele Dateien vorher die Änderung
anzeigen**, erst dann schreiben. Zwei Fälle in zwei Tagen: der YAML-Bruch
durch die Anführungszeichen-Ersetzung und der long-[duration]-Fall.

## Zurückgestellt

Drei Metaphern warten auf ihr zweites Vorkommen im Bestand, bevor sie
einen eigenen Eintrag bekommen: **Maschinenraum**, **Gelddruckmaschine**,
**Achterbahn**. Ein Bild, das nur einmal vorkommt, ist noch kein Register-
Eintrag.
