// ─────────────────────────────────────────────────────────────
// Sucht die KI-Muster aus Dennys Liste im sichtbaren Text.
//
//   node muster.mjs <repo-pfad> [--roh]
//
// Zwei Quellen:
//   src/content/**/*.md   — die Inhalte, mit Datei und Zeile
//   dist/**/*.html        — das Gebaute, also auch Nav, Knoepfe,
//                           Formular-Copy und Meta-Zeilen
//
// Der Detektor findet KANDIDATEN, keine Urteile. Ein
// Gedankenstrich-Einschub ist gutes Deutsch; erst die Haeufung
// stoert. Deshalb zaehlt die Ausgabe pro Datei und markiert, wo die
// Faustregel "pro Muster hoechstens einmal pro laengerem Text"
// gebrochen ist.
// ─────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO = process.argv[2];
const ROH = process.argv.includes("--roh");
if (!REPO) {
  console.error("Aufruf: node muster.mjs <repo-pfad>");
  process.exit(1);
}

/* Nicht anfassen, also auch nicht melden. */
const TABU = [
  /impressum/i,
  /datenschutz/i,
  /haftung/i,
  /ki-(kennzeichnung|hinweis|label)/i,
  /ampel\/regeln/i,
  /001-funding-verstummt/i,
  /kalibrierung/i,
];

const istTabu = (pfad) => TABU.some((r) => r.test(pfad));

function dateien(wurzel, endung) {
  const raus = [];
  const gehe = (d) => {
    let e;
    try {
      e = readdirSync(d);
    } catch {
      return;
    }
    for (const n of e) {
      if (n === "node_modules" || n === "_astro" || n.startsWith(".")) continue;
      const p = join(d, n);
      if (statSync(p).isDirectory()) gehe(p);
      else if (n.endsWith(endung)) raus.push(p);
    }
  };
  gehe(wurzel);
  return raus;
}

/* ── Text herausschaelen ──────────────────────────────────────── */

