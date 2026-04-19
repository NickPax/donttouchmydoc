# CLAUDE.md — DontTouchMyDoc

Privacy-first, **client-side only** PDF tools. The site is a static bundle
hosted on Cloudflare Pages. There is no backend; all PDF processing happens
in the browser via `pdf-lib`, `pdfjs-dist` and `JSZip`.

This file overrides the parent `website-projects/CLAUDE.md` (which is for a
different project).

## The promise, load-bearing
Files never leave the user's device. If you're about to add anything that
uploads, fetches remote resources from inside the tool flow, or creates
a backend endpoint — **stop and check with the user first**. The copy,
the CSP, and the brand all depend on this staying true.

## Stack at a glance
- Astro 5 with `output: 'static'` and `compressHTML: true`
- Tailwind v4 via `@tailwindcss/vite` (pinned to `~4.1.14` because Tailwind 4.2
  pulls Vite 8 which needs Node ≥20.19; upgrade both together)
- `pdf-lib` for PDF creation / modification, `pdfjs-dist` for rendering /
  text extraction, `JSZip` for packing split outputs
- Sitemap via `@astrojs/sitemap`

## Commands
- `npm run dev` — dev server (http://localhost:4321)
- `npm run build` — static build into `./dist`
- `npm run preview` — serve the built `./dist`
- `npm run deploy` — build + `wrangler pages deploy ./dist --project-name=donttouchmydoc`

## Routes
`/`, `/merge-pdf`, `/split-pdf`, `/organize-pdf`, `/compress-pdf`,
`/redact-pdf`, `/remove-line-numbers`, `/about`, plus sitemap + robots.

## Architecture
- `src/layouts/BaseLayout.astro` — head, OG / JSON-LD, skip link, conditional
  AdSense + Cloudflare Analytics script injection.
- `src/components/` — shared UI (Header, Footer, Hero, ToolGrid, Faq,
  HowItWorks, RelatedTools, PrivacyBadge, AdSlot, TrustSection, ToolHeader).
- `src/components/tools/*.astro` — one component per tool, each a self-
  contained island with an inline `<script>` that imports from
  `src/lib/`. Tool scripts are lazily-loaded by Astro; heavy libs
  (`pdfjs-dist`) live in chunked pages via `vite.build.rollupOptions.manualChunks`.
- `src/lib/format.ts` — `formatBytes`, `downloadBlob`, `parseRanges`.
- `src/lib/pdfjs-loader.ts` — lazy PDF.js loader with worker URL wiring.
- `public/_headers` — Cloudflare Pages security headers and CSP.
- `public/robots.txt`, `public/favicon.svg`.

## Runtime feature flags (env vars, all `PUBLIC_*`)
All three default to off. See `.env.example`.

| Var                           | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `PUBLIC_ADS_ENABLED`          | `placeholder` shows dashed ad-slot stripes for dev; `true` renders real AdSense (also needs `PUBLIC_ADSENSE_CLIENT` + per-slot `slot=` props). |
| `PUBLIC_ADSENSE_CLIENT`       | `ca-pub-…` client id. Only read when `PUBLIC_ADS_ENABLED=true`. |
| `PUBLIC_CF_ANALYTICS_TOKEN`   | Cloudflare Web Analytics beacon token. Cookieless, no banner. CSP already allow-lists the hosts. |

## Deploy quirk
Because we deploy via **direct upload** (`wrangler pages deploy ./dist`),
env vars set in the Cloudflare Pages dashboard **are not applied** — those
only run for Git-connected builds. Pass any `PUBLIC_*` var inline, e.g.:
```
PUBLIC_CF_ANALYTICS_TOKEN=<token> npm run deploy
```
Or create a local `.env` (gitignored) with the vars.

## CSP
Defined in `public/_headers`. The load-bearing directive is
`connect-src 'self' https://cloudflareinsights.com;` — it browser-enforces
the "no uploads" promise. If a new tool needs an external fetch, the
change is significant: tell the user, and update the CSP at the same time.

Current allow-lists:
- script-src: `'self' 'unsafe-inline' https://static.cloudflareinsights.com`
- font-src: `'self' https://fonts.gstatic.com https://cdn.jsdelivr.net`
- connect-src: `'self' https://cloudflareinsights.com`
- When ads go live, script-src needs `https://pagead2.googlesyndication.com`
  and more (googleads host is noisy; expand carefully).

## Adding a new tool — the recipe
1. `src/components/tools/NewTool.astro` — self-contained island, inline
   `<script>` with lazy imports, uses the existing `drop-target`,
   `bar`, `stamp` etc. classes from `global.css`.
2. `src/pages/new-tool.astro` — wraps the tool with `BaseLayout`,
   `ToolHeader`, `HowItWorks`, `Faq`, `RelatedTools`, `AdSlot`s.
   Include FAQ + WebApplication JSON-LD schema.
3. Add nav entry in `Header.astro`, `Footer.astro`, `Hero.astro`
   quick-jump, `ToolGrid.astro`, and extend the `current` type in
   `RelatedTools.astro`.
4. Rebuild, hit the route, push.

## Things I should not do without checking
- Adding any remote fetch inside a tool flow.
- Loosening the CSP (especially `connect-src`).
- Adding cookies, localStorage, or any persistence — the About page
  explicitly promises we don't.
- Modifying the underline / red strike pattern on display headings —
  use `.strike-red`; don't go back to `underline-offset-4` (clashed
  with next-line "i" dots).
