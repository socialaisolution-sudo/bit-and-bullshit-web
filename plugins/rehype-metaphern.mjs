import fs from "node:fs";

/**
 * Verlinkt Bilder aus dem Metaphern-Register im Fließtext.
 *
 * Gegenstueck zu rehype-begriffe.mjs, aber mit anderer Quelle und
 * strengerem Budget: Fachbegriffe schlaegt man nach, ein Denkbild liest
 * man ganz. Deshalb hoechstens MAX_LINKS pro Seite.
 *
 *   - nur das ERSTE Vorkommen je Metapher und Text
 *   - hoechstens MAX_LINKS Metaphern pro Seite
 *   - nie in Ueberschriften, Zitaten, Code oder in einem bestehenden Link
 *   - nie auf einer Metapher-Seite selbst (die verlinken sich ueber
 *     „IM EINSATZ“ von Hand)
 *   - nie Entwuerfe, die haetten noch keine Zielseite
 *
 * Getroffen wird nach den `ausloeser`-Listen im Frontmatter der Eintraege.
 * Das ist Absicht: eine unscharfe Texterkennung wuerde „Rakete“ auch dort
 * verlinken, wo jemand die naechste Meme-Coin-Rakete sucht — und das ist
 * ein anderes Bild als das hier gemeinte.
 */

const MAX_LINKS = 2;
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

const verzeichnis = new URL("../src/content/metaphern/", import.meta.url);

/* Nur die drei Felder, die hier gebraucht werden. Ein YAML-Parser waere
   fuer drei Zeilen zu viel Abhaengigkeit — das Format steht im Schema
   und ist damit unter Kontrolle. */
function liesEintrag(datei) {
  const roh = fs.readFileSync(new URL(datei, verzeichnis), "utf-8");
  const fm = roh.split(/^---$/m)[1] ?? "";
  const titel = fm.match(/^title:\s*['"](.+)['"]\s*$/m)?.[1] ?? "";
  const entwurf = /^draft:\s*true\s*$/m.test(fm);
  const block = fm.match(/^ausloeser:\n((?:[ \t]+- .*\n)+)/m)?.[1] ?? "";
  const ausloeser = [...block.matchAll(/-\s*['"](.+)['"]/g)].map((m) => m[1]);
  return { slug: datei.replace(/\.md$/, ""), titel, entwurf, ausloeser };
}

const eintraege = fs
  .readdirSync(verzeichnis)
  .filter((f) => f.endsWith(".md"))
  .map(liesEintrag)
  .filter((e) => !e.entwurf);

/* Laengste Phrase zuerst, sonst frisst „Kartenhaus“ das
   „Bitcoin-Kartenhaus“ weg, bevor es drankommt. */
const phrasen = eintraege
  .flatMap((e) =>
    e.ausloeser.map((form) => ({
      form,
      slug: e.slug,
      titel: e.titel,
      url: `/metaphern/${e.slug}/`,
    })),
  )
  .sort((a, b) => b.form.length - a.form.length);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Wortgrenzen von Hand, wie bei den Begriffen: \b kennt weder Umlaute
   noch den Bindestrich in „Bitcoin-Kartenhaus“. Die Phrasen selbst
   duerfen Komma und Leerzeichen enthalten. */
const WORT = "A-Za-zÄÖÜäöüß0-9";
const muster = phrasen.length
  ? new RegExp(
      `(?<![${WORT}\\-])(${phrasen.map((p) => escape(p.form)).join("|")})(?![${WORT}\\-])`,
      "i",
    )
  : null;

export default function rehypeMetaphern() {
  return (tree, file) => {
    if (!muster) return;

    /* Auf den Eintragsseiten selbst wird nicht verlinkt. */
    const pfad = file?.history?.[0] ?? file?.path ?? "";
    if (pfad.replace(/\\/g, "/").includes("/content/metaphern/")) return;

    const vergeben = new Set();
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

        const treffer = phrasen.find(
          (p) => p.form.toLowerCase() === m[1].toLowerCase(),
        );

        if (!treffer || vergeben.has(treffer.slug)) {
          /* Metapher schon vergeben: Rest des Textknotens weiter absuchen,
             sonst blockiert ein frueher Treffer alles Nachfolgende. */
          const rest = kind.value.slice(m.index + m[1].length);
          if (rest) {
            knoten.children.splice(i + 1, 0, { type: "text", value: rest });
            kind.value = kind.value.slice(0, m.index + m[1].length);
          }
          continue;
        }

        vergeben.add(treffer.slug);
        gesetzt++;

        const davor = kind.value.slice(0, m.index);
        const danach = kind.value.slice(m.index + m[1].length);
        const ersatz = [
          davor ? { type: "text", value: davor } : null,
          {
            type: "element",
            tagName: "a",
            properties: {
              href: treffer.url,
              class: "metapher-link",
              title: `${treffer.titel} — im Metaphern-Register`,
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

/* Fuer die Metaphern-Wache in astro.config.mjs. */
export { eintraege as metapherEintraege, phrasen as metapherPhrasen };
