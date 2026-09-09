/**
 * Eine erfundene Ausgabe in realistischer Länge, nur fürs Layout.
 *
 * Bewusst KEIN „Lorem ipsum": Deutscher Text hat andere Wortlängen
 * und andere Umbruchpunkte, und die langen Komposita in diesem Feld
 * („Stablecoin-Versorgung") sind genau die Stellen, an denen ein
 * Mail-Layout bricht. Blindtext, der kürzer ist als der echte, prüft
 * nichts.
 *
 * Die vier Eingänge decken absichtlich alle vier Stufen ab — ruhig,
 * erhöht, im Extrem, kein Wert. Eine Vorschau, die nur den Normalfall
 * zeigt, prüft das Layout genau dort nicht, wo es darauf ankommt.
 *
 * Der letzte steht auf `fehlt`. Das ist der Fall, der im Betrieb
 * vorkommt und im Entwurf gern vergessen wird: Was fehlt, muss als
 * fehlend zu sehen sein und darf nicht wie „ruhig" aussehen.
 */

import type { Ausgabe } from "./typen";

export const BLINDAUSGABE: Ausgabe = {
  nummer: 1,
  datum: "2026-09-11",
  titel: "Die Kennzahl, die alle zitieren, ist seit 415 Tagen tot",
  anriss:
    "Funding Rates gelten als Überhitzungsanzeiger. Nur zeigen sie seit über " +
    "einem Jahr gar nichts mehr an — und das hat einen Grund, über den kaum " +
    "jemand spricht.",

  ampel: {
    farbe: "gelb",
    begruendung: "Coinbase-Premium im Extrem, Stablecoin-Versorgung erhöht.",
    eingaenge: [
      { name: "ETF-Nettoflüsse", stufe: "ruhig", zusatz: "+987 Mio. $ / 5 Tage" },
      { name: "Coinbase-Premium", stufe: "extrem", zusatz: "−17,4 bp" },
      { name: "Stablecoin-Versorgung", stufe: "erhoeht", zusatz: "−0,54 % / 7 Tage" },
      { name: "Open Interest", stufe: "fehlt", zusatz: "Quelle nicht erreichbar" },
    ],
    fundingTage: 415,
    fundingSeit: "2025-07-23",
    gemessen: "2026-09-11",
    regelversion: 1,
  },

  text: [
    {
      art: "absatz",
      text:
        "Wenn irgendwo steht, der Markt sei überhitzt, folgt fast immer ein " +
        "Verweis auf die Funding Rate. Sie misst, welche Seite am Terminmarkt " +
        "überfüllt ist, und galt jahrelang als der eine Wert, den man kennen " +
        "muss. Das Problem: Bei der Herleitung unseres Ampelsystems ist etwas " +
        "aufgefallen, das niemand erwähnt.",
    },
    {
      art: "hervorhebung",
      text:
        "Der Wert, auf den es dabei ankommt, ist seit dem 23. Juli 2025 nicht " +
        "ein einziges Mal aufgetreten.",
    },
    {
      art: "absatz",
      text:
        "Nicht selten. Nicht schwach. Kein einziges Mal. Im Jahr 2024 lag die " +
        "Funding Rate an 27,5 Prozent aller Tage über ihrem Ankerwert, 2025 an " +
        "1,6 Prozent, 2026 an keinem. Wer heute liest, die Funding Rate zeige " +
        "Überhitzung, sollte nachfragen, gegen welchen Nullpunkt gemessen wurde.",
    },
    { art: "zwischentitel", text: "Warum sie verstummt ist" },
    {
      art: "absatz",
      text:
        "Die naheliegende Erklärung ist der Basis-Handel rund um die Spot-ETFs. " +
        "Wer ETF-Anteile kauft und gleichzeitig den Perpetual verkauft, verdient " +
        "an genau der Differenz, die die Funding Rate misst — und drückt sie " +
        "damit weg. Was früher ein Stimmungsmesser war, misst heute vor allem, " +
        "wie gut dieser Handel funktioniert.",
    },
    {
      art: "liste",
      punkte: [
        "2024: an 27,5 % der Tage ein positiver Überschuss",
        "2025: an 1,6 %",
        "2026: an keinem einzigen Tag",
      ],
    },
    {
      art: "absatz",
      text:
        "Wir haben die Kennzahl deshalb nicht gestrichen, sondern umgewidmet. " +
        "Sie zählt nicht mehr in die Ampelfarbe hinein, wird aber weiter " +
        "angezeigt — als Zähler, wie viele Tage seit dem letzten Überschuss " +
        "vergangen sind. Kommt der Wert zurück, wird sie wieder eine reguläre " +
        "Eingangsgröße.",
    },
    { art: "zwischentitel", text: "Was das für die Ampel heißt" },
    {
      art: "absatz",
      text:
        "Unangenehme Folge: Die höchste Warnstufe unseres eigenen Systems hat " +
        "damit noch nie ausgelöst. Nicht in diesem Jahr, sondern in keinem " +
        "Zeitraum, für den alle Kennzahlen zusammen vorliegen. Sie ist " +
        "hergeleitet, aber nicht erprobt. Was sie im Ernstfall anzeigt, weiß " +
        "niemand — und das steht seit dem ersten Tag offen auf der Regelseite.",
    },
    {
      art: "absatz",
      text:
        "Diese Woche ist der Open Interest ausgefallen, die Quelle war nicht " +
        "erreichbar. Er zählt deshalb nicht als ruhig, sondern gar nicht. Ein " +
        "fehlender Wert ist keine Entwarnung.",
    },
  ],

  passwort: "tiefe-pfeiler-11",
  passwortWoche: "KW 37",
};
