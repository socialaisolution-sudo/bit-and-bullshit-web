// ─────────────────────────────────────────────────────────────
// Schreibt den aktuellen Ampelstand in den `ampel:`-Block einer
// Ausgabe.
//
//   node skripte/ampel-in-ausgabe.mjs 001-funding-verstummt.md
//   node skripte/ampel-in-ausgabe.mjs 001-funding-verstummt.md --pruefen
//
// Warum ein Skript und nicht von Hand: Der Ampelstand steht an vier
// Stellen in einer Ausgabe — vier Eingänge, Farbe, Begründung,
// Funding-Zähler — und der Zähler steht zusätzlich im Titel. Wer das
// von Hand nachträgt, vergisst eine Stelle. Und eine Ausgabe, die
// eine Kennzahl als „fehlt" ausgibt, die inzwischen vorliegt,
// widerspricht ihrem eigenen Text.
//
// `--pruefen` schreibt nichts, sondern meldet nur Abweichungen.
// Gedacht für den Blick am Versandtag.
//
// Der Zähler wird NICHT vom Endpunkt übernommen, sondern aus
// `fundingSeit` und dem Versanddatum gerechnet. Grund: Die Ausgabe
// geht am `datum` raus, der Endpunkt antwortet mit dem Stand von
// heute. Am Donnerstag für einen Freitagsversand wären das
// unterschiedliche Zahlen, und die falsche stünde im Titel.
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENDPUNKT = "https://bitcoin-ampel.social-ai-solution.workers.dev/ampel";

/* Die Namen, unter denen die Kennzahlen in der Ausgabe stehen. Der
   Endpunkt liefert Schlüssel, die Leser sehen Klartext. */
const NAMEN = {
  etf: "ETF-Nettoflüsse",
  stablecoins: "Stablecoin-Versorgung",
  premium: "Coinbase-Premium",
  open_interest: "Open Interest",
};
/* Reihenfolge wie in der Mail — nicht die des Endpunkts. */
const FOLGE = ["etf", "stablecoins", "premium", "open_interest"];

const [datei, ...schalter] = process.argv.slice(2);
const nurPruefen = schalter.includes("--pruefen");

if (!datei) {
  console.error("Aufruf: node skripte/ampel-in-ausgabe.mjs <datei.md> [--pruefen]");
  process.exit(1);
}

const pfad = datei.includes("/") ? datei : join("src/content/newsletter", datei);
const roh = readFileSync(pfad, "utf-8");

const ende = roh.indexOf("\n---\n", 4);
if (!roh.startsWith("---\n") || ende < 0) {
  console.error(`${pfad}: kein Frontmatter gefunden.`);
  process.exit(1);
}
const kopf = roh.slice(4, ende + 1);
const koerper = roh.slice(ende + 5);

const feld = (name) => kopf.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim();

const versand = feld("datum");
const titel = feld("titel") ?? "";
if (!versand) {
  console.error(`${pfad}: kein \`datum\` im Frontmatter.`);
  process.exit(1);
}

const antwort = await fetch(ENDPUNKT, { headers: { "User-Agent": "bullshitmelder/1.0" } });
if (!antwort.ok) {
  console.error(`Ampel nicht erreichbar: HTTP ${antwort.status}`);
  process.exit(1);
}
const a = await antwort.json();

if (a.veraltet) {
  console.error(
    `Die Ampel meldet ihren Stand als veraltet (${Math.round(a.alter_sekunden / 60)} min alt). ` +
      `Abgebrochen — ein alter Stand gehört nicht eingefroren.`,
  );
  process.exit(1);
}

/* Der Zähler zum VERSANDDATUM, nicht zu heute. */
const seit = a.funding_regime?.letzter_ueberschuss ?? null;
const tage = seit
  ? Math.floor((Date.parse(`${versand}T00:00:00Z`) - Date.parse(`${seit}T00:00:00Z`)) / 86400000)
  : null;

const eingaenge = FOLGE.filter((k) => a.eingaenge?.[k]).map((k) => {
  const e = a.eingaenge[k];
  const stufe = e.verfuegbar ? e.stufe : "fehlt";
  const zusatz = e.verfuegbar ? null : (e.grund ?? "Quelle nicht erreichbar");
  return { name: NAMEN[k] ?? k, stufe, zusatz };
});

