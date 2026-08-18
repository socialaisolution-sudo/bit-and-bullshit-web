/**
 * Die Themen-Cluster der Snippets — die einzige Ordnung der Seite.
 *
 * Sie ersetzt seit 08/2026 die frühere Dreiteilung entlarven/learning/
 * denkfehler. Eine Ordnung statt zweier: Leser und Google sollen dieselbe
 * Einteilung sehen, sonst konkurrieren zwei halbleere Systeme miteinander.
 *
 * Jeder Eintrag speist drei Stellen: die Übersicht auf /snippets, die eigene
 * Seite unter /kategorie/<slug>/ und den Kicker über jedem Artikel. Deshalb
 * stehen Titel und Einleitung hier und nicht in den Templates.
 *
 * `lede` läuft auf /snippets, `intro` auf der Kategorie-Seite — bewusst
 * unterschiedlich formuliert, sonst stünde derselbe Absatz auf zwei
 * indexierten Seiten.
 */
export type KategorieSchluessel =
  | "grundwissen"
  | "geld-inflation"
  | "staat-steuern"
  | "betrug-maschen"
  | "markt-mythen";

export interface Kategorie {
  key: KategorieSchluessel;
  kicker: string;
  /** Kurzform für Kacheln und Breadcrumbs. */
  titel: string;
  /** H1 der Kategorie-Seite, trägt das Oberthema-Keyword. */
  h1: string;
  /** Meta-Description der Kategorie-Seite. */
  description: string;
  /** Zwei Sätze auf /snippets. */
  lede: string;
  /** Eigener Einleitungstext auf der Kategorie-Seite. */
  intro: string;
  toneClass: string;
}

export const KATEGORIEN: Kategorie[] = [
  {
    key: "grundwissen",
    kicker: "// GRUNDWISSEN",
    titel: "Bitcoin-Grundwissen",
    h1: "Bitcoin einfach erklärt",
    description:
      "Bitcoin-Grundwissen ohne Fachchinesisch: Halving, Blockchain, Seed-Phrase, Wallets und Mining — kurz erklärt, ehrlich eingeordnet.",
    lede: "Die Grundlagen. Kurz erklärt. Tieferer Kaninchenbau auf bitcoinaera.de.",
    intro:
      "Hier liegt das Fundament: Was ein Halving ist, warum es nur 21 Millionen gibt, wie eine Seed-Phrase funktioniert und wo deine Coins wirklich liegen. Alles in normalem Deutsch, ohne dass du vorher Informatik studiert haben musst. Wer diese Begriffe kennt, durchschaut den Rest der Debatte deutlich schneller.",
    toneClass: "cat-learning",
  },
  {
    key: "geld-inflation",
    kicker: "// GELD",
    titel: "Geld & Inflation",
    h1: "Inflation und Geldsystem einfach erklärt",
    description:
      "Warum Geld an Wert verliert, wer daran verdient und was Fiatgeld, Cantillon-Effekt und kalte Progression damit zu tun haben. Ehrlich erklärt.",
    lede: "Warum dein Geld leiser weniger wird, als dir lieb ist — und wer auf der anderen Seite steht.",
    intro:
      "Die Inflation ist keine Naturgewalt, sie hat Ursachen und Nutznießer. In dieser Rubrik geht es darum, wie unser Geld entsteht, warum es an Kaufkraft verliert und über welche Wege dir gleichzeitig etwas abgenommen wird, ohne dass es je jemand so genannt hätte. Vom Döner-Preis bis zur kalten Progression.",
    toneClass: "cat-entlarven",
  },
  {
    key: "staat-steuern",
    kicker: "// STAAT",
    titel: "Staat & Steuern",
    h1: "Steuer-Mythen und staatliche Mogelpackungen",
    description:
      "Steuer, Regulierung und Überwachung rund um Krypto und Geld: Was wirklich beschlossen wurde, was nur Schlagzeile war — nüchtern eingeordnet.",
    lede: "Was Behörden beschließen, wie es verkauft wird — und was am Ende tatsächlich für dich gilt.",
    intro:
      "Zwischen Pressekonferenz und Paragraf liegt oft ein erstaunlicher Abstand. Hier geht es um Steuerregeln, Meldepflichten und Regulierung: was tatsächlich in den Papieren steht, wer davon profitiert und wo eine Ankündigung nur nach Schutz klingt. Keine Rechtsberatung, aber der Blick, den man vorher haben will.",
    toneClass: "cat-entlarven",
  },
  {
    key: "betrug-maschen",
    kicker: "// BETRUG",
    titel: "Betrug & Maschen",
    h1: "Krypto-Betrug und die Maschen dahinter",
    description:
      "Fake-Wallets, Promi-Giveaways, KI-Trading-Bots: Wie Krypto-Betrug wirklich abläuft, woran du ihn erkennst und welche Regel dich immer schützt.",
    lede: "Wie die Abzocke wirklich läuft — und an welchem Punkt du sie jedes Mal erkennst.",
    intro:
      "Die meisten Verluste in Krypto entstehen nicht durch spektakuläre Hacks, sondern durch alte Maschen in neuen Kulissen. In dieser Rubrik zerlegen wir sie: das gefälschte Wallet aus dem App Store, das Promi-Giveaway, den Bot mit garantierter Rendite. Wer das Muster einmal kennt, fällt auf die Variante von morgen nicht mehr rein.",
    toneClass: "cat-entlarven",
  },
  {
    key: "markt-mythen",
    kicker: "// MARKT",
    titel: "Markt & Mythen",
    h1: "Bitcoin-Mythen und Marktgeschichten im Faktencheck",
    description:
      "Kriminellen-Mythos, Wal-Panik, Untergangs-Schlagzeilen: Welche Geschichten über den Bitcoin-Markt stimmen — und welche nur gut klicken.",
    lede: "Die großen Erzählungen über den Markt — und was von ihnen übrig bleibt, wenn man nachrechnet.",
    intro:
      "Kaum ein Thema produziert so viele sichere Prognosen wie der Bitcoin-Markt. Hier prüfen wir die Geschichten, die dabei entstehen: der Mythos vom Kriminellen-Geld, die Panik vor den Walen, der angekündigte Untergang. Nicht um zu beruhigen, sondern um zu unterscheiden, was belegt ist und was nur laut ist.",
    toneClass: "cat-denkfehler",
  },
];

export const KATEGORIE_MAP = Object.fromEntries(
  KATEGORIEN.map((k) => [k.key, k]),
) as Record<KategorieSchluessel, Kategorie>;
