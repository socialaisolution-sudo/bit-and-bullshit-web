import daten from "../data/aenderungen.json";

/**
 * Erst- und Änderungsdatum einer Seite, gemessen am sichtbaren Text.
 *
 * Erzeugt wird die Datei beim lokalen Build aus der Git-Historie
 * (plugins/stand-aus-git.mjs), gelesen wird sie auch auf Cloudflares
 * flachem Klon, der die Historie gar nicht kennt.
 *
 * Wo kein Datum vorliegt, kommt keins zurück. Ein geschätztes Datum wäre
 * schlimmer als keins: Ein falsches Frischesignal wird genau dann nicht
 * mehr geglaubt, wenn wirklich überarbeitet wurde.
 */
type Stand = { geaendert?: string; erstellt?: string };

const dateien: Record<string, Stand> =
  (daten as { fassung?: number; dateien?: Record<string, Stand> }).fassung === 2
    ? ((daten as { dateien: Record<string, Stand> }).dateien ?? {})
    : {};

export function stand(quelle: string): Stand {
  return dateien[quelle] ?? {};
}

/**
 * Nur das Erstdatum. Für Seiten, die aus einem Template entstehen
 * (Comics), lässt sich kein Änderungsdatum sauber messen: Es gibt keinen
 * Fließtext, den man vom Beiwerk trennen könnte, und schon eine
 * Änderung an der Auszeichnung würde die Seite als überarbeitet melden.
 * Dann lieber kein Datum als ein falsches.
 */
export function erstDatum(quelle: string): { datePublished?: string } {
  const s = stand(quelle);
  return s.erstellt ? { datePublished: s.erstellt } : {};
}

/** Die beiden Datumsfelder für schema.org/Article — oder gar nichts. */
export function artikelDaten(quelle: string): {
  datePublished?: string;
  dateModified?: string;
} {
  const s = stand(quelle);
  return {
    ...(s.erstellt ? { datePublished: s.erstellt } : {}),
    ...(s.geaendert ? { dateModified: s.geaendert } : {}),
  };
}
