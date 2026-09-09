/**
 * Newsletter-Anmeldung.
 *
 * Cloudflare Pages liest /functions im Repo-Wurzelverzeichnis von
 * selbst aus. Der Astro-Adapter bleibt unangetastet, die Seite bleibt
 * statisch — nur dieser eine Pfad ist dynamisch.
 *
 * Die Kette: eigenes Formular → hierher → Brevo. Das Double-Opt-In
 * macht Brevo, wir speichern selbst gar nichts. Kein Provider-Embed
 * auf der Seite, also auch kein Drittanbieter-Skript beim Aufruf.
 *
 * Antwort ist eine Weiterleitung, kein JSON — damit funktioniert die
 * Anmeldung auch ohne JavaScript.
 *
 * Secret (im Cloudflare-Dashboard setzen, nie ins Repo):
 *   BREVO_API_KEY
 * Optional:
 *   BREVO_LISTE   — Listen-ID, Vorgabe 1
 *   BREVO_VORLAGE — ID der Double-Opt-In-Vorlage
 *   BREVO_WEITER  — Bestätigungsziel nach dem Klick in der Mail
 */

interface Env {
  BREVO_API_KEY?: string;
  BREVO_LISTE?: string;
  BREVO_VORLAGE?: string;
  BREVO_WEITER?: string;
}

/* Wer schneller als das absendet, hat nicht getippt. Zusammen mit dem
   Honigtopf reicht das gegen die üblichen Formular-Bots — Turnstile
   oder reCAPTCHA wären ein Drittanbieter-Skript auf jeder Seite mit
   Anmeldeblock, und das ist der Preis nicht wert, solange kein echter
   Spam auftritt. */
const MINDESTZEIT_MS = 2000;

const weiter = (url: URL, pfad: string, grund?: string) => {
  const ziel = new URL(pfad, url.origin);
  if (grund) ziel.searchParams.set("grund", grund);
  return Response.redirect(ziel.toString(), 303);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);

  let daten: FormData;
  try {
    daten = await request.formData();
  } catch {
    return weiter(url, "/newsletter/fehler/", "form");
  }

  const mail = String(daten.get("mail") ?? "").trim().toLowerCase();
  const quelle = String(daten.get("quelle") ?? "unbekannt").slice(0, 40);
  const honigtopf = String(daten.get("website") ?? "");
  const gestartet = Number(daten.get("gestartet") ?? 0);

  /* Ein Feld, das kein Mensch sieht. Wer es ausfüllt, ist keiner.
     Wir antworten trotzdem mit der Dankeseite — ein Bot, der eine
     Fehlermeldung bekommt, probiert es anders herum noch einmal. */
  if (honigtopf) return weiter(url, "/newsletter/danke/");

  if (!gestartet || Date.now() - gestartet < MINDESTZEIT_MS) {
    return weiter(url, "/newsletter/danke/");
  }

  /* Absichtlich grob. Wer eine Adresse mit ungewöhnlichem Aufbau hat,
     soll sich anmelden können; ob sie existiert, klärt ohnehin erst
     die Bestätigungsmail. */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) || mail.length > 254) {
    return weiter(url, "/newsletter/fehler/", "adresse");
  }

  if (!env.BREVO_API_KEY) {
    /* Kein Schlüssel gesetzt: Das ist ein Betriebsfehler, kein
       Nutzerfehler. Nicht so tun, als hätte es geklappt. */
    console.error("BREVO_API_KEY fehlt — Anmeldung nicht möglich.");
    return weiter(url, "/newsletter/fehler/", "technik");
  }

  const liste = Number(env.BREVO_LISTE ?? "1");
  const koerper: Record<string, unknown> = {
    email: mail,
    includeListIds: [liste],
    /* Brevo verschickt die Bestätigungsmail und trägt erst nach dem
       Klick ein. Wir bekommen die Adresse also nie in eine Liste,
       ohne dass jemand zugestimmt hat. */
    templateId: env.BREVO_VORLAGE ? Number(env.BREVO_VORLAGE) : undefined,
    redirectionUrl: env.BREVO_WEITER ?? new URL("/newsletter/bestaetigt/", url.origin).toString(),
    attributes: { QUELLE: quelle },
  };
  for (const k of Object.keys(koerper)) if (koerper[k] === undefined) delete koerper[k];

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(koerper),
    });

    /* 201 = Bestätigungsmail unterwegs. 204 = Adresse ist schon
       eingetragen; für den Absender ist das kein Fehler, und wir
       verraten ihm auch nicht, wer sonst noch angemeldet ist. */
    if (res.status === 201 || res.status === 204) return weiter(url, "/newsletter/danke/");

    const text = await res.text();
    console.error(`Brevo antwortete ${res.status}: ${text.slice(0, 300)}`);
    return weiter(url, "/newsletter/fehler/", "dienst");
  } catch (e) {
    console.error(`Brevo nicht erreichbar: ${String((e as Error).message ?? e)}`);
    return weiter(url, "/newsletter/fehler/", "dienst");
  }
};

/** GET auf diesen Pfad ist ein Versehen, kein Angriff. */
export const onRequestGet: PagesFunction = ({ request }) =>
  Response.redirect(new URL("/newsletter/", new URL(request.url).origin).toString(), 303);
