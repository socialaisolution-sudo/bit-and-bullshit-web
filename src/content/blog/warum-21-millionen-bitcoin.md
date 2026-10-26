---
title: "Warum gibt es nur 21 Millionen Bitcoin — und wie knapp sind sie wirklich?"
description: "Nur 21 Millionen Bitcoin, aber rund 96 Prozent sind schon geschürft. Woher die Grenze kommt, warum sie hält und was „knapp“ dabei wirklich heißt."
keyword: "21 Millionen Bitcoin"
kategorie: grundwissen
order: 22
aeraLink: "https://bitcoinaera.de/bitcoin/21-millionen/"
draft: false
image: "../../assets/mascots/warum-21-millionen-bitcoin.webp"
imageAlt: 'Pete mit Bitcoin-Cap steht mit verschränkten Armen und breitem Grinsen vor einer grauen Betonwand voller schwarzer Farbspritzer — Graffiti-Schriftzug „21 MIO. = KNAPP?“'
quellen:
  - text: "Bitcoin Core, src/validation.cpp, Funktion GetBlockSubsidy: Die Blockbelohnung startet bei 50 BTC (\"CAmount nSubsidy = 50 * COIN\") und wird per Bit-Shift alle nSubsidyHalvingInterval Blöcke halbiert (\"Subsidy is cut in half every 210,000 blocks which will occur approximately every 4 years\"); das Intervall von 210.000 Blöcken ist in src/kernel/chainparams.cpp für das Mainnet festgelegt. Aus dieser Regel ergibt sich die Gesamtmenge. Weil Satoshis ganzzahlig sind und beim Halbieren abgerundet wird, fällt die Belohnung nach 33 Halvings (Block 6.930,000, rechnerisch um das Jahr 2140 bei durchschnittlich zehn Minuten pro Block) auf null; die Summe aller Belohnungen beträgt 20.999.999,9769 BTC. Abgerufen 26. Oktober 2026"
    url: "https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp"
  - text: "Bitcoin Core, src/consensus/amount.h: MAX_MONEY = 21.000.000 * COIN. Laut Code-Kommentar ausdrücklich nicht die Gesamtgeldmenge, sondern eine Plausibilitätsprüfung (\"this constant is *not* the total money supply, which in Bitcoin currently happens to be less than 21,000,000 BTC\"); kein einzelner Betrag darf diesen Wert überschreiten. Die tatsächliche Obergrenze ergibt sich aus GetBlockSubsidy (siehe oben). Abgerufen 26. Oktober 2026"
    url: "https://github.com/bitcoin/bitcoin/blob/master/src/consensus/amount.h"
  - text: "mempool.space, Blockhöhe der Spitze der Kette am 26. Oktober 2026: 973.231. Eigene Berechnung der geschürften Menge: 19.687.500 BTC bis zum vierten Halving bei Block 840.000, plus 133.231 Blöcke à 3,125 BTC = 416.346,875 BTC, zusammen rund 20.103.847 BTC = 95,7 Prozent von 21 Millionen. Verlorene oder nie beanspruchte Coins (z. B. die nicht ausgebbaren 50 BTC des Genesis-Blocks, von Minern nicht voll abgeholte Belohnungen) sind nicht abgezogen, die tatsächlich ausgebbare Menge liegt geringfügig darunter. Jahresneuemission: rund 52.560 Blöcke pro Jahr × 3,125 BTC ≈ 164.250 BTC ≈ 0,82 Prozent der vorhandenen Menge; da Blöcke im Schnitt etwas schneller als alle zehn Minuten kommen, ist das ein Näherungswert. Nächstes Halving bei Block 1.050.000, noch 76.769 Blöcke, bei zehn Minuten pro Block rund 533 Tage, also etwa April 2028 (Schätzung)"
    url: "https://mempool.space/"
  - text: "Chainalysis-Schätzung zu verlorenen Bitcoin aus dem November 2017, berichtet von Fortune (25. November 2017): zwischen 2,78 Millionen (niedrige Schätzung) und 3,79 Millionen (hohe Schätzung) Bitcoin dauerhaft verloren, damals 17 bis 23 Prozent der existierenden Menge. Methodik nur teilweise offengelegt (statistische Stichproben, lange Inaktivität als Indiz); lange nicht bewegte Coins können auch bewusst gehaltene sein. Die Originalveröffentlichung von Chainalysis war nicht direkt auffindbar, daher Sekundärquelle; neuere Schätzungen anderer Anbieter liegen in einer ähnlichen Spanne"
    url: "https://fortune.com/2017/11/25/lost-bitcoins"
