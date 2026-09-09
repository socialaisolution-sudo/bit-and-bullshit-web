/**
 * Setzt eine Marke nach rund 40 % des Fließtexts.
 *
 * Der Anmeldeblock soll mitten im Text stehen, nicht darunter — dort
 * liest jemand noch, statt schon weiterzuscrollen. Wo genau „mitten“
 * ist, kann kein Autor je Artikel entscheiden wollen, also rechnet
 * es der Build aus.
 *
 * Gezählt werden Absätze, nicht Zeichen. Ein Artikel mit fünf langen
 * und zehn kurzen Absätzen soll die Marke dort bekommen, wo der
 * Leser gefühlt in der Mitte ist, und das hängt an der Zahl der
 * Blöcke, nicht an ihrer Länge.
 *
 * Zwei Sicherungen:
 *   - unter MINDEST_ABSAETZE passiert gar nichts. In einem Text mit
 *     vier Absätzen gibt es kein Drinnen.
 *   - die Marke landet nie unmittelbar vor einer Überschrift, sonst
 *     trennt sie eine Überschrift von ihrem Absatz.
 */

const MINDEST_ABSAETZE = 8;
const ANTEIL = 0.4;
const UEBERSCHRIFT = new Set(["h2", "h3", "h4"]);

export default function rehypeAnmeldeplatz() {
  return (tree) => {
    const kinder = tree.children ?? [];
    const absaetze = kinder
      .map((k, i) => (k.type === "element" && k.tagName === "p" ? i : -1))
      .filter((i) => i >= 0);

    if (absaetze.length < MINDEST_ABSAETZE) return;

    let ziel = absaetze[Math.floor(absaetze.length * ANTEIL)];

    /* Nicht zwischen Überschrift und zugehörigen Absatz. Lieber einen
       Block später als eine zerrissene Gliederung. */
    while (
      ziel + 1 < kinder.length &&
      kinder[ziel + 1]?.type === "element" &&
      UEBERSCHRIFT.has(kinder[ziel + 1].tagName)
    ) {
      const naechster = absaetze.find((i) => i > ziel + 1);
      if (naechster === undefined) return;
      ziel = naechster;
    }

    kinder.splice(ziel + 1, 0, {
      type: "element",
      tagName: "div",
      properties: { "data-anmeldeplatz": "" },
      children: [],
    });
  };
}
