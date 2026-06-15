import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { SEED, DEFAULT_SLUG } from "./seed.js";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ── database ─────────────────────────────────────────────────────────
// Railway's Postgres plugin injects DATABASE_URL automatically.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS creators (
      slug        TEXT PRIMARY KEY,
      config      JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // seed only slugs that don't already exist (never overwrites live edits)
  for (const [slug, config] of Object.entries(SEED)) {
    await pool.query(
      `INSERT INTO creators (slug, config) VALUES ($1, $2)
       ON CONFLICT (slug) DO NOTHING`,
      [slug, config]
    );
  }
  console.log("DB ready, seed ensured");
}

const slugOk = (s) => typeof s === "string" && /^[a-z0-9-]{1,40}$/.test(s);

// ── simple in-memory rate limiter (no external deps) ─────────────────
// Limits writes per client IP. A real human editing their page stays well
// under this; a script spamming writes gets 429'd.
const RATE_MAX = 20;            // max write requests...
const RATE_WINDOW_MS = 60_000;  // ...per IP per 60s
const hits = new Map();         // ip -> [timestamps]

function rateLimit(req, res, next) {
  const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown").trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    res.setHeader("Retry-After", Math.ceil(RATE_WINDOW_MS / 1000));
    return res.status(429).json({ error: "rate_limited", message: "Too many edits, slow down a moment." });
  }
  recent.push(now);
  hits.set(ip, recent);
  next();
}

// occasional cleanup so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [ip, ts] of hits) {
    const recent = ts.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length) hits.set(ip, recent); else hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref?.();

// ── admin auth ───────────────────────────────────────────────────────
// Set ADMIN_TOKEN in Railway env vars. Admin routes require it via the
// "x-admin-token" header. If unset, admin routes are disabled (fail safe).
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(503).json({ error: "admin_disabled", message: "ADMIN_TOKEN not configured on the server." });
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });
  next();
}

// ── API ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// list all slugs (handy for an admin overview)
app.get("/api/creators", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT slug, config->'creator'->>'name' AS name, updated_at
       FROM creators ORDER BY updated_at DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// fetch one creator's config (falls back to default slug if unknown)
app.get("/api/creators/:slug", async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  try {
    let { rows } = await pool.query("SELECT slug, config FROM creators WHERE slug = $1", [slug]);
    let known = rows.length > 0;
    if (!known) {
      rows = (await pool.query("SELECT slug, config FROM creators WHERE slug = $1", [DEFAULT_SLUG])).rows;
    }
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json({ slug: rows[0].slug, known, requestedSlug: slug, ...rows[0].config });
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// create or update a creator's config (no auth — demo only, rate limited)
app.put("/api/creators/:slug", rateLimit, async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  if (!slugOk(slug)) return res.status(400).json({ error: "bad_slug" });
  const body = req.body || {};
  // accept either a full {creator, collabs, theme} or a partial edit {theme, collabs}
  try {
    const existing = (await pool.query("SELECT config FROM creators WHERE slug = $1", [slug])).rows[0]?.config || {};
    const merged = {
      creator: body.creator ?? existing.creator ?? null,
      collabs: body.collabs ?? existing.collabs ?? [],
      theme:   body.theme   ?? existing.theme   ?? null,
    };
    if (!merged.creator) return res.status(400).json({ error: "missing_creator" });
    await pool.query(
      `INSERT INTO creators (slug, config, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (slug) DO UPDATE SET config = $2, updated_at = now()`,
      [slug, merged]
    );
    res.json({ ok: true, slug });
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// reset a slug back to its original seed data (recovery for a mangled demo).
// Only works for slugs that exist in seed.js; returns 404 otherwise.
app.post("/api/creators/:slug/reset", rateLimit, async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const seed = SEED[slug];
  if (!seed) return res.status(404).json({ error: "no_seed", message: "No seed exists for this slug." });
  try {
    await pool.query(
      `INSERT INTO creators (slug, config, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (slug) DO UPDATE SET config = $2, updated_at = now()`,
      [slug, seed]
    );
    res.json({ ok: true, slug, reset: true });
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// ── admin routes (require x-admin-token) ─────────────────────────────
// verify a token (used by the /admin login screen)
app.post("/api/admin/verify", requireAdmin, (_req, res) => res.json({ ok: true }));

// create a brand-new creator with full fields
app.post("/api/admin/creators", requireAdmin, async (req, res) => {
  const slug = String(req.body?.slug || "").toLowerCase();
  if (!slugOk(slug)) return res.status(400).json({ error: "bad_slug", message: "Slug must be lowercase letters, numbers, or hyphens (max 40)." });
  const { creator, collabs, theme } = req.body || {};
  if (!creator || !creator.name) return res.status(400).json({ error: "missing_creator", message: "Creator name is required." });
  try {
    const exists = (await pool.query("SELECT 1 FROM creators WHERE slug = $1", [slug])).rows.length > 0;
    if (exists) return res.status(409).json({ error: "slug_taken", message: "That slug already exists." });
    const config = {
      creator: {
        name: creator.name,
        handle: creator.handle || slug,
        tagline: creator.tagline || "",
        bio: creator.bio || "",
        location: creator.location || "",
        niche: creator.niche || "",
        stats: creator.stats || { ref3rScore: 0, clout: 0, cloutDelta: 0 },
        socials: creator.socials || [],
        highlights: creator.highlights || [],
      },
      collabs: collabs || [],
      theme: theme || null,
    };
    await pool.query("INSERT INTO creators (slug, config) VALUES ($1, $2)", [slug, config]);
    res.json({ ok: true, slug });
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// delete a creator
app.delete("/api/admin/creators/:slug", requireAdmin, async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  try {
    await pool.query("DELETE FROM creators WHERE slug = $1", [slug]);
    res.json({ ok: true, slug, deleted: true });
  } catch (e) { res.status(500).json({ error: "db_error" }); }
});

// ── serve the built frontend (single Railway service) ────────────────
const dist = path.join(__dirname, "..", "dist");
app.use(express.static(dist));
// SPA fallback: any non-API route returns index.html so /slug works
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));

const PORT = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Server on :${PORT}`)))
  .catch((e) => { console.error("DB init failed:", e); process.exit(1); });
