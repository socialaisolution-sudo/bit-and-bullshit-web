/**
 * Passwortprüfung für den Leserbereich.
 *
 * Nimmt das Passwort entgegen, fragt beim Ampel-Worker nach und setzt
 * bei Erfolg ein Cookie. Mehr passiert nicht: kein Konto, keine
 * Registrierung, kein gespeichertes Passwort, keine Nutzerdaten.
 *
 * Das Cookie enthält die Kalenderwoche und eine Signatur darüber. Die
 * Signatur prüft die Zwischenschicht bei jedem Aufruf selbst — ohne
 * den Worker noch einmal zu fragen. Sonst hinge jeder Seitenaufruf an
 * einem zweiten Netzwerkweg.
 *
 * Antwort ist eine Weiterleitung, damit es ohne JavaScript geht.
 *
 * Secret (im Cloudflare-Dashboard setzen, nie ins Repo):
 *   LESER_SECRET — beliebige lange Zeichenkette, nur zum Signieren
 */

import { COOKIE_NAME, signieren } from "../_leser";

interface Env {
  LESER_SECRET?: string;
  AMPEL_URL?: string;
}

const WORKER = "https://bitcoin-ampel.social-ai-solution.workers.dev";

const weiter = (url: URL, pfad: string, kopf?: HeadersInit) =>
  new Response(null, { status: 303, headers: { location: new URL(pfad, url.origin).toString(), ...kopf } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);

  if (!env.LESER_SECRET) {
    console.error("LESER_SECRET fehlt — Leserbereich nicht nutzbar.");
    return weiter(url, "/leserbereich/?fehler=technik");
  }

  let passwort = "";
  try {
    const daten = await request.formData();
    passwort = String(daten.get("passwort") ?? "").trim();
  } catch {
    return weiter(url, "/leserbereich/?fehler=form");
  }
  if (!passwort) return weiter(url, "/leserbereich/?fehler=leer");

  let woche: string | null = null;
  try {
    const res = await fetch(`${env.AMPEL_URL ?? WORKER}/leserbereich/pruefen`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passwort }),
    });
    if (res.ok) woche = (await res.json<{ woche?: string }>()).woche ?? null;
  } catch (e) {
    console.error(`Ampel-Worker nicht erreichbar: ${String((e as Error).message ?? e)}`);
    return weiter(url, "/leserbereich/?fehler=dienst");
  }

  if (!woche) return weiter(url, "/leserbereich/?fehler=passwort");

  const wert = `${woche}.${await signieren(woche, env.LESER_SECRET)}`;
  /* Zehn Tage: Die Woche plus Puffer, damit niemand mitten im Lesen
     ausgesperrt wird. Danach steht das neue Passwort ohnehin in der
     nächsten Freitagsausgabe. */
  const cookie =
    `${COOKIE_NAME}=${wert}; Path=/; Max-Age=${10 * 24 * 3600}; ` +
    `HttpOnly; Secure; SameSite=Lax`;

  return weiter(url, "/leserbereich/", { "set-cookie": cookie });
};

/** Abmelden: Cookie löschen. */
export const onRequestGet: PagesFunction = ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("abmelden") === "1") {
    return weiter(url, "/leserbereich/", {
      "set-cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    });
  }
  return weiter(url, "/leserbereich/");
};
