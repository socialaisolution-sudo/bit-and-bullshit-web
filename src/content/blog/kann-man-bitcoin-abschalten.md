---
title: "Kann man Bitcoin abschalten? Der Bullshit-Check mit Blockdaten"
description: "Kann man Bitcoin abschalten? Seit 2009 läuft das Netz ohne Chef, über 973.000 Blöcke. Was die Blockdaten belegen und was „nicht aufzuhalten“ verschweigt."
keyword: "kann man Bitcoin abschalten"
kategorie: grundwissen
order: 88
aeraLink: "https://bitcoinaera.de/technologie/sicherheit/"
draft: false
image: "../../assets/mascots/kann-man-bitcoin-abschalten.webp"
imageAlt: 'Pete mit Bitcoin-Cap steht grübelnd mit der Hand am Kinn vor einer grauen, farbbespritzten Betonwand mit einem orange durchgestrichenen Power-Symbol — Graffiti-Schriftzug „NICHT ABSCHALTBAR?“'
quellen:
  - text: "mempool.space, Block 0 (Genesis-Block): Höhe 0, Zeitstempel 1231006505 = 3. Januar 2009, 18:15:05 UTC. Abgerufen am 26. Oktober 2026"
    url: "https://mempool.space/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
  - text: "mempool.space API, aktuelle Blockhöhe (tip/height): 973.237, abgerufen am 26. Oktober 2026. Einschränkung: Die Zahl wächst im Schnitt alle zehn Minuten um eins und muss vor Veröffentlichung aktualisiert werden. Eigene Rundung in der Description: „über 973.000 Blöcke“"
    url: "https://mempool.space/api/blocks/tip/height"
  - text: "mempool.space API, Difficulty-Adjustments (letzte drei Monate), abgerufen am 26. Oktober 2026: Anpassung bei Block 971.712, Zeitstempel 1792154251 (16. Oktober 2026), Schwierigkeit 140.577.680.051.919,6 ≈ 140,58 Billionen, Änderungsfaktor 1,05924 (+5,92 Prozent). Davor bei Block 969.696, Zeitstempel 1791011796 (3. Oktober 2026), Schwierigkeit 132.716.002.350.731 ≈ 132,72 Billionen (das sind die Zahlen aus dem Short). Nächste Anpassung bei Block 973.728. Die Schwierigkeit ist eine dimensionslose Größe relativ zur Mindestschwierigkeit 1 von 2009"
    url: "https://mempool.space/api/v1/mining/difficulty-adjustments/3m"
  - text: "Bitcoin Core, src/kernel/chainparams.cpp (CMainParams): consensus.nPowTargetTimespan = 14 * 24 * 60 * 60 („two weeks“) und consensus.nPowTargetSpacing = 10 * 60 (zehn Minuten). Daraus ergibt sich das Anpassungsintervall 14 Tage / 10 Minuten = 2.016 Blöcke. Die Anpassung pro Runde ist im Code (pow.cpp) auf höchstens Faktor vier in jede Richtung begrenzt"
    url: "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"
  - text: "Chinesische Regierung (gov.cn), 21. Mai 2021, „刘鹤主持召开国务院金融稳定发展委员会第五十一次会议“: Der Finanzstabilitätsausschuss des Staatsrats beschließt u. a. „打击比特币挖矿和交易行为“ (gegen Bitcoin-Mining und -Handel vorgehen). Danach schlossen Provinzen wie Yunnan, Xinjiang und Sichuan Mining-Farmen (laut Medienberichten, etwa The Paper, Juni 2021; nicht amtlich)"
    url: "https://www.gov.cn/guowuyuan/2021-05/21/content_5610192.htm"
  - text: "mempool.space API, alle Difficulty-Adjustments, abgerufen am 26. Oktober 2026: Anpassung bei Block 689.472, Zeitstempel 1625294046 (3. Juli 2021), Schwierigkeit 14,36 Billionen, Änderungsfaktor 0,720573 (−27,94 Prozent), der kleinste Faktor in der gesamten Reihe seit 2009. Die Anpassung davor (Block 687.456, 13. Juni 2021) lag bereits bei −5,3 Prozent. Einschränkung: Dass der Rückgang auf das chinesische Vorgehen zurückgeht, ist ein zeitlicher Zusammenhang; die Blockdaten selbst zeigen nicht, wo die Miner standen"
    url: "https://mempool.space/api/v1/mining/difficulty-adjustments/all"
  - text: "CVE-2010-5139 (MITRE/CVE-Programm): „Integer overflow in wxBitcoin and bitcoind before 0.3.11 allows remote attackers to bypass intended economic restrictions and create many bitcoins via a crafted Bitcoin transaction.“"
    url: "https://www.cve.org/CVERecord?id=CVE-2010-5139"
  - text: "Bitcointalk, Thread „overflow bug SERIOUS“, eröffnet am 15. August 2010 von Nutzer lfm: Block 74638 enthält eine Transaktion mit zwei Ausgaben zu je „92233720368.54“ BTC (zusammen rund 184,47 Milliarden BTC) durch einen Integer-Overflow. Satoshi im selben Thread: „Patch is uploaded to SVN rev 132!“ sowie die Anweisung, mit weniger als 74.000 Blöcken neu zu starten und den Rest neu herunterzuladen, also die fehlerhafte Kette zu verwerfen. Einschränkung: Forenbeitrag, aber Primärquelle der Beteiligten"
    url: "https://bitcointalk.org/index.php?topic=823.0"
