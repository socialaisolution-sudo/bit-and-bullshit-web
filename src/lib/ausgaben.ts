/**
 * Welche Ausgaben öffentlich sind — an einer Stelle entschieden.
 *
 * Auf der Anmeldeseite steht: „Die Inhalte erscheinen 8 bis 12 Wochen
 * später auch öffentlich." Das ist ein Versprechen. Ein Versprechen,
 * das an einem Handgriff hängt, den jemand vergessen kann, wird
 * gebrochen — deshalb entscheidet das Datum in der Ausgabe und nicht
 * ein Schalter.
 *
 * Umgekehrt gilt dasselbe: Eine Ausgabe, die noch nicht verschickt
 * ist, darf nicht im Archiv stehen. `draft` deckt das ab.
 */
import { getCollection, type CollectionEntry } from "astro:content";

export type Ausgabeneintrag = CollectionEntry<"newsletter">;

/** Stichtag. Beim Bauen ausgewertet, nicht beim Aufruf. */
const heute = () => new Date();

export function istOeffentlich(e: Ausgabeneintrag, stichtag = heute()): boolean {
  if (e.data.draft) return false;
  return e.data.oeffentlichAb.getTime() <= stichtag.getTime();
}

/** Alle öffentlichen Ausgaben, neueste zuerst. */
export async function oeffentlicheAusgaben(): Promise<Ausgabeneintrag[]> {
  const alle = await getCollection("newsletter");
  return alle
    .filter((e) => istOeffentlich(e))
    .sort((a, b) => b.data.nummer - a.data.nummer);
}

/**
 * Ausgaben, die geschrieben, aber noch gesperrt sind. Nur die Zahl
 * wird gezeigt, nicht der Inhalt — „drei Ausgaben warten" ist ein
 * ehrlicher Hinweis, kein Teaser mit Inhalt.
 */
export async function gesperrteAusgaben(): Promise<number> {
  const alle = await getCollection("newsletter");
  return alle.filter((e) => !e.data.draft && !istOeffentlich(e)).length;
}

export const datumLang = (d: Date) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);

/** Aus Dateiname `001-funding-verstummt` wird `funding-verstummt`. */
export const slugVon = (e: Ausgabeneintrag) => e.id.replace(/^\d+-/, "");
