/**
 * Die Form einer Ausgabe — getrennt vom Rendern.
 *
 * Diese Datei beschreibt, WAS in einer Ausgabe steht, nicht wie es
 * aussieht. Der Grund ist Etappe 6: Später kommt eine Content
 * Collection unter src/content/newsletter/, aus der sowohl die
 * Archivseite als auch dieses Mail-Template gespeist werden. Wer die
 * Struktur erst dann trennt, schreibt das Template zweimal.
 *
 * Der Ampelstand wird beim Erstellen der Ausgabe EINGEFROREN, nicht
 * live geholt. Eine Mail, die dienstags gelesen wird, soll den Stand
 * vom Freitag zeigen — sonst behauptet die Ausgabe etwas, das mit
 * ihrem Text nicht mehr zusammenpasst.
 */

/** Wie eine Kennzahl in der Ausgabe steht. */
export type Stufe = "ruhig" | "erhoeht" | "extrem" | "fehlt";

export interface Eingang {
  /** Ausgeschrieben, wie er in der Mail steht. */
  name: string;
  stufe: Stufe;
  /**
   * Ein kurzer Zusatz — bei `fehlt` der Grund, sonst optional der
   * Wert. Fehlt er, steht nur die Stufe da.
   *
   * Was fehlt, wird nicht als Erfolg getarnt: Eine Kennzahl ohne Wert
   * erscheint als „kein Wert" mit Begründung, nie als „ruhig".
   */
  zusatz?: string;
}

export interface Ampelstand {
  farbe: "gruen" | "gelb" | "rot" | null;
  /** Ein Satz. Steht unter der Farbe. */
  begruendung: string;
  eingaenge: Eingang[];
  /** Tage seit dem letzten positiven Funding-Überschuss. */
  fundingTage: number | null;
  fundingSeit: string | null;
  /** Wann gemessen. ISO-Datum, wird für die Mail formatiert. */
  gemessen: string;
  regelversion: number | null;
}

/** Ein Absatzblock im Fließteil. */
export type Textblock =
  | { art: "absatz"; text: string }
  | { art: "zwischentitel"; text: string }
  | { art: "hervorhebung"; text: string }
  | { art: "liste"; punkte: string[] };

/**
 * Die Namen der beiden Meinungsrubriken.
 *
 * Konstanten, keine Frontmatter-Felder. Eine Rubrik, deren Name je
 * Ausgabe wechselt, ist keine Rubrik — der Leser soll sie
 * wiedererkennen, ohne sie zu lesen. Sie stehen hier und nicht im
 * Mail-Template, weil die Archivseite dieselben Namen braucht.
 */
export const RUBRIK = {
  meinung: "Wie ich das sehe",
  burner: "Bullshit Burner",
} as const;

/**
 * „Wie ich das sehe" — Haltung, erste Person.
 *
 * Getrennt vom Fließtext, weil Messung und Meinung nicht verschwimmen
 * dürfen. Verschwimmen sie, beschädigt die Meinung die
 * Glaubwürdigkeit der Messung — und die Messung ist das Kapital.
 */
export interface Meinung {
  text: Textblock[];
}

/**
 * „Bullshit Burner" — eine Behauptung, an den Zahlen geprüft.
 *
 * `urteil` ist ein eigenes Feld und kein Teil des Textes. Grund: Der
 * Markdown-Parser ebnet Fettschrift zu reinem Text ein, ein
 * `**Verbrannt.**` am Ende käme also unauffällig als Absatz heraus.
 * Und es ist ohnehin ein wiederkehrendes Bauteil der Rubrik, kein
 * Prosatext — es gehört gesetzt, nicht geschrieben.
 */
export interface Burner {
  text: Textblock[];
  /** Der Stempel am Ende. In der Regel „Verbrannt." */
  urteil: string;
}

export interface Ausgabe {
  nummer: number;
  /** ISO-Datum des Versands. */
  datum: string;
  /** Die Zeile im Kopf, unter der Marke. */
  titel: string;
  /** Steht im Betreff und als Vorschautext. */
  anriss: string;
  ampel: Ampelstand;
  /** Rubrik 2, „Die Auswertung". Der Fließtext aus dem Markdown-Körper. */
  text: Textblock[];
  /** Rubrik 3. Fehlt sie, entfällt der Block ganz. */
  meinung?: Meinung;
  /** Rubrik 4. Fehlt sie, entfällt der Block ganz. */
  burner?: Burner;
  /** Passwort der Woche für den Leserbereich. */
  passwort: string;
  /** Für welche Kalenderwoche es gilt, ausgeschrieben. */
  passwortWoche: string;
}

export const FARBTEXT: Record<string, string> = {
  gruen: "Grün",
  gelb: "Gelb",
  rot: "Rot",
};

export const STUFENTEXT: Record<Stufe, string> = {
  ruhig: "ruhig",
  erhoeht: "erhöht",
  extrem: "im Extrem",
  fehlt: "kein Wert",
};
