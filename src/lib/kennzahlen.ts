/**
 * Baustein 5: Was die Zahlen messen.
 *
 * Feste Definitionen, die sich nicht ändern. Sie stehen an zwei
 * Stellen:
 *
 *   als Fußzeile unter jedem Report — damit jeder Leser die Kennzahl
 *   einordnen kann, ohne nachzuschlagen,
 *
 *   als Rückfall für Baustein 2, wenn in einer Woche kein
 *   `bausteine`-Feld gepflegt wurde. Dann steht dort die Definition
 *   statt einer Lücke.
 *
 * Bewusst evergreen formuliert: Diese Texte werden mit dem Report
 * nach drei Wochen öffentlich und sollen dann noch stimmen. Alles,
 * was einen Tagesstand beschreibt, gehört in die Wochendatei, nicht
 * hierher.
 *
 * Die Schlüssel entsprechen den Feldern in `bausteine`. Die Zuordnung
 * zu den Ampel-Schlüsseln steht in AMPEL_SCHLUESSEL — die heissen
 * nicht gleich, und genau daran ist schon einmal etwas
 * auseinandergelaufen.
 */

export interface Kennzahl {
  /** Wie sie beim Leser heißt. */
  name: string;
  /** Ein Satz: was gemessen wird. */
  misst: string;
  /** Ein Satz: warum es zählt. */
  warum: string;
  /** Der Begriff im Glossar auf bitcoinaera. */
  glossar: string;
}

export const KENNZAHLEN: Record<string, Kennzahl> = {
  etf: {
    name: "ETF-Nettoflüsse",
    misst:
      "Die Differenz aus dem Geld, das an einem Handelstag in die Bitcoin-Spot-ETFs hineinfließt, und dem, das herausgeht.",
    warum:
      "Es ist der am besten dokumentierte Teil der Nachfrage. Hinter jedem Zufluss steht ein tatsächlich gekaufter Bitcoin, nicht bloß ein Handel zwischen zwei Anlegern.",
    glossar: "etf-nettofluesse",
  },
  premium: {
    name: "Coinbase-Premium",
    misst:
      "Den Preisunterschied zwischen Bitcoin auf der US-Börse Coinbase und auf internationalen Börsen, in Basispunkten.",
    warum:
      "Ein grober Anhaltspunkt dafür, ob gerade aus den USA gekauft oder verkauft wird — und beinahe in Echtzeit verfügbar, während die ETF-Zahlen erst abends erscheinen.",
    glossar: "coinbase-premium",
  },
  stablecoin: {
    name: "Stablecoin-Versorgung",
    misst:
      "Die Summe aller umlaufenden dollargebundenen Stablecoins, gemessen als Veränderung über sieben Tage.",
    warum:
      "Sie zeigt, wie viel Kaufkraft im Kryptomarkt bereitliegt, ohne schon investiert zu sein. Sie ist die trägste der vier — und wenn sie dreht, steckt eine Kapitalbewegung dahinter, keine Stimmung.",
    glossar: "stablecoin-versorgung",
  },
  openinterest: {
    name: "Open Interest",
    misst:
      "Die Summe aller offenen Terminkontrakte, gemessen als Veränderung über 72 Stunden gegen die eigene Schwankungsbreite.",
    warum:
      "Er sagt nichts über die Richtung, aber etwas über die Fallhöhe: Je mehr gehebelte Positionen offen stehen, desto mehr davon werden bei einer Bewegung zwangsweise geschlossen — und diese Schließungen treiben den Kurs weiter.",
    glossar: "open-interest",
  },
};

/**
 * Die Ampel nennt ihre Eingänge anders als die Wochendatei.
 *
 * `stablecoins` gegen `stablecoin`, `open_interest` gegen
 * `openinterest`. Das ist unschön, aber die Ampel-Schlüssel stehen im
 * Worker und in der Datenbank, und die Feldnamen der Wochendatei sind
 * gesetzt. Die Abbildung steht deshalb hier, an genau einer Stelle.
 */
export const AMPEL_SCHLUESSEL: Record<string, string> = {
  etf: "etf",
  premium: "premium",
  stablecoin: "stablecoins",
  openinterest: "open_interest",
};

/** Reihenfolge, in der die vier überall erscheinen. */
export const REIHENFOLGE = ["etf", "premium", "stablecoin", "openinterest"] as const;