---

„Bitcoin kann man nicht abschalten.“ Das klingt nach Magie. Bevor wir das glauben, zählen wir lieber nach.

Fangen wir mit dem Teil an, der stimmt. Seit dem [Genesis-Block](https://bitcoinaera.de/glossar/genesis-block/) am 3. Januar 2009 hängt das Netz Block an Block. Am 26. Oktober 2026 stand die Kette bei Block 973.237. Es gibt keine Firma, die man schließen könnte, und keinen zentralen Server, den man vom Strom nimmt. Einen Chef mit Ausschalter gibt es auch nicht. Wer die Kette verlängern will, muss Rechenarbeit leisten, egal wo auf der Welt er sitzt.

Dazu kommt ein Mechanismus, den kaum einer kennt. Alle 2.016 Blöcke rechnet jeder Knoten nach, ob die letzten Blöcke zu schnell oder zu langsam kamen. Ziel sind zehn Minuten pro Block, also zwei Wochen pro Runde. Dann passt sich die Schwierigkeit an, ganz ohne Abstimmung. Zuletzt geschah das am 16. Oktober 2026 bei Block 971.712: plus 5,9 Prozent auf rund 140,58 Billionen.

Wie gut das funktioniert, zeigte ein echter Stresstest. Im Mai 2021 kündigte Chinas Regierung an, gegen Bitcoin-Mining vorzugehen. Die Folge steht direkt in den Blockdaten. Am 3. Juli 2021 sank die Schwierigkeit um 27,9 Prozent, der stärkste Rückgang seit Beginn. Weniger Rechenleistung, also leichtere Aufgabe. Die übrigen Miner fanden wieder im Takt Blöcke, und Bitcoin lief weiter.

Jetzt der Teil, der fast immer weggelassen wird. Bitcoin lief nicht immer von allein. Im August 2010 nutzte jemand einen Programmierfehler und erzeugte in Block 74.638 über 184 Milliarden Bitcoin aus dem Nichts. Satoshi lieferte einen Patch, und die Teilnehmer mussten die fehlerhafte Kette verwerfen. Gerettet hat das Netz damals kein Naturgesetz. Es waren Menschen, die schnell reagiert haben.

„Nicht abschaltbar“ heißt deshalb auch nicht „unangreifbar“. Staaten können [Börsen dichtmachen](/snippets/krypto-boerse-geschlossen-kyc-kontrolle/) und Mining verbieten. Software kann wieder Fehler haben. Und wer über Änderungen am Code entscheidet, ist [eine eigene Frage](https://bitcoinaera.de/technologie/governance/). Belegt ist nur: Bisher lief es weiter. Ob das für immer gilt, weiß niemand.

Bitcoin wurde [schon unzählige Male totgesagt](/snippets/wahre-geschichte-bitcoin-6-vom-witz-zum-phaenomen/) und steht immer noch da. Aber „nicht aufzuhalten“ ist kein Messwert. Die Blockhöhe schon. Frag also nicht, ob Bitcoin ewig läuft. Frag lieber: Wie viel Aufwand bräuchte jemand, um es zu stoppen — und wer hätte etwas davon?

Passend dazu Karte 13: [„Pete der Unbeeindruckte — Schon 400 Mal beerdigt. Steht immer noch da.“](/sammelkarten/#k13)
