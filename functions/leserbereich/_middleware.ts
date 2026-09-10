/**
 * Das Türschloss vor /leserbereich/.
 *
 * Cloudflare Pages ruft diese Zwischenschicht für jeden Pfad unter
 * /leserbereich/ auf. Passt das Cookie, wird die statische Seite
 * ausgeliefert. Passt es nicht, kommt die Anmeldeseite — mit
 * HTTP 401, damit auch Suchmaschinen wissen, dass hier nichts zu
 * holen ist.
 *
 * Gesperrtes rankt nicht, deshalb liegt hier ausschließlich
 * Tagesaktuelles. Alles, was dauerhaft nachschlagbar ist — das
 * Regelwerk, die Kennzahl-Erklärungen, die Trefferbilanz — steht
 * öffentlich auf bitcoinaera.de und bleibt dort.
 */

import { cookiePruefen } from "../_leser";

interface Env {
  LESER_SECRET?: string;
}

const GRUENDE: Record<string, string> = {
  passwort: "Das Passwort stimmt nicht. Es steht in der aktuellen Ausgabe des Bullshitmelders.",
  leer: "Da war kein Passwort drin.",
  dienst: "Die Prüfung ist gerade nicht erreichbar. Probier es in ein paar Minuten noch einmal.",
  technik: "Bei uns fehlt eine Einstellung. Wir wissen davon.",
  form: "Das Formular kam unvollständig an.",
};

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env, next } = ctx;
  const url = new URL(request.url);

  if (await cookiePruefen(request.headers.get("Cookie"), env.LESER_SECRET ?? "")) {
    return next();
  }

  const grund = url.searchParams.get("fehler");
  const meldung = grund ? (GRUENDE[grund] ?? "Das hat nicht geklappt.") : null;

  return new Response(anmeldeSeite(meldung), {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      /* Nicht zwischenspeichern — sonst liefert der Edge-Cache die
         Anmeldeseite an jemanden aus, der längst ein Cookie hat. */
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
};

const anmeldeSeite = (meldung: string | null) => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Leserbereich — Bit &amp; Bullshit</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #0d0d0d; color: #f4f1ea; padding: 1.5rem;
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  main { width: 100%; max-width: 26rem; }
  .kicker { font-size: .7rem; letter-spacing: .3em; color: #f7931a; margin: 0 0 .6rem; text-transform: uppercase; }
  h1 { font-size: 1.9rem; line-height: 1.15; margin: 0 0 .9rem; }
  p { margin: 0 0 1rem; opacity: .85; }
  .fehler { border-left: 3px solid #e2705f; padding: .6rem .9rem; background: rgba(226,112,95,.08); opacity: 1; }
  form { display: flex; flex-wrap: wrap; gap: .6rem; margin: 1.4rem 0 0; }
  input {
    flex: 1 1 12rem; min-width: 0; padding: .75rem .9rem; font: inherit;
    color: inherit; background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.25);
  }
  input:focus-visible { outline: 2px solid #f7931a; outline-offset: 2px; }
  button {
    padding: .75rem 1.5rem; border: 0; background: #f7931a; color: #111;
    font: inherit; cursor: pointer;
  }
  .klein { font-size: .82rem; opacity: .6; margin-top: 1.6rem; }
  a { color: #f7931a; }
</style>
</head>
<body>
<main>
  <p class="kicker">// Leserbereich</p>
  <h1>Passwort der Woche</h1>
  ${meldung ? `<p class="fehler">${meldung}</p>` : ""}
  <p>
    Es steht in der aktuellen Ausgabe des Bullshitmelders, ganz unten. Jede Woche ein
    neues — das der Vorwoche gilt noch ein paar Tage weiter.
  </p>

  <form method="POST" action="/api/leserbereich">
    <label class="sr-only" for="pw" style="position:absolute;left:-9999px">Passwort</label>
    <input id="pw" name="passwort" type="text" autocomplete="off" autocapitalize="none"
           spellcheck="false" placeholder="wort-wort-00" required autofocus>
    <button type="submit">Rein</button>
  </form>

  <p class="klein">
    Kein Konto, keine Anmeldung, keine gespeicherten Daten — nur dieses eine
    Passwort. <a href="/newsletter/">Bullshitmelder abonnieren</a> ·
    <a href="https://bitcoinaera.de/ampel/">die Ampel ist öffentlich</a>
  </p>
</main>
</body>
</html>`;
