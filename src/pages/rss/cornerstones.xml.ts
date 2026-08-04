import type { APIRoute } from "astro";
import { feed } from "../../lib/feed";
import { ladeRatgeber } from "../../lib/ratgeber";

export const GET: APIRoute = async ({ site }) => {
  const ratgeber = await ladeRatgeber();

  /* Neueste zuerst: letzter Ratgeber, letzter Teil. Dieselbe Reihenfolge,
     nach der auch aktuellerCornerstone() den Aufmacher wählt. */
  const eintraege = ratgeber
    .flatMap((r) =>
      r.teile
        .filter((t) => t.veroeffentlicht)
        .map((t) => ({
          titel: `${t.cornerstone!.data.title} (Teil ${t.nr})`,
          beschreibung: t.cornerstone!.data.description,
          pfad: `/ratgeber/${r.id}/${t.slug}/`,
          kategorie: r.data.titel,
        })),
    )
    .reverse();

  return feed({
    titel: "Bit & Bullshit — Ratgeber",
    beschreibung:
      "Die langen Texte: fünf Ratgeber zu Bitcoin, Geld und den Denkfehlern drumherum. Je fünf Teile, die aufeinander aufbauen.",
    selbst: "/rss/cornerstones.xml",
    site: site ?? new URL("https://bitandbullshit.com"),
    eintraege,
  });
};
