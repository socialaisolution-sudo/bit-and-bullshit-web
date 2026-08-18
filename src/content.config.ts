import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Snippets — kurzlebiger Stream, viele Stücke, chronologisch. */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      keyword: z.string(),
      /**
       * Genau eine Hauptkategorie je Artikel. Die Werte stehen in
       * src/data/kategorien.ts; wer hier einen hinzufügt, muss ihn dort
       * ebenfalls anlegen, sonst hat die Kategorie keine Seite.
       */
      kategorie: z.enum([
        "grundwissen",
        "geld-inflation",
        "staat-steuern",
        "betrug-maschen",
        "markt-mythen",
      ]),
      order: z.number(),
      aeraLink: z.string().url().optional(),
      draft: z.boolean().default(true),
      featured: z.boolean().default(false),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /**
       * Belege, wenn ein Snippet auf eine konkrete Meldung Bezug nimmt.
       * Steht bewusst nicht im Fließtext: Die Erzählung soll ohne Fußnoten
       * lesbar bleiben, der Nachweis aber nachprüfbar darunter stehen.
       * `url` darf fehlen — ein O-Ton hat keine eigene Adresse.
       */
      quellen: z
        .array(
          z.object({
            text: z.string(),
            url: z.string().url().optional(),
          }),
        )
        .optional(),
    }),
});

/**
 * Ratgeber — die Hub-Ebene. Eine Datei je Ratgeber.
 *
 * `teile` listet ALLE fünf Teile, auch die noch ungeschriebenen. Genau die
 * ausgegrauten Einträge sind der Grund, wiederzukommen — und der Anlass für
 * das E-Mail-Feld. Ein Teil gilt als veröffentlicht, sobald ein Cornerstone
 * mit passendem `slug` existiert und nicht auf draft steht.
 */
const ratgeber = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/ratgeber" }),
  schema: z.object({
    nummer: z.number(),
    titel: z.string(),
    kurztitel: z.string(),
    einleitung: z.string(),
    teile: z
      .array(
        z.object({
          nr: z.number(),
          titel: z.string(),
          /** Slug des Cornerstones. Fehlt = geplant, wird ausgegraut. */
          slug: z.string().optional(),
        }),
      )
      .min(1),
    /** Liegt in /public, sobald alle Teile stehen. */
    pdf: z.string().optional(),
  }),
});

/**
 * Cornerstones — langlebige Texte. Liegen in Unterordnern je Ratgeber,
 * die Zuordnung kommt aus dem Ordnernamen (id = "<ratgeber>/<slug>").
 */
const cornerstones = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/cornerstones" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Kursive Zeile unter der Überschrift. */
      untertitel: z.string().optional(),
      description: z.string(),
      keyword: z.string(),
      teil: z.number(),
      draft: z.boolean().default(true),
      /** 16:9 — die Homepage zeigt den aktuellen Cornerstone im Querformat. */
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Anriss auf den Folgeteil, erscheint am Textende. */
      ausblick: z.string().optional(),
      /**
       * Pfad zur Comic-Fassung. Gibt es keine, entfällt der Verweis
       * vollständig — ein Link auf eine Seite, die es nicht gibt, ist
       * schlimmer als kein Link.
       */
      comic: z.string().optional(),
    }),
});

export const collections = { blog, ratgeber, cornerstones };
