import React, { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const GREEN = "#4ade80";
const TOKEN_KEY = "ref3r-admin-token";

const ui = {
  page: { minHeight: "100vh", background: "radial-gradient(120% 80% at 50% 0%, #14241a 0%, #0a0f0c 50%, #050706 100%)", color: "#e4e4e7", fontFamily: "'Outfit', system-ui, sans-serif", padding: "32px 16px" },
  wrap: { maxWidth: 720, margin: "0 auto" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18 },
  input: { width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fafafa", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  label: { fontSize: 11, color: "#a1a1aa", fontWeight: 600, marginBottom: 5, display: "block" },
  btn: { padding: "11px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: GREEN, color: "#052e16", fontWeight: 700, fontSize: 14, fontFamily: "inherit" },
  btnGhost: { padding: "9px 14px", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#e4e4e7", fontWeight: 600, fontSize: 13, fontFamily: "inherit" },
  btnDanger: { padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontWeight: 600, fontSize: 12.5, fontFamily: "inherit" },
};

function field(label, value, onChange, placeholder) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={ui.label}>{label}</label>
      <input style={ui.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);
  const [creating, setCreating] = useState(false);

  const authHeaders = useCallback(() => ({ "Content-Type": "application/json", "x-admin-token": token }), [token]);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/creators`);
      if (res.ok) setList(await res.json());
    } catch {}
  }, []);

  const verify = async (t) => {
    setChecking(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/verify`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": t } });
      if (res.ok) {
        sessionStorage.setItem(TOKEN_KEY, t);
        setToken(t); setAuthed(true); loadList();
      } else if (res.status === 503) {
        setError("Admin is disabled — ADMIN_TOKEN isn't set on the server.");
      } else {
        setError("Incorrect password.");
      }
    } catch { setError("Couldn't reach the server."); }
    setChecking(false);
  };

  // auto-verify a stored token on load
  useEffect(() => { if (token) verify(token); /* eslint-disable-next-line */ }, []);

  const remove = async (slug) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_BASE}/api/admin/creators/${slug}`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) loadList(); else alert("Delete failed.");
  };

  const resetSlug = async (slug) => {
    if (!confirm(`Reset "${slug}" to its original seed data?`)) return;
    const res = await fetch(`${API_BASE}/api/creators/${slug}/reset`, { method: "POST" });
    if (res.ok) { loadList(); alert("Reset done."); } else alert("No seed exists for this slug.");
  };

  if (!authed) {
    return (
      <div style={ui.page}>
        <div style={{ ...ui.wrap, maxWidth: 360, marginTop: "18vh" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800 }}>REF<span style={{ color: GREEN }}>3</span>R</div>
            <div style={{ color: "#71717a", fontSize: 13, marginTop: 4 }}>Admin</div>
          </div>
          <div style={ui.card}>
            <label style={ui.label}>Admin password</label>
            <input style={ui.input} type="password" value={token} onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify(token)} placeholder="••••••••" autoFocus />
            {error && <div style={{ color: "#f87171", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
            <button style={{ ...ui.btn, width: "100%", marginTop: 14, opacity: checking ? 0.6 : 1 }} disabled={checking} onClick={() => verify(token)}>
              {checking ? "Checking…" : "Enter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={ui.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');`}</style>
      <div style={ui.wrap}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Creators</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={ui.btn} onClick={() => setCreating(true)}>+ New creator</button>
            <button style={ui.btnGhost} onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setAuthed(false); setToken(""); }}>Log out</button>
          </div>
        </div>

        {creating && <CreateForm authHeaders={authHeaders} onDone={() => { setCreating(false); loadList(); }} onCancel={() => setCreating(false)} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.length === 0 && <div style={{ color: "#71717a", fontSize: 14 }}>No creators yet.</div>}
          {list.map((c) => (
            <div key={c.slug} style={{ ...ui.card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name || c.slug}</div>
                <div style={{ color: "#71717a", fontSize: 12.5, marginTop: 2 }}>/{c.slug} · updated {new Date(c.updated_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <a href={`/${c.slug}`} style={{ ...ui.btnGhost, textDecoration: "none" }}>Open</a>
                <button style={ui.btnGhost} onClick={() => resetSlug(c.slug)}>Reset</button>
                <button style={ui.btnDanger} onClick={() => remove(c.slug)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ color: "#52525b", fontSize: 11.5, marginTop: 24, lineHeight: 1.5 }}>
          "Open" links to the live profile, where palette / fonts / bio / collabs can be edited inline.
          "Reset" restores a seeded creator to its original data. Detailed fields (name, stats, highlights)
          are set at creation here.
        </div>
      </div>
    </div>
  );
}

function CreateForm({ authHeaders, onDone, onCancel }) {
  const [f, setF] = useState({ slug: "", name: "", handle: "", tagline: "", bio: "", location: "", niche: "", ref3rScore: "", clout: "", cloutDelta: "" });
  const [socials, setSocials] = useState([
    { id: "instagram", label: "IG", color: "#E1306C", followers: "" },
    { id: "youtube", label: "YT", color: "#FF0000", followers: "" },
    { id: "tiktok", label: "TT", color: "#69C9D0", followers: "" },
    { id: "twitter", label: "X", color: "#1DA1F2", followers: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(""); setBusy(true);
    const niche = f.niche.includes(",") ? f.niche.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3) : f.niche.trim();
    const payload = {
      slug: f.slug.trim().toLowerCase(),
      creator: {
        name: f.name.trim(), handle: f.handle.trim() || f.slug.trim(), tagline: f.tagline.trim(),
        bio: f.bio.trim(), location: f.location.trim(), niche,
        stats: { ref3rScore: Number(f.ref3rScore) || 0, clout: Number(f.clout) || 0, cloutDelta: Number(f.cloutDelta) || 0 },
        socials: socials.filter((s) => s.followers.trim()),
        highlights: [],
      },
      collabs: [],
      theme: null,
    };
    try {
      const res = await fetch(`${API_BASE}/api/admin/creators`, { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) onDone();
      else setErr(data.message || "Create failed.");
    } catch { setErr("Couldn't reach the server."); }
    setBusy(false);
  };

  return (
    <div style={{ ...ui.card, marginBottom: 16, border: `1px solid ${GREEN}44` }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>New creator</div>
      {field("Slug (URL) — lowercase, no spaces", f.slug, (v) => set("slug", v), "e.g. nike")}
      {field("Name *", f.name, (v) => set("name", v), "Full name")}
      {field("Handle", f.handle, (v) => set("handle", v), "username (defaults to slug)")}
      {field("Tagline", f.tagline, (v) => set("tagline", v), "Short quote / motto")}
      {field("Bio", f.bio, (v) => set("bio", v), "One-line description")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {field("Location", f.location, (v) => set("location", v), "City, Country")}
        {field("Niche(s) — up to 3, comma-separated", f.niche, (v) => set("niche", v), "Fashion, Beauty")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {field("REF3R Score", f.ref3rScore, (v) => set("ref3rScore", v), "302")}
        {field("Clout", f.clout, (v) => set("clout", v), "72100")}
        {field("Clout Δ%", f.cloutDelta, (v) => set("cloutDelta", v), "6")}
      </div>
      <label style={ui.label}>Social follower counts</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {socials.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#a1a1aa", width: 26 }}>{s.label}</span>
            <input style={ui.input} value={s.followers} placeholder="58.2K"
              onChange={(e) => setSocials((arr) => arr.map((x, j) => j === i ? { ...x, followers: e.target.value } : x))} />
          </div>
        ))}
      </div>
      {err && <div style={{ color: "#f87171", fontSize: 12.5, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...ui.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>{busy ? "Creating…" : "Create"}</button>
        <button style={ui.btnGhost} onClick={onCancel}>Cancel</button>
      </div>
      <div style={{ color: "#52525b", fontSize: 11.5, marginTop: 12, lineHeight: 1.5 }}>
        After creating, click "Open" on the new creator to add highlights, collabs, and tune the palette inline.
      </div>
    </div>
  );
}
