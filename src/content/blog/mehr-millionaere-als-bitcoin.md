---
title: "Mehr Millionäre als Bitcoin? Der Bullshit-Check mit 57,5 Millionen"
description: "57,5 Millionen Millionäre, höchstens 21 Millionen Bitcoin: Einen ganzen für jeden gibt es nicht. Was an der Rechnung stimmt und was sie verschweigt."
keyword: "mehr Millionäre als Bitcoin"
kategorie: markt-mythen
order: 89
aeraLink: "https://bitcoinaera.de/bitcoin/21-millionen/"
draft: false
image: "../../assets/mascots/mehr-millionaere-als-bitcoin.webp"
imageAlt: 'Pete mit Bitcoin-Cap hält grinsend eine orange leuchtende Bitcoin-Münze hoch, vor einer nächtlichen, regennassen Finanzstraße mit Hochhäusern, Säulenfassade, US-Flaggen und Anzugträgern unter Regenschirmen — Graffiti-Schriftzug „MEHR MILLIONÄRE ALS BITCOIN?“'
quellen:
  - text: "UBS Global Wealth Report 2026 (veröffentlicht am 30. Juni 2026), S. 21: „over 40% of the world’s USD millionaires live in the United States, amounting to more than 23.6 million people out of the roughly 57.5 million millionaires in our sample.“ Stand: Ende 2025. Millionär = Nettovermögen (net assets) über 1 Million US-Dollar pro Erwachsenem (S. 25). Stichprobe: 56 Märkte, laut UBS über 92 Prozent des Weltvermögens (S. 9). Einschränkung: Modellschätzung der UBS auf Basis von OECD-, IWF-, UN-, Weltbank- und nationalen Statistikdaten, gemessen in US-Dollar und damit wechselkursabhängig. Eigene Rechnung: 21 Mio. / 57,5 Mio. ≈ 0,365 Bitcoin pro Millionär („gut ein Drittel“)"
    url: "https://www.ubs.com/global/en/wealthmanagement/insights/global-wealth-report.html"
  - text: "UBS Global Wealth Report 2026, S. 22, Tabelle „The UBS Millionaire Index“: Deutschland 2.648 Tausend USD-Millionäre (im Text gerundet: etwa 2,6 Millionen). S. 23, „The global wealth pyramid 2025“: Erwachsene nach Vermögensband: über 1 Mio. USD 58 Mio., 100.000 bis 1 Mio. 588 Mio., 10.000 bis 100.000 1,58 Mrd., unter 10.000 1,62 Mrd., zusammen rund 3,85 Milliarden Erwachsene in der Stichprobe. Eigene Rechnung: 21 Mio. × 100 Mio. Satoshi = 2,1 Billiarden Satoshi / 3,846 Mrd. ≈ 546.000 Satoshi pro Erwachsenem (≈ 0,0055 BTC)"
    url: "https://www.ubs.com/global/en/media/display-page-ndp/en-20260630-gwr-2026.html"
  - text: "Bitcoin Core, src/consensus/amount.h: „inline constexpr CAmount COIN{100'000'000};“ und „inline constexpr CAmount MAX_MONEY{21'000'000 * COIN};“. Der Kommentar im Code stellt klar, dass MAX_MONEY eine Plausibilitätsprüfung ist und nicht die tatsächliche Geldmenge; diese liegt wegen des Ausgabeplans knapp unter 21 Millionen. 1 Bitcoin = 100 Millionen Satoshi"
    url: "https://github.com/bitcoin/bitcoin/blob/master/src/consensus/amount.h"
  - text: "Bitcoin Core, src/kernel/chainparams.cpp (CMainParams): consensus.nSubsidyHalvingInterval = 210000, die Blockbelohnung halbiert sich alle 210.000 Blöcke (rund vier Jahre). Daraus ergibt sich, dass die letzten Bruchteile neuer Bitcoin um das Jahr 2140 ausgegeben werden. Einschränkung: Das Jahr ist eine Hochrechnung aus dem Zehn-Minuten-Ziel pro Block und kein fest im Code stehendes Datum"
    url: "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"
  - text: "blockchain.info API (totalbc), abgerufen am 26. Oktober 2026: 2.010.385.000.000.000 Satoshi = 20.103.850 Bitcoin im Umlauf (im Text: „gut 20,1 Millionen“). Plausibilitätsprüfung: 19.687.500 BTC bis Block 840.000 plus (973.237 − 840.000) × 3,125 BTC ≈ 20,10 Mio. Einschränkung: Wert eines privaten Blockexplorers, wächst täglich um rund 450 Bitcoin und muss vor Veröffentlichung aktualisiert werden"
    url: "https://blockchain.info/q/totalbc"
  - text: "Fortune, 25. November 2017, „Exclusive: Nearly 4 Million Bitcoins Lost Forever, New Study Says“: Chainalysis schätzt 3,79 Millionen verlorene Bitcoin (hohe Schätzung) bzw. 2.767.468 (niedrige Schätzung), also 17 bis 23 Prozent der damals existierenden Coins. Die Schätzung unterstellt, dass die rund 1 Million Satoshi Nakamoto zugeschriebenen Coins verloren sind. Einschränkung: Die vollständige Methodik von Chainalysis ist vertraulich; die Studie selbst ist nicht öffentlich, Fortune berichtet exklusiv darüber"
    url: "https://fortune.com/crypto/2017/11/25/lost-bitcoins/"
  - text: "Fortune, 24. April 2024, „Old Bitcoin wallets keep waking up: How many of the 1.8 million ‘lost’ coins are really gone?“: Chainalysis zählt Stand Mitte März 2024 1.798.681 „verlorene“ Bitcoin, definiert als Coins, die sich seit 2014 nicht bewegt haben. Nicht enthalten sind rund 1,1 Millionen Bitcoin in etwa 30.000 Wallets, die Chainalysis Satoshi Nakamoto zuschreibt. Laut Artikel haben sich in den letzten Jahren Hunderttausende als verloren geltende Bitcoin wieder bewegt. Eigene Einordnung: Mit Satoshis Coins ergäben sich rund 2,9 Millionen, das deckt die „rund 3 Millionen“ aus dem Skript als Größenordnung"
    url: "https://fortune.com/crypto/2024/04/24/bitcoin-wallets-waking-up-lost-coins-satoshi/"
