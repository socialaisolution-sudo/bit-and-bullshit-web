import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import { execSync } from "node:child_process";
import rehypeBegriffe from "./plugins/rehype-begriffe.mjs";
import rehypeMetaphern from "./plugins/rehype-metaphern.mjs";

/**
 * Schreibt `dist/_redirects` für Cloudflare Pages.
 *
 * Hintergrund: Die Snippets lagen bis 2026-07-31 auf oberster Ebene
 * (`/was-ist-fiatgeld`) und der Stream unter `/blog/`. Beides ist nach
 * `/snippets/` gezogen. Die Liste wird aus den Markdown-Dateien erzeugt
 * statt von Hand gepflegt — sonst fehlt bei jedem neuen Post die
 * Weiterleitung oder es bleiben Leichen stehen.
 */
function legacyRedirects() {
  return {
    name: "legacy-redirects",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const contentDir = new URL("./src/content/blog/", import.meta.url);
        const slugs = fs
          .readdirSync(contentDir)
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(/\.md$/, ""))
          .sort();

        const lines = [
          "# Automatisch beim Build erzeugt — nicht von Hand bearbeiten.",
          "# Quelle: astro.config.mjs → legacyRedirects()",
          "",
          "# Stream-Übersicht",
          "/blog /snippets/ 301",
          "/blog/* /snippets/:splat 301",
          "",
          `# Einzelne Snippets (${slugs.length})`,
          ...slugs.map((s) => `/${s} /snippets/${s}/ 301`),
          "",
        ];

        fs.writeFileSync(new URL("./_redirects", dir), lines.join("\n"));
        logger.info(`_redirects: ${slugs.length} Snippet-Weiterleitungen + /blog`);
      },
    },
  };
}


/**
 * Letztes Änderungsdatum je Datei — für `lastmod` in der Sitemap.
 *
 * Ohne das trägt jede Adresse die Build-Zeit, und damit behauptet jeder
 * Deploy, alle 66 Seiten seien frisch. Google lernt daraus, dass das Datum
 * nichts wert ist, und ignoriert es.
 *
 * Der Haken: Cloudflare Pages klont flach (nur der letzte Commit). Dort
 * kennt Git jede Datei nur aus diesem einen Commit und meldet für alles
 * dasselbe Datum — also genau der Fehler, den wir vermeiden wollen.
 *
 * Deshalb zwei Wege: Läuft der Build auf einem vollständigen Klon (also
 * lokal), wird der Stand aus der Historie gelesen UND in
 * src/data/aenderungen.json geschrieben. Die Datei wandert mit ins Repo.
 * Auf dem flachen Klon wird sie einfach gelesen. Damit stimmen die Daten
 * in der Produktion, ohne dass jemand daran denken muss.
 */
const STAND_DATEI = new URL("./src/data/aenderungen.json", import.meta.url);

function ausGitHistorie() {
  const flach =
    execSync("git rev-parse --is-shallow-repository", { encoding: "utf-8" }).trim() ===
    "true";
  if (flach) return null;

  const stand = {};
  const roh = execSync("git log --name-only --date=iso-strict --format=%cI", {
    encoding: "utf-8",
    maxBuffer: 32 * 1024 * 1024,
  });
  let datum = null;
  for (const zeile of roh.split("\n")) {
    const z = zeile.trim();
    if (!z) continue;
    if (/^\d{4}-\d{2}-\d{2}T/.test(z)) datum = z;
    else if (datum && !(zeile in stand)) stand[zeile] = datum;
  }
  /* Noch nicht eingecheckte Änderungen zählen als "jetzt". Ohne das würde
     eine gerade bearbeitete Datei ihr vorheriges Datum melden — der Build
     läuft ja vor dem Commit, nicht danach. */
  try {
    const offen = execSync("git status --porcelain", { encoding: "utf-8" });
    const jetzt = new Date().toISOString();
    for (const zeile of offen.split("\n")) {
      const datei = zeile.slice(3).trim().split(" -> ").pop();
      if (datei && !zeile.startsWith("D ") && !zeile.startsWith(" D")) {
        stand[datei] = jetzt;
      }
    }
  } catch {
    /* ohne Statusabfrage bleibt es beim Historienstand */
  }

  return stand;
}

