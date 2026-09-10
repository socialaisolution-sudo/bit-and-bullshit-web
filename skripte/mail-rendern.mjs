// Rendert eine Ausgabe zum Ansehen und zum Einspielen in Brevo.
//
//   npm run mail                          → neueste Ausgabe, Passwort als Platzhalter
//   npm run mail -- 1                     → Ausgabe Nr. 1
//   npm run mail -- 1 hafen-kompass-42    → mit echtem Wochenpasswort
//
// Ohne Nummer wird die höchste genommen, auch wenn sie noch gesperrt
// ist — beim Versand ist die Ausgabe naturgemäß noch nicht öffentlich.
//
// Das Ergebnis liegt unter vorschau/ und ist bewusst nicht im Repo:
// Es entsteht aus src/content/newsletter/ und wäre dort eine zweite
// Wahrheit. Das Passwort schon gar nicht.
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

const [nummerArg, passwortArg] = process.argv.slice(2);

const ORDNER = "src/content/newsletter";
const { mailHtml, mailText, mailBetreff } = await import("../src/newsletter/mail.ts");
const { zuBloecken } = await import("../src/newsletter/markdown.ts");

/* Frontmatter von Hand lesen — ein YAML-Parser für dieses eine
   Skript wäre eine Abhängigkeit für nichts. Astro liest dieselben
   Dateien mit Schema, dort wird geprüft. */
function lies(datei) {
  const roh = readFileSync(`${ORDNER}/${datei}`, "utf-8");
  const teile = roh.split(/^---\s*$/m);
  const kopf = teile[1] ?? "";
  const koerper = teile.slice(2).join("---");

  const feld = (name) => kopf.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "m"))?.[1]?.replace(/^["']|["']$/g, "");
  const eingaenge = [...kopf.matchAll(/- \{ name: "(.+?)", stufe: (\w+)(?:, zusatz: "(.+?)")? \}/g)].map(
    (m) => ({ name: m[1], stufe: m[2], zusatz: m[3] }),
  );
  const anriss = kopf.match(/^anriss: >-\n((?:\s{2,}.*\n)+)/m)?.[1]?.trim().replace(/\s+/g, " ") ?? feld("anriss") ?? "";

  return {
    datei,
    nummer: Number(feld("nummer")),
    datum: feld("datum"),
    titel: feld("titel"),
    anriss,
    ampel: {
      farbe: kopf.match(/^\s+farbe:\s*(\w+)/m)?.[1] ?? null,
      begruendung: kopf.match(/^\s+begruendung:\s*"(.+?)"/m)?.[1] ?? "",
      eingaenge,
      fundingTage: Number(kopf.match(/^\s+fundingTage:\s*(-?\d+)/m)?.[1] ?? NaN) || null,
      fundingSeit: kopf.match(/^\s+fundingSeit:\s*"(.+?)"/m)?.[1] ?? null,
      gemessen: kopf.match(/^\s+gemessen:\s*(\S+)/m)?.[1] ?? feld("datum"),
      regelversion: Number(kopf.match(/^\s+regelversion:\s*(\d+)/m)?.[1] ?? NaN) || null,
    },
    text: zuBloecken(koerper),
  };
}

const dateien = readdirSync(ORDNER).filter((f) => f.endsWith(".md"));
if (!dateien.length) {
  console.error(`Keine Ausgabe in ${ORDNER}.`);
  process.exit(1);
}

const alle = dateien.map(lies).sort((a, b) => b.nummer - a.nummer);
const gewaehlt = nummerArg ? alle.find((a) => a.nummer === Number(nummerArg)) : alle[0];

if (!gewaehlt) {
  console.error(`Ausgabe ${nummerArg} nicht gefunden. Vorhanden: ${alle.map((a) => a.nummer).join(", ")}`);
  process.exit(1);
}

/* Ohne Passwort wird ein sichtbarer Platzhalter gesetzt, kein
   erfundenes. Wer die Datei versehentlich verschickt, merkt es. */
const ausgabe = {
  ...gewaehlt,
  passwort: passwortArg ?? "PASSWORT-FEHLT",
  passwortWoche: passwortArg ? "Passwort der Woche" : "Platzhalter",
};

mkdirSync("vorschau", { recursive: true });
const basis = `vorschau/bullshitmelder-${String(ausgabe.nummer).padStart(3, "0")}`;
writeFileSync(`${basis}.html`, mailHtml(ausgabe));
writeFileSync(`${basis}.txt`, mailText(ausgabe));

console.log(`Ausgabe ${ausgabe.nummer}: ${ausgabe.titel}`);
console.log(`Betreff: ${mailBetreff(ausgabe)}`);
console.log(`Bloecke: ${ausgabe.text.length}`);
if (!passwortArg) console.log("⚠ Kein Passwort uebergeben — im HTML steht PASSWORT-FEHLT.");
console.log(`→ ${basis}.html`);
console.log(`→ ${basis}.txt`);
