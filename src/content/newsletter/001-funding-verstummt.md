---
# Noch nicht verschickt. Beim Versand umzustellen:
#   draft        → false
#   datum        → der tatsaechliche Freitag
#   oeffentlichAb → datum plus acht bis zwoelf Wochen
#   ampel        → der ECHTE Stand vom Versandtag, abgelesen unter
#                  bitcoin-ampel.social-ai-solution.workers.dev/ampel
#
# Die Werte unten sind der Stand vom 10.09.2026, 09:30 MESZ. Sie sind
# echt, aber nicht der Versandstand — und eine Ausgabe, die eine alte
# Ampel zeigt, widerspricht ihrem eigenen Text.
nummer: 1
datum: 2026-09-11
titel: "Die Kennzahl, die alle zitieren, ist seit 415 Tagen verstummt"
anriss: >-
  Funding Rates gelten als Überhitzungsanzeiger. Nur zeigen sie seit über einem
  Jahr gar nichts mehr an — und das hat einen Grund, über den kaum jemand
  spricht.
oeffentlichAb: 2026-11-13
ampel:
  farbe: gruen
  begruendung: "Keine Auffälligkeit bei den beiden Kennzahlen, die vorliegen."
  eingaenge:
    - { name: "ETF-Nettoflüsse", stufe: ruhig }
    - { name: "Stablecoin-Versorgung", stufe: ruhig }
    - { name: "Coinbase-Premium", stufe: fehlt, zusatz: "zu wenige Messungen" }
    - { name: "Open Interest", stufe: fehlt, zusatz: "Quelle nicht erreichbar" }
  fundingTage: 415
  fundingSeit: "2025-07-23"
  gemessen: 2026-09-11
  regelversion: 1
kennzahlen:
  - funding-rate
  - coinbase-premium
  - stablecoin-versorgung
  - open-interest
draft: true
---

Erste Ausgabe. Der Plan ist einfach: Einmal die Woche steht hier, wie der
Bitcoin-Markt nach festen Regeln gemessen wird und was davon Bedeutung hat.
Fangen wir mit einer Kennzahl an, die fast jeder zitiert.

Wenn irgendwo steht, der Markt sei überhitzt, folgt fast immer ein Verweis auf
die Funding Rate. Sie misst, welche Seite am Terminmarkt überfüllt ist, und
galt jahrelang als der eine Wert, den man kennen muss. Beim Nachrechnen für
unser Ampelsystem ist uns dabei etwas aufgefallen, das sonst niemand erwähnt.

> Der Wert, auf den es ankommt, ist seit dem 23. Juli 2025 nicht ein einziges
> Mal aufgetreten. Nicht selten. Nicht schwach. Kein einziges Mal.

Kurz zur Mechanik: Die Funding Rate besteht aus zwei Teilen. Einem Basiszins,
der auch dann anfällt, wenn gar nichts los ist, und einem Aufschlag, der die
tatsächliche Schieflage misst. Nur der Aufschlag sagt etwas über Überhitzung
aus. Und genau der ist verschwunden.

## Warum sie verstummt ist

Die naheliegende Erklärung ist der Basis-Handel rund um die Spot-ETFs. Wer
ETF-Anteile kauft und gleichzeitig den Perpetual verkauft, verdient an genau
der Differenz, die die Funding Rate misst — und drückt sie damit weg. Was
früher ein Stimmungsmesser war, misst heute vor allem, wie gut dieser Handel
funktioniert.

Die Zahlen dazu, gerechnet auf Tagessummen:

- 2024: an 77 von 366 Tagen ein positiver Aufschlag
- 2025: an zweien — dem 22. Februar und dem 23. Juli
- 2026: an keinem einzigen Tag

Wer heute liest, die Funding Rate zeige Überhitzung, sollte also nachfragen,
gegen welchen Nullpunkt gemessen wurde. Ein Wert leicht über null ist nicht
dasselbe wie ein Wert über dem Basiszins — und der Unterschied entscheidet
darüber, ob die Zahl etwas bedeutet oder nichts.

## Was wir damit gemacht haben

Gestrichen haben wir die Kennzahl nicht. Sie zählt nur nicht mehr in die
Ampelfarbe hinein, sondern läuft als Zähler mit: wie viele Tage seit dem
letzten Aufschlag vergangen sind. Kommt der Wert zurück, wird sie wieder eine
reguläre Eingangsgröße — das wäre dann Regelversion 2, und es steht mit Datum
im Protokoll.

Der Unterschied ist wichtig: Eine Kennzahl wegzulassen, weil sie gerade nichts
anzeigt, wäre der Fehler, den wir sonst bei anderen anprangern. Dass sie
schweigt, ist selbst eine Information über den Marktzustand.

## Was das für die Ampel heißt

Und jetzt die unangenehme Folge. Weil die Funding Rate ausfällt, hat die
höchste Warnstufe unseres eigenen Systems noch nie ausgelöst. Nicht in diesem
Jahr, sondern in keinem Zeitraum, für den alle Kennzahlen zusammen vorliegen.

> Sie ist hergeleitet, aber nicht erprobt. Was sie im Ernstfall anzeigt, weiß
> niemand.

Das steht seit dem ersten Tag offen auf der Regelseite, und es bleibt dort
stehen, bis sie das erste Mal ausgelöst hat. Wer ein Warnsystem betreibt und
dessen Schwachstelle für sich behält, hat schon verloren.
