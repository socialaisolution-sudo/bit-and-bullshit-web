/**
 * Rendert eine Ausgabe als E-Mail-HTML.
 *
 * Alles hier ist gegen die Eigenheiten von Mail-Programmen gebaut,
 * nicht gegen die von Browsern. Die Regeln, die das Layout erklären:
 *
 *   Tabellen, kein Flexbox und kein Grid — Outlook rendert mit einer
 *   Word-Engine und kennt beides nicht.
 *
 *   Inline-Styles, keine Klassen — viele Clients werfen den
 *   <style>-Block weg. Der Block oben enthält deshalb ausschliesslich
 *   Dinge, die verzichtbar sind (Media Query, Dark-Mode-Feinschliff).
 *   Fällt er raus, sieht die Mail schlechter aus, aber sie steht.
 *
 *   Keine Webfonts. Der Bit-&-Bullshit-Look entsteht über Versalien,
 *   Fettung und Sperrung in einem websicheren Stack.
 *
 *   Keine Hintergrundbilder für tragende Elemente. Farbige Flächen
 *   bekommen zusätzlich zum CSS ein bgcolor-Attribut, weil Outlook
 *   das zuverlässiger auswertet.
 *
 *   Farbe ist nie der einzige Informationsträger. Jede Stufe steht
 *   auch ausgeschrieben da — wer die Mail schwarzweiss ausdruckt oder
 *   deren Farben invertiert bekommt, liest dasselbe.
 */

import type { Ausgabe, Eingang, Textblock } from "./typen";
import { FARBTEXT, RUBRIK, STUFENTEXT } from "./typen";

/* ── Farben ───────────────────────────────────────────────────── */

const F = {
  grund: "#0F1115",
  /* Etwas heller als der Grund, damit Blöcke sich absetzen, ohne
     dass ein Rahmen nötig wäre. */
  flaeche: "#171A20",
  text: "#E9E7E1",
  leise: "#9A9C9E",
  linie: "#2A2E36",
  orange: "#FF7A1A",
  gruen: "#3E9E6B",
  gelb: "#C9922B",
  /* Aufgehellt von #C4462F am 10.09.2026. Der alte Ton lag auf der
     Flaeche bei 3,54:1 und damit unter der Schwelle 4,5:1 — und das
     ausgerechnet bei dem Wort, das diese Mail im Ernstfall sagen
     muss. Der neue liegt bei 4,92:1, im selben Farbton (9 Grad, das
     Orange liegt bei 25) und ist damit weiter unverwechselbar rot.
     Gerechnet in skripte/kontrast-pruefen.mjs. */
  rot: "#E85940",
} as const;

const AMPELFARBE: Record<string, string> = {
  gruen: F.gruen,
  gelb: F.gelb,
  rot: F.rot,
};

const STUFENFARBE: Record<string, string> = {
  ruhig: F.leise,
  erhoeht: F.gelb,
  extrem: F.rot,
  fehlt: F.leise,
};

const SCHRIFT =
  "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif";

/* ── Werkzeug ─────────────────────────────────────────────────── */

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const datumLang = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
};

/* ── Bausteine ────────────────────────────────────────────────── */

/**
 * Eine Zeile im Ampelblock.
 *
 * Der farbige Punkt ist Beiwerk. Die Aussage steht rechts als Wort.
 * Bei `fehlt` steht der Grund dabei — eine Kennzahl ohne Wert darf
 * nicht wie eine ruhige aussehen.
 */
const eingangZeile = (e: Eingang) => {
  const farbe = STUFENFARBE[e.stufe] ?? F.leise;
  const wort = STUFENTEXT[e.stufe];
  const kursiv = e.stufe === "fehlt";
  return `
              <tr>
                <td style="padding:9px 0;border-bottom:1px solid ${F.linie};font-family:${SCHRIFT};font-size:15px;line-height:20px;color:${F.text};">
                  ${esc(e.name)}
                </td>
                <td align="right" style="padding:9px 0;border-bottom:1px solid ${F.linie};font-family:${SCHRIFT};font-size:15px;line-height:20px;color:${farbe};${kursiv ? "font-style:italic;" : "font-weight:bold;"}white-space:nowrap;">
                  ${esc(wort)}${e.zusatz ? `<span style="color:${F.leise};font-weight:normal;font-style:normal;"> · ${esc(e.zusatz)}</span>` : ""}
                </td>
              </tr>`;
};

