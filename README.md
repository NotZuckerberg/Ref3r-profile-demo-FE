# REF3R Creator Profile

A personalized, fully-customizable creator profile page built with React + Vite.
Features a bottom-sheet editor for color palettes, fonts, bio styling, and
collaborations. Customizations persist in the browser via `localStorage`.

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

Any of these work with zero config (point them at this folder):

- **Vercel** — `npm i -g vercel` then `vercel`
- **Netlify** — drag the `dist/` folder into the Netlify dashboard, or `netlify deploy --prod`
- **GitHub Pages / Cloudflare Pages / S3** — upload the contents of `dist/`

Build command: `npm run build` · Output directory: `dist`

## Project structure

```
ref3r-app/
├── index.html            # HTML entry, sets fonts + base background
├── package.json          # dependencies & scripts
├── vite.config.js        # Vite + React plugin
└── src/
    ├── main.jsx          # React root
    └── Ref3rProfile.jsx  # the entire profile + editor component
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
