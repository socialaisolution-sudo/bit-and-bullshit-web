// Rendert eine Ausgabe in Dateien zum Ansehen und zum Einspielen.
//
//   npx tsx skripte/mail-rendern.mjs
//
// Ergebnis liegt unter vorschau/ und ist bewusst nicht im Repo — es
// entsteht aus src/newsletter/ und waere dort eine zweite Wahrheit.
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("vorschau", { recursive: true });
const { BLINDAUSGABE } = await import("../src/newsletter/blindtext.ts");
const { mailHtml, mailText, mailBetreff } = await import("../src/newsletter/mail.ts");

writeFileSync("vorschau/bullshitmelder.html", mailHtml(BLINDAUSGABE));
writeFileSync("vorschau/bullshitmelder.txt", mailText(BLINDAUSGABE));

console.log(`Betreff: ${mailBetreff(BLINDAUSGABE)}`);
console.log("→ vorschau/bullshitmelder.html");
console.log("→ vorschau/bullshitmelder.txt");