const textblock = (b: Textblock): string => {
  switch (b.art) {
    case "zwischentitel":
      return `
          <p style="margin:32px 0 10px;font-family:${SCHRIFT};font-size:13px;line-height:18px;letter-spacing:1.6px;text-transform:uppercase;font-weight:bold;color:${F.orange};">${esc(b.text)}</p>`;
    case "hervorhebung":
      /* Kein Kasten mit Rundung — eine Kante links, das reicht und
         überlebt jeden Client. */
      return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0;">
            <tr>
              <td width="3" bgcolor="${F.orange}" style="width:3px;background-color:${F.orange};font-size:0;line-height:0;">&nbsp;</td>
              <td style="padding:2px 0 2px 16px;font-family:${SCHRIFT};font-size:17px;line-height:26px;color:${F.text};font-weight:bold;">${esc(b.text)}</td>
            </tr>
          </table>`;
    case "liste":
      return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
            ${b.punkte
              .map(
                (p) => `<tr>
              <td width="18" valign="top" style="width:18px;padding:4px 0;font-family:${SCHRIFT};font-size:16px;line-height:25px;color:${F.orange};">&bull;</td>
              <td style="padding:4px 0;font-family:${SCHRIFT};font-size:16px;line-height:25px;color:${F.text};">${esc(p)}</td>
            </tr>`,
              )
              .join("\n            ")}
          </table>`;
    default:
      return `
          <p style="margin:0 0 18px;font-family:${SCHRIFT};font-size:16px;line-height:26px;color:${F.text};">${esc(b.text)}</p>`;
  }
};

/**
 * Rubrik 3, „Wie ich das sehe".
 *
 * Muss sich vom Fließtext darüber lösen, ohne wie ein weiterer
 * Zwischentitel auszusehen. Drei Mittel gleichzeitig, weil ein
 * einzelnes in irgendeinem Client verlorengeht:
 *
 *   eine eigene Fläche, als bgcolor-Attribut und nicht nur als CSS —
 *   Outlook ignoriert background-color am td schon mal,
 *   eine durchgehende Linie oben,
 *   eine Überschrift, die anders gebaut ist als die im Fließtext:
 *   gemischte Schreibweise, groß, in Textfarbe. Die Zwischentitel im
 *   Fließtext sind orange, in Versalien und gesperrt — verwechseln
 *   kann man das nicht.
 *
 * Darüber ein leiser Hinweis „Meinung". Er steht da, damit niemand
 * die Haltung für die Messung nimmt.
 */
