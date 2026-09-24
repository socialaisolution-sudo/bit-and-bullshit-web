/**
 * Welcher Leserreport gesperrt ist und welcher öffentlich.
 *
 * Dieselbe Mechanik wie beim Newsletter: Die Frist steht im Code und
 * läuft von selbst ab. Kein Schalter, den jemand umlegen muss — ein
 * Versprechen, das an einem Handgriff hängt, wird irgendwann
 * gebrochen.
 *
 * Der Reihe nach:
 *   die neuesten `HINTER_SCHLOSS` Reports liegen hinter dem Passwort,
 *   alles Ältere wird nach `FRIST_TAGE` öffentlich und indexierbar.
 *
 * Beides bewusst als einzelne Zahl, damit eine Änderung eine Zeile
 * ist und keine Suche.
 */

import { getCollection, type CollectionEntry } from "astro:content";

/** Wie viele der jüngsten Reports hinter dem Passwort bleiben. */
export const HINTER_SCHLOSS = 2;

/** Ab wann ein Report öffentlich wird, gerechnet ab Wochenbeginn. */
export const FRIST_TAGE = 21;

export type Report = CollectionEntry<"leserbereich">;

/**
 * Montag einer ISO-Kalenderwoche.
 *
 * ISO 8601: Die Woche mit dem ersten Donnerstag des Jahres ist KW 1.
 * Von Hand gerechnet statt mit einer Bibliothek — es ist eine
 * Funktion, und eine Abhängigkeit für ein Datum lohnt nicht.
 */
export function wochenbeginn(kw: string): Date {
  const [jahr, woche] = kw.split("-").map(Number);
  /* 4. Januar liegt immer in KW 1. */
  const vierter = new Date(Date.UTC(jahr, 0, 4));
  const wochentag = vierter.getUTCDay() || 7;
  const montagKw1 = new Date(vierter);
  montagKw1.setUTCDate(vierter.getUTCDate() - wochentag + 1);
  const montag = new Date(montagKw1);
  montag.setUTCDate(montagKw1.getUTCDate() + (woche - 1) * 7);
  return montag;
}

/** Wann dieser Report öffentlich wird. */
export function oeffentlichAb(kw: string): Date {
  const d = wochenbeginn(kw);
  d.setUTCDate(d.getUTCDate() + FRIST_TAGE);
  return d;
}

/** Alle Reports, neueste zuerst. */
export async function alleReports(): Promise<Report[]> {
  const alle = await getCollection("leserbereich");
  return alle.sort((a, b) => wochenbeginn(b.data.kw).getTime() - wochenbeginn(a.data.kw).getTime());
}

/**
 * Der Report, den der Leserbereich gerade zeigt: schlicht der
 * jüngste.
 *
 * Erst hing das an „Woche hat begonnen". Das war gut gemeint —
 * vorbereiten, ohne zu veroeffentlichen — und in der Praxis im Weg:
 * Wer am Donnerstag den Report fuer die kommende Woche ablegt, sieht
 * ihn dann bis Montag nicht. Vorbereiten geht auch, indem man die
 * Datei noch nicht pusht.
 *
 * Die Kalenderwoche bleibt Kennung und Grundlage der Frist, sie
 * steuert aber nicht mehr die Sichtbarkeit.
 */
export async function aktuellerReport(): Promise<Report | null> {
  return (await alleReports())[0] ?? null;
}

/**
 * Öffentlich ist ein Report, wenn die Frist um ist UND er nicht mehr
 * zu den jüngsten `HINTER_SCHLOSS` gehört.
 *
 * Die zweite Bedingung ist die wichtigere: Sie sorgt dafuer, dass
 * Abonnenten immer etwas haben, das nur sie sehen — auch wenn eine
 * Woche ausfaellt und die Frist allein den Bereich leerraeumen wuerde.
 */
export async function oeffentlicheReports(jetzt = new Date()): Promise<Report[]> {
  const alle = await alleReports();
  const gesperrt = new Set(alle.slice(0, HINTER_SCHLOSS).map((r) => r.id));
  return alle.filter((r) => !gesperrt.has(r.id) && oeffentlichAb(r.data.kw) <= jetzt);
}

/** Die Reports, die gerade nur hinter dem Passwort liegen. */
export async function gesperrteReports(jetzt = new Date()): Promise<Report[]> {
  const oeff = new Set((await oeffentlicheReports(jetzt)).map((r) => r.id));
  return (await alleReports()).filter((r) => !oeff.has(r.id));
}

/** Aus „Warum die alte Formel …" wird „warum-die-alte-formel-…". */
export function slugVon(titel: string): string {
  return titel
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** „KW 40 · 28. September 2026" für die Anzeige. */
export function wochenLabel(kw: string): string {
  const [, woche] = kw.split("-");
  const montag = wochenbeginn(kw);
  const datum = new Intl.DateTimeFormat("de-DE", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(montag);
  return `KW ${woche} · ab ${datum}`;
}