/** Aus Markdown: Körper plus die sichtbaren Kopffelder. */
function ausMarkdown(roh) {
  const teile = roh.split(/^---\s*$/m);
  const kopf = teile.length > 2 ? teile[1] : "";
  let koerper = teile.length > 2 ? teile.slice(2).join("---") : roh;

  const felder = [];
  for (const name of ["title", "titel", "untertitel", "description", "beschreibung", "anriss"]) {
    const m = kopf.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
    if (m) felder.push(m[1].replace(/^["'>|-]+\s*/, "").replace(/["']$/, ""));
  }

  koerper = koerper
    /* Zitate raus — Dennys Vorgabe. */
    .replace(/^>.*$/gm, "")
    /* Codeblöcke und Auszeichnungsreste raus. */
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    /* Quellenangaben-Zeilen raus. */
    .replace(/^\s*(Quelle|Quellen|Stand|Siehe auch)\s*:.*$/gim, "");

  return { text: `${felder.join("\n")}\n\n${koerper}`, koerper };
}

/** Aus gebautem HTML: nur was ein Besucher liest. */
function ausHtml(roh) {
  let t = roh
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, " ");
  const meta = [...t.matchAll(/<meta[^>]+(?:name|property)="(?:description|og:description|og:title)"[^>]+content="([^"]*)"/gi)].map(
    (m) => m[1],
  );
  const titel = [...t.matchAll(/<title[^>]*>([^<]*)<\/title>/gi)].map((m) => m[1]);
  t = t.replace(/<[^>]+>/g, " ");
  return [...titel, ...meta, t]
    .join("\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#821[6-9];/g, "'")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ");
}

/* ── Die Muster ───────────────────────────────────────────────── */

const FLOSKEL = [
  "bemerkenswert", "faszinierend", "es ist wichtig zu verstehen", "letztlich",
  "im Kern", "nicht zuletzt", "im Grunde", "im Wesentlichen", "entscheidend ist",
  "es lohnt sich", "in der Tat", "durchaus", "keineswegs", "zweifellos",
];
const RATGEBER = [
  "in diesem Artikel", "in diesem Beitrag", "lass uns einen Blick",
  "werfen wir einen Blick", "zusammenfassend", "abschließend lässt sich",
  "wie wir gesehen haben", "du erfährst", "Sie erfahren", "wir zeigen dir",
  "das Wichtigste in Kürze", "Fazit:",
];
const ABSICHERUNG = [
  "könnte möglicherweise", "in gewisser Weise", "unter Umständen",
  "gewissermaßen", "möglicherweise", "unter anderem", "tendenziell",
  "in vielen Fällen", "nicht selten",
];

const saetze = (t) =>
  t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

const absaetze = (t) =>
  t
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 60 && !/^[#\-*|]/.test(s));

function pruefe(text, koerper) {
  const f = {};
  const add = (art, beleg) => (f[art] ??= []).push(beleg.replace(/\s+/g, " ").trim().slice(0, 120));

  /* 1 · Nicht X, sondern Y */
  for (const m of text.matchAll(/\b[Nn]icht\b[^.!?;]{3,90}?,\s*sondern\b[^.!?]{0,90}/g)) add("nicht-sondern", m[0]);

  /* 2 · Dreierliste A, B und C */
  for (const m of text.matchAll(/\b([A-Za-zÄÖÜäöüß]{4,}(?:\s\w+){0,2}), ([A-Za-zÄÖÜäöüß]{4,}(?:\s\w+){0,2}) und ([A-Za-zÄÖÜäöüß]{4,}(?:\s\w+){0,2})\b/g)) {
    /* Nur melden, wenn die drei Glieder aehnlich lang sind — sonst
       ist es eine normale Aufzaehlung und kein Rhythmusmuster. */
    const l = [m[1], m[2], m[3]].map((x) => x.length);
    if (Math.max(...l) - Math.min(...l) <= 8) add("dreierliste", m[0]);
  }

  /* 3 · Doppelpunkt-Enthuellung — GESTRICHEN am 10.09.2026.
     
     Der Ausdruck fand 303 Stellen, davon fast alle Fettschrift-Label
     („Zum Mitnehmen:", „Kurz erklaert:") und Bruchstuecke von
     Dezimalzahlen: Die Satztrennung bricht bei „840.000" hinter der
     „840." und macht daraus einen eigenen Satz. Die Label sind ein
     bewusstes Stilmittel, keine Enthuellungs-Masche.
     
     Nach dem Filtern blieb so wenig uebrig, dass der Aufwand nicht
     lohnt. Diese Masche findet sich beim Lesen, nicht per Ausdruck. */

  /* 4 · Gedankenstrich-Dichte, gemessen gegen eine Decke aus
     Texten, von denen belegt ist, dass sie tragen — NICHT gegen den
     Median des Bestands.
     
     Der Unterschied ist der ganze Punkt: Steckt die Angewohnheit
     schon im Grundduktus, eicht ein Median den Detektor auf genau
     das Problem, das er finden soll. Er meldet dann nur noch
     Ausreisser nach oben.
     
     Die Decke ist der HOECHSTE Wert unter den abgenommenen Texten,
     nicht ihr Mittel: „nicht schlechter als das Schlechteste, was
     abgenommen wurde."
     
     ACHTUNG, WICHTIGE EINSCHRAENKUNG (10.09.2026): Die Dichte haengt
     stark an der TEXTLAENGE, und beide Referenz-Artikel sind
     Langform. Nach Laengenklasse gemessen:
     
       150-260 Woerter (Snippet)   Median 14,4 je 1000
       260-400 Woerter             Median  0,0
       400-700 Woerter             Median  2,3
       ueber 700 Woerter           Median  2,0
     
     Von den sieben Langform-Texten liegt KEINER ueber der Decke. Die
     Decke passt also nur auf Langform. Auf Snippets angewendet
     vergleicht sie zwei Register: Dort arbeiten die Einschuebe als
     gesprochene Einwuerfe („Ok, mal ehrlich — das Zeug soll seinen
     Wert halten"), und das ist Absicht.
     
     Was bleibt: Dennys eigene beiden Rubriken sind Snippet-Laenge
     (199 und 128 Woerter) und haben null Einschuebe. Bei 14,4 waeren
     auf 327 Woertern rund fuenf zu erwarten. Eine duenne, aber
     vorhandene Referenz — nicht entschieden, liegt bei ihm.
     
       Ausgabe 1, beide Rubriken (Denny selbst)   0,0 je 1000
       Cypherpunks-Artikel („so lassen")          1,0
       Wale-Artikel („so lassen")                 4,2  ← Decke
     
     Zum Vergleich der Bestand: Median 5,1, oberes Viertel 14,4. Der
     Median liegt also ueber der Decke. */
  const DECKE = 4.2 / 1000;
  const striche = (text.match(/\s—\s/g) ?? []).length;
  const woerter = text.split(/\s+/).length;
  if (woerter > 150 && striche / woerter > DECKE) {
    const je = (1000 * striche) / woerter;
    f["gedankenstrich-dichte"] = [
      `${striche} Striche auf ${woerter} Wörter = ${je.toFixed(1)} je 1000, ${(je / 4.2).toFixed(1)}× der Decke`,
    ];
  }

  /* 5 · Parallelkonstruktion: drei Saetze hintereinander mit
     demselben Anfangswort */
  const s = saetze(koerper);
  for (let i = 0; i + 2 < s.length; i++) {
    const w = s.slice(i, i + 3).map((x) => x.split(/\s+/)[0].replace(/[^\wÄÖÜäöüß]/g, "").toLowerCase());
    if (w[0] && w[0].length > 2 && w[0] === w[1] && w[1] === w[2]) {
      add("parallelbau", `3× „${w[0]}…": ${s[i].slice(0, 60)}`);
      i += 2;
    }
  }

  /* 6 · Floskeln, Ratgeber-Duktus, Absicherungen */
  for (const [art, liste] of [["floskel", FLOSKEL], ["ratgeber", RATGEBER], ["absicherung", ABSICHERUNG]]) {
    for (const w of liste) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
      for (const m of text.matchAll(re)) {
        const i = m.index ?? 0;
        add(art, text.slice(Math.max(0, i - 40), i + w.length + 40));
      }
    }
  }

  /* 7 · Rhetorische Frage als Uebergang: kurzer Fragesatz, der
     allein in einem Absatz oder am Absatzanfang steht */
  for (const a of absaetze(koerper)) {
    const m = a.match(/^((?:Aber|Doch|Und|Was|Warum|Wie|Wieso|Heißt)[^.!?]{5,70}\?)/);
    if (m) add("rhetorische-frage", m[1]);
  }

  /* 8 · Anfuehrungszeichen um ein einzelnes Wort — GESTRICHEN.
     
     Auch nach der Einschraenkung auf einmalige Begriffe blieb der
     Ausdruck unbrauchbar: Getroffen wurden „Enkeltrick", „Uschi",
     „Oben", „Steuergerechtigkeit" — echte Woerter und echte Zitate,
     keine Erfindungen. Ein Ausdruck kann nicht unterscheiden, ob ein
     Begriff existiert. Das muss beim Lesen entschieden werden. */

  /* 9 · Zu gleichmaessige Absaetze: sechs oder mehr Absaetze, deren
     Laenge kaum streut */
  const a = absaetze(koerper);
  if (a.length >= 6) {
    const l = a.map((x) => x.length);
    const mi = l.reduce((x, y) => x + y, 0) / l.length;
    const sd = Math.sqrt(l.reduce((x, y) => x + (y - mi) ** 2, 0) / l.length);
    if (sd / mi < 0.28) {
      f["gleichmass"] = [`${a.length} Absätze, Streuung nur ${(100 * sd / mi).toFixed(0)} % vom Mittel (${Math.round(mi)} Zeichen)`];
    }
  }

  /* 10 · Aufzaehlung mit gleich langen Punkten */
  const punkte = [...koerper.matchAll(/^[-*]\s+(.{15,})$/gm)].map((m) => m[1].trim());
  if (punkte.length >= 3) {
    const l = punkte.map((x) => x.length);
    const mi = l.reduce((x, y) => x + y, 0) / l.length;
    const sd = Math.sqrt(l.reduce((x, y) => x + (y - mi) ** 2, 0) / l.length);
    if (sd / mi < 0.15) f["punkte-gleichlang"] = [`${punkte.length} Punkte, Streuung ${(100 * sd / mi).toFixed(0)} %`];
  }

  return f;
}

/* ── Durchlauf ────────────────────────────────────────────────── */

const befunde = [];

for (const p of dateien(join(REPO, "src/content"), ".md")) {
  const rel = relative(REPO, p);
  if (istTabu(rel)) continue;
  const { text, koerper } = ausMarkdown(readFileSync(p, "utf-8"));
  const f = pruefe(text, koerper);
  const n = Object.values(f).reduce((s, x) => s + x.length, 0);
  if (n) befunde.push({ datei: rel, woerter: koerper.split(/\s+/).length, funde: f, n });
}

for (const p of dateien(join(REPO, "dist"), ".html")) {
  const rel = relative(REPO, p);
  if (istTabu(rel)) continue;
  /* Artikel-HTML nicht doppelt zaehlen — die Inhalte stehen schon
     oben. Hier interessieren die Seiten, die KEINE Markdown-Quelle
     haben: Startseite, Formulare, Danke-Seiten, Nav. */
  const t = ausHtml(readFileSync(p, "utf-8"));
  const f = pruefe(t, t);
  const n = Object.values(f).reduce((s, x) => s + x.length, 0);
  if (n) befunde.push({ datei: rel, woerter: t.split(/\s+/).length, funde: f, n, gebaut: true });
}

/* ── Ausgabe ──────────────────────────────────────────────────── */

const nachArt = {};
for (const b of befunde)
  for (const [art, liste] of Object.entries(b.funde)) (nachArt[art] ??= []).push(...liste.map((x) => ({ datei: b.datei, beleg: x })));

console.log(`\n═══ ${relative(process.env.HOME ?? "", REPO)} ═══`);
console.log(`${befunde.length} Dateien mit Funden, ${Object.values(nachArt).reduce((s, x) => s + x.length, 0)} Kandidaten\n`);

console.log("Nach Mustertyp:");
for (const [art, liste] of Object.entries(nachArt).sort((a, b) => b[1].length - a[1].length)) {
  const dateien = new Set(liste.map((x) => x.datei)).size;
  console.log(`  ${art.padEnd(24)}${String(liste.length).padStart(4)}  in ${dateien} Datei(en)`);
}

console.log("\nAm stärksten betroffen (Funde je 1000 Wörter, ab 300 Wörtern):");
const dicht = befunde
  .filter((b) => b.woerter >= 300)
  .map((b) => ({ ...b, dichte: (1000 * b.n) / b.woerter }))
  .sort((a, b) => b.dichte - a.dichte)
  .slice(0, 15);
for (const b of dicht) {
  console.log(`  ${b.dichte.toFixed(1).padStart(5)}  ${String(b.n).padStart(3)} Funde  ${b.woerter.toString().padStart(5)} W  ${b.datei}`);
}

console.log("\nKleine Dateien und Seiten mit Funden:");
for (const b of befunde.filter((b) => b.woerter < 300).sort((a, b) => b.n - a.n).slice(0, 20)) {
  console.log(`  ${String(b.n).padStart(3)} Funde  ${b.woerter.toString().padStart(4)} W  ${b.datei}   [${Object.keys(b.funde).join(", ")}]`);
}

if (ROH) {
  console.log("\n══ Belege ══");
  for (const [art, liste] of Object.entries(nachArt)) {
    console.log(`\n── ${art} (${liste.length}) ──`);
    for (const x of liste.slice(0, 40)) console.log(`  ${x.datei}\n     ${x.beleg}`);
  }
}
