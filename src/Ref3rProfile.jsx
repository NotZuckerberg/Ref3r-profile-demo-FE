import React, { useState, useEffect, useRef, useMemo } from "react";
import { CREATORS, DEFAULT_SLUG } from "./creators.js";

// API base: empty = same origin (backend serves this frontend on Railway).
// Override with VITE_API_BASE if the API is on a different host.
const API_BASE = import.meta.env.VITE_API_BASE || "";

// ── REF3R Editable Creator Profile ───────────────────────────────────
// Bottom-sheet customizer: color palette, header/name fonts, bio styling,
// and editable collaborations. Persists via window.storage (artifact API)
// with graceful in-memory fallback.

const GREEN = "#4ade80"; // REF3R signature brand mark (verified, OG, footer)

// ── font catalogue (loaded via Google Fonts) ─────────────────────────
const FONTS = {
  Syne:        { stack: "'Syne', sans-serif",               label: "Syne" },
  Outfit:      { stack: "'Outfit', sans-serif",             label: "Outfit" },
  Cormorant:   { stack: "'Cormorant Garamond', serif",      label: "Cormorant" },
  Playfair:    { stack: "'Playfair Display', serif",        label: "Playfair" },
  SpaceGrotesk:{ stack: "'Space Grotesk', sans-serif",      label: "Space Grotesk" },
  DMSerif:     { stack: "'DM Serif Display', serif",        label: "DM Serif" },
};
const FONT_KEYS = Object.keys(FONTS);             // 6 header/name fonts
const BIO_FONT_KEYS = ["Outfit", "Cormorant"];    // 2 bio fonts

// ── palette presets ──────────────────────────────────────────────────
const PRESETS = [
  { name: "REF3R Signature", primary: "#4ade80", secondary: "#0e1a13", tertiary: "#0a0f0c", dark: true },
  { name: "Luxe Champagne",  primary: "#b08d4f", secondary: "#fbf8f3", tertiary: "#f4efe7", dark: false },
  { name: "Midnight Indigo", primary: "#818cf8", secondary: "#161629", tertiary: "#0c0c18", dark: true },
  { name: "Rose Couture",    primary: "#e8638c", secondary: "#fdf1f4", tertiary: "#f9e6ec", dark: false },
  { name: "Ocean Mist",      primary: "#2dd4bf", secondary: "#0d2422", tertiary: "#071815", dark: true },
  { name: "Sunset Coral",    primary: "#fb7185", secondary: "#1f1419", tertiary: "#140d10", dark: true },
];

// ── default editable state ───────────────────────────────────────────
const DEFAULT_THEME = {
  primary: "#4ade80",
  secondary: "#0e1a13",
  tertiary: "#0a0f0c",
  dark: true,
  headerFont: "Syne",
  nameFont: "Syne",
  nameColor: "__ink",         // __ink/__primary/__secondary/__tertiary or hex
  headerColor: "__ink",
  bioFont: "Outfit",
  bioItalic: true,
  bioBold: false,
  bioColor: "__inkSoft",
};

// ── per-creator data is loaded by slug (see creators.js) ─────────────
// loadCreator() is the single seam: swap the body for a fetch() when you
// move configs to a backend / KV store / Supabase, and nothing else changes.
function getSlug() {
  // path-based: demo.ref3r.com/nike  → "nike"
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (path) return path.split("/")[0].toLowerCase();
  // query fallback: demo.ref3r.com/?creator=nike
  const q = new URLSearchParams(window.location.search).get("creator");
  return q ? q.toLowerCase() : null;
}

function loadCreator(slug) {
  const key = slug && CREATORS[slug] ? slug : DEFAULT_SLUG;
  const entry = CREATORS[key];
  return {
    slug: key,
    known: !!(slug && CREATORS[slug]),
    requestedSlug: slug,
    creator: entry.creator,
    collabs: entry.collabs,
    themeOverride: entry.theme || null,
  };
}

