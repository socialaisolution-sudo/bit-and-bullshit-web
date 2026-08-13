import fs from "node:fs";

/**
 * Verlinkt Fachbegriffe automatisch ins Nachschlagewerk auf bitcoinaera.de.
 *
 * Die Regeln sind absichtlich streng, weil ein Text mit vierzig blauen
 * Wörtern nicht mehr gelesen, sondern überflogen wird:
 *
 *   - nur das ERSTE Vorkommen eines Begriffs je Text
 *   - höchstens MAX_LINKS Begriffe pro Seite
 *   - nie in Überschriften, Zitaten, Code oder in einem bestehenden Link
 *   - nie den Begriff, auf den die Seite ohnehin schon per aeraLink zeigt
 *
 * Die Zuordnung steht in src/data/begriffe.json, damit sie ohne Codeänderung
 * wächst. Jede URL dort muss existieren — beim letzten Durchgang waren alle
 * neun handgesetzten aeraLinks 404, weil das Schema geraten war.
 */

const MAX_LINKS = 6;
const UEBERSPRINGEN = new Set([
  "a",
  "code",
  "pre",
  "kbd",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

const daten = JSON.parse(
  fs.readFileSync(new URL("../src/data/begriffe.json", import.meta.url), "utf-8"),
);

/* Längste Schreibweise zuerst, sonst frisst „Lightning“ das
   „Lightning-Network“ weg, bevor es drankommt. */
const eintraege = daten.begriffe
  .flatMap((b) =>
    [b.begriff, ...(b.aliase ?? [])].map((form) => ({
      form,
      url: `${daten.basis}${b.pfad}`,
      schluessel: b.pfad,
    })),
  )
  .sort((a, b) => b.form.length - a.form.length);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Wortgrenzen von Hand: \b kennt weder Umlaute noch den Bindestrich in
   „Seed-Phrase“ und würde mitten im Wort zuschlagen. */
const WORT = "A-Za-zÄÖÜäöüß0-9";
const muster = new RegExp(
  `(?<![${WORT}\\-])(${eintraege.map((e) => escape(e.form)).join("|")})(?![${WORT}\\-])`,
);

export default function rehypeBegriffe() {
  return (tree, file) => {
    const fm = file?.data?.astro?.frontmatter ?? {};
    const vergeben = new Set();

    /* Zeigt die Seite schon oben auf einen Eintrag, wird derselbe Begriff im
       Fließtext nicht noch einmal verlinkt. Zweimal dasselbe Ziel liest sich
       wie ein Fehler. */
    if (typeof fm.aeraLink === "string") {
      const treffer = eintraege.find((e) => fm.aeraLink.endsWith(e.schluessel));
      if (treffer) vergeben.add(treffer.schluessel);
    }

    let gesetzt = 0;

    const gehe = (knoten) => {
      if (gesetzt >= MAX_LINKS) return;
      if (!Array.isArray(knoten.children)) return;

      for (let i = 0; i < knoten.children.length; i++) {
        const kind = knoten.children[i];

        if (kind.type === "element") {
          if (UEBERSPRINGEN.has(kind.tagName)) continue;
          gehe(kind);
          if (gesetzt >= MAX_LINKS) return;
          continue;
        }
        if (kind.type !== "text") continue;

        const m = muster.exec(kind.value);
        if (!m) continue;

        const eintrag = eintraege.find((e) => e.form === m[1]);
        if (!eintrag || vergeben.has(eintrag.schluessel)) {
          /* Begriff schon vergeben: Rest des Textknotens weiter absuchen,
             sonst blockiert ein früher Treffer alles Nachfolgende. */
          const rest = kind.value.slice(m.index + m[1].length);
          if (rest) {
            knoten.children.splice(
              i + 1,
              0,
              { type: "text", value: rest },
            );
            kind.value = kind.value.slice(0, m.index + m[1].length);
          }
          continue;
        }

        vergeben.add(eintrag.schluessel);
        gesetzt++;

        const davor = kind.value.slice(0, m.index);
        const danach = kind.value.slice(m.index + m[1].length);
        const ersatz = [
          davor ? { type: "text", value: davor } : null,
          {
            type: "element",
            tagName: "a",
            properties: {
              href: eintrag.url,
              class: "begriff-link",
              rel: "noopener",
              title: `${eintrag.form} im Nachschlagewerk auf bitcoinaera.de`,
            },
            children: [{ type: "text", value: m[1] }],
          },
          danach ? { type: "text", value: danach } : null,
        ].filter(Boolean);

        knoten.children.splice(i, 1, ...ersatz);
        i += ersatz.length - 1;
        if (gesetzt >= MAX_LINKS) return;
      }
    };

    gehe(tree);
  };
}
