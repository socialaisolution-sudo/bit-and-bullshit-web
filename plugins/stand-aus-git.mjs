import { execSync } from "node:child_process";
import fs from "node:fs";

/**
 * Erst- und Änderungsdatum je Datei — aus der Git-Historie, aber gemessen
 * am SICHTBAREN TEXT, nicht an der Datei.
 *
 * Der Unterschied ist der ganze Punkt. Am 27.08.2026 lief eine reine
 * Typografie-Bereinigung über 47 Dateien. Nach Dateistand hätte die
 * Sitemap den halben Bestand als frisch überarbeitet gemeldet, obwohl für
 * einen Leser kein Wort anders war. Ein falsches Frischesignal wird genau
 * dann nicht mehr geglaubt, wenn wirklich überarbeitet wurde.
 *
 * Gezählt wird deshalb nur, was jemand auf der Seite liest:
 *
 *   - der Fließtext unter dem Frontmatter
 *   - `title` (die H1), `untertitel` und `description` (der Vorspann)
 *
 * Nicht gezählt: keyword, metaTitel, metaBeschreibung, Bildpfade,
 * Auslöser-Listen, draft-Schalter — und Anführungszeichen, die von gerade
 * auf deutsch gedreht wurden.
 *
 * Für alles, was kein Markdown ist (Seiten-Templates, Daten-Dateien),
 * bleibt es beim Commit-Datum: dort gibt es keinen Fließtext, den man
 * herauslösen könnte.
 */

/* Anführungszeichen aller Bauarten auf eine Form. Damit fällt eine reine
   Typografie-Korrektur beim Vergleich nicht auf. */
const ZITATE = /[„“”‟"‚‘’‛']/g;

const SICHTBAR = ["title", "untertitel", "description"];

export function sichtbarerText(roh) {
  const teile = roh.split(/^---\s*$/m);
  const hatKopf = teile.length >= 3 && teile[0].trim() === "";
  const kopf = hatKopf ? teile[1] : "";
  const koerper = hatKopf ? teile.slice(2).join("---") : roh;

  const felder = SICHTBAR.map((f) => {
    const m = kopf.match(new RegExp(`^${f}:\\s*(.+?)\\s*$`, "m"));
    return m ? `${f}=${m[1].replace(/^['"]|['"]$/g, "")}` : "";
  }).join("\n");

  return `${felder}\n${koerper}`.replace(ZITATE, "'").replace(/\s+/g, " ").trim();
}

/** Liest viele Blobs in einem einzigen git-Aufruf. */
function bloblesen(anfragen) {
  if (anfragen.length === 0) return new Map();
  const roh = execSync("git cat-file --batch", {
    input: anfragen.join("\n") + "\n",
    maxBuffer: 256 * 1024 * 1024,
  });

  const raus = new Map();
  let pos = 0;
  for (const anfrage of anfragen) {
    const zeilenende = roh.indexOf("\n", pos);
    if (zeilenende === -1) break;
    const kopf = roh.toString("utf-8", pos, zeilenende);
    pos = zeilenende + 1;
    /* „<oid> missing“ heißt: Datei gab es unter dem Namen damals nicht. */
    const teile = kopf.split(" ");
    if (teile.length < 3) continue;
    const laenge = Number(teile[2]);
    raus.set(anfrage, roh.toString("utf-8", pos, pos + laenge));
    pos += laenge + 1;
  }
  return raus;
}

export function standAusGit() {
  const flach =
    execSync("git rev-parse --is-shallow-repository", { encoding: "utf-8" }).trim() ===
    "true";
  if (flach) return null;

  /* Ein Durchgang durch die Historie: welcher Commit hat wann welche
     Dateien angefasst. */
  const roh = execSync("git log --name-only --date=iso-strict --format=%H%x09%cI", {
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });

  const commits = new Map(); // pfad -> [{sha, datum}, ...] neu nach alt
  let sha = null;
  let datum = null;
  for (const zeile of roh.split("\n")) {
    if (!zeile.trim()) continue;
    const kopf = zeile.match(/^([0-9a-f]{7,40})\t(\d{4}-\d{2}-\d{2}T\S+)$/);
    if (kopf) {
      sha = kopf[1];
      datum = kopf[2];
      continue;
    }
    if (!sha) continue;
    if (!commits.has(zeile)) commits.set(zeile, []);
    commits.get(zeile).push({ sha, datum });
  }

  /* Für Markdown alle Fassungen anfordern, die verglichen werden müssen. */
  const anfragen = [];
  for (const [pfad, liste] of commits) {
    if (!pfad.endsWith(".md")) continue;
    for (const c of liste) anfragen.push(`${c.sha}:${pfad}`);
  }
  const blobs = bloblesen(anfragen);

  const stand = {};
  for (const [pfad, liste] of commits) {
    const erstellt = liste[liste.length - 1].datum;

    if (!pfad.endsWith(".md")) {
      stand[pfad] = { geaendert: liste[0].datum, erstellt };
      continue;
    }

    /* Von neu nach alt zurücklaufen, solange der sichtbare Text gleich
       bleibt. Der älteste Commit mit demselben Text ist der, in dem
       dieser Text entstanden ist. */
    const text = (c) => {
      const b = blobs.get(`${c.sha}:${pfad}`);
      return b === undefined ? null : sichtbarerText(b);
    };
    const jetzt = text(liste[0]);
    let geaendert = liste[0].datum;
    if (jetzt !== null) {
      for (let i = 1; i < liste.length; i++) {
        const frueher = text(liste[i]);
        if (frueher === null || frueher !== jetzt) break;
        geaendert = liste[i].datum;
      }
    }
    stand[pfad] = { geaendert, erstellt };
  }

  /* Noch nicht eingecheckte Änderungen: nur zählen, wenn sich der
     sichtbare Text gegenüber HEAD wirklich unterscheidet. Sonst würde
     jede Frontmatter-Korrektur vor dem Commit das Datum hochziehen. */
  try {
    const offen = execSync("git status --porcelain", { encoding: "utf-8" });
    const heute = new Date().toISOString();
    for (const zeile of offen.split("\n")) {
      const pfad = zeile.slice(3).trim().split(" -> ").pop();
      if (!pfad || zeile.startsWith("D ") || zeile.startsWith(" D")) continue;

      if (!pfad.endsWith(".md")) {
        stand[pfad] = { geaendert: heute, erstellt: stand[pfad]?.erstellt ?? heute };
        continue;
      }
      let jetzt = null;
      try {
        jetzt = sichtbarerText(
          execSync(`git show HEAD:"${pfad}"`, { encoding: "utf-8", maxBuffer: 16 * 1024 * 1024 }),
        );
      } catch {
        /* neue Datei — die hat noch keinen Vorgänger */
      }
      const roh = fs.readFileSync(pfad, "utf-8");
      if (jetzt === null || sichtbarerText(roh) !== jetzt) {
        stand[pfad] = { geaendert: heute, erstellt: stand[pfad]?.erstellt ?? heute };
      }
    }
  } catch {
    /* ohne Statusabfrage bleibt es beim Historienstand */
  }

  return stand;
}