const PLATFORMS = {
  youtube:   { name: "YouTube",   color: "#FF0000", label: "YT" },
  instagram: { name: "Instagram", color: "#E1306C", label: "IG", grad: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" },
  tiktok:    { name: "TikTok",    color: "#69C9D0", label: "TT" },
  twitter:   { name: "X",         color: "#1DA1F2", label: "X" },
};

// ── derive a full token set from the editable theme ──────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex, a) {
  try { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  catch { return hex; }
}
function luminance(hex) {
  try { const { r, g, b } = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
  catch { return 0.5; }
}
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

// ── social platform logos (white fill, no background) ────────────────
function SocialIcon({ id, size = 26 }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (id) {
    case "youtube":
      return (
        <svg {...common}>
          <path d="M47.5219 14.4001C47.5219 14.4001 47.0531 11.0907 45.6094 9.6376C43.7812 7.7251 41.7375 7.71572 40.8 7.60322C34.0875 7.11572 24.0094 7.11572 24.0094 7.11572H23.9906C23.9906 7.11572 13.9125 7.11572 7.2 7.60322C6.2625 7.71572 4.21875 7.7251 2.39062 9.6376C0.946875 11.0907 0.4875 14.4001 0.4875 14.4001C0.4875 14.4001 0 18.2907 0 22.172V25.8095C0 29.6907 0.478125 33.5813 0.478125 33.5813C0.478125 33.5813 0.946875 36.8907 2.38125 38.3438C4.20937 40.2563 6.60938 40.1907 7.67813 40.397C11.5219 40.7626 24 40.8751 24 40.8751C24 40.8751 34.0875 40.8563 40.8 40.3782C41.7375 40.2657 43.7812 40.2563 45.6094 38.3438C47.0531 36.8907 47.5219 33.5813 47.5219 33.5813C47.5219 33.5813 48 29.7001 48 25.8095V22.172C48 18.2907 47.5219 14.4001 47.5219 14.4001ZM19.0406 30.2251V16.7345L32.0062 23.5032L19.0406 30.2251Z" fill="currentColor"/>
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M24 4.32187C30.4125 4.32187 31.1719 4.35 33.6938 4.4625C36.0375 4.56562 37.3031 4.95938 38.1469 5.2875C39.2625 5.71875 40.0688 6.24375 40.9031 7.07812C41.7469 7.92188 42.2625 8.71875 42.6938 9.83438C43.0219 10.6781 43.4156 11.9531 43.5188 14.2875C43.6313 16.8187 43.6594 17.5781 43.6594 23.9813C43.6594 30.3938 43.6313 31.1531 43.5188 33.675C43.4156 36.0188 43.0219 37.2844 42.6938 38.1281C42.2625 39.2438 41.7375 40.05 40.9031 40.8844C40.0594 41.7281 39.2625 42.2438 38.1469 42.675C37.3031 43.0031 36.0281 43.3969 33.6938 43.5C31.1625 43.6125 30.4031 43.6406 24 43.6406C17.5875 43.6406 16.8281 43.6125 14.3063 43.5C11.9625 43.3969 10.6969 43.0031 9.85313 42.675C8.7375 42.2438 7.93125 41.7188 7.09688 40.8844C6.25313 40.0406 5.7375 39.2438 5.30625 38.1281C4.97813 37.2844 4.58438 36.0094 4.48125 33.675C4.36875 31.1438 4.34063 30.3844 4.34063 23.9813C4.34063 17.5688 4.36875 16.8094 4.48125 14.2875C4.58438 11.9437 4.97813 10.6781 5.30625 9.83438C5.7375 8.71875 6.2625 7.9125 7.09688 7.07812C7.94063 6.23438 8.7375 5.71875 9.85313 5.2875C10.6969 4.95938 11.9719 4.56562 14.3063 4.4625C16.8281 4.35 17.5875 4.32187 24 4.32187ZM24 0C17.4844 0 16.6688 0.028125 14.1094 0.140625C11.5594 0.253125 9.80625 0.665625 8.2875 1.25625C6.70312 1.875 5.3625 2.69062 4.03125 4.03125C2.69063 5.3625 1.875 6.70313 1.25625 8.27813C0.665625 9.80625 0.253125 11.55 0.140625 14.1C0.028125 16.6687 0 17.4844 0 24C0 30.5156 0.028125 31.3312 0.140625 33.8906C0.253125 36.4406 0.665625 38.1938 1.25625 39.7125C1.875 41.2969 2.69063 42.6375 4.03125 43.9688C5.3625 45.3 6.70313 46.125 8.27813 46.7344C9.80625 47.325 11.55 47.7375 14.1 47.85C16.6594 47.9625 17.475 47.9906 23.9906 47.9906C30.5063 47.9906 31.3219 47.9625 33.8813 47.85C36.4313 47.7375 38.1844 47.325 39.7031 46.7344C41.2781 46.125 42.6188 45.3 43.95 43.9688C45.2812 42.6375 46.1063 41.2969 46.7156 39.7219C47.3063 38.1938 47.7188 36.45 47.8313 33.9C47.9438 31.3406 47.9719 30.525 47.9719 24.0094C47.9719 17.4938 47.9438 16.6781 47.8313 14.1188C47.7188 11.5688 47.3063 9.81563 46.7156 8.29688C46.125 6.70312 45.3094 5.3625 43.9688 4.03125C42.6375 2.7 41.2969 1.875 39.7219 1.26562C38.1938 0.675 36.45 0.2625 33.9 0.15C31.3313 0.028125 30.5156 0 24 0Z" fill="currentColor"/>
          <path d="M24 11.6719C17.1938 11.6719 11.6719 17.1938 11.6719 24C11.6719 30.8062 17.1938 36.3281 24 36.3281C30.8062 36.3281 36.3281 30.8062 36.3281 24C36.3281 17.1938 30.8062 11.6719 24 11.6719ZM24 31.9969C19.5844 31.9969 16.0031 28.4156 16.0031 24C16.0031 19.5844 19.5844 16.0031 24 16.0031C28.4156 16.0031 31.9969 19.5844 31.9969 24C31.9969 28.4156 28.4156 31.9969 24 31.9969Z" fill="currentColor"/>
          <path d="M39.6937 11.1843C39.6937 12.778 38.4 14.0624 36.8156 14.0624C35.2219 14.0624 33.9375 12.7687 33.9375 11.1843C33.9375 9.59053 35.2313 8.30615 36.8156 8.30615C38.4 8.30615 39.6937 9.5999 39.6937 11.1843Z" fill="currentColor"/>
        </svg>
      );
    case "twitter":
      return (
        <svg {...common}>
          <path d="M36.6526 3.80762H43.3995L28.6594 20.6546L46 43.5796H32.4225L21.7881 29.6757L9.61989 43.5796H2.86886L18.6349 25.5598L2 3.80762H15.9222L25.5348 16.5163L36.6526 3.80762ZM34.2846 39.5412H38.0232L13.8908 7.63388H9.87892L34.2846 39.5412Z" fill="currentColor"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M34.1451 0H26.0556V32.6956C26.0556 36.5913 22.9444 39.7913 19.0725 39.7913C15.2007 39.7913 12.0894 36.5913 12.0894 32.6956C12.0894 28.8696 15.1315 25.7391 18.8651 25.6V17.3913C10.6374 17.5304 4 24.2783 4 32.6956C4 41.1827 10.7757 48 19.1417 48C27.5075 48 34.2833 41.1131 34.2833 32.6956V15.9304C37.3255 18.1565 41.059 19.4783 45 19.5479V11.3391C38.9157 11.1304 34.1451 6.12173 34.1451 0Z" fill="currentColor"/>
        </svg>
      );
    default:
      return null;
  }
}

function buildTokens(theme) {
  const onDark = theme.dark;
  const ink = onDark ? "#fafafa" : "#2a2320";
  const inkSoft = onDark ? "#a1a1aa" : "#6b605a";
  const inkFaint = onDark ? "#71717a" : "#9c8f86";
  const line = onDark ? "rgba(255,255,255,0.07)" : "rgba(42,35,32,0.10)";
  const t = {
    primary: theme.primary,
    secondary: theme.secondary,
    tertiary: theme.tertiary,
    page: theme.tertiary,
    pageGlow: theme.secondary,
    panel: onDark ? "rgba(255,255,255,0.03)" : "#ffffffcc",
    panelAlt: onDark ? "rgba(255,255,255,0.04)" : "#00000008",
    ink, inkSoft, inkFaint, line,
    primarySoft: rgba(theme.primary, 0.14),
    onPrimary: luminance(theme.primary) > 0.6 ? "#1a1a1a" : "#ffffff",
  };
  // resolve named color refs
  t.resolve = (val) => {
    if (val === "__ink") return ink;
    if (val === "__inkSoft") return inkSoft;
    if (val === "__primary") return theme.primary;
    if (val === "__secondary") return theme.secondary;
    if (val === "__tertiary") return theme.tertiary;
    return val; // raw hex
  };
  return t;
}

// ─────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function ScoreRing({ score, T, max = 500 }) {
  const r = 38, c = 2 * Math.PI * r;
  const animated = useCountUp(score, 1600);
  const pct = Math.min(animated / max, 1);
  return (
    <div style={{ position: "relative", width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke={T.line} strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={T.primary} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 5px ${rgba(T.primary, 0.5)})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: T.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(animated)}</span>
        <span style={{ fontSize: 7.5, letterSpacing: 1.5, color: T.primary, marginTop: 3, fontWeight: 600 }}>REF3R SCORE</span>
      </div>
    </div>
  );
}

function StatPill({ label, value, delta, T }) {
  return (
    <div style={{ flex: 1, background: T.panelAlt, border: `1px solid ${T.line}`, borderRadius: 14, padding: "11px 14px" }}>
      <div style={{ fontSize: 9.5, letterSpacing: 1.5, color: T.inkSoft, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: T.ink, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {delta != null && <span style={{ fontSize: 10.5, color: T.primary, fontWeight: 600 }}>▲ {delta}%</span>}
      </div>
    </div>
  );
}

function PlayButton({ size = 54 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontSize: size * 0.4, boxShadow: "0 8px 30px rgba(0,0,0,0.45)", paddingLeft: 3 }}>▶</div>;
}

function YouTubeCard({ item, T, creator }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: T.panel, border: `1px solid ${T.line}` }}>
      <div style={{ position: "relative", aspectRatio: "16/9", cursor: "pointer", background: "linear-gradient(135deg,#2a1010,#0f0f0f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PlayButton />
        <span style={{ position: "absolute", bottom: 8, right: 8, fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "rgba(0,0,0,0.8)", color: "#fff" }}>{item.duration}</span>
        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#FF0000", color: "#fff" }}>▶ YOUTUBE</span>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.primarySoft, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 12, fontWeight: 700 }}>{initials(creator.name)}</div>
        <div>
          <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, lineHeight: 1.35, marginBottom: 3 }}>{item.title}</div>
          <div style={{ fontSize: 11.5, color: T.inkSoft }}>{item.channel} · {item.views} views</div>
        </div>
      </div>
    </div>
  );
}

