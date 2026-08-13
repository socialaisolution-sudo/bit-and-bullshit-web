import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
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

export default defineConfig({
  site: "https://bitandbullshit.com",
  integrations: [sitemap(), legacyRedirects()],
  markdown: {
    rehypePlugins: [rehypeBegriffe],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
