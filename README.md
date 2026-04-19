# DontTouchMyDoc

Privacy-first PDF tools — **everything runs in your browser**. No uploads, no accounts, no watermarks.

Live: [donttouchmydoc.com](https://donttouchmydoc.com)

## Stack

- **[Astro](https://astro.build)** — static site generation, island architecture.
- **[Tailwind CSS v4](https://tailwindcss.com)** — via `@tailwindcss/vite`.
- **[pdf-lib](https://pdf-lib.js.org)** — PDF creation / merging / splitting.
- **[pdfjs-dist](https://github.com/mozilla/pdf.js)** — rendering & rasterising pages.
- **[JSZip](https://stuk.github.io/jszip/)** — zipping split outputs.
- Deploy target: **Cloudflare Pages** (static output).

No backend, no server-side processing. The site is a static bundle.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:4321.

### Scripts

| script          | what                                                 |
| --------------- | ---------------------------------------------------- |
| `npm run dev`   | Start the dev server                                 |
| `npm run build` | Produce a static build in `./dist`                   |
| `npm run preview` | Preview the built site locally                     |
| `npm run deploy` | Build and deploy to Cloudflare Pages (requires `wrangler`) |

## Deploying to Cloudflare Pages

### One-off (from your machine)

```bash
npm run build
npx wrangler pages deploy ./dist --project-name=donttouchmydoc
```

Or the combined script:

```bash
npm run deploy
```

### Connected to Git (recommended)

In the Cloudflare dashboard:

1. **Pages → Create project → Connect to Git**, select this repository.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Node version: 20+ (set `NODE_VERSION=20` in the project's environment variables if needed).
5. Add custom domain `donttouchmydoc.com`.

That's it — every push to `main` ships a new build.

## Project layout

```
src/
  layouts/BaseLayout.astro       — shell with SEO meta / JSON-LD / skip link
  components/
    Header.astro, Footer.astro
    Hero.astro, ToolGrid.astro, TrustSection.astro
    PrivacyBadge.astro, HowItWorks.astro, Faq.astro, RelatedTools.astro, AdSlot.astro
    ToolHeader.astro
    tools/
      MergeTool.astro            — client-side merge (pdf-lib)
      SplitTool.astro            — client-side split (pdf-lib + pdf.js + JSZip)
      CompressTool.astro         — client-side compress (PDF.js → JPEG → pdf-lib)
  lib/
    format.ts                    — bytes, download helper, range parser
    pdfjs-loader.ts              — lazy PDF.js loader with worker wiring
  pages/
    index.astro                  — landing
    merge-pdf.astro
    split-pdf.astro
    compress-pdf.astro
    about.astro
public/
  favicon.svg, robots.txt
```

## Ad slots

Every page has `<AdSlot />` placements. They're **off by default** — empty space, no third-party scripts, until you flip them on.

Three modes, set via `PUBLIC_ADS_ENABLED` (copy `.env.example` → `.env` for local dev, or set in the Cloudflare Pages dashboard):

| `PUBLIC_ADS_ENABLED` | What renders                                                 |
| -------------------- | ------------------------------------------------------------ |
| *(unset / anything else)* | Nothing. An HTML comment marker remains so `<AdSlot />` positions are still greppable. **This is the launch-day default.** |
| `placeholder`        | Dashed stripes in each slot — useful for eyeballing layout during development or pre-launch. |
| `true`               | Real Google AdSense. Also requires `PUBLIC_ADSENSE_CLIENT=ca-pub-…` in env, and per-slot `slot` IDs added to the `<AdSlot />` calls in the pages. |

Every slot is still tagged with a comment so they're easy to find:

```html
<!-- ADSENSE SLOT: merge-sidebar -->
```

### Going live (post-AdSense-approval)

1. Get approved by [Google AdSense](https://www.google.com/adsense/). Approval typically takes 1–4 weeks after submitting the site.
2. From the AdSense dashboard, create ad units for each position you want to fill. Copy the `data-ad-slot` ID for each.
3. In Cloudflare Pages → Project → Settings → Environment variables, set:
   - `PUBLIC_ADS_ENABLED=true`
   - `PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000`
4. In each page file, add the `slot="xxxxxxxxxx"` prop to the `<AdSlot />` calls whose ad units you've created, e.g.
   ```astro
   <AdSlot position="merge-under-tool" size="970x250" slot="1234567890" />
   ```
5. Trigger a redeploy. The AdSense loader script is only injected when `PUBLIC_ADS_ENABLED=true` **and** the client ID is set, so the "no third-party scripts" promise holds until the moment ads actually ship.

## Analytics

Cloudflare Web Analytics is wired in — **cookieless, no consent banner needed**, injected only when `PUBLIC_CF_ANALYTICS_TOKEN` is set. CSP already whitelists the beacon host and the `/cdn-cgi/rum` endpoint.

### Enabling it

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics** → **Add a site**.
2. Choose **Automatic setup** and pick the `donttouchmydoc.pages.dev` project (or the custom domain once bound).
3. Copy the **JavaScript snippet token** — the value inside `data-cf-beacon='{"token": "..."}'`.
4. In Cloudflare Pages → **Settings → Environment variables**, add `PUBLIC_CF_ANALYTICS_TOKEN` with that value.
5. Trigger a redeploy (`npm run deploy` locally, or a Git push if you've connected the repo).

The beacon is a ~5 kB script with no cookies, no local storage, and no personal identifiers — just pageview counts, referrers, countries, and basic page performance. Perfect for "how many people are using each tool" without touching the privacy promise.

## Browser support

Tested on the latest Chrome / Firefox / Safari / Edge. PDF.js needs `type="module"` support and a working `Worker`, which means evergreen browsers only.

## Privacy notes

- No cookies, no localStorage writes, no service workers.
- No third-party scripts inside the tools (ad scripts, if added, are injected only around the tools).
- `pdf-lib` and `pdfjs-dist` are bundled locally — no CDN fetches at runtime.

## License

All rights reserved. Contact via [hello@donttouchmydoc.com](mailto:hello@donttouchmydoc.com).
