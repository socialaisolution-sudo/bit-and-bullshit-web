/**
 * Markdown einer Ausgabe in die Blöcke übersetzen, die das
 * Mail-Template kennt.
 *
 * Warum von Hand und nicht mit einer Bibliothek: Das Mail-Template
 * kennt genau vier Blockarten, und eine Markdown-Bibliothek würde
 * dreissig weitere anbieten, die dort nicht darstellbar sind. Wer
 * eine Tabelle in eine Ausgabe schreibt, soll das beim Rendern
 * merken und nicht beim Testversand.
 *
 * Unterstützt wird deshalb bewusst wenig:
 *
 *   ## Titel      → Zwischentitel
 *   > Satz        → Hervorhebung
 *   - Punkt       → Liste
 *   Alles andere  → Absatz
 *
 * Inline-Auszeichnung (fett, kursiv, Links) wird zu reinem Text
 * eingeebnet. Im Mail-Kontext ist das die ehrlichere Lösung: Links
 * mitten im Fliesstext gehen in Textfassungen ohnehin verloren, und
 * halb gerendertes Markdown sähe aus wie ein Fehler.
 */

import type { Textblock } from "./typen";

/** `**fett**`, `_kursiv_`, `[Text](url)` → nackter Text. */
function einebnen(zeile: string): string {
  return zeile
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function zuBloecken(markdown: string): Textblock[] {
  const bloecke: Textblock[] = [];
  let absatz: string[] = [];
  let liste: string[] = [];
  let zitat: string[] = [];

  const absatzSchliessen = () => {
    if (absatz.length) {
      bloecke.push({ art: "absatz", text: einebnen(absatz.join(" ")) });
      absatz = [];
    }
  };
  const listeSchliessen = () => {
    if (liste.length) {
      bloecke.push({ art: "liste", punkte: liste.map(einebnen) });
      liste = [];
    }
  };
  /* Ein Zitat läuft über mehrere Zeilen — jede für sich wäre eine
     eigene Hervorhebung, und der Satz stünde dann zerrissen in der
     Mail. Fiel beim ersten Durchlauf auf. */
  const zitatSchliessen = () => {
    if (zitat.length) {
      bloecke.push({ art: "hervorhebung", text: einebnen(zitat.join(" ")) });
      zitat = [];
    }
  };
  const alleSchliessen = () => {
    absatzSchliessen();
    listeSchliessen();
    zitatSchliessen();
  };

  for (const roh of markdown.split("\n")) {
    const z = roh.trim();

    if (!z) {
      alleSchliessen();
      continue;
    }
    if (/^#{2,6}\s+/.test(z)) {
      alleSchliessen();
      bloecke.push({ art: "zwischentitel", text: einebnen(z.replace(/^#{2,6}\s+/, "")) });
      continue;
    }
    if (/^>\s?/.test(z)) {
      absatzSchliessen();
      listeSchliessen();
      zitat.push(z.replace(/^>\s?/, ""));
      continue;
    }
    zitatSchliessen();
    if (/^[-*]\s+/.test(z)) {
      absatzSchliessen();
      liste.push(z.replace(/^[-*]\s+/, ""));
      continue;
    }
    /* Eine einzelne Raute wäre eine H1 — die steht schon als `titel`
       im Frontmatter, hier wäre sie doppelt. */
    if (/^#\s+/.test(z)) {
      throw new Error(
        "Ausgabe enthält eine H1 (# …). Der Titel steht im Frontmatter; " +
          "im Text bitte ## für Zwischentitel verwenden.",
      );
    }

    listeSchliessen();
    absatz.push(z);
  }

  alleSchliessen();
  return bloecke;
}
