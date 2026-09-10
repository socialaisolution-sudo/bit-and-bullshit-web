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
       * Zeigt auf den Cornerstone, wenn dieses Snippet die Kurzfassung
       * desselben Themas ist.
       *
       * Regel der Denkfehler-Serie: Behandeln Snippet und Cornerstone
       * dieselbe Frage, rankt der Cornerstone. Das Snippet bekommt dann ein
       * canonical dorthin, fliegt aus der Sitemap und verlinkt prominent
       * auf die Langfassung — es bleibt lesbar und Teil der Serie, tritt
       * aber in der Suche nicht mehr gegen den eigenen Cornerstone an.
       *
       * Der Verweis wird erst wirksam, wenn es den Cornerstone gibt. So
       * kann er gesetzt werden, bevor der Langtext geschrieben ist.
       */
      langfassung: z.string().optional(),
      /**
       * Nur für Google und den Browser-Tab. Bleibt leer, solange Überschrift
       * und Suchtreffer dasselbe sagen dürfen — gesetzt wird es dort, wo die
       * Suchanfrage anders klingt als die Schlagzeile. Die H1 bleibt in
       * jedem Fall `title`, damit die Seite nicht nach Keyword klingt.
       */
      metaTitel: z.string().optional(),
      /** Meta-Description, falls sie vom sichtbaren Anriss abweichen soll. */
      metaBeschreibung: z.string().optional(),
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
      /**
       * Nur für Google und den Browser-Tab. Bleibt leer, solange Überschrift
       * und Suchtreffer dasselbe sagen dürfen — gesetzt wird es dort, wo die
       * Suchanfrage anders klingt als die Schlagzeile. Die H1 bleibt in
       * jedem Fall `title`, damit die Seite nicht nach Keyword klingt.
       */
      metaTitel: z.string().optional(),
      /** Meta-Description, falls sie vom sichtbaren Anriss abweichen soll. */
      metaBeschreibung: z.string().optional(),
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

/**
 * Metaphern — das Register der Denkbilder.
 *
 * Bewusst KEIN Begriffsglossar. Fachbegriffe mit eigenem Namen (Halving,
 * Cantillon-Effekt, Survivorship Bias) liegen auf bitcoinaera.de und werden
 * dorthin verlinkt. Hier stehen nur Bilder und Mechanismen, für die es
 * keinen Fachbegriff gibt — sonst entsteht Doppelung über Domaingrenzen
 * hinweg.
 *
 * Ein neuer Eintrag ist eine neue Datei. Register, Navigation und
 * Querverweise ziehen von allein nach.
 */
const metaphern = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/metaphern" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Ein Satz fürs Register. Nicht die Meta-Description. */
      kurz: z.string(),
      description: z.string(),
      keyword: z.string(),
      metaTitel: z.string().optional(),
      metaBeschreibung: z.string().optional(),
      draft: z.boolean().default(true),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Pfad zur Comic-Fassung, falls es eine gibt. */
      comic: z.string().optional(),
      /**
       * Formulierungen, bei denen in einem Artikel auf diesen Eintrag
       * verlinkt werden soll — inklusive Beugungen und Kurzformen.
       *
       * Bewusst eine gepflegte Liste statt Texterkennung: Eine Metapher
       * erkennt man am Sinn, nicht an Buchstaben. „Zug" allein trifft die
       * Bahnstrecke, „im Kreis" trifft das Karussell. Wer die Phrasen
       * schreibt, entscheidet, was gemeint war.
       */
      ausloeser: z.array(z.string()).optional(),
      /**
       * Artikel, in denen das Bild angewendet wird — der Rückweg aus dem
       * Register in die Texte. Bewusst von Hand gepflegt: Automatisch
       * gefundene Treffer wären oft nur beiläufige Erwähnungen.
       */
      angewendet: z
        .array(z.object({ titel: z.string(), pfad: z.string() }))
        .optional(),
    })
      /**
       * Ein veröffentlichter Eintrag braucht sein eigenes Bild — sonst
       * fällt er beim Teilen auf das Standardmotiv zurück und sieht aus
       * wie jede andere Seite. Entwürfe dürfen noch ohne, sonst könnte man
       * einen Eintrag nicht anlegen, bevor das Motiv existiert.
       */
      .superRefine((d, ctx) => {
        if (d.draft) return;
        if (!d.image)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["image"],
            message:
              "Veröffentlichter Metapher-Eintrag ohne Bild. Motiv in 1200x630 anlegen oder draft: true setzen.",
          });
        if (!d.imageAlt)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["imageAlt"],
            message: "Bild ohne Alt-Text.",
          });
      }),
});

