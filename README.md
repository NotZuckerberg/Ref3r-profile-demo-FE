# REF3R Creator Profile

A personalized, fully-customizable creator profile page built with React + Vite.
Features a bottom-sheet editor for color palettes, fonts, bio styling, and
collaborations. Customizations persist in the browser via `localStorage`.

## Admin page — add creators from the browser

Go to **`demo.ref3r.com/admin`**. It's password-gated (see `ADMIN_TOKEN`
below). From there you can:

- **Create a new creator** — a form for slug, name, handle, tagline, bio,
  location, niche(s), REF3R score, clout, and social follower counts. The new
  demo is live at `demo.ref3r.com/<slug>` the moment you save.
- **List / open / delete** every creator.
- **Reset** a seeded creator back to its original data.

After creating a creator, click **Open** to go to their live page and tune the
palette, fonts, bio styling, highlights, and collabs inline with the Edit
button — those inline edits stay open (no password) so prospects can play too.

### Setting the admin password

Set `ADMIN_TOKEN` in Railway → your service → **Variables** to any long random
string. That value is the password on the `/admin` login screen. If it's unset,
the admin routes are disabled (they return 503) — fail-safe, so admin is never
accidentally wide open.

> The split is deliberate: **creating/deleting** creators requires the admin
> password; **editing an existing** profile's look (palette/fonts/collabs) stays
> open for prospects. Destructive actions are locked; cosmetic ones aren't.

## Backend & database (live editing, no redeploy)

This project now ships with a small **Express + Postgres** backend
(`server/`) so profile edits save live — no file edit, no git push, no
rebuild. One Railway service runs both the API and the built frontend.

### How it works

- `server/index.js` — Express API:
  - `GET  /api/creators/:slug` — fetch a profile (unknown slug → default)
  - `PUT  /api/creators/:slug` — create/update a profile (rate limited)
  - `POST /api/creators/:slug/reset` — restore a slug to its original seed
    data (recovery if a demo gets mangled; only works for seeded slugs)
  - `GET  /api/creators` — list all profiles (admin overview)
  - `POST /api/admin/verify` — check the admin password (admin only)
  - `POST /api/admin/creators` — create a new creator (admin only)
  - `DELETE /api/admin/creators/:slug` — delete a creator (admin only)
- Profiles are rows in a `creators` table, each storing the full config as
  JSONB.
- On first boot against an empty table, `server/seed.js` populates the
  initial demos. **Re-seeding never overwrites edits** (uses `ON CONFLICT DO
  NOTHING`), so your saved changes are safe across restarts.
- The frontend loads each profile from the API and the **Save** button in the
  editor writes back via `PUT`. If the API is unreachable it silently falls
  back to the bundled `src/creators.js` data, so the page never breaks.

Editing colors is now: open the page → Edit → change palette → Save. Done.
Changes are live for everyone immediately.

### Deploy on Railway

1. Push to GitHub, create a Railway project from the repo.
2. In the project, **add a Postgres database** (New → Database → PostgreSQL).
   Railway injects `DATABASE_URL` into your service automatically.
3. The included `railway.json` builds the frontend (`npm run build`) and
   starts the server (`npm run start`). `postinstall` installs the server's
   dependencies. No env vars needed.
4. Add your custom domain (`demo.ref3r.com`) as before.

### Run locally

Needs a local Postgres (or point `DATABASE_URL` at any Postgres):

```bash
npm install                       # installs frontend + server deps
npm run build                     # build the frontend once
DATABASE_URL=postgresql://localhost:5432/ref3r npm run start
# → http://localhost:3000
```

For frontend-only hot reload during design work, `npm run dev` still works and
falls back to bundled data when the API isn't running.

> ⚠️ There is **no authentication** — anyone who knows a slug URL can edit that
> profile. This is intended for private demos only. Two guardrails soften the
> open-editing risk: writes are **rate limited** (20 per IP per minute) to stop
> scripted abuse, and any seeded demo can be restored with a one-line reset:
>
> ```bash
> curl -X POST https://demo.ref3r.com/api/creators/elena/reset
> ```
>
> To lock editing down fully later, add an admin token check to the `PUT` and
> reset routes in `server/index.js`.

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
├── package.json          # frontend deps + build/start scripts
├── railway.json          # Railway build/start config
├── vite.config.js        # Vite + React plugin
├── .env.example          # env vars (DATABASE_URL, optional VITE_API_BASE)
├── server/
│   ├── index.js          # Express API + serves the built frontend
│   ├── seed.js           # initial demo data (first boot only)
│   └── package.json      # backend deps (express, pg, cors)
└── src/
    ├── main.jsx          # React root (routes /admin → Admin page)
    ├── creators.js       # bundled fallback data (used if API is down)
    ├── Admin.jsx         # password-gated admin: create/list/delete creators
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