function ladeStand(logger) {
  let ausGit = null;
  try {
    ausGit = ausGitHistorie();
  } catch {
    /* kein Git verfügbar — dann bleibt nur die mitgelieferte Datei */
  }

  if (ausGit && Object.keys(ausGit).length > 0) {
    fs.writeFileSync(STAND_DATEI, JSON.stringify(ausGit, null, 0) + "\n");
    return ausGit;
  }

  try {
    return JSON.parse(fs.readFileSync(STAND_DATEI, "utf-8"));
  } catch {
    logger?.warn?.("Kein Aenderungsstand verfuegbar — Sitemap ohne lastmod.");
    return {};
  }
}

const GIT_STAND = ladeStand();

/**
 * Snippets, die per `langfassung` auf einen Cornerstone zeigen.
 *
 * Sie tragen ein canonical dorthin und gehören deshalb nicht in die
 * Sitemap: Eine Adresse dort anzumelden und gleichzeitig auf eine andere
 * zu verweisen, sind zwei widersprüchliche Ansagen an dieselbe Maschine.
 */
function kanonisierteSnippets() {
  const ordner = new URL("./src/content/blog/", import.meta.url);
  const raus = new Set();
  for (const datei of fs.readdirSync(ordner)) {
    if (!datei.endsWith(".md")) continue;
    const roh = fs.readFileSync(new URL(datei, ordner), "utf-8");
    if (/^langfassung:\s*\S/m.test(roh)) raus.add(`/snippets/${datei.replace(/\.md$/, "")}/`);
  }
  return raus;
}
const OHNE_SITEMAP = kanonisierteSnippets();

