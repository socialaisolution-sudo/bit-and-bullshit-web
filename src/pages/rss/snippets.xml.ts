import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { feed } from "../../lib/feed";
import { KATEGORIE_MAP } from "../../data/kategorien";

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("blog", ({ data }) => data.draft !== true);

  return feed({
    titel: "Bit & Bullshit — Snippets",
    beschreibung:
      "Kurze Erklärstücke zu Bitcoin, Makro und Geld. Ein Thema, 60 Sekunden, kein Rendite-Bullshit.",
    selbst: "/rss/snippets.xml",
    site: site ?? new URL("https://bitandbullshit.com"),
    eintraege: posts
      .sort((a, b) => b.data.order - a.data.order)
      .map((p) => ({
        titel: p.data.title,
        beschreibung: p.data.description,
        pfad: `/snippets/${p.id}/`,
        kategorie: KATEGORIE_MAP[p.data.kategorie].titel,
      })),
  });
};
