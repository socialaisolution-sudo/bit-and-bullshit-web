/**
 * Zwei Feeds statt einem — die beiden Ebenen haben verschiedene Takte.
 * Snippets kommen im Strom, Cornerstones einzeln und selten. Wer die langen
 * Texte abonniert, will nicht dreimal die Woche ein 60-Sekunden-Stück im
 * Reader haben, und umgekehrt.
 *
 * Kein <pubDate>: Weder Snippets noch Cornerstones tragen ein Datum im
 * Frontmatter. Ein erfundenes Datum wäre schlimmer als keins — Reader
 * sortieren dann eben nach Reihenfolge im Feed, und die stimmt.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function xml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export type FeedEintrag = {
  titel: string;
  beschreibung: string;
  pfad: string;
  kategorie?: string;
};

export function feed(opts: {
  titel: string;
  beschreibung: string;
  selbst: string;
  site: URL;
  eintraege: FeedEintrag[];
}): Response {
  const basis = opts.site.toString().replace(/\/$/, "");
  const items = opts.eintraege
    .map((e) => {
      const url = `${basis}${e.pfad}`;
      return [
        "    <item>",
        `      <title>${xml(e.titel)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        e.kategorie ? `      <category>${xml(e.kategorie)}</category>` : null,
        `      <description>${xml(e.beschreibung)}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(opts.titel)}</title>
    <link>${xml(basis)}/</link>
    <description>${xml(opts.beschreibung)}</description>
    <language>de-DE</language>
    <atom:link href="${xml(basis + opts.selbst)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