/**
 * Die Newsletter-Ausgaben.
 *
 * Der Bullshitmelder wohnt hier, nicht bei Brevo — Brevo ist nur der
 * Transportweg. Aus derselben Datei entsteht beides: die Mail (über
 * src/newsletter/mail.ts) und die Archivseite. Zwei Quellen für
 * denselben Text wären zwei Fassungen, die auseinanderlaufen.
 *
 * Der Fließtext steht als Markdown im Körper, nicht als Struktur im
 * Frontmatter. Wer eine Ausgabe schreibt, soll schreiben und nicht
 * YAML tippen.
 *
 * **Kein Passwortfeld.** Das Wochenpasswort gehört in die Mail und
 * nirgendwo sonst. Stünde es hier, läge es im Git und ginge später
 * mit der Archivseite online.
 */
const newsletter = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/newsletter" }),
  schema: z.object({
    /** Fortlaufend. Trägt die Betreffzeile und das Archiv. */
    nummer: z.number().int().positive(),
    /** Versanddatum. */
    datum: z.coerce.date(),
    titel: z.string(),
    /** Ein bis zwei Sätze. Steht im Vorschautext der Mail und im Archiv. */
    anriss: z.string().min(40),

    /**
     * Ab wann die Ausgabe öffentlich lesbar ist.
     *
     * Auf der Anmeldeseite steht: „Die Inhalte erscheinen 8 bis 12
     * Wochen später auch öffentlich." Das ist ein Versprechen, und
     * ein Versprechen, das von einem vergessenen Handgriff abhängt,
     * wird gebrochen. Deshalb steht das Datum in der Ausgabe, und die
     * Archivseite entscheidet daran — nicht ein Schalter, den jemand
     * umlegen muss.
     */
    oeffentlichAb: z.coerce.date(),

    /**
     * Die Ampelstellung zum Versandzeitpunkt, EINGEFROREN.
     *
     * Nicht live geholt: Eine Ausgabe, die drei Monate später gelesen
     * wird, soll den Stand zeigen, über den ihr Text spricht.
     */
    ampel: z.object({
      farbe: z.enum(["gruen", "gelb", "rot"]).nullable(),
      begruendung: z.string(),
      eingaenge: z
        .array(
          z.object({
            name: z.string(),
            stufe: z.enum(["ruhig", "erhoeht", "extrem", "fehlt"]),
            /** Bei `fehlt` der Grund, sonst der Wert. */
            zusatz: z.string().optional(),
          }),
        )
        .min(1),
      fundingTage: z.number().int().nullable(),
      fundingSeit: z.string().nullable(),
      gemessen: z.coerce.date(),
      regelversion: z.number().int().nullable(),
    }),

    /**
     * Rubrik 3, „Wie ich das sehe" — Haltung in erster Person.
     *
     * Als Markdown-Zeichenkette im Frontmatter, nicht als eigene
     * Markdown-Auszeichnung im Körper. Der Grund: Die Rubrik ist ein
     * ABSCHNITT, kein Block — sie enthält selbst Absätze, Zitate und
     * Listen. Eine neue Auszeichnung bräuchte also eine
     * Container-Syntax, und genau die hat der Parser bewusst nicht
     * (siehe src/newsletter/markdown.ts: „genau vier Blockarten").
     *
     * Im Frontmatter validiert es hier, beim Bauen. Ein vertippter
     * Zaun im Körper würde dagegen erst beim Testversand auffallen —
     * oder gar nicht, weil der Abschnitt dann still als Fließtext
     * durchläuft.
     *
     * Der Inhalt wird mit demselben `zuBloecken()` gelesen wie der
     * Körper. Innen gelten also die vier bekannten Blockarten.
     */
    meinung: z.string().min(40).optional(),

    /**
     * Rubrik 4, „Bullshit Burner".
     *
     * `urteil` steht getrennt vom Text, weil der Parser Fettschrift
     * einebnet — ein `**Verbrannt.**` am Textende käme als
     * unauffälliger Absatz heraus. Es ist außerdem ein
     * wiederkehrendes Bauteil und kein Prosatext.
     */
    burner: z
      .object({
        text: z.string().min(40),
        urteil: z.string().min(2).default("Verbrannt."),
      })
      .optional(),

    /** Glossarbegriffe, die in dieser Ausgabe vorkommen. Fürs Archiv. */
    kennzahlen: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, ratgeber, cornerstones, metaphern, newsletter };