function VerticalCard({ item, T }) {
  const p = PLATFORMS[item.platform];
  const isIG = item.platform === "instagram";
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer", aspectRatio: "9/16", flex: 1, background: isIG ? "linear-gradient(160deg,#2a1424,#0a0f0c)" : "linear-gradient(160deg,#0b2426,#0a0f0c)", border: `1px solid ${T.line}` }}>
      <span style={{ position: "absolute", top: 8, left: 8, zIndex: 2, fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 6, color: "#fff", background: isIG ? p.grad : "rgba(0,0,0,0.55)", border: isIG ? "none" : "1px solid rgba(255,255,255,0.2)" }}>{isIG ? "📷 REEL" : "♪ TIKTOK"}</span>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><PlayButton size={42} /></div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 10px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
        <div style={{ fontSize: 11.5, color: "#fff", fontWeight: 600, lineHeight: 1.3, marginBottom: 5 }}>{item.title}</div>
        <div style={{ display: "flex", gap: 10, fontSize: 10.5, color: "#d4d4d8" }}><span>▶ {item.views}</span><span>♥ {item.likes}</span></div>
        {item.sound && <div style={{ fontSize: 9.5, color: "#a1a1aa", marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>♪ {item.sound}</div>}
      </div>
    </div>
  );
}

function TwitterCard({ item, T, creator }) {
  return (
    <div style={{ borderRadius: 16, padding: "14px 16px", background: T.panel, border: `1px solid ${T.line}`, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 13, fontWeight: 700 }}>{initials(creator.name)}</div>
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>{creator.name} <span style={{ color: GREEN, fontSize: 12 }}>✓</span></div>
          <div style={{ fontSize: 12, color: T.inkFaint }}>@{creator.handle} · {item.time}</div>
        </div>
        <span style={{ fontSize: 16, color: T.ink, fontWeight: 700 }}>𝕏</span>
      </div>
      <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5, marginBottom: 12 }}>{item.text}</div>
      <div style={{ display: "flex", gap: 22, fontSize: 12, color: T.inkSoft }}><span>🔁 {item.retweets}</span><span>♥ {item.likes}</span><span>↗ Share</span></div>
    </div>
  );
}

