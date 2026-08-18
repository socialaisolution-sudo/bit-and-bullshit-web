import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import { execSync } from "node:child_process";
import rehypeBegriffe from "./plugins/rehype-begriffe.mjs";

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
  if (m(/^\/kategorie\//)) return "src/data/kategorien.ts";
  if (m(/^\/snippets\/?$/)) return "src/pages/snippets/index.astro";
  if (m(/^\/ratgeber\/?$/)) return "src/pages/ratgeber/index.astro";
  if (m(/^\/?$/)) return "src/pages/index.astro";
  const seite = pfad.replace(/^\/|\/$/g, "");
  return seite ? `src/pages/${seite}.astro` : null;
}

export default defineConfig({
  site: "https://bitandbullshit.com",
  integrations: [
    sitemap({
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
  ],
  markdown: {
    rehypePlugins: [rehypeBegriffe],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
