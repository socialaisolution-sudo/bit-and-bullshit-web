// Wiesn-Maß-Index: Daten und Helfer.
// Die JSON-Datei schreibt Trinity monatlich neu (~/trinity/web/indizes.py):
// Maßpreis = Landeshauptstadt München (Open Data), BTC = Bitstamp-Schlusskurs 30.09. ÷ EZB-Referenzkurs.
import daten from "../data/wiesn-mass-index.json";

export type Jahr = {
  jahr: number;
  euro: number;
  quelle?: string;
  bier_index: number | null;
  lohn_index: number | null;
  btc_eur?: number;
  sats?: number;
};

export const WIESN = daten as { name: string; erzeugt: string; quellen: { text: string; url: string; stand?: string }[]; jahre: Jahr[] };
export const JAHRE = WIESN.jahre;
export const ERSTES = JAHRE[0];
export const LETZTES = JAHRE[JAHRE.length - 1];
export const MIT_SATS = JAHRE.filter((j) => j.sats);
export const SATS_MAX = MIT_SATS.reduce((a, b) => ((b.sats ?? 0) > (a.sats ?? 0) ? b : a));

export const euro = (x: number) => x.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
export const sats = (x: number) =>
  x >= 1_000_000
    ? (x / 1_000_000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Mio. Sats"
    : x.toLocaleString("de-DE") + " Sats";

/** Wiesn-Teuerung gegen amtliche Bier-Teuerung über denselben Zeitraum (erstes Jahr mit Bierindex bis letztes). */
export function wiesnGegenAmtlich() {
  const mit = JAHRE.filter((j) => j.bier_index);
  const a = mit[0];
  const z = mit[mit.length - 1];
  return {
    von: a.jahr,
    bis: z.jahr,
    wiesn: Math.round((z.euro / a.euro - 1) * 100),
    amtlich: Math.round((z.bier_index! / a.bier_index! - 1) * 100),
    lohn: a.lohn_index && z.lohn_index ? Math.round((z.lohn_index / a.lohn_index - 1) * 100) : null,
  };
}