function HighlightCard({ item, T, creator }) {
  if (item.platform === "youtube") return <YouTubeCard item={item} T={T} creator={creator} />;
  if (item.platform === "twitter") return <TwitterCard item={item} T={T} creator={creator} />;
  return <VerticalCard item={item} T={T} />;
}

function HighlightsCarousel({ items, T, creator }) {
  const [idx, setIdx] = useState(0);
  const touch = useRef({ x: 0, active: false });
  useEffect(() => { setIdx(0); }, [items]);
  const clamp = (n) => Math.max(0, Math.min(n, items.length - 1));
  const go = (n) => setIdx(clamp(n));
  const onStart = (e) => { touch.current = { x: e.touches[0].clientX, active: true }; };
  const onEnd = (e) => { if (!touch.current.active) return; const dx = e.changedTouches[0].clientX - touch.current.x; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); touch.current.active = false; };
  if (!items.length) return null;
  return (
    <div>
      <div onTouchStart={onStart} onTouchEnd={onEnd} style={{ position: "relative", height: 430, perspective: 1200, overflow: "hidden" }}>
        {items.map((item, i) => {
          const offset = i - idx, abs = Math.abs(offset), visible = abs <= 2;
          const isVert = item.platform === "instagram" || item.platform === "tiktok";
          return (
            <div key={i} onClick={() => offset !== 0 && go(i)} style={{
              position: "absolute", top: "50%", left: "50%", width: isVert ? 230 : 320,
              transform: `translate(-50%, -50%) translateX(${offset * 56}%) scale(${offset === 0 ? 1 : 0.78})`,
              opacity: visible ? (offset === 0 ? 1 : 0.4) : 0, filter: offset === 0 ? "none" : "blur(1px)",
              zIndex: 10 - abs, pointerEvents: visible ? "auto" : "none", cursor: offset === 0 ? "default" : "pointer",
              transition: "transform .5s cubic-bezier(.22,1,.36,1), opacity .5s ease, filter .5s ease",
            }}>
              <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%" }}><HighlightCard item={item} T={T} creator={creator} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 8 }}>
        <button onClick={() => go(idx - 1)} disabled={idx === 0} style={navBtn(idx === 0, T)}>‹</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => go(i)} style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 999, border: "none", cursor: "pointer", background: i === idx ? (PLATFORMS[it.platform]?.color || T.primary) : T.line, transition: "all .3s", padding: 0 }} />
          ))}
        </div>
        <button onClick={() => go(idx + 1)} disabled={idx === items.length - 1} style={navBtn(idx === items.length - 1, T)}>›</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: T.inkFaint, fontWeight: 500 }}>{idx + 1} / {items.length}</div>
    </div>
  );
}
function navBtn(disabled, T) {
  return { width: 36, height: 36, borderRadius: "50%", cursor: disabled ? "default" : "pointer", background: T.panel, border: `1px solid ${T.line}`, color: disabled ? T.inkFaint : T.ink, fontSize: 20, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1, transition: "all .2s", flexShrink: 0 };
}