/** Ordnet einer fertigen Adresse die Quelldatei zu, aus der sie entsteht. */
function quelleZuUrl(pfad) {
  const m = (re) => pfad.match(re);
  let t;
  if ((t = m(/^\/snippets\/([^/]+)\/?$/))) return `src/content/blog/${t[1]}.md`;
  if ((t = m(/^\/ratgeber\/([^/]+)\/([^/]+)\/?$/)))
    return `src/content/cornerstones/${t[1]}/${t[2]}.md`;
  if ((t = m(/^\/ratgeber\/([^/]+)\/?$/))) return `src/content/ratgeber/${t[1]}.json`;
  if ((t = m(/^\/comic\/([^/]+)\/?$/))) return `src/pages/comic/${t[1]}.astro`;
  if (m(/^\/comic\/?$/)) return "src/pages/comic/index.astro";
  if ((t = m(/^\/metaphern\/([^/]+)\/?$/))) return `src/content/metaphern/${t[1]}.md`;
  if (m(/^\/metaphern\/?$/)) return "src/pages/metaphern/index.astro";
  if (m(/^\/kategorie\//)) return "src/data/kategorien.ts";
  if (m(/^\/snippets\/?$/)) return "src/pages/snippets/index.astro";
  if (m(/^\/ratgeber\/?$/)) return "src/pages/ratgeber/index.astro";
  if (m(/^\/?$/)) return "src/pages/index.astro";
  const seite = pfad.replace(/^\/|\/$/g, "");
  return seite ? `src/pages/${seite}.astro` : null;
}


/**
 * Warnt, wenn ein Snippet und ein Cornerstone dasselbe Keyword bedienen,
 * ohne dass die Kurzfassungs-Regel greift.
 *
 * Der Anlass: Snippet "Teil 1" und der Cornerstone "Niemand verteilt
 * Bitcoin" zielten monatelang unbemerkt auf dieselbe Suchanfrage. Die
 * nächste Kollision ist schon angelegt — Snippet "Teil 2" behandelt, wie
 * Geld entsteht, und genau das wird Cornerstone 1.3. Statt sich das zu
 * merken, sagt es der Build.
 */
function keywordWache() {
  const lies = (ordner, tief) => {
    const basis = new URL(ordner, import.meta.url);
    const raus = [];
    for (const eintrag of fs.readdirSync(basis, { withFileTypes: true })) {
      if (eintrag.isDirectory() && tief) {
        for (const datei of fs.readdirSync(new URL(eintrag.name + "/", basis))) {
          if (!datei.endsWith(".md")) continue;
          raus.push({
            name: `${eintrag.name}/${datei.replace(/\.md$/, "")}`,
            roh: fs.readFileSync(new URL(`${eintrag.name}/${datei}`, basis), "utf-8"),
          });
        }
      } else if (eintrag.name.endsWith(".md")) {
        raus.push({
          name: eintrag.name.replace(/\.md$/, ""),
          roh: fs.readFileSync(new URL(eintrag.name, basis), "utf-8"),
        });
      }
    }
    return raus;
  };
  const kw = (roh) =>
    (roh.match(/^keyword:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "").toLowerCase().trim();

  return {
    name: "keyword-wache",
    hooks: {
      "astro:build:done": ({ logger }) => {
        const snippets = lies("./src/content/blog/", false);
        const steine = lies("./src/content/cornerstones/", true);
        const bilder = lies("./src/content/metaphern/", false);
        let treffer = 0;
        for (const s of snippets) {
          if (/^langfassung:\s*\S/m.test(s.roh)) continue;
          for (const c of steine) {
            if (kw(s.roh) && kw(s.roh) === kw(c.roh)) {
              treffer++;
              logger.warn(
                `Gleiches Keyword "${kw(s.roh)}": Snippet ${s.name} und Cornerstone ${c.name}. ` +
                  `Kurzfassungs-Regel anwenden — langfassung im Snippet setzen.`,
              );
            }
          }
        }

        /* Die Metapher-Eintraege zielen auf eigene Suchbegriffe. Kollidiert
           einer davon mit einem Artikel, wird gemeldet statt aufgeloest —
           welcher von beiden ranken soll, ist eine redaktionelle Frage. */
        for (const b of bilder) {
          if (/^draft:\s*true/m.test(b.roh) || !kw(b.roh)) continue;
          for (const [andere, art] of [
            [snippets, "Snippet"],
            [steine, "Cornerstone"],
          ]) {
            for (const a of andere) {
              if (kw(a.roh) === kw(b.roh)) {
                treffer++;
                logger.warn(
                  `Gleiches Keyword "${kw(b.roh)}": Metapher ${b.name} und ${art} ${a.name}. ` +
                    `Bitte melden, nicht eigenmaechtig aufloesen.`,
                );
              }
            }
          }
        }
        if (treffer === 0) logger.info("Keyword-Wache: keine Doppelbelegung.");
      },
    },
  };
}


/**
 * Prueft die Ausloese-Phrasen des Metaphern-Registers.
 *
 * Der Automatismus in plugins/rehype-metaphern.mjs verlinkt stur nach
 * diesen Listen. Drei Dinge koennen dabei schiefgehen, und alle drei
 * werden nur gemeldet — welche Metapher eine Phrase bekommt, ist eine
 * redaktionelle Entscheidung, keine technische:
 *
 *   1. dieselbe Phrase steht bei zwei Eintraegen
 *   2. eine Phrase ist gleichzeitig ein Fachbegriff aus begriffe.json
 *      (dann streiten zwei Automatismen um dasselbe Wort)
 *   3. eine Phrase kommt im ganzen Bestand kein einziges Mal vor
 */
function metaphernWache() {
  return {
    name: "metaphern-wache",
    hooks: {
      "astro:build:done": async ({ logger }) => {
        const { metapherPhrasen } = await import(
          "./plugins/rehype-metaphern.mjs"
        );
        const begriffe = JSON.parse(
          fs.readFileSync(new URL("./src/data/begriffe.json", import.meta.url), "utf-8"),
        );
        const fachwoerter = new Set(
          begriffe.begriffe
            .flatMap((b) => [b.begriff, ...(b.aliase ?? [])])
            .map((w) => w.toLowerCase()),
        );

        /* Fließtext aller Artikel einsammeln, ohne Frontmatter. */
        const texte = [];
        const sammle = (ordner, tief) => {
          const basis = new URL(ordner, import.meta.url);
          for (const e of fs.readdirSync(basis, { withFileTypes: true })) {
            if (e.isDirectory() && tief) sammle(`${ordner}${e.name}/`, tief);
            else if (e.name.endsWith(".md"))
              texte.push(
                fs
                  .readFileSync(new URL(e.name, basis), "utf-8")
                  .split(/^---$/m)
                  .slice(2)
                  .join("---"),
              );
          }
        };
        sammle("./src/content/blog/", false);
        sammle("./src/content/ratgeber/", true);
        sammle("./src/content/cornerstones/", true);

        const WORT = "A-Za-zÄÖÜäöüß0-9";
        const gesehen = new Map();
        let treffer = 0;
        let tot = 0;

        for (const p of metapherPhrasen) {
          const schluessel = p.form.toLowerCase();

          const schon = gesehen.get(schluessel);
          if (schon && schon !== p.slug) {
            treffer++;
            logger.warn(
              `Ausloeser "${p.form}" steht bei zwei Eintraegen: ${schon} und ${p.slug}. ` +
                `Der laengere Eintrag gewinnt zufaellig — bitte einem zuordnen.`,
            );
          }
          gesehen.set(schluessel, p.slug);

          if (fachwoerter.has(schluessel)) {
            treffer++;
            logger.warn(
              `Ausloeser "${p.form}" ist auch ein Fachbegriff im Nachschlagewerk. ` +
                `Metapher-Link und Begriffs-Link streiten um dasselbe Wort.`,
            );
          }

          const muster = new RegExp(
            `(?<![${WORT}\\-])${p.form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![${WORT}\\-])`,
            "i",
          );
          if (!texte.some((t) => muster.test(t))) tot++;
        }

        if (tot > 0)
          logger.info(
            `Metaphern-Wache: ${tot} von ${metapherPhrasen.length} Ausloesern kommen im Bestand (noch) nicht vor.`,
          );
        if (treffer === 0) logger.info("Metaphern-Wache: keine Doppelbelegung.");
      },
    },
  };
}


/**
 * Meldet falsche Schlusszeichen im Fließtext.
 *
 * Deutsch heißt „so“ — unten geöffnet, oben geschlossen. Gerade (") und
 * englische (”) Schlusszeichen sind falsch. Die Seite hatte davon 206
 * Stück in 47 Dateien, bevor es jemandem auffiel.
 *
 * Geprüft wird nur ein Zeichen, das direkt ein „ schließt. Gerade
 * Anführungszeichen an anderer Stelle sind legitim: YAML-Werte,
 * HTML-Attribute, Zollangaben.
 *
 * Wird nur gemeldet, nicht ersetzt. Eine automatische Reparatur hat schon
 * einmal ein YAML-Escape zerlegt.
 */
function typografieWache() {
  const sammle = (ordner, tief) => {
    const basis = new URL(ordner, import.meta.url);
    const raus = [];
    let eintraege;
    try {
      eintraege = fs.readdirSync(basis, { withFileTypes: true });
    } catch {
      return raus;
    }
    for (const e of eintraege) {
      if (e.isDirectory() && tief) {
        for (const datei of fs.readdirSync(new URL(e.name + "/", basis))) {
          if (datei.endsWith(".md"))
            raus.push([`${e.name}/${datei}`, new URL(`${e.name}/${datei}`, basis)]);
        }
      } else if (e.name.endsWith(".md")) {
        raus.push([e.name, new URL(e.name, basis)]);
      }
    }
    return raus;
  };

  return {
    name: "typografie-wache",
    hooks: {
      "astro:build:done": ({ logger }) => {
        const quellen = [
          ...sammle("./src/content/blog/", false),
          ...sammle("./src/content/cornerstones/", true),
          ...sammle("./src/content/metaphern/", false),
        ];
        let treffer = 0;
        for (const [name, url] of quellen) {
          const roh = fs.readFileSync(url, "utf-8");
          const teile = roh.split("---");
          const text = teile.length > 2 ? teile.slice(2).join("---") : roh;
          for (const m of text.matchAll(/„([^„“”"]{1,120})([”"])/g)) {
            treffer++;
            const art = m[2] === '"' ? "gerades" : "englisches";
            logger.warn(
              `${name}: ${art} Schlusszeichen bei „${m[1].slice(0, 40)}${m[2]} — deutsch waere „…“.`,
            );
          }
        }
        if (treffer === 0) logger.info("Typografie-Wache: Anfuehrungszeichen sauber.");
      },
    },
  };
}

export default defineConfig({
  site: "https://bitandbullshit.com",
  integrations: [
    sitemap({
      filter: (url) => !OHNE_SITEMAP.has(new URL(url).pathname),
      serialize(eintrag) {
        const pfad = new URL(eintrag.url).pathname;
        const quelle = quelleZuUrl(pfad);
        const datum = quelle && GIT_STAND[quelle];
        if (datum) eintrag.lastmod = datum;
        else delete eintrag.lastmod;
        return eintrag;
      },
    }),
    legacyRedirects(),
    keywordWache(),
    metaphernWache(),
    typografieWache(),
  ],
  markdown: {
    rehypePlugins: [rehypeMetaphern, rehypeBegriffe],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
