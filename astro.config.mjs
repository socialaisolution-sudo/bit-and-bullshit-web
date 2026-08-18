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
 * Letztes Änderungsdatum je Datei aus der Git-Historie.
 *
 * Ohne das trägt jede Adresse in der Sitemap die Build-Zeit — und damit
 * behauptet jeder Deploy, alle 65 Seiten seien frisch. Google lernt daraus,
 * dass das Datum nichts wert ist, und ignoriert es. Ein Artikel, der seit
 * Juli unverändert ist, soll auch Juli melden.
 *
 * Ein einziger git-Aufruf statt einer Abfrage je Datei; das erste Vorkommen
 * eines Pfades ist automatisch der jüngste Commit.
 */
function letzteAenderungen() {
  const stand = new Map();
  try {
    const roh = execSync("git log --name-only --date=iso-strict --format=%cI", {
      encoding: "utf-8",
      maxBuffer: 32 * 1024 * 1024,
    });
    let datum = null;
    for (const zeile of roh.split("\n")) {
      if (!zeile.trim()) continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(zeile)) datum = zeile.trim();
      else if (datum && !stand.has(zeile)) stand.set(zeile, datum);
    }
  } catch {
    /* Kein Git-Repo (etwa im Cloudflare-Cache ohne Historie): dann bleibt
       es beim Standardverhalten, das ist besser als ein Abbruch. */
  }
  return stand;
}

const GIT_STAND = letzteAenderungen();

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
        const datum = quelle && GIT_STAND.get(quelle);
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