---

„57,5 Millionen Millionäre, aber nur 21 Millionen Bitcoin.“ Der Satz soll beweisen, wie knapp Bitcoin ist. Bevor du nickst, rechnen wir nach.

Erst das Zugeständnis: Die Grundrechnung stimmt. Laut Global Wealth Report der UBS hatten Ende 2025 rund 57,5 Millionen Erwachsene ein Nettovermögen von über einer Million US-Dollar. Allein in Deutschland waren es etwa 2,6 Millionen. Mehr als 21 Millionen Bitcoin lässt der Code nicht zu. Selbst wenn sämtliche Coins bei Millionären lägen, bekäme jeder nur gut ein Drittel. Einen ganzen für alle gibt es nicht.

Und es wird noch enger. Geschürft sind bisher gut 20,1 Millionen Bitcoin, der Rest kommt in immer kleineren Portionen bis etwa 2140 dazu. Ein Teil der vorhandenen Coins ist unerreichbar, weil Wallets vergessen und [private Schlüssel](https://bitcoinaera.de/glossar/private-key/) verloren gingen. Ohne Schlüssel bewegt sich nichts, auch nicht für den rechtmäßigen Besitzer.

Jetzt der Teil, der fast immer weggelassen wird. Wie viele Bitcoin wirklich weg sind, weiß niemand genau. Die Analysefirma Chainalysis schätzte 2017 zwischen 2,8 und 3,8 Millionen. 2024 kam sie auf 1,8 Millionen, ohne die rund 1,1 Millionen Coins, die [Satoshi Nakamoto](/snippets/wahre-geschichte-bitcoin-4-satoshi-nakamoto/) zugeschrieben werden. „Verloren“ heißt in solchen Modellen meist nur: seit Jahren nicht bewegt. Und alte Wallets wachen immer wieder auf. Die „rund drei Millionen“ sind eine plausible Schätzung. Gezählt hat sie keiner.

Der zweite weggelassene Punkt wiegt schwerer. Niemand braucht einen ganzen Bitcoin. Jeder Coin lässt sich in [100 Millionen Einheiten teilen](/snippets/was-ist-ein-satoshi/), die Satoshis. Die UBS-Zahlen decken rund 3,85 Milliarden Erwachsene ab. Teilst du 21 Millionen Bitcoin durch sie alle, bleiben pro Kopf etwa 546.000 Satoshi. Wenig, aber eben nicht null.

Bleibt die Knappheit. Die ist echt: Die Obergrenze steht als Regel im Code, und jeder Knoten im Netz prüft sie. [Woher diese Grenze kommt](/snippets/warum-21-millionen-bitcoin/), ist eine eigene Geschichte. Nur macht Knappheit allein noch keinen Preis. Dein Kinderbild ist auch ein Unikat, kaufen will es trotzdem kaum jemand. Ob etwas Wert hat, entscheiden [Angebot und Nachfrage](https://bitcoinaera.de/glossar/angebot-und-nachfrage/). Und die Nachfrage steht in keinem Code.

Der Millionärsvergleich arbeitet mit einem Gefühl: schnell, bevor alles weg ist. Genau bei diesem Gefühl solltest du langsamer werden. Wie viel du in Bitcoin steckst, entscheidest du selbst. Dieser Text ist keine Anlageberatung.

„Jeder Millionär einen Bitcoin“ geht sich also nicht aus. Musste es aber auch nie. Die bessere Frage lautet: Wie viele Satoshis brauchst du eigentlich — und wofür?

Passend dazu Karte 10: [„Pete der Wächter — 21 Millionen. Mehr gibt's nie. Das ist der ganze Trick.“](/sammelkarten/#k10)
