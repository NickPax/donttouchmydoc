# DontTouchMyDoc — Handover Notes

A reference for anyone stepping in to help run or extend this site.
For deeper technical / architectural detail, see `CLAUDE.md` and `README.md`.

---

## What this is

**DontTouchMyDoc** is a static website offering six PDF tools, all of which
run entirely inside the user's browser. No files are uploaded anywhere,
because there is no backend. The site's brand, copy, and marketing all rest
on that one truth — so it is a **load-bearing promise**, not a feature
choice. See the "Don't break" list at the bottom.

- Live: **https://donttouchmydoc.com**
- Source: **https://github.com/NickPax/donttouchmydoc** (public, MIT)
- Host: **Cloudflare Pages** (project name `donttouchmydoc`)
- Domain: **donttouchmydoc.com** (registered & DNS in Cloudflare)
- `www.` redirects 301 → bare domain (via a Cloudflare Page Rule)

---

## The six tools

| URL path | What it does |
| --- | --- |
| `/merge-pdf` | Combine multiple PDFs into one, drag-to-reorder |
| `/split-pdf` | Pull pages out by "extract all" or ranges like `1-3, 5, 8-10` |
| `/organize-pdf` | Visual grid — drag-to-reorder, bulk rotate, delete pages |
| `/compress-pdf` | Shrink scanner-sized PDFs (Light / Medium / Heavy presets) |
| `/redact-pdf` | Click-and-drag black boxes; underlying text genuinely destroyed |
| `/remove-line-numbers` | Strip line numbers from court transcripts etc. |

Plus `/about` and the landing page `/`.

---

## How to make changes (the everyday flow)

The whole site is code in the GitHub repo. Any change — text edits, new
pages, new tools — works the same way:

1. `git clone git@github.com:NickPax/donttouchmydoc.git` (first time)
2. `cd donttouchmydoc && npm install` (first time)
3. Edit files in `src/` (pages are `.astro` files, plain-ish HTML with
   frontmatter at the top).
4. `npm run dev` → preview locally at `http://localhost:4321`.
5. `git add -A && git commit -m "describe the change"`
6. `git push origin main`
7. **GitHub Actions** automatically builds and deploys to Cloudflare
   Pages within ~35 seconds. Watch it at
   https://github.com/NickPax/donttouchmydoc/actions.

Site updates at **https://donttouchmydoc.com** as soon as the green tick
shows.

---

## Deployment: how it works

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Spins up a Node 20 runner.
2. `npm ci` (installs locked dependencies).
3. `npm run build` (produces `./dist` — static HTML/CSS/JS).
4. Calls the official `cloudflare/wrangler-action` to run
   `wrangler pages deploy ./dist --project-name=donttouchmydoc`.

The manual fallback (from your own laptop) still works if Actions is ever
broken:

```bash
PUBLIC_CF_ANALYTICS_TOKEN=<token> npm run deploy
```

---

## Where the secrets live

Three things the build needs that can't go into the public repo — all live
as **GitHub Repository Secrets** (Repo → Settings → Secrets and variables
→ Actions):

| Secret name | What it is |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Lets GitHub Actions deploy to CF Pages. Made via CF dashboard → My Profile → API Tokens. Template: "Edit Cloudflare Workers". |
| `CLOUDFLARE_ACCOUNT_ID` | The hex ID visible in any Cloudflare dashboard URL. Public but convenient to store. |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Token for the cookieless Cloudflare Web Analytics beacon. Current value: `c01e6fc6acd1487eb04aaa8aa2831cb7`. Also ships in the public HTML — not secret in any real sense, just stored here so the build can inject it. |

If any of these ever need rotating, update them in GitHub Secrets and
re-trigger the workflow from the Actions tab.

---

## Analytics (how many people are using which tool)

**Cloudflare dashboard → Analytics & Logs → Web Analytics → donttouchmydoc.com**

Shows pageviews per URL, visitors, referrers, countries, Core Web Vitals.
Cookieless. No consent banner required (that's why we chose it over Google
Analytics). Data appears ~15–30 min after traffic arrives.

---

## Ads (not enabled yet)

Every page has placeholder ad slots wired up but **hidden by default**.
They're gated by the `PUBLIC_ADS_ENABLED` env var. See `README.md` →
"Ad slots" section for the post-AdSense-approval switch-on procedure.

Short version of what'll be needed later:
1. Apply to Google AdSense and wait 1–4 weeks for approval.
2. Once approved, create ad units in the AdSense dashboard and copy each
   unit's slot ID.
3. Add `PUBLIC_ADS_ENABLED=true` and `PUBLIC_ADSENSE_CLIENT=ca-pub-…` to
   GitHub Secrets.
4. Edit each `<AdSlot />` call in the page files to add the corresponding
   `slot="…"` prop.
5. Push — ads go live on the next deploy.

Until that's done, the ad slots are completely invisible (not even an
empty dashed box) and no AdSense script is loaded from the site.

---

## Security headers & CSP

Defined in `public/_headers`. The load-bearing directive is
`connect-src 'self' https://cloudflareinsights.com;` — this **browser-
enforces** the "no uploads" promise: if any tool tried to POST data to an
external host, the browser would block it. Don't loosen this casually.

Other protective headers included: HSTS (2-year preload), X-Frame-Options
DENY, referrer policy, Permissions-Policy disabling camera / mic / geo
even though we don't use them.

---

## Useful dashboards & URLs (for bookmarking)

- **Site**: https://donttouchmydoc.com
- **Preview URL (per build)**: https://donttouchmydoc.pages.dev
- **Source**: https://github.com/NickPax/donttouchmydoc
- **GitHub Actions runs**: https://github.com/NickPax/donttouchmydoc/actions
- **GitHub Secrets**: https://github.com/NickPax/donttouchmydoc/settings/secrets/actions
- **Cloudflare Pages project**: `dash.cloudflare.com/<account-id>/workers-and-pages` → `donttouchmydoc`
- **Cloudflare Web Analytics**: `dash.cloudflare.com/<account-id>/analytics-and-logs/web-analytics`
- **Cloudflare DNS / Page Rule**: `dash.cloudflare.com/<account-id>/donttouchmydoc.com`

---

## Don't break these (ask first)

The site's entire brand sits on these things being *genuinely* true. If a
change would contradict any of them, check with Nick first.

1. **Nothing is ever uploaded.** No fetch/POST to any origin other than
   Cloudflare Analytics. Users can verify in DevTools.
2. **No cookies, no localStorage inside the tools.** If we ever need
   persistence, add it only with explicit consent UI.
3. **No watermarks on tool output.** Ever.
4. **No sign-up required to use any tool.** Ever.
5. **No third-party scripts inside the tool pages**, beyond Cloudflare
   Analytics (cookieless) and, post-approval, Google AdSense (around the
   tool, not inside it).

Breaking any of these would require rewriting the About page, the hero,
the footer manifesto, and arguably the domain name itself.

---

## Who to ask about what

- **Site owner / final decisions**: Nick.
- **Cloudflare account owner**: Nick (same login used for the domain,
  Pages project, and Analytics).
- **GitHub repo admin**: Nick (@NickPax).