---

„Nur 21 Millionen Bitcoin, das wird irgendwann knapp.“ Den Satz hörst du ständig. Und er stimmt sogar. Nur anders, als die meisten denken.

Fangen wir mit dem ehrlichen Teil an. Ja, die Grenze ist echt. Sie folgt aus einer einzigen Regel im Code: Die Belohnung für jeden neuen Block startete bei 50 Bitcoin und [halbiert sich](/snippets/was-ist-das-halving/) alle 210.000 Blöcke, also ungefähr alle vier Jahre. Rechnest du das bis zum Ende durch, landest du knapp unter 21 Millionen. Genau genommen bei 20.999.999,9769 Bitcoin. Keine Regierung kann daran drehen. Wer die Regel ändern will, müsste Tausende unabhängige Rechner auf der ganzen Welt dazu bringen, freiwillig mitzumachen.

Jetzt kommt der Teil, der fast immer weggelassen wird. „Knapp“ klingt nach Zukunft, nach einem Tag X, an dem der Hahn zugedreht wird. Schau lieber auf den [Blockzähler](https://bitcoinaera.de/glossar/block/). Ende Oktober 2026 steht er bei über 973.000. Rechnerisch sind damit rund 20,1 Millionen Bitcoin geschürft, etwa 96 Prozent der Maximalmenge. Das meiste ist längst verteilt.

Neu dazu kommen nur noch 3,125 Bitcoin pro Block. Aufs Jahr gerechnet sind das gut 164.000 Stück, weniger als ein Prozent der vorhandenen Menge. Beim nächsten Halving, voraussichtlich im Frühjahr 2028, sinkt der Nachschub noch mal auf die Hälfte. Die allerletzten Bruchteile tröpfeln bis ungefähr 2140 ins Netz. Über hundert Jahre für die letzten vier Prozent.

Und dann gibt es noch die Coins, die keiner mehr bewegen kann. Vergessene Passwörter, weggeworfene Festplatten, Besitzer, die ohne Notfallplan gestorben sind. Die Analysefirma Chainalysis hat schon 2017 geschätzt, dass zwischen 2,8 und 3,8 Millionen Bitcoin für immer weg sind. Wie viele es heute wirklich sind, weiß niemand. Sicher ist nur: Die nutzbare Menge ist kleiner als die Zahl auf dem Papier.

Jetzt die Einordnung. Knappheit allein macht noch keinen Preis. Von meinen Kinderzeichnungen gibt es auch nur eine Handvoll, und keiner will sie haben. Ob etwas wertvoll ist, entscheidet erst das Zusammenspiel von [Angebot und Nachfrage](https://bitcoinaera.de/glossar/angebot-und-nachfrage/). Bitcoin legt davon nur eine Seite fest, das Angebot. Ob jemand die andere Seite füllt, steht in keinem Code.

Das Besondere an den 21 Millionen ist deshalb, wie sie gesichert sind. Beim Euro hängt die Geldmenge an Entscheidungen von Zentralbanken und Geschäftsbanken. Bei Bitcoin steht sie seit dem ersten Block fest, und jeder kann sie selbst nachrechnen. [Regel statt Vertrauen](/snippets/regel-statt-vertrauen/) eben.

Also, sind 21 Millionen knapp? Sie sind es heute schon. Die bessere Frage lautet: Zählst du selbst nach — oder glaubst du einfach, was dir jemand erzählt?

Die Kurzfassung steht auf Karte 10: [„Pete der Wächter — 21 Millionen. Mehr gibt's nie.“](/sammelkarten/#k10)
