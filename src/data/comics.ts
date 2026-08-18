/**
 * Register aller Web-Comics.
 *
 * Ein neuer Comic braucht genau zwei Handgriffe: die Seite unter
 * src/pages/comic/<slug>.astro anlegen und hier einen Eintrag ergänzen.
 * Galerie, Startseiten-Block und die Verweise aus den Langtexten ziehen
 * sich alles Weitere von hier — es gibt keine zweite Stelle, an der ein
 * Comic gepflegt werden müsste.
 *
 * `serie` gruppiert die Kapitel in der Galerie. Steht später ein zweiter
 * Erzählstrang an, bekommt er einfach einen anderen Serientitel; die
 * Galerie gruppiert von selbst. Das ist der Grundstein fürs Comic-Buch:
 * Reihenfolge und Kapitelzählung liegen als Daten vor, nicht im Layout.
 */
import type { ImageMetadata } from "astro";

import coverZuSpaet from "../assets/comic/zu-spaet-gibt-es-nicht/05-sonnenuntergang.webp";
import coverNiemand from "../assets/comic/niemand-verteilt-bitcoin/03-kein-oben.webp";

export interface Comic {
  slug: string;
  serie: string;
  /** Kapitelnummer innerhalb der Serie. */
  teil: number;
  titel: string;
  /** Zwei Zeilen für Kachel und Startseite. */
  anriss: string;
  /**
   * Das Panel, das als Cover läuft. Bewusst nicht das erste — das erste
   * Panel stellt die Frage, das Cover soll die Stimmung tragen.
   */
  cover: ImageMetadata;
  coverAlt: string;
  /** Der ausführliche Text zum selben Thema, falls es ihn gibt. */
  langfassung?: string;
}

export const COMICS: Comic[] = [
  {
    slug: "zu-spaet-gibt-es-nicht",
    serie: "Der große Bitcoin-Denkfehler",
    teil: 1,
    titel: "Zu spät gibt es nicht",
    anriss:
      "Fünf Panels, ein Zug, der im Kreis fährt. Warum „zu spät“ ein Ende voraussetzt, das es auf einem Markt nicht gibt.",
    cover: coverZuSpaet,
    coverAlt:
      "Das Maskottchen sitzt bei Sonnenuntergang am Bahnsteig, der Zug zieht seine Kreisbahn über der Stadt",
    langfassung: "/ratgeber/bitcoin-denkfehler/zu-spaet-gibt-es-nicht/",
  },
  {
    slug: "niemand-verteilt-bitcoin",
    serie: "Der große Bitcoin-Denkfehler",
    teil: 2,
    titel: "Niemand verteilt Bitcoin",
    anriss:
      "Vier Panels über die Hand, die von oben austeilt — und warum es sie hier zum ersten Mal nicht gibt.",
    cover: coverNiemand,
    coverAlt:
      "Die verteilende Hand ist orange durchgestrichen, eine gemischte Menge greift frei nach leuchtenden Bitcoin-Münzen",
    langfassung: "/ratgeber/bitcoin-denkfehler/niemand-verteilt-bitcoin/",
  },
];

/** Neuestes Kapitel zuerst — das ist der Aufmacher auf der Startseite. */
export const COMIC_NEUESTE = [...COMICS].sort((a, b) => b.teil - a.teil)[0];

/** Serien in Erscheinungsreihenfolge, Kapitel darin aufsteigend. */
export function comicsNachSerie(): { serie: string; kapitel: Comic[] }[] {
  const reihenfolge: string[] = [];
  const gruppen = new Map<string, Comic[]>();
  for (const c of COMICS) {
    if (!gruppen.has(c.serie)) {
      gruppen.set(c.serie, []);
      reihenfolge.push(c.serie);
    }
    gruppen.get(c.serie)!.push(c);
  }
  return reihenfolge.map((serie) => ({
    serie,
    kapitel: gruppen.get(serie)!.sort((a, b) => a.teil - b.teil),
  }));
}

/** Findet den Comic zu einem Langtext — für den Verweis in die andere Richtung. */
export function comicZuLangfassung(pfad: string): Comic | undefined {
  return COMICS.find((c) => c.langfassung === pfad);
}
