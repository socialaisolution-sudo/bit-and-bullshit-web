/**
 * Gemeinsames Handwerkszeug für das Türschloss.
 *
 * Die Signatur ist ein HMAC über die Kalenderwoche. Damit kann die
 * Zwischenschicht ein Cookie ohne Netzwerkweg prüfen, und niemand
 * kann sich eins bauen, ohne das Secret zu kennen.
 *
 * Bewusst kein Nutzerbezug im Cookie: Es steht nur drin, für welche
 * Woche jemand das Passwort kannte. Wer, wissen wir nicht und wollen
 * wir nicht wissen.
 */

export const COOKIE_NAME = "bb_leser";

const hex = (puffer: ArrayBuffer) =>
  [...new Uint8Array(puffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function signieren(inhalt: string, secret: string): Promise<string> {
  const schluessel = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", schluessel, new TextEncoder().encode(inhalt));
  return hex(sig).slice(0, 32);
}

/** Zeitkonstanter Vergleich. */
function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** ISO-Kalenderwoche, identisch zur Rechnung im Worker. */
export function wochenschluessel(jetzt = Date.now()): string {
  const d = new Date(jetzt);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const anfang = Date.UTC(d.getUTCFullYear(), 0, 1);
  const woche = Math.ceil(((d.getTime() - anfang) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(woche).padStart(2, "0")}`;
}

/**
 * Prüft das Cookie. Gültig ist die laufende Woche und die davor —
 * wer Sonntagabend liest, soll nicht Montagfrüh vor der Tür stehen.
 */
export async function cookiePruefen(
  cookieKopf: string | null,
  secret: string,
): Promise<boolean> {
  if (!cookieKopf || !secret) return false;
  const roh = cookieKopf
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  if (!roh) return false;

  const [woche, sig] = roh.slice(COOKIE_NAME.length + 1).split(".");
  if (!woche || !sig) return false;

  const jetzt = wochenschluessel();
  const vorwoche = wochenschluessel(Date.now() - 7 * 24 * 3600 * 1000);
  if (woche !== jetzt && woche !== vorwoche) return false;

  return gleich(sig, await signieren(woche, secret));
}