const meinungBlock = (a: Ausgabe): string => {
  if (!a.meinung?.text?.length) return "";
  return `
        <tr>
          <td class="luft" style="padding:38px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${F.flaeche}" style="background-color:${F.flaeche};border-top:1px solid ${F.linie};">
              <tr>
                <td style="padding:26px 24px 8px;">
                  <p class="leise" style="margin:0 0 6px;font-family:${SCHRIFT};font-size:11px;line-height:16px;letter-spacing:1.8px;text-transform:uppercase;color:${F.leise};">
                    Meinung
                  </p>
                  <p class="txt" style="margin:0 0 16px;font-family:${SCHRIFT};font-size:21px;line-height:28px;font-weight:bold;color:${F.text};">
                    ${esc(RUBRIK.meinung)}
                  </p>
${a.meinung.text.map(textblock).join("\n")}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
};

/**
 * Rubrik 4, „Bullshit Burner".
 *
 * Der Markenblock. Er darf aus der Reihe fallen, und er soll es:
 * dicke orange Kante oben, die Rubrikmarke in Versalien und Orange,
 * am Ende das Urteil als Stempel in einem orangen Rahmen.
 *
 * Der Tonbruch zur Rubrik davor ist beabsichtigt und wird hier auch
 * optisch nicht abgemildert.
 *
 * Zur Lesbarkeit: Orange #FF7A1A auf der Fläche #171A20 liegt bei
 * 6,7:1 Kontrast — über der Schwelle 4,5:1 selbst für normalen Text,
 * und die Marke ist groß und fett. Nachgerechnet in
 * skripte/kontrast-pruefen.mjs, damit die Zahl nicht behauptet ist.
 */
const burnerBlock = (a: Ausgabe): string => {
  if (!a.burner?.text?.length) return "";
  return `
        <tr>
          <td class="luft" style="padding:30px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${F.flaeche}" style="background-color:${F.flaeche};border-top:3px solid ${F.orange};">
              <tr>
                <td style="padding:24px 24px 10px;">
                  <p class="marke" style="margin:0 0 18px;font-family:${SCHRIFT};font-size:15px;line-height:20px;letter-spacing:2.4px;text-transform:uppercase;font-weight:bold;color:${F.orange};">
                    ${esc(RUBRIK.burner.toUpperCase())}
                  </p>
${a.burner.text.map(textblock).join("\n")}
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 8px;">
                    <tr>
                      <td class="marke" style="padding:9px 18px;border:2px solid ${F.orange};font-family:${SCHRIFT};font-size:15px;line-height:20px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:${F.orange};">
                        ${esc(a.burner.urteil)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
};

/* ── Das Ganze ────────────────────────────────────────────────── */

export function mailHtml(a: Ausgabe): string {
  const farbe = a.ampel.farbe ? (AMPELFARBE[a.ampel.farbe] ?? F.leise) : F.leise;
  const farbwort = a.ampel.farbe ? (FARBTEXT[a.ampel.farbe] ?? a.ampel.farbe) : "keine Anzeige";

  return `<!doctype html>
<html lang="de" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!-- Sagt Gmail und Apple Mail, dass die Mail bereits dunkel ist. Ohne
     das drehen beide die Farben eigenmaechtig und machen aus hellem
     Text auf dunklem Grund hellen Text auf hellem Grund. -->
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(a.titel)}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  :root { color-scheme: dark; supported-color-schemes: dark; }
  /* Alles hier ist verzichtbar. Wirft ein Client den Block weg,
     sieht die Mail schlechter aus, aber sie steht. */
  a { color: ${F.orange}; }
  @media only screen and (max-width: 620px) {
    .huelle { width: 100% !important; }
    .luft { padding-left: 20px !important; padding-right: 20px !important; }
    .gross { font-size: 26px !important; line-height: 32px !important; }
  }
  /* Outlook.com im Dunkelmodus haengt data-ogsc an. Damit lassen sich
     die wenigen Stellen retten, an denen es sonst eigenmaechtig
     aufhellt. */
  [data-ogsc] .txt { color: ${F.text} !important; }
  [data-ogsc] .leise { color: ${F.leise} !important; }
  /* Rubrikmarke und Urteilsstempel des Burners. Outlook.com faerbt im
     Dunkelmodus eigenmaechtig um, und ausgerechnet dieser Block lebt
     von der Farbe. */
  [data-ogsc] .marke { color: ${F.orange} !important; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${F.grund};" bgcolor="${F.grund}">

<!-- Vorschautext. Steht in der Inbox neben dem Betreff und wird hier
     mit Leerzeichen aufgefuellt, damit kein Fussnotentext durchsickert. -->
<div style="display:none;font-size:1px;color:${F.grund};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${esc(a.anriss)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${F.grund}" style="background-color:${F.grund};">
  <tr>
    <td align="center" style="padding:0;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="huelle" style="width:600px;max-width:600px;">

        <!-- 1 · Kopf -->
        <tr>
          <td class="luft" style="padding:36px 40px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="font-family:${SCHRIFT};font-size:19px;line-height:24px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${F.text};" class="txt">
                  BULLSHIT<span style="color:${F.orange};">MELDER</span>
                </td>
                <td align="right" style="font-family:${SCHRIFT};font-size:12px;line-height:24px;color:${F.leise};" class="leise">
                  Nr.&nbsp;${a.nummer} &middot; ${esc(datumLang(a.datum))}
                </td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px;">
              <tr><td height="2" bgcolor="${F.orange}" style="height:2px;background-color:${F.orange};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p class="gross txt" style="margin:24px 0 0;font-family:${SCHRIFT};font-size:30px;line-height:36px;font-weight:bold;color:${F.text};">
              ${esc(a.titel)}
            </p>
          </td>
        </tr>

        <!-- 2 · Ampelblock.
             Die kritische Stelle. bgcolor zusaetzlich zum CSS, feste
             Breiten, kein Hintergrundbild. Und: Die Farbe steht immer
             auch als Wort da, damit sie nicht der einzige Traeger der
             Aussage ist. -->
        <tr>
          <td class="luft" style="padding:8px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${F.flaeche}" style="background-color:${F.flaeche};">
              <tr>
                <td style="padding:22px 22px 6px;">
                  <p class="leise" style="margin:0 0 12px;font-family:${SCHRIFT};font-size:11px;line-height:16px;letter-spacing:1.8px;text-transform:uppercase;color:${F.leise};">
                    Bitcoin-Ampel
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="14" bgcolor="${farbe}" style="width:14px;height:14px;background-color:${farbe};font-size:0;line-height:0;">&nbsp;</td>
                      <td style="padding-left:12px;font-family:${SCHRIFT};font-size:26px;line-height:30px;font-weight:bold;color:${farbe};">
                        ${esc(farbwort)}
                      </td>
                    </tr>
                  </table>
                  <p class="leise" style="margin:10px 0 0;font-family:${SCHRIFT};font-size:15px;line-height:22px;color:${F.leise};">
                    ${esc(a.ampel.begruendung)}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 22px 4px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${a.ampel.eingaenge.map(eingangZeile).join("\n")}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 22px 22px;">
                  ${
                    a.ampel.fundingTage != null
                      ? `<p style="margin:0;font-family:${SCHRIFT};font-size:15px;line-height:23px;color:${F.text};" class="txt">
                    <span style="font-size:22px;font-weight:bold;color:${F.orange};">${a.ampel.fundingTage}&nbsp;Tage</span><br>
                    ohne positiven Funding-Überschuss${a.ampel.fundingSeit ? ` (zuletzt ${esc(datumLang(a.ampel.fundingSeit))})` : ""}.
                    Die Kennzahl zählt derzeit nicht in die Farbe hinein.
                  </p>`
                      : `<p style="margin:0;font-family:${SCHRIFT};font-size:15px;line-height:23px;color:${F.leise};font-style:italic;" class="leise">
                    Zum Funding-Zähler liegt für diese Ausgabe kein Wert vor.
                  </p>`
                  }
                </td>
              </tr>
            </table>
            <p class="leise" style="margin:10px 0 0;font-family:${SCHRIFT};font-size:12px;line-height:18px;color:${F.leise};">
              Gemessen ${esc(datumLang(a.ampel.gemessen))}${a.ampel.regelversion ? ` &middot; Regelversion ${a.ampel.regelversion}` : ""} &middot;
              <a href="https://bitcoinaera.de/ampel/regeln/" style="color:${F.orange};text-decoration:underline;">Wie gerechnet wird</a>
            </p>
          </td>
        </tr>

        <!-- 3 · Fliesstext -->
        <tr>
          <td class="luft" style="padding:34px 40px 0;">
${a.text.map(textblock).join("\n")}
          </td>
        </tr>
${meinungBlock(a)}${burnerBlock(a)}

        <!-- 4 · Passwort. Deutlich abgesetzt, damit es beim
             Ueberfliegen gefunden wird — das ist der eine Grund,
             aus dem manche die Mail ueberhaupt oeffnen. -->
        <tr>
          <td class="luft" style="padding:34px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${F.flaeche}" style="background-color:${F.flaeche};border-top:2px solid ${F.orange};">
              <tr>
                <td align="center" style="padding:24px 22px;">
                  <p class="leise" style="margin:0 0 10px;font-family:${SCHRIFT};font-size:11px;line-height:16px;letter-spacing:1.8px;text-transform:uppercase;color:${F.leise};">
                    Leserbereich &middot; ${esc(a.passwortWoche)}
                  </p>
                  <p style="margin:0;font-family:${SCHRIFT};font-size:28px;line-height:34px;font-weight:bold;letter-spacing:1px;color:${F.orange};">
                    ${esc(a.passwort)}
                  </p>
                  <p class="leise" style="margin:12px 0 0;font-family:${SCHRIFT};font-size:14px;line-height:21px;color:${F.leise};">
                    <a href="https://bitandbullshit.com/leserbereich/" style="color:${F.orange};text-decoration:underline;">bitandbullshit.com/leserbereich</a><br>
                    Kein Konto, keine Anmeldung. Gilt bis Ende nächster Woche.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 5 · Fusszeile -->
        <tr>
          <td class="luft" style="padding:40px 40px 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td height="1" bgcolor="${F.linie}" style="height:1px;background-color:${F.linie};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <p class="leise" style="margin:22px 0 0;font-family:${SCHRIFT};font-size:12px;line-height:19px;color:${F.leise};">
              Der Bullshitmelder beschreibt einen Marktzustand. Er enthält keine
              Kauf- oder Verkaufsempfehlung, keine Kursprognose und keine
              Anlage-, Steuer- oder Rechtsberatung.
            </p>

            <p class="leise" style="margin:16px 0 0;font-family:${SCHRIFT};font-size:12px;line-height:19px;color:${F.leise};">
              Themenauswahl, Recherche, Faktenprüfung und redaktionelle
              Verantwortung liegen beim Autor. Für Textformulierung, Struktur
              und Layout kommen KI-gestützte Werkzeuge zum Einsatz.
            </p>

            <p class="leise" style="margin:16px 0 0;font-family:${SCHRIFT};font-size:12px;line-height:19px;color:${F.leise};">
              Denny Guhlmann &middot; Altendorfer Straße 28 &middot; 09113 Chemnitz<br>
              <a href="mailto:hello@bitandbullshit.com" style="color:${F.leise};text-decoration:underline;">hello@bitandbullshit.com</a>
            </p>

            <p class="leise" style="margin:16px 0 0;font-family:${SCHRIFT};font-size:12px;line-height:19px;color:${F.leise};">
              <a href="https://bitandbullshit.com/impressum/" style="color:${F.leise};text-decoration:underline;">Impressum</a> &middot;
              <a href="https://bitandbullshit.com/datenschutz/" style="color:${F.leise};text-decoration:underline;">Datenschutz</a> &middot;
              <a href="{{ unsubscribe }}" style="color:${F.leise};text-decoration:underline;">Abmelden</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ── Plaintext ────────────────────────────────────────────────── */

/**
 * Die Textfassung. Ohne sie steigt die Spam-Wahrscheinlichkeit
 * spürbar, und in manchen Clients ist sie das Einzige, was ankommt.
 *
 * Sie ist keine Notlösung: Dieselben Informationen in derselben
 * Reihenfolge, nur ohne Auszeichnung. Auch hier steht jede Stufe als
 * Wort — Farbe gibt es hier ohnehin nicht.
 */
export function mailText(a: Ausgabe): string {
  const linie = "=".repeat(58);
  const duenn = "-".repeat(58);
  const farbwort = a.ampel.farbe ? (FARBTEXT[a.ampel.farbe] ?? a.ampel.farbe) : "keine Anzeige";

  const zeilen: string[] = [
    "BULLSHITMELDER",
    `Nr. ${a.nummer} · ${datumLang(a.datum)}`,
    linie,
    "",
    a.titel.toUpperCase(),
    "",
    duenn,
    `BITCOIN-AMPEL: ${farbwort.toUpperCase()}`,
    a.ampel.begruendung,
    "",
  ];

  for (const e of a.ampel.eingaenge) {
    const wort = STUFENTEXT[e.stufe];
    zeilen.push(`  ${e.name.padEnd(26)} ${wort}${e.zusatz ? ` · ${e.zusatz}` : ""}`);
  }

  zeilen.push("");
  zeilen.push(
    a.ampel.fundingTage != null
      ? `  ${a.ampel.fundingTage} Tage ohne positiven Funding-Überschuss` +
          (a.ampel.fundingSeit ? ` (zuletzt ${datumLang(a.ampel.fundingSeit)}).` : ".") +
          "\n  Die Kennzahl zählt derzeit nicht in die Farbe hinein."
      : "  Zum Funding-Zähler liegt für diese Ausgabe kein Wert vor.",
  );
  zeilen.push("");
  zeilen.push(
    `  Gemessen ${datumLang(a.ampel.gemessen)}` +
      (a.ampel.regelversion ? ` · Regelversion ${a.ampel.regelversion}` : ""),
  );
  zeilen.push("  Wie gerechnet wird: https://bitcoinaera.de/ampel/regeln/");
  zeilen.push(duenn);
  zeilen.push("");

  /* Der Fliesstext und die beiden Meinungsrubriken laufen durch
     dieselbe Schleife — sonst driften vier fast gleiche Kopien
     auseinander, sobald jemand eine Blockart aendert. */
  const bloeckeSchreiben = (bloecke: Textblock[]) => {
    for (const b of bloecke) {
      if (b.art === "zwischentitel") {
        zeilen.push("", b.text.toUpperCase(), "");
      } else if (b.art === "hervorhebung") {
        /* Auch die Hervorhebung umbrechen. Eine Zeile mit 101 Zeichen
           wird in schmalen Textansichten hart abgeschnitten — und
           ausgerechnet die Hervorhebung ist der Satz, der ankommen
           soll. */
        zeilen.push("", umbrechen(b.text, 69).split("\n").map((z, i) => (i ? `   ${z}` : `>> ${z}`)).join("\n"), "");
      } else if (b.art === "liste") {
        for (const p of b.punkte) zeilen.push(`  - ${p}`);
        zeilen.push("");
      } else {
        zeilen.push(umbrechen(b.text, 72), "");
      }
    }
  };

  bloeckeSchreiben(a.text);

  /* Rubrik 3. In der Textfassung gibt es keine Flaeche und keine
     Farbe, also muss der Trenner die Arbeit machen: eine
     durchgehende Linie und der Hinweis „MEINUNG" darueber. Ohne das
     laese sich die Haltung nicht von der Messung unterscheiden, und
     das ist der ganze Zweck der Trennung. */
  if (a.meinung?.text?.length) {
    zeilen.push(duenn, "MEINUNG", RUBRIK.meinung.toUpperCase(), duenn, "");
    bloeckeSchreiben(a.meinung.text);
  }

  /* Rubrik 4. Doppelte Linie statt einfacher — der Block soll auch
     hier aus der Reihe fallen. Das Urteil steht als eigene Zeile in
     Versalien, weil die Fettschrift der HTML-Fassung in einer
     Textansicht nichts hinterlaesst. */
  if (a.burner?.text?.length) {
    zeilen.push(linie, RUBRIK.burner.toUpperCase(), linie, "");
    bloeckeSchreiben(a.burner.text);
    zeilen.push(`>>> ${a.burner.urteil.toUpperCase()} <<<`, "");
  }

  zeilen.push(
    linie,
    `LESERBEREICH · ${a.passwortWoche}`,
    "",
    `  Passwort: ${a.passwort}`,
    "  https://bitandbullshit.com/leserbereich/",
    "  Kein Konto, keine Anmeldung. Gilt bis Ende nächster Woche.",
    linie,
    "",
    umbrechen(
      "Der Bullshitmelder beschreibt einen Marktzustand. Er enthält keine " +
        "Kauf- oder Verkaufsempfehlung, keine Kursprognose und keine Anlage-, " +
        "Steuer- oder Rechtsberatung.",
      72,
    ),
    "",
    umbrechen(
      "Themenauswahl, Recherche, Faktenprüfung und redaktionelle Verantwortung " +
        "liegen beim Autor. Für Textformulierung, Struktur und Layout kommen " +
        "KI-gestützte Werkzeuge zum Einsatz.",
      72,
    ),
    "",
    "Denny Guhlmann · Altendorfer Straße 28 · 09113 Chemnitz",
    "hello@bitandbullshit.com",
    "",
    "Impressum:   https://bitandbullshit.com/impressum/",
    "Datenschutz: https://bitandbullshit.com/datenschutz/",
    "Abmelden:    {{ unsubscribe }}",
    "",
  );

  return zeilen.join("\n");
}

/** Weicher Zeilenumbruch auf Wortgrenzen. */
function umbrechen(text: string, breite: number): string {
  const woerter = text.split(/\s+/);
  const zeilen: string[] = [];
  let z = "";
  for (const w of woerter) {
    if (z && (z + " " + w).length > breite) {
      zeilen.push(z);
      z = w;
    } else {
      z = z ? `${z} ${w}` : w;
    }
  }
  if (z) zeilen.push(z);
  return zeilen.join("\n");
}

/** Betreffzeile. Kurz genug, dass mobil nichts abgeschnitten wird. */
export const mailBetreff = (a: Ausgabe) => `Bullshitmelder #${a.nummer}: ${a.titel}`;