// ════════════════════════════════════════════════════════════════════
//  EDITOR — bottom sheet
// ════════════════════════════════════════════════════════════════════
function Swatch({ color, active, onClick, size = 30 }) {
  return <button onClick={onClick} style={{ width: size, height: size, borderRadius: 9, background: color, cursor: "pointer", border: active ? "2px solid #fff" : "2px solid transparent", boxShadow: active ? "0 0 0 2px #000, 0 0 0 3px #fff" : "inset 0 0 0 1px rgba(0,0,0,0.15)", transition: "all .15s" }} />;
}

// color control: spectrum input + the 3 theme swatches
function ColorField({ label, value, onChange, theme }) {
  const refs = [
    { key: "__primary", color: theme.primary, name: "Primary" },
    { key: "__secondary", color: theme.secondary, name: "Secondary" },
    { key: "__tertiary", color: theme.tertiary, name: "Tertiary" },
  ];
  const isHex = typeof value === "string" && value.startsWith("#");
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {refs.map((r) => <Swatch key={r.key} color={r.color} active={value === r.key} onClick={() => onChange(r.key)} />)}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
        <label style={{ position: "relative", cursor: "pointer" }}>
          <input type="color" value={isHex ? value : "#888888"} onChange={(e) => onChange(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "7px 11px", borderRadius: 9, border: isHex ? "2px solid #fff" : "1px solid rgba(255,255,255,0.18)", color: "#e4e4e7" }}>
            <span style={{ width: 16, height: 16, borderRadius: 4, background: isHex ? value : "conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)" }} />
            Custom
          </span>
        </label>
      </div>
    </div>
  );
}

