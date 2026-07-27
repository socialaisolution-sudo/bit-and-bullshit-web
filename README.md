# bit-and-bullshit-web

Marken-Website für **Bit & Bullshit** — Bitcoin, Makro, Geld. Frech, kurz, ehrlich.

## Stack

- Astro 5 (static output)
- Tailwind v4 (via `@tailwindcss/vite`)
- Astro Content Collections (Markdown-Blog)
- Cloudflare Pages (Hosting)

## Struktur

```
src/
  content/blog/*.md    31 Snippet-Artikel (Stubs — Skripte werden nachgetragen)
  pages/
    index.astro        Startseite (Maskottchen + Claim + Socials)
    blog/index.astro   Blog-Übersicht, gruppiert nach Kategorie
    [slug].astro       Dynamische Post-URL auf Top-Level (SEO-freundlich)
    sticker.astro      Coming-Soon-Seite
    impressum.astro
    datenschutz.astro
  components/
    SiteHeader.astro
    SiteFooter.astro
    SocialLinks.astro
```

## Blog-Content

Jeder Snippet-Stub in `src/content/blog/` hat folgendes Frontmatter:

```yaml
title: "…"           # H1 der Seite (SEO)
description: "…"     # Meta-Description
keyword: "…"         # Primär-Keyword (Doku)
category: entlarven  # entlarven | learning | denkfehler
order: 1             # Sortierung + Anzeige (#01)
aeraLink: "…"        # optional: Link zu bitcoinaera.de-Detailseite
draft: true          # default true — auf false setzen, wenn Fließtext steht
```

Der Fließtext (aus dem Short-Skript zu Prosa umgeschrieben) kommt darunter.
Solange `draft: true`, zeigt der Post einen sichtbaren „Entwurf"-Hinweis.

## Lokale Entwicklung

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # -> dist/
```

## Cloudflare Pages

- Repo: `socialaisolution-sudo/bit-and-bullshit-web`
- Build: `npm run build` · Output: `dist`
- Domain: bit-and-bullshit.com

## Socials

- TikTok: [@bitandbullshit](https://www.tiktok.com/@bitandbullshit)
- Instagram: [@bitandbullshit](https://www.instagram.com/bitandbullshit)

## Offene TODOs

- Impressum: echten Text (Anbieter, Adresse, Kontakt) einsetzen
- Datenschutz: DSGVO-Generator + rechtl. Prüfung
- 31 Blog-Stubs: Skripte als Prosa einfließen lassen, `draft: false` setzen
- Sticker-Seite: Motive einsetzen, sobald verfügbar
- Learning-Artikel (21–29): finale `aeraLink`-Slugs mit bitcoinaera.de abgleichen