/* Die Begründung aus der Zählregel, nicht aus dem Endpunkt: Der
   liefert „keine Auffälligkeit", was als eingefrorener Satz in einer
   Ausgabe nichts erklärt. */
const erhoeht = eingaenge.filter((e) => e.stufe === "erhoeht").length;
const extrem = eingaenge.filter((e) => e.stufe === "extrem").length;
const fehlt = eingaenge.filter((e) => e.stufe === "fehlt").length;
const zahlwort = ["Keine", "Eine", "Zwei", "Drei", "Vier"];

let begruendung;
if (a.ampel === null) {
  begruendung = `Nur ${eingaenge.length - fehlt} von vier Kennzahlen verfügbar. Unter drei gibt die Ampel keine Farbe aus.`;
} else if (extrem) {
  begruendung = `${zahlwort[extrem]} Kennzahl${extrem > 1 ? "en" : ""} im Extrem.`;
} else if (erhoeht >= 2) {
  begruendung = `${zahlwort[erhoeht]} von vier Kennzahlen erhöht.`;
} else if (erhoeht === 1) {
  begruendung = "Eine von vier Kennzahlen erhöht. Für Gelb müssen es zwei sein.";
} else {
  begruendung = "Keine der vier Kennzahlen auffällig.";
}
if (fehlt && a.ampel !== null) {
  begruendung += ` ${zahlwort[fehlt]} Kennzahl${fehlt > 1 ? "en" : ""} nicht verfügbar.`;
}

const zeile = (e) =>
  `    - { name: "${e.name}", stufe: ${e.stufe}` + (e.zusatz ? `, zusatz: "${e.zusatz}" }` : " }");

const heute = new Date(a.stand).toISOString().slice(0, 10);
const neuerBlock =
  `ampel:\n` +
  `  farbe: ${a.ampel ?? "null"}\n` +
  `  begruendung: "${begruendung}"\n` +
  `  eingaenge:\n${eingaenge.map(zeile).join("\n")}\n` +
  `  fundingTage: ${tage ?? "null"}\n` +
  `  fundingSeit: ${seit ? `"${seit}"` : "null"}\n` +
  `  gemessen: ${heute}\n` +
  `  regelversion: ${a.regelversion ?? "null"}\n`;

/* Vom `ampel:`-Block bis zur nächsten Zeile ohne Einrückung. */
const treffer = kopf.match(/^ampel:\n(?:[ \t].*\n)*/m);
if (!treffer) {
  console.error(`${pfad}: kein \`ampel:\`-Block im Frontmatter.`);
  process.exit(1);
}

console.log(`Ampel vom ${heute}, Regelversion ${a.regelversion} → ${pfad}`);
console.log(`  Farbe: ${a.ampel ?? "keine"} — ${begruendung}`);
for (const e of eingaenge) console.log(`  ${e.name.padEnd(22)} ${e.stufe}${e.zusatz ? ` (${e.zusatz})` : ""}`);
console.log(`  Funding-Zähler zum ${versand}: ${tage} Tage (seit ${seit})`);

/* Der Zähler steht auch im Titel. Eine stille Abweichung dort wäre
   der schlimmste Fall: Die Ausgabe widerspricht sich in der
   Betreffzeile. */
const imTitel = titel.match(/(\d{2,4})\s*Tag/);
if (imTitel && tage != null && Number(imTitel[1]) !== tage) {
  console.log(
    `\n⚠ Der Titel nennt ${imTitel[1]} Tage, gerechnet sind ${tage}.\n` +
      `  Der Titel wird NICHT automatisch geändert — er ist Text, keine Zahl.\n` +
      `  Bitte von Hand anpassen: ${titel}`,
  );
}

if (treffer[0] === neuerBlock) {
  console.log("\nUnverändert — der Block steht schon so.");
  process.exit(0);
}

if (nurPruefen) {
  console.log("\nAbweichung gefunden. Ohne --pruefen wird sie geschrieben.");
  process.exit(1);
}

writeFileSync(pfad, `---\n${kopf.replace(treffer[0], neuerBlock)}---\n${koerper}`);
console.log("\nGeschrieben.");