function EditorSheet({ open, onClose, theme, setTheme, collabs, setCollabs, onSave, saved }) {
  const [tab, setTab] = useState("palette");
  const set = (patch) => setTheme((t) => ({ ...t, ...patch }));
  const tabs = [
    { id: "palette", label: "🎨 Palette" },
    { id: "fonts", label: "🔠 Headings" },
    { id: "bio", label: "✍️ Bio" },
    { id: "collabs", label: "🤝 Collabs" },
  ];

  const updateCollab = (id, patch) => setCollabs((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));
  const addCollab = () => setCollabs((cs) => [...cs, { id: "c" + Date.now(), brand: "New Brand", desc: "Description", link: "Link →", verified: false, accent: "#4ade80" }]);
  const removeCollab = (id) => setCollabs((cs) => cs.filter((c) => c.id !== id));

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .3s", zIndex: 90 }} />
      {/* sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100,
        background: "#15171a", borderTopLeftRadius: 22, borderTopRightRadius: 22,
        border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none",
        boxShadow: "0 -16px 50px rgba(0,0,0,0.5)", color: "#e4e4e7",
        transform: open ? "translateY(0)" : "translateY(110%)", transition: "transform .35s cubic-bezier(.22,1,.36,1)",
        maxHeight: "78vh", display: "flex", flexDirection: "column",
        fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 520, margin: "0 auto",
      }}>
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 12px" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Customize your page</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSave} style={{ padding: "7px 14px", borderRadius: 10, border: "none", background: GREEN, color: "#052e16", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>{saved ? "Saved ✓" : "Save"}</button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#e4e4e7", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        </div>
        {/* tabs */}
        <div style={{ display: "flex", gap: 6, padding: "0 14px 12px", overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${tab === t.id ? GREEN : "rgba(255,255,255,0.12)"}`, background: tab === t.id ? rgba(GREEN, 0.16) : "transparent", color: tab === t.id ? GREEN : "#a1a1aa" }}>{t.label}</button>
          ))}
        </div>
        {/* body */}
        <div style={{ overflowY: "auto", padding: "4px 18px 28px" }}>
          {tab === "palette" && (
            <div>
              <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 8, fontWeight: 600 }}>Presets</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {PRESETS.map((p) => {
                  const active = theme.primary === p.primary && theme.secondary === p.secondary && theme.tertiary === p.tertiary;
                  return (
                    <button key={p.name} onClick={() => set({ primary: p.primary, secondary: p.secondary, tertiary: p.tertiary, dark: p.dark })}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 12, cursor: "pointer", textAlign: "left", border: `1px solid ${active ? GREEN : "rgba(255,255,255,0.1)"}`, background: active ? rgba(GREEN, 0.1) : "rgba(255,255,255,0.03)", color: "#e4e4e7" }}>
                      <div style={{ display: "flex" }}>
                        {[p.primary, p.secondary, p.tertiary].map((c, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: c, marginLeft: i ? -5 : 0, border: "1.5px solid #15171a" }} />)}
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 600 }}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 10, fontWeight: 600 }}>Custom colors</div>
              {[["primary", "Primary (accents, buttons, score)"], ["secondary", "Secondary (hero glow, surfaces)"], ["tertiary", "Tertiary (page background)"]].map(([k, lbl]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5 }}>{lbl}</span>
                  <label style={{ cursor: "pointer", position: "relative" }}>
                    <input type="color" value={theme[k]} onChange={(e) => set({ [k]: e.target.value })} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: theme[k], border: "1px solid rgba(255,255,255,0.2)" }} />
                      <span style={{ fontSize: 11, color: "#71717a", fontFamily: "monospace" }}>{theme[k]}</span>
                    </span>
                  </label>
                </div>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12.5, cursor: "pointer" }}>
                <input type="checkbox" checked={theme.dark} onChange={(e) => set({ dark: e.target.checked })} />
                Dark mode text & surfaces
              </label>
            </div>
          )}

          {tab === "fonts" && (
            <div>
              <FontPicker label="Name font" value={theme.nameFont} onChange={(v) => set({ nameFont: v })} keys={FONT_KEYS} />
              <ColorField label="Name color" value={theme.nameColor} onChange={(v) => set({ nameColor: v })} theme={theme} />
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0" }} />
              <FontPicker label="Section header font (Highlights, Collaborations)" value={theme.headerFont} onChange={(v) => set({ headerFont: v })} keys={FONT_KEYS} />
              <ColorField label="Header color" value={theme.headerColor} onChange={(v) => set({ headerColor: v })} theme={theme} />
            </div>
          )}

          {tab === "bio" && (
            <div>
              <FontPicker label="Bio / tagline font" value={theme.bioFont} onChange={(v) => set({ bioFont: v })} keys={BIO_FONT_KEYS} />
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <Toggle label="Italic" on={theme.bioItalic} onClick={() => set({ bioItalic: !theme.bioItalic })} />
                <Toggle label="Bold" on={theme.bioBold} onClick={() => set({ bioBold: !theme.bioBold })} />
              </div>
              <ColorField label="Bio color" value={theme.bioColor} onChange={(v) => set({ bioColor: v })} theme={theme} />
            </div>
          )}

          {tab === "collabs" && (
            <div>
              {collabs.map((c) => (
                <div key={c.id} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, marginBottom: 10, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input type="color" value={c.accent} onChange={(e) => updateCollab(c.id, { accent: e.target.value })} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                    <input value={c.brand} onChange={(e) => updateCollab(c.id, { brand: e.target.value })} placeholder="Brand" style={inp()} />
                    <button onClick={() => removeCollab(c.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, padding: 4 }}>🗑</button>
                  </div>
                  <input value={c.desc} onChange={(e) => updateCollab(c.id, { desc: e.target.value })} placeholder="Description" style={{ ...inp(), marginBottom: 8, width: "100%" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input value={c.code || ""} onChange={(e) => updateCollab(c.id, { code: e.target.value, link: undefined })} placeholder="Promo code" style={inp()} />
                    <span style={{ fontSize: 10, color: "#71717a" }}>or</span>
                    <input value={c.link || ""} onChange={(e) => updateCollab(c.id, { link: e.target.value, code: undefined })} placeholder="Link label" style={inp()} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!c.verified} onChange={(e) => updateCollab(c.id, { verified: e.target.checked })} /> Verified badge
                  </label>
                </div>
              ))}
              <button onClick={addCollab} style={{ width: "100%", padding: "11px", borderRadius: 11, border: "1px dashed rgba(255,255,255,0.25)", background: "transparent", color: "#a1a1aa", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add collaboration</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FontPicker({ label, value, onChange, keys }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#a1a1aa", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: keys.length > 2 ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
        {keys.map((k) => (
          <button key={k} onClick={() => onChange(k)} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `1px solid ${value === k ? GREEN : "rgba(255,255,255,0.12)"}`, background: value === k ? rgba(GREEN, 0.12) : "rgba(255,255,255,0.03)", color: "#e4e4e7", fontFamily: FONTS[k].stack, fontSize: 16 }}>
            {FONTS[k].label}
          </button>
        ))}
      </div>
    </div>
  );
}
function Toggle({ label, on, onClick }) {
  return <button onClick={onClick} style={{ flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, border: `1px solid ${on ? GREEN : "rgba(255,255,255,0.12)"}`, background: on ? rgba(GREEN, 0.14) : "rgba(255,255,255,0.03)", color: on ? GREEN : "#a1a1aa", fontStyle: label === "Italic" ? "italic" : "normal" }}>{label}</button>;
}
function inp() {
  return { flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fafafa", fontSize: 12.5, fontFamily: "inherit", outline: "none" };
}

// ════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════
export default function Ref3rProfile() {
  // resolve slug from URL once; bundled config is the instant fallback
  const slug = useMemo(() => getSlug(), []);
  const fallback = useMemo(() => loadCreator(slug), [slug]);

  const [creator, setCreator] = useState(fallback.creator);
  const [theme, setTheme] = useState(() => ({ ...DEFAULT_THEME, ...(fallback.themeOverride || {}) }));
  const [collabs, setCollabs] = useState(fallback.collabs);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(null);
  const heroRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const T = useMemo(() => buildTokens(theme), [theme]);
  const clout = useCountUp(creator.stats.clout, 1600);

  // load config from the API (falls back silently to bundled data on error)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/creators/${encodeURIComponent(slug || DEFAULT_SLUG)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.creator) return;
        setCreator(data.creator);
        if (data.collabs) setCollabs(data.collabs);
        setTheme({ ...DEFAULT_THEME, ...(data.theme || {}) });
      } catch (e) { /* offline / no backend → keep bundled fallback */ }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/creators/${encodeURIComponent(fallback.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator, collabs, theme }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true); setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      // fallback: keep a local copy so the user doesn't lose work
      try { localStorage.setItem(`ref3r-profile-config:${fallback.slug}`, JSON.stringify({ theme, collabs })); } catch {}
      setSaved(true); setTimeout(() => setSaved(false), 1800);
    }
  };

  const handleMove = (e) => { if (!heroRef.current) return; const r = heroRef.current.getBoundingClientRect(); setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); };
  const copyCode = (code) => { navigator.clipboard?.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1600); };

  const nameColor = T.resolve(theme.nameColor);
  const headerColor = T.resolve(theme.headerColor);
  const bioColor = T.resolve(theme.bioColor);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: `radial-gradient(120% 80% at 50% 0%, ${T.pageGlow} 0%, ${T.page} 50%, ${T.page} 100%)`, fontFamily: "'Outfit', system-ui, sans-serif", display: "flex", justifyContent: "center", padding: "24px 12px 90px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Syne:wght@700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Playfair+Display:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes rise { from { opacity:0; transform:translateY(24px);} to {opacity:1; transform:translateY(0);} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .rise { animation: rise .7s cubic-bezier(.22,1,.36,1) both; }
        .liveDot { animation: pulse 1.8s ease-in-out infinite; }
        * { box-sizing: border-box; }
        input::placeholder { color:${T.inkFaint}; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 26 }}>

        {/* HERO */}
        <div ref={heroRef} onMouseMove={handleMove} className="rise" style={{ position: "relative", borderRadius: 28, overflow: "hidden", padding: "36px 24px 28px", textAlign: "center", background: `radial-gradient(80% 60% at ${mouse.x * 100}% ${mouse.y * 100}%, ${rgba(theme.primary, 0.18)}, transparent 60%), linear-gradient(180deg, ${T.secondary}, ${T.page})`, border: `1px solid ${rgba(theme.primary, 0.14)}`, transition: "background .2s ease-out" }}>
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 16px" }}>
            <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: `conic-gradient(from 0deg, ${T.primary}, ${rgba(theme.primary,0.6)}, ${T.primary})`, filter: "blur(2px)" }} />
            <div style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", background: T.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: T.primary, border: `3px solid ${T.page}`, fontFamily: FONTS[theme.nameFont].stack }}>{initials(creator.name)}</div>
            <div className="liveDot" style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: GREEN, border: `3px solid ${T.page}` }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontFamily: FONTS[theme.nameFont].stack, fontSize: 28, fontWeight: 800, color: nameColor, margin: 0 }}>{creator.name}</h1>
            <span style={{ color: GREEN, fontSize: 18 }}>✓</span>
          </div>
          <div style={{ color: T.inkFaint, fontSize: 14, marginBottom: 12 }}>@{creator.handle}</div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { t: "Lvl 1", brand: true },
              { t: "OG", brand: true },
              { t: `📍 ${creator.location}`, brand: false },
              ...(Array.isArray(creator.niche) ? creator.niche : [creator.niche])
                .filter(Boolean).slice(0, 3).map((n) => ({ t: `#${n}`, brand: false })),
            ].map((b, i) => (
              <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 600, background: b.brand ? rgba(GREEN, 0.12) : T.panelAlt, color: b.brand ? GREEN : T.inkSoft, border: `1px solid ${b.brand ? rgba(GREEN, 0.28) : T.line}` }}>{b.t}</span>
            ))}
          </div>

          <p style={{ fontFamily: FONTS[theme.bioFont].stack, color: bioColor, fontSize: 16, fontWeight: theme.bioBold ? 700 : 500, fontStyle: theme.bioItalic ? "italic" : "normal", margin: "0 0 5px", lineHeight: 1.4 }}>"{creator.tagline}"</p>
          <p style={{ fontFamily: FONTS[theme.bioFont].stack, color: T.inkFaint, fontSize: 13, fontStyle: theme.bioItalic ? "italic" : "normal", fontWeight: theme.bioBold ? 600 : 400, margin: 0 }}>{creator.bio}</p>

          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 20 }}>
            {creator.socials.map((s) => (
              <div key={s.id} style={{ textAlign: "center" }}>
                <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: "pointer", color: T.ink, transition: "transform .2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px) scale(1.1)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
                  <SocialIcon id={s.id} size={26} />
                </div>
                <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 7, fontWeight: 600 }}>{s.followers}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EMAIL */}
        <div className="rise" style={{ animationDelay: ".1s" }}>
          {!subscribed ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, padding: "15px 18px", borderRadius: 16, background: T.panel, border: `1px solid ${T.line}`, color: T.ink, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              <button onClick={() => email.includes("@") && setSubscribed(true)} style={{ padding: "0 22px", borderRadius: 16, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${T.primary}, ${rgba(theme.primary, 0.8)})`, color: T.onPrimary, fontWeight: 700, fontSize: 14, fontFamily: "inherit", whiteSpace: "nowrap", boxShadow: `0 6px 20px ${rgba(theme.primary, 0.35)}` }}>Connect →</button>
            </div>
          ) : (
            <div style={{ padding: "15px 18px", borderRadius: 16, textAlign: "center", background: rgba(theme.primary, 0.1), border: `1px solid ${rgba(theme.primary, 0.3)}`, color: T.primary, fontWeight: 600, fontSize: 14 }}>✓ You're in. Welcome to the squad.</div>
          )}
        </div>

        {/* SCORE + CLOUT */}
        <div className="rise" style={{ animationDelay: ".15s", borderRadius: 20, padding: "14px 18px", background: T.panel, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 16 }}>
          <ScoreRing score={creator.stats.ref3rScore} T={T} />
          <div style={{ flex: 1 }}><StatPill label="Clout" value={Math.round(clout).toLocaleString()} delta={creator.stats.cloutDelta} T={T} /></div>
        </div>

        {/* COLLABS */}
        <div className="rise" style={{ animationDelay: ".2s", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: FONTS[theme.headerFont].stack, fontSize: 19, fontWeight: 800, color: headerColor, paddingLeft: 4 }}>Collaborations</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {collabs.map((c) => (
              <div key={c.id} style={{ borderRadius: 16, overflow: "hidden", background: T.panel, border: `1px solid ${T.line}`, display: "flex", flexDirection: "column", transition: "transform .2s, border-color .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${c.accent}66`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = T.line; }}>
                <div style={{ position: "relative", aspectRatio: "16/10", background: `radial-gradient(120% 100% at 30% 20%, ${c.accent}33, transparent 70%), ${T.panelAlt}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, fontSize: 18, fontWeight: 800, background: `${c.accent}26`, color: c.accent, border: `1px solid ${c.accent}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>{(c.brand || "?")[0]}</div>
                  {c.verified && <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 999, color: GREEN, background: T.dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.85)", border: `1px solid ${rgba(GREEN, 0.3)}` }}>✓ VERIFIED</span>}
                  <span style={{ position: "absolute", top: 6, right: 6, color: T.inkSoft, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>⋮</span>
                </div>
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 2 }}>{c.brand}</div>
                    <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.35 }}>{c.desc}</div>
                  </div>
                  {c.code ? (
                    <button onClick={() => copyCode(c.code)} style={{ padding: "7px 10px", borderRadius: 10, border: `1px dashed ${c.accent}88`, background: `${c.accent}1a`, color: c.accent, fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>{copied === c.code ? "Copied!" : c.code}</button>
                  ) : (
                    <button style={{ padding: "7px 10px", borderRadius: 10, border: `1px solid ${T.line}`, background: "transparent", color: c.accent, fontWeight: 600, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>{c.link}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HIGHLIGHTS */}
        <div className="rise" style={{ animationDelay: ".25s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingLeft: 4 }}>
            <span style={{ fontFamily: FONTS[theme.headerFont].stack, fontSize: 19, fontWeight: 800, color: headerColor }}>Highlights</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", ...Object.keys(PLATFORMS)].map((k) => {
                const active = tab === k; const c = k === "all" ? T.primary : PLATFORMS[k].color;
                return <button key={k} onClick={() => setTab(k)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize", border: `1px solid ${active ? c : T.line}`, background: active ? `${c}1f` : "transparent", color: active ? c : T.inkSoft, transition: "all .15s" }}>{k === "all" ? "All" : PLATFORMS[k].label}</button>;
              })}
            </div>
          </div>
          {(() => { const shown = creator.highlights.filter((h) => tab === "all" || h.platform === tab); return <HighlightsCarousel key={tab} items={shown} T={T} creator={creator} />; })()}
        </div>

        {/* FOOTER */}
        <div className="rise" style={{ animationDelay: ".3s", textAlign: "center", padding: "20px 0 8px" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: T.inkFaint, marginBottom: 4 }}>POWERED BY</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 12 }}>REF<span style={{ color: GREEN }}>3</span>R</div>
          <button style={{ padding: "10px 24px", borderRadius: 999, border: `1px solid ${rgba(GREEN, 0.3)}`, background: "transparent", color: GREEN, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Create your free profile →</button>
        </div>
      </div>

      {/* EDIT FAB */}
      {!editing && (
        <button onClick={() => setEditing(true)} style={{ position: "fixed", bottom: 22, right: 22, zIndex: 80, padding: "13px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: GREEN, color: "#052e16", fontWeight: 700, fontSize: 14, fontFamily: "'Outfit', sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", gap: 7 }}>✎ Edit page</button>
      )}

      <EditorSheet open={editing} onClose={() => setEditing(false)} theme={theme} setTheme={setTheme} collabs={collabs} setCollabs={setCollabs} onSave={handleSave} saved={saved} />
    </div>
  );
}
