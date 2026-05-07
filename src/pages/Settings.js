import React, { useContext, useState } from "react";
import { ThemeContext, THEMES } from "../ThemeContext";

const THEME_PREVIEWS = {
  earthGreen:     { bg: "#f0f7f0", accent: "#2e7d32",  text: "#1b2e1b" },
  darkForest:     { bg: "#0a0f0a", accent: "#22c55e",  text: "#e8f5e8" },
  savanna:        { bg: "#fdf6ec", accent: "#c17f24",  text: "#2c1810" },
  skyBlue:        { bg: "#f0f6ff", accent: "#0369a1",  text: "#0f172a" },
  midnightPurple: { bg: "#0d0d1a", accent: "#a78bfa",  text: "#e2e8f0" },
  warmRed:        { bg: "#fff5f5", accent: "#dc2626",  text: "#1c0a0a" },
};

export default function Settings({ user, onLogout }) {
  const { theme: T, themeName, setThemeName, isDark } = useContext(ThemeContext);
  const [saved, setSaved] = useState(false);

  const save = (name) => {
    setThemeName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const s = {
    wrap: {
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      color: T.text,
      paddingBottom: 40,
    },
    pageTitle: {
      fontSize: 22, fontWeight: 900, color: T.text,
      marginBottom: 4, display: "flex", alignItems: "center", gap: 8,
    },
    pageSub: { fontSize: 13, color: T.muted, marginBottom: 24, marginTop: 0 },
    section: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: "22px 22px",
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 15, fontWeight: 800, color: T.text,
      marginTop: 0, marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    },
    themeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 12,
    },
    themeCard: (name) => ({
      borderRadius: 14,
      border: themeName === name
        ? `2.5px solid ${T.green}`
        : `1.5px solid ${T.border}`,
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.18s, box-shadow 0.18s",
      boxShadow: themeName === name
        ? `0 0 0 3px ${T.green}33`
        : "none",
    }),
    themePreview: (name) => ({
      height: 56,
      background: THEME_PREVIEWS[name].bg,
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: 6, padding: "0 12px",
    }),
    themeAccentDot: (name) => ({
      width: 18, height: 18, borderRadius: "50%",
      background: THEME_PREVIEWS[name].accent,
      boxShadow: `0 0 8px ${THEME_PREVIEWS[name].accent}88`,
    }),
    themeLabel: (name) => ({
      padding: "10px 12px",
      background: T.surface,
      fontSize: 12, fontWeight: 700,
      color: themeName === name ? T.green : T.text,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }),
    quickToggle: {
      display: "flex", gap: 10, flexWrap: "wrap",
    },
    toggleBtn: (active) => ({
      padding: "10px 20px", borderRadius: 12,
      border: active ? "none" : `1.5px solid ${T.border}`,
      cursor: "pointer", fontWeight: 700, fontSize: 13,
      background: active ? T.green : T.surface,
      color: active ? T.bg : T.text,
      transition: "all 0.18s", fontFamily: "inherit",
    }),
    infoRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "10px 0",
      borderBottom: `1px solid ${T.border}`,
      fontSize: 13,
    },
    infoLabel: { color: T.muted, fontWeight: 600 },
    infoValue: { color: T.text, fontWeight: 700 },
    savedBanner: {
      background: `${T.green}22`,
      border: `1px solid ${T.green}44`,
      color: T.green,
      borderRadius: 10, padding: "10px 16px",
      fontSize: 13, fontWeight: 700,
      marginBottom: 16, textAlign: "center",
      transition: "opacity 0.3s",
    },
    logoutBtn: {
      width: "100%", padding: "13px",
      borderRadius: 12, border: `1.5px solid #ef444466`,
      cursor: "pointer", fontWeight: 700, fontSize: 14,
      background: "transparent", color: "#ef4444",
      fontFamily: "inherit", transition: "all 0.18s",
    },
  };

  return (
    <div style={s.wrap}>

      <h2 style={s.pageTitle}>⚙️ Settings</h2>
      <p style={s.pageSub}>Personalise your AgroBot experience</p>

      {saved && (
        <div style={s.savedBanner}>✅ Theme saved!</div>
      )}

      {/* ── Quick Toggle: Light / Dark ────────────────────── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>🌓 Light / Dark Mode</h3>
        <div style={s.quickToggle}>
          <button
            style={s.toggleBtn(!isDark)}
            onClick={() => save("earthGreen")}
          >
            ☀️ Light Mode
          </button>
          <button
            style={s.toggleBtn(isDark && themeName === "darkForest")}
            onClick={() => save("darkForest")}
          >
            🌑 Dark Forest
          </button>
          <button
            style={s.toggleBtn(themeName === "midnightPurple")}
            onClick={() => save("midnightPurple")}
          >
            🌙 Midnight
          </button>
        </div>
      </div>

      {/* ── Full Theme Picker ──────────────────────────────── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>🎨 Choose Your Theme</h3>
        <div style={s.themeGrid}>
          {Object.entries(THEMES).map(([name, thm]) => (
            <div
              key={name}
              style={s.themeCard(name)}
              onClick={() => save(name)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.15)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = themeName === name
                  ? `0 0 0 3px ${T.green}33` : "none";
              }}
            >
              {/* Preview swatch */}
              <div style={s.themePreview(name)}>
                <div style={s.themeAccentDot(name)} />
                <div style={{
                  fontSize: 20,
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
                }}>
                  {name === "earthGreen"     ? "🌿" :
                   name === "darkForest"     ? "🌑" :
                   name === "savanna"        ? "🌅" :
                   name === "skyBlue"        ? "🌊" :
                   name === "midnightPurple" ? "🌙" : "🌺"}
                </div>
              </div>
              <div style={s.themeLabel(name)}>
                <span>{thm.name.replace(/^.+? /, "")}</span>
                {themeName === name && (
                  <span style={{
                    background: T.green, color: T.bg,
                    fontSize: 9, fontWeight: 900,
                    padding: "2px 7px", borderRadius: 20,
                  }}>✓ ON</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview strip */}
        <div style={{
          marginTop: 18, borderRadius: 12, overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}>
          <div style={{
            background: T.bg, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: T.green,
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, color: T.bg,
            }}>🌿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>
                AgroBot Pro
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>
                Live preview — {THEMES[themeName]?.name}
              </div>
            </div>
            <div style={{
              marginLeft: "auto",
              background: T.green, color: T.bg,
              padding: "6px 14px", borderRadius: 20,
              fontSize: 11, fontWeight: 700,
            }}>Active</div>
          </div>
          <div style={{
            background: T.card, padding: "12px 16px",
            borderTop: `1px solid ${T.border}`,
            display: "flex", gap: 10,
          }}>
            {["🌿 Crops", "💰 Prices", "🌤 Weather"].map(lbl => (
              <div key={lbl} style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10, padding: "7px 12px",
                fontSize: 12, fontWeight: 600, color: T.text,
              }}>{lbl}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account Info ───────────────────────────────────── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>👤 Account Info</h3>
        {[
          ["Name",    user?.name || `Farmer ${user?.phone?.slice(-4)}`],
          ["Phone",   user?.phone || "—"],
          ["Plan",    (user?.plan || "free").toUpperCase()],
          ["Support", "0787 341 018"],
        ].map(([lbl, val]) => (
          <div key={lbl} style={s.infoRow}>
            <span style={s.infoLabel}>{lbl}</span>
            <span style={s.infoValue}>{val}</span>
          </div>
        ))}
        <div style={{ ...s.infoRow, borderBottom: "none" }}>
          <span style={s.infoLabel}>App Version</span>
          <span style={s.infoValue}>AgroBot Pro v4.2</span>
        </div>
      </div>

      {/* ── Logout ─────────────────────────────────────────── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>🚪 Session</h3>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
          Logging out clears your local session. Your data stays safe in the cloud.
        </p>
        <button
          style={s.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#ef444415";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          🚪 Logout from AgroBot
        </button>
      </div>

    </div>
  );
}