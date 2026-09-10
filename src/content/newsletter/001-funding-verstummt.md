---
# Noch nicht verschickt. Beim Versand: draft auf false, datum auf den
# tatsaechlichen Freitag, oeffentlichAb auf datum plus acht bis zwoelf
# Wochen. Erst dann taucht die Ausgabe im Archiv auf — die Sperrfrist
# haengt am Datum, nicht an einem Handgriff, den jemand vergisst.
nummer: 1
datum: 2026-09-11
titel: "Die Kennzahl, die alle zitieren, ist seit 415 Tagen verstummt"
anriss: >-
  Funding Rates gelten als Überhitzungsanzeiger. Nur zeigen sie seit über einem
  Jahr gar nichts mehr an — und das hat einen Grund, über den kaum jemand
  spricht.
oeffentlichAb: 2026-11-13
ampel:
  farbe: gelb
  begruendung: "Coinbase-Premium im Extrem, Stablecoin-Versorgung schrumpft."
  eingaenge:
    - { name: "ETF-Nettoflüsse", stufe: ruhig, zusatz: "+987 Mio. $ / 5 Tage" }
    - { name: "Coinbase-Premium", stufe: extrem, zusatz: "−17,4 bp" }
    - { name: "Stablecoin-Versorgung", stufe: erhoeht, zusatz: "−0,54 % / 7 Tage" }
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

Wenn irgendwo steht, der Markt sei überhitzt, folgt fast immer ein Verweis auf
die Funding Rate. Sie misst, welche Seite am Terminmarkt überfüllt ist, und
galt jahrelang als der eine Wert, den man kennen muss. Das Problem: Beim
Nachrechnen ist uns etwas aufgefallen, das niemand erwähnt.

> Der Wert, auf den es dabei ankommt, ist seit dem 23. Juli 2025 nicht ein
> einziges Mal aufgetreten.

Nicht selten. Nicht schwach. Kein einziges Mal. Wer heute liest, die Funding
Rate zeige Überhitzung, sollte nachfragen, gegen welchen Nullpunkt gemessen
wurde.

## Warum sie verstummt ist

Die naheliegende Erklärung ist der Basis-Handel rund um die Spot-ETFs. Wer
ETF-Anteile kauft und gleichzeitig den Perpetual verkauft, verdient an genau
der Differenz, die die Funding Rate misst — und drückt sie damit weg. Was
früher ein Stimmungsmesser war, misst heute vor allem, wie gut dieser Handel
funktioniert.

- 2024: an 77 von 366 Tagen ein positiver Überschuss
- 2025: an zweien — dem 22. Februar und dem 23. Juli
- 2026: an keinem einzigen Tag

Wir haben die Kennzahl deshalb nicht gestrichen, sondern umgewidmet. Sie zählt
nicht mehr in die Ampelfarbe hinein, wird aber weiter angezeigt — als Zähler,
wie viele Tage seit dem letzten Überschuss vergangen sind. Kommt der Wert
zurück, wird sie wieder eine reguläre Eingangsgröße — und das ist dann
ausdrücklich Regelversion 2. Jede Messung trägt ihre Regelversion mit, das
lässt sich also nachschlagen statt glauben.

## Was das für die Ampel heißt

Unangenehme Folge: Die höchste Warnstufe unseres eigenen Systems hat damit noch
nie ausgelöst. Nicht in diesem Jahr, sondern in keinem Zeitraum, für den alle
Kennzahlen zusammen vorliegen. Sie ist hergeleitet, aber nicht erprobt. Was sie
im Ernstfall anzeigt, weiß niemand — und das steht seit dem ersten Tag offen
auf der Regelseite.

Diese Woche ist der Open Interest ausgefallen, die Quelle war nicht erreichbar.
Er zählt deshalb nicht als ruhig, sondern gar nicht. Ein fehlender Wert ist
keine Entwarnung.
