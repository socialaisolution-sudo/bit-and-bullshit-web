# Vorlage für den wöchentlichen Leserreport

Kopieren nach `src/content/leserbereich/JJJJ-WW.md` — der Dateiname ist die
Kalenderwoche, also etwa `2026-41.md`. Pushen genügt, Cloudflare baut.

Diese Datei liegt bewusst **außerhalb** von `src/content/leserbereich/`.
Dort würde sie als Report geladen und am Schema scheitern.

Alles außer `kw` ist freiwillig. Was fehlt, lässt seinen Block entfallen —
außer bei `bausteine`, dort treten die festen Definitionen an die Stelle.

Drei Wochen nach Wochenbeginn wird der Report öffentlich unter
`/leserreports/<deep-dive-titel>/`. Die jüngsten zwei bleiben immer gesperrt,
auch wenn die Frist schon um ist.

---

```markdown
---
kw: 2026-41

bausteine:
  etf: "Was die ETF-Flüsse bei diesem Stand für die Positionierung heißen."
  premium: "Dasselbe für den Coinbase-Premium."
  stablecoin: "Dasselbe für die Stablecoin-Versorgung."
  openinterest: "Dasselbe für das Open Interest."

gesamtkontext: "Zwei, drei Sätze, die die vier Befunde verdichten."

notiz: ""

deepdive_titel: "Überschrift des Makro-Themas"
deepdive_quellen: "Woher die Zahlen stammen. Keine Anlageberatung."
---

Hier der Deep-Dive-Fließtext.

Absätze durch Leerzeilen trennen. Fußnoten, Tabellen und Bilder kann das
Gerüst nicht — was hier steht, wird als Fließtext ausgegeben.
```

---

## Zwei Fallen

**Der Deep-Dive-Titel ist die Adresse.** Zwei Wochen mit demselben Titel
bekommen nicht dieselbe Seite — bei der zweiten hängt die Kalenderwoche
hinten dran. Sauberer ist ein eigener Titel je Woche.

**`bausteine` und `gesamtkontext` beschreiben einen Stand.** Sie werden drei
Wochen später öffentlich gelesen. Im Archiv steht ein Hinweis darüber, dass es
eine Momentaufnahme ist — trotzdem gilt: Was auch in drei Wochen noch stimmen
soll, gehört in den Deep Dive, nicht in die Einordnung.
