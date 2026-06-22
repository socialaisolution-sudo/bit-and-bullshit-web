# bit-and-bullshit-web

Triple B (Bit & Bullshit Bot) opt-in landing page. Stage A of the funnel — collect emails in exchange for the free "Honest Starter Guide" PDF.

## Stack

- Astro 5 (static output)
- Tailwind v4 (via `@tailwindcss/vite`)
- Cloudflare Pages (hosting + Pages Functions for the form endpoint)
- MailerLite (Double-Opt-In + drip sequence — no custom email infra)

## Local development

```bash
npm install
npm run dev          # Astro dev server on :4321 (form will fail — no Pages Functions runtime)
npm run build        # static site -> dist/
```

To test the form end-to-end locally, run `npx wrangler pages dev dist --compatibility-date=2026-06-01` after a build, and supply env vars via `.dev.vars` (gitignored).

## Environment variables (Cloudflare Pages → Settings → Environment variables)

| Name                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `MAILERLITE_API_KEY`    | MailerLite API token (Account → Integrations → API)            |
| `MAILERLITE_GROUP_ID`   | ID of the group new subscribers land in (must have DOI enabled)|

## MailerLite setup checklist (one-time)

1. Create account at mailerlite.com.
2. Create a group: **Triple B Subscribers**.
3. Enable **Double-Opt-In** for that group (Settings → Double opt-in).
4. Customize the confirmation email (subject + body).
5. Build the post-confirmation automation: Mail 0 (deliver the PDF) + the 5-mail sequence (Stage B — comes later).
6. Generate an API token and copy the group ID into Cloudflare Pages env vars.

## Cloudflare Pages setup checklist

1. Connect this repo (`socialaisolution-sudo/bit-and-bullshit-web`) to Cloudflare Pages.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add the two env vars above (production + preview).
4. Set the custom domain.

## TODOs still open (handed off to Denny)

- `src/assets/mascot-placeholder.svg` — swap for the final Drip-Smiley art.
- `src/pages/impressum.astro` — real Impressum text.
- `src/pages/datenschutz.astro` — finalized DSGVO text (legal review recommended).
- Lead-Magnet PDF + Mail 0 inside MailerLite.
