---
# Verschickt wird von Hand ueber Brevo — im Repo gibt es keinen
# Versandweg. `draft: false` stellt die Ausgabe nur in den
# passwortgeschuetzten Leserbereich; oeffentlich wird sie am
# `oeffentlichAb`-Datum, ohne dass jemand einen Schalter umlegt.
#
# Der Ampelstand unten ist echt und eingefroren, abgelesen am
# 10.09.2026 um 16:55 UTC unter
# bitcoin-ampel.social-ai-solution.workers.dev/ampel.
#
# Verschiebt sich der Versand um mehr als einen Tag:
#   node skripte/ampel-in-ausgabe.mjs 001-funding-verstummt.md
# Das holt den Stand neu und rechnet den Funding-Zaehler nach. Von
# Hand nachtippen bitte nicht — der Zaehler steht auch im Titel.
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
  begruendung: "Eine von vier Kennzahlen erhöht. Für Gelb müssen es zwei sein."
  eingaenge:
    - { name: "ETF-Nettoflüsse", stufe: ruhig }
    - { name: "Stablecoin-Versorgung", stufe: ruhig }
    - { name: "Coinbase-Premium", stufe: ruhig }
    - { name: "Open Interest", stufe: erhoeht }
  fundingTage: 415
  fundingSeit: "2025-07-23"
  gemessen: 2026-09-10
  regelversion: 6

# Rubrik 3 von 4. Haltung, erste Person — bewusst getrennt vom
# Fliesstext darueber, damit Meinung und Messung nicht verschwimmen.
# Der Text ist redaktionell abgenommen; nicht glaetten.
meinung: |
  Mich stört an dieser Sache weniger, dass eine Kennzahl ausfällt. Das passiert. Mich stört, wie lange es niemandem aufgefallen ist.

  Über ein Jahr lang wird eine Zahl zitiert, die nichts mehr misst – und zwar von Leuten, die sich als Marktbeobachter ausgeben. Das ist der eigentliche Befund. Nicht der Basis-Handel, nicht die ETFs. Sondern dass eine Kennzahl weitergereicht wird, weil sie schon immer weitergereicht wurde.

  Ich glaube nicht, dass das Absicht ist. Es ist bequemer. Wer jede Woche etwas sagen muss, greift nach dem, was letzte Woche funktioniert hat. Nachrechnen kostet Zeit und liefert im besten Fall ein Achselzucken.

  Für mich heißt das: Jede Kennzahl braucht ein Verfallsdatum. Nicht in dem Sinn, dass man sie wegwirft, sondern dass man sie regelmäßig gegen die Frage prüft, ob sie noch dasselbe misst wie bei ihrer Einführung. Beim Funding war der Bruch der Januar 2024. Was die anderen vier betrifft, weiß ich es noch nicht – und genau deshalb steht in unserem Protokoll ein Datum, an dem alles neu gerechnet wird.

  Und was die Ampel gerade anzeigt, ist kein Freibrief. Grün heißt hier: An dem, was wir messen konnten, war nichts auffällig. Es war diese Woche nur weniger, als mir lieb ist.

# Rubrik 4 von 4. Der Markenblock. Der Tonbruch zur Rubrik davor ist
# beabsichtigt und wird auch optisch nicht abgemildert.
#
# `urteil` steht getrennt, weil der Parser Fettschrift einebnet — ein
# `**Verbrannt.**` am Textende kaeme als unauffaelliger Absatz heraus.
burner:
  text: |
    Behauptung dieser Woche, sinngemäß so oder ähnlich in jedem zweiten Marktkommentar:

    > „Die Funding Rates zeigen deutliche Überhitzung."

    Nein. Zeigen sie nicht. Zeigen sie seit 415 Tagen nicht.

    Die Zahl liegt seit dem 23. Juli 2025 auf dem Basiszins fest und rührt sich nicht. Wer da Überhitzung sieht, hat entweder nicht hingeschaut oder weiß nicht, was er anschaut.

    Und es wird nicht mal geraten. Raten wäre ehrlich. Es wird abgeschrieben – von letzter Woche, von 2024, vom Typen mit den 40.000 Followern, der es auch nur abgeschrieben hat. Dazu ein roter Chart, ein Wert mit vier Nachkommastellen und der Tonfall von jemandem, der gerade aus dem Maschinenraum kommt.

    Vier Nachkommastellen an einer Zahl, die sich seit über einem Jahr nicht bewegt hat. Da ist die Präzision das Kostüm.
  urteil: "Verbrannt."
kennzahlen:
  - funding-rate
  - coinbase-premium
  - stablecoin-versorgung
  - open-interest
# Bleibt auf true, wie beauftragt. Zum Stand siehe die Meldung an
# Denny vom 10.09.2026: Die drei genannten Gruende dafuer sind
# inzwischen erledigt (Mindestbedingung = Regelversion 2, OKX
# durchgerechnet, drittes Bein durch den Referenzkorb ersetzt), und
# die Ampel laeuft auf vier von vier Eingaengen. Umstellen ist seine
# Entscheidung, nicht meine.
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
reguläre Eingangsgröße — das wäre dann Regelversion 7, und es steht mit Datum
im Protokoll.

Dass wir schon bei sechs sind, liegt übrigens nicht an der Funding Rate. Zwei
Börsen haben uns die Datenabfrage gesperrt und eine dritte hat geändert, was
ihre Datumsangaben bedeuten. Davon ein andermal.

Der Unterschied ist wichtig: Eine Kennzahl wegzulassen, weil sie gerade nichts
anzeigt, wäre der Fehler, den wir sonst bei anderen anprangern. Dass sie
schweigt, ist selbst eine Information über den Marktzustand.

## Was das für die Ampel heißt

Und jetzt die unangenehme Folge. Unsere höchste Warnstufe hing an genau dieser
Kennzahl: Rot sollte auslösen, wenn die Funding Rate ihren Extremwert
überschreitet und gleichzeitig immer mehr Geld am Terminmarkt liegt. Solange
die Funding Rate am Basiszins klebt, ist die erste Hälfte dieser Bedingung
unerfüllbar.

> Die Regel konnte nicht auslösen. Nicht selten, nicht schwer — überhaupt
> nicht, unter keinen Umständen.

Aufgefallen ist uns das beim Nachrechnen, nicht im Ernstfall. Seit dem
8. September gilt eine neue Rot-Regel, die ohne die Funding Rate auskommt.

Nur steht die auf dünnem Boden. Alle vier Kennzahlen liegen zusammen für 113
Tage vor, und darin steckt eine besonders unruhige Phase im Mai und Juni. In
diesem Fenster hätte die neue Regel an knapp drei Prozent der Tage ausgelöst —
tatsächlich ausgelöst hat sie seither nicht.

Was sie im Ernstfall anzeigt, weiß deshalb niemand. Das steht offen auf der
Regelseite und bleibt dort stehen, bis sie das erste Mal ausgelöst hat. Wer ein
Warnsystem betreibt und dessen Schwachstelle für sich behält, hat schon
verloren.
