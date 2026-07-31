import { getCollection, type CollectionEntry } from "astro:content";

export type TeilStatus = {
  nr: number;
  titel: string;
  slug?: string;
  cornerstone?: CollectionEntry<"cornerstones">;
  veroeffentlicht: boolean;
};

export type RatgeberMitStand = CollectionEntry<"ratgeber"> & {
  teile: TeilStatus[];
  fertig: number;
  gesamt: number;
  komplett: boolean;
};

/**
 * Verbindet die Ratgeber-Definition mit den tatsächlich vorhandenen
 * Cornerstones. Ein Teil gilt als veröffentlicht, wenn die JSON-Datei einen
 * `slug` nennt UND dazu ein Cornerstone ohne draft-Flag existiert. Fehlt
 * eines von beidem, bleibt der Teil ausgegraut stehen — mit Titel, denn
 * genau der ist der Grund wiederzukommen.
 */
export async function ladeRatgeber(): Promise<RatgeberMitStand[]> {
  const [ratgeber, cornerstones] = await Promise.all([
    getCollection("ratgeber"),
    getCollection("cornerstones", ({ data }) => data.draft !== true),
  ]);

  return ratgeber
    .sort((a, b) => a.data.nummer - b.data.nummer)
    .map((r) => {
      const teile: TeilStatus[] = r.data.teile
        .slice()
        .sort((a, b) => a.nr - b.nr)
        .map((t) => {
          const cs = t.slug
            ? cornerstones.find((c) => c.id === `${r.id}/${t.slug}`)
            : undefined;
          return { ...t, cornerstone: cs, veroeffentlicht: Boolean(cs) };
        });

      const fertig = teile.filter((t) => t.veroeffentlicht).length;
      return {
        ...r,
        teile,
        fertig,
        gesamt: teile.length,
        komplett: fertig === teile.length,
      };
    });
}

/** Zuletzt veröffentlichter Cornerstone — steht oben auf der Startseite. */
export async function aktuellerCornerstone() {
  const alle = await ladeRatgeber();
  for (const r of [...alle].reverse()) {
    const letzter = [...r.teile].reverse().find((t) => t.veroeffentlicht);
    if (letzter?.cornerstone) return { ratgeber: r, teil: letzter };
  }
  return null;
}
