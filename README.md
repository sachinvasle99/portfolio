# Sachin Vasle — Portfolio

AI infrastructure and DevOps engineer. Hybrid Kubernetes across on-premises bare metal and
AWS EKS, self-hosted LLM inference on on-prem GPUs, and an AI-powered SRE root cause analysis
platform written from scratch.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

## Run it locally

The site lives in `public/`. Serve that directory, not the repo root:

```bash
cd public && python3 -m http.server 8080
```

Opening `index.html` over `file://` works too, but `localStorage` (remembering the theme
choice) and the clipboard API are restricted for local files in some browsers, so the theme
toggle won't persist and the copy-email button falls back to `execCommand`.

## Structure

```
wrangler.jsonc                Cloudflare Workers Static Assets config
public/                       ← everything below here is the deployed site
public/index.html             Single-page site
public/notes/                 Field notes, one plain HTML page each
public/req/css/styles.css     All styles — theme tokens, layout, motion
public/req/js/main.js         Nav, theme, clock, magnetic, tilt, decode, reveals, marquee, copy
public/req/js/preloader.js    Cluster-bootstrap loading sequence
public/req/js/cursor.js       Custom signal cursor
public/req/img/fav/           Favicon set (SVG + PNG sizes + webmanifest)
public/assets/                Résumé PDF (see "Before publishing")
```

## Design

Instrumentation panel rather than terminal pastiche: graphite ground with a slight warm bias,
amber signal accent, copper for the light theme where amber would fail contrast. Semantic
colours (ok / critical) are deliberately separate from the accent hue so status never reads as
decoration.

Type is **Archivo** for display, **IBM Plex Sans** for body, **IBM Plex Mono** for labels, node
names and data — loaded from Google Fonts, with real fallback stacks.

Themes follow the visitor's OS by default. The toggle stores an explicit choice in
`localStorage`, and that choice wins over the OS in both directions. All colour lives in CSS
custom properties declared on bare `:root` (light), redefined for system dark and again for
`[data-theme="dark"]`.

Reveal animations start from a **visible** resting state: the CSS only hides `[data-reveal]`
when `html.js` is set, JS runs immediately, and a 3-second timer force-shows everything. With
JS off, broken, or slow, nothing is invisible.

## Before publishing

The page carries `TODO` comments at each of these:

- **Résumé PDF** — `assets/Sachin_Vasle_Resume.pdf` is linked from the hero and the footer
  but is not in the repo yet.
- **Canonical URL and OG image** — `og:url`, `og:image` and `rel=canonical` are commented out in
  `<head>` until there is a real domain.
- **RAM-backed PostgreSQL** — the speed-up is described qualitatively in the Work section
  because the real before/after numbers are unknown. A concrete figure there would be the most
  quotable metric on the page.
- **SOC 2 / HIPAA / Trivy** — written from Sachin's own instruction, not from any sourced
  document. Confirm the wording, in particular whether these are environments built *for* those
  standards versus audits actually passed.
- **CKA** — shown honestly as issued Feb 2022 and lapsed. Remove the `lapsed` tag when renewed.

## Deploying

Cloudflare Workers Static Assets, connected to this repo. There is no build step:

- **Build command:** leave empty
- **Deploy command:** `npx wrangler deploy`

`wrangler.jsonc` points at `public/`. Do not set `assets.directory` to the repo
root — Wrangler pulls in `.git` and the repo metadata along with it, and
`.assetsignore` does not reliably exclude them.

## Attribution

Page structure and front-end approach adapted, MIT-licensed, from
[Praveen Kumar's portfolio](https://github.com/praveenraghav01/portfolio), which is itself
adapted from [Puneeth Aradhya's](https://github.com/aradhyapuneeth/aradhyapuneeth.github.io).
The visual identity, layout, copy and content here are this site's own.

## License

MIT — see [LICENSE](LICENSE).
