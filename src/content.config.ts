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
      category: z.enum(["entlarven", "learning", "denkfehler"]),
      order: z.number(),
      aeraLink: z.string().url().optional(),
      draft: z.boolean().default(true),
      featured: z.boolean().default(false),
      image: image().optional(),
      imageAlt: z.string().optional(),
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
    }),
});

export const collections = { blog, ratgeber, cornerstones };
