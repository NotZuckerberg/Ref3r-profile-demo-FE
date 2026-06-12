# REF3R Creator Profile

A personalized, fully-customizable creator profile page built with React + Vite.
Features a bottom-sheet editor for color palettes, fonts, bio styling, and
collaborations. Customizations persist in the browser via `localStorage`.

## Per-prospect demos (one deploy, unlimited demos)

Each demo is selected by the URL — no extra deploys, no subdomains per prospect:

```
demo.ref3r.com            → default demo (DEFAULT_SLUG)
demo.ref3r.com/elena      → the "elena" demo
demo.ref3r.com/?creator=elena   → same, query-string form
```

To add a prospect, open `src/creators.js` and add an entry keyed by the slug
you want in the URL:

```js
export const CREATORS = {
  nike: {
    creator: { name: "...", handle: "...", stats: {...}, socials: [...], highlights: [...] },
    collabs: [ { id: "c1", brand: "...", ... } ],
    theme:   { primary: "#...", secondary: "#...", tertiary: "#..." }, // optional
  },
};
```

Then rebuild/redeploy. Each demo's in-browser customizations are saved
separately (localStorage key `ref3r-profile-config:<slug>`), so editing one
prospect's page never affects another.

### Scaling beyond a config file

`src/Ref3rProfile.jsx` has a single function, `loadCreator(slug)`, that is the
only place data is read. To serve demos from a backend / KV store / Supabase /
Google Sheet instead of the bundled file, change that one function to `fetch()`
the slug's config — nothing else in the app needs to change.

> ⚠️ Demo URLs are public if someone knows the slug. If a demo shows a
> prospect's real numbers, gate it (a token in the URL or a password) rather
> than relying on the slug being secret.

## Quick start

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:5173
```

## Build for production

```bash
npm run build    # outputs static files to dist/
npm run preview  # preview the production build locally
```

The `dist/` folder is a fully static site — host it anywhere.

## Deploy

### Railway (recommended here)

This repo includes `railway.json`. Railway will:

- build with `npm run build` (static files → `dist/`)
- serve with `npm run start`, which runs `serve -s dist` — the `-s` flag
  rewrites every path (e.g. `/elena`) back to `index.html` so slug URLs work.

Steps:
1. Push this repo to GitHub, then "New Project → Deploy from GitHub repo" in Railway.
2. Railway auto-detects the config; no env vars required (it sets `PORT`).
3. Settings → Networking → Custom Domain → add `demo.ref3r.com`.
4. Add the CNAME Railway gives you to your DNS (`Name: demo`, value: the
   `*.up.railway.app` target). Your main `ref3r.com` records are untouched.

### Static hosts (Vercel / Netlify / Cloudflare Pages)

Also work with zero config. Build command `npm run build`, output dir `dist`.
Enable SPA fallback (rewrite all routes to `/index.html`) so slug paths resolve:
- Netlify: add a `_redirects` file with `/*  /index.html  200`
- Vercel: add a rewrite of `/(.*)` → `/index.html`

Build command: `npm run build` · Output directory: `dist`

## Project structure

```
ref3r-app/
├── index.html            # HTML entry, sets fonts + base background
├── package.json          # dependencies & scripts (build + serve)
├── railway.json          # Railway build/start config
├── vite.config.js        # Vite + React plugin
└── src/
    ├── main.jsx          # React root
    ├── creators.js       # per-prospect demo configs (keyed by URL slug)
    └── Ref3rProfile.jsx  # the profile + editor component
```

## Customizing

- **Edit content** (creator name, handle, stats, highlights): edit the
  `CREATOR` object near the top of `src/Ref3rProfile.jsx`.
- **Default collaborations**: edit `DEFAULT_COLLABS`.
- **Palette presets**: edit the `PRESETS` array.
- **Available fonts**: edit `FONTS` (and add the matching Google Fonts
  `@import` in the `<style>` block inside the component).
- **Signature green** brand color: the `GREEN` constant (used on the verified
  tick, OG / Level badges, live dot, and footer).

End users customize their live page through the **✎ Edit page** button, and
their choices are saved to `localStorage` under the key `ref3r-profile-config`.

## Notes

- Fonts load from Google Fonts at runtime (needs internet on first load).
- No backend required — this is a static single-page app.
- To reset all customizations, clear the site's `localStorage`.
