// ─────────────────────────────────────────────────────────────
// Kontrast der Mail-Farben, nach WCAG 2.1 gerechnet.
//
//   node skripte/kontrast-pruefen.mjs
//
// Anlass: Der Bullshit-Burner-Block setzt Orange auf dunkle Fläche.
// Ob das lesbar ist, lässt sich ausrechnen, und dann muss man es
// nicht behaupten. Die Mail ist reiner Dunkelmodus
// (`color-scheme: dark`), es gibt also nur diesen einen Fall zu
// prüfen — aber den für jede Paarung, die im Template vorkommt.
//
// Schwellen: 4,5:1 für normalen Text, 3:1 für großen (ab 18,66 px
// fett oder 24 px normal). Rubrikmarke und Urteilsstempel sind 15 px
// fett und gesperrt — das ist nach WCAG NICHT groß, also gilt für
// sie die strengere Schwelle. Bewusst so gerechnet: Eine Marke, die
// nur als „großer Text" durchgeht, ist zu knapp.
// ─────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";

/* Muss mit F in src/newsletter/mail.ts übereinstimmen. Doppelt
   gepflegt, weil dieses Skript ohne Astro läuft und das Template
   TypeScript ist. Damit die Doppelung nicht zur Lüge wird, liest die
   Wache weiter unten die echten Werte aus mail.ts und vergleicht.
   
   Ohne diese Wache wäre der schlimmste Fall nicht ein Fehler,
   sondern ein bestandener Test auf Farben, die niemand benutzt. */
const F = {
  grund: "#0F1115",
  flaeche: "#171A20",
  text: "#E9E7E1",
  leise: "#9A9C9E",
  linie: "#2A2E36",
  orange: "#FF7A1A",
  gruen: "#3E9E6B",
  gelb: "#C9922B",
  rot: "#E85940",
};

/* Die Wache: F aus mail.ts lesen und gegenprüfen. */
{
  const roh = readFileSync("src/newsletter/mail.ts", "utf-8");
  const block = roh.match(/^const F = \{[\s\S]*?^\} as const;/m)?.[0];
  if (!block) {
    console.error("Kontrast-Wache: `const F = {` in mail.ts nicht gefunden.");
    process.exit(1);
  }
  const echt = {};
  for (const m of block.matchAll(/^\s*(\w+):\s*"(#[0-9A-Fa-f]{6})"/gm)) echt[m[1]] = m[2].toUpperCase();

  const abweichung = [];
  for (const [name, wert] of Object.entries(F)) {
    if (echt[name] !== wert.toUpperCase()) abweichung.push(`${name}: hier ${wert}, in mail.ts ${echt[name] ?? "fehlt"}`);
  }
  for (const name of Object.keys(echt)) {
    if (!(name in F)) abweichung.push(`${name}: in mail.ts vorhanden, hier nicht geprüft`);
  }
  if (abweichung.length) {
    console.error("Kontrast-Wache: Palette laeuft auseinander.\n  " + abweichung.join("\n  "));
    console.error("\nDieses Skript haette Farben geprueft, die im Template nicht stehen.");
    process.exit(1);
  }
}

const kanal = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

function leuchtkraft(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = kanal((n >> 16) & 255);
  const g = kanal((n >> 8) & 255);
  const b = kanal(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontrast(a, b) {
  const la = leuchtkraft(a);
  const lb = leuchtkraft(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* Was tatsächlich im Template aufeinandertrifft. */
const PAARE = [
  ["Fließtext auf Grund", F.text, F.grund, 4.5],
  ["Leise Zeile auf Grund", F.leise, F.grund, 4.5],
  ["Zwischentitel orange auf Grund", F.orange, F.grund, 4.5],
  ["Meinung: Überschrift auf Fläche", F.text, F.flaeche, 4.5],
  ["Meinung: Text auf Fläche", F.text, F.flaeche, 4.5],
  ["Meinung: „Meinung“ leise auf Fläche", F.leise, F.flaeche, 4.5],
  ["BURNER: Rubrikmarke orange auf Fläche", F.orange, F.flaeche, 4.5],
  ["BURNER: Text auf Fläche", F.text, F.flaeche, 4.5],
  ["BURNER: Urteilsstempel orange auf Fläche", F.orange, F.flaeche, 4.5],
  ["Passwort orange auf Fläche", F.orange, F.flaeche, 4.5],
  ["Ampel grün auf Fläche", F.gruen, F.flaeche, 4.5],
  ["Ampel gelb auf Fläche", F.gelb, F.flaeche, 4.5],
  ["Ampel rot auf Fläche", F.rot, F.flaeche, 4.5],
];

let durchgefallen = 0;
console.log("Kontrast der Mail-Farben, Dunkelmodus\n");
console.log(`${"Paarung".padEnd(44)}${"Kontrast".padStart(9)}  Schwelle  Urteil`);
console.log("─".repeat(76));

for (const [name, vg, hg, schwelle] of PAARE) {
  const k = kontrast(vg, hg);
  const gut = k >= schwelle;
  if (!gut) durchgefallen++;
  console.log(
    `${name.padEnd(44)}${k.toFixed(2).padStart(8)}:1  ${schwelle.toFixed(1)}:1     ${gut ? "besteht" : "DURCHGEFALLEN"}`,
  );
}

/* Die Ampelfarben stehen im Template fett und in Wortform daneben —
   deshalb ist ihr Kontrast wichtig, aber der Punkt daneben ist
   Beiwerk. Falls eine durchfällt, gehört sie aufgehellt und nicht
   weggelassen. */
console.log("\nHinweis: Rot und Gelb sind die knappsten. Sie stehen als WORT da,");
console.log("nicht nur als Punkt — wer sie aufhellt, prüft hier nach.");

if (durchgefallen) {
  console.error(`\n${durchgefallen} Paarung(en) unter der Schwelle.`);
  process.exit(1);
}
console.log("\nAlle Paarungen bestehen.");
