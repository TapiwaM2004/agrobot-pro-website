import React, { useState, useEffect, useRef } from "react";

// ── Original AgroBot green colours ────────────────────────────
const N = {
  bg:     "#1b5e20",
  bg2:    "#154a19",
  accent: "#f9a825",
  text:   "#ffffff",
  muted:  "rgba(255,255,255,0.55)",
  hover:  "rgba(249,168,37,0.12)",
  active: "rgba(249,168,37,0.2)",
  border: "rgba(249,168,37,0.25)",
  red:    "#ef4444",
};

const ALL_LINKS = [
  { id:"dashboard",     label:"🏠 Home",             group:"free"    },
  { id:"disease",       label:"🌿 Crop Disease",      group:"free"    },
  { id:"soil",          label:"🧪 Soil & Fertilizer", group:"free"    },
  { id:"marketplace",   label:"🛒 Marketplace",       group:"free"    },
  { id:"news",          label:"📰 Farming News",      group:"free"    },
  { id:"community",     label:"👥 Community",         group:"free"    },
  { id:"weather",       label:"🌤️ GPS Weather",       group:"premium" },
  { id:"photo",         label:"📸 Photo Analysis",    group:"premium" },
  { id:"prices",        label:"💰 Live Prices",       group:"premium" },
  { id:"seeds",         label:"🌱 Seed Guide",        group:"premium" },
  { id:"help",          label:"📍 Find Help",         group:"premium" },
  { id:"loans",         label:"🏦 Loans & Insurance", group:"premium" },
  { id:"farmplan",      label:"📅 Farm Calendar",     group:"premium" },
  { id:"profile",       label:"👤 My Profile",        group:"account" },
  { id:"notifications", label:"🔔 Notifications",     group:"account" },
  { id:"settings",      label:"🎨 Settings & Themes", group:"account" },
  { id:"support",       label:"🎫 Support Ticket",    group:"account" },
  { id:"payment",       label:"💳 Subscribe",         group:"account" },
  { id:"admin",         label:"🔐 Admin Panel",       group:"admin"   },
];

const GROUP_LABELS = {
  free:    "📋 Free Services",
  premium: "💎 Premium Services",
  account: "👤 My Account",
  admin:   "🔐 Administration",
};

export default function Navbar({ page, setPage, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const plan = user?.plan || "free";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [page]);

  const planColor =
    plan === "premium" || plan === "business" ? "#4caf50" :
    plan === "trial" ? N.accent : "rgba(255,255,255,0.4)";

  const planLabel =
    plan === "premium"  ? "⭐ PREMIUM"    :
    plan === "business" ? "🏆 BUSINESS"   :
    plan === "trial"    ? "🎁 FREE TRIAL" : "🆓 FREE PLAN";

  const currentLabel = ALL_LINKS.find(l => l.id === page)?.label || "🏠 Home";

  return (
    <nav style={{
      background: N.bg, position: "sticky", top: 0, zIndex: 1000,
      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 16px", height: 56,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>

        {/* Logo */}
        <div onClick={() => setPage("dashboard")} style={{
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer", flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(249,168,37,0.18)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16,
          }}>🌱</div>
          <span style={{
            fontWeight: 900, fontSize: 15, color: N.accent,
            whiteSpace: "nowrap", letterSpacing: 0.3,
          }}>AgroBot Pro</span>
        </div>

        {/* Current page pill */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{
            background: N.active, border: `1px solid ${N.border}`,
            borderRadius: 20, padding: "5px 14px",
            fontSize: 12, fontWeight: 700, color: N.accent,
            maxWidth: 200, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {currentLabel}
          </div>
        </div>

        {/* Plan badge + hamburger */}
        <div style={{ display: "flex", alignItems: "center",
          gap: 8, flexShrink: 0 }}>

          <div style={{
            background: `${planColor}22`,
            border: `1px solid ${planColor}55`,
            color: planColor, padding: "3px 10px",
            borderRadius: 20, fontSize: 10,
            fontWeight: 800, whiteSpace: "nowrap",
          }}>
            {planLabel}
          </div>

          <div ref={menuRef} style={{ position: "relative" }}>
            {/* Hamburger button */}
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                width: 38, height: 38, borderRadius: 9, padding: 0,
                background: open ? N.active : "rgba(255,255,255,0.08)",
                border: `1.5px solid ${open ? N.accent : "rgba(255,255,255,0.2)"}`,
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <span style={{
                display: "block", width: 17, height: 2, borderRadius: 2,
                background: open ? N.accent : "#fff",
                transform: open ? "rotate(45deg) translate(5px,5px)" : "none",
                transition: "all 0.25s",
              }}/>
              <span style={{
                display: "block", width: 17, height: 2, borderRadius: 2,
                background: open ? N.accent : "#fff",
                opacity: open ? 0 : 1, transition: "all 0.25s",
              }}/>
              <span style={{
                display: "block", width: 17, height: 2, borderRadius: 2,
                background: open ? N.accent : "#fff",
                transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none",
                transition: "all 0.25s",
              }}/>
            </button>

            {/* Dropdown */}
            {open && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                zIndex: 500, background: "#1a3a1a",
                border: `1px solid rgba(249,168,37,0.2)`,
                borderRadius: 18, width: 270,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                overflow: "hidden",
              }}>

                {/* User header */}
                <div style={{
                  padding: "14px 16px 12px",
                  borderBottom: "1px solid rgba(249,168,37,0.12)",
                  background: "rgba(249,168,37,0.05)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(249,168,37,0.2)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16, flexShrink: 0,
                  }}>🌱</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>
                      {user?.name || `Farmer ${user?.phone?.slice(-4)}`}
                    </div>
                    <div style={{ fontSize: 11, color: N.accent, fontWeight: 600 }}>
                      {planLabel}
                    </div>
                  </div>
                </div>

                {/* Groups */}
                <div style={{ maxHeight: "72vh", overflowY: "auto", padding: "6px 0" }}>
                  {["free","premium","account","admin"].map(group => (
                    <div key={group}>
                      <div style={{
                        padding: "8px 16px 3px", fontSize: 9,
                        fontWeight: 800, letterSpacing: 1.2,
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                      }}>
                        {GROUP_LABELS[group]}
                      </div>

                      {ALL_LINKS.filter(l => l.group === group).map(l => {
                        const isActive = page === l.id;
                        const isAdmin  = l.group === "admin";
                        return (
                          <div
                            key={l.id}
                            onClick={() => { setPage(l.id); setOpen(false); }}
                            style={{
                              padding: "9px 16px", cursor: "pointer",
                              display: "flex", alignItems: "center",
                              gap: 8, fontSize: 13, fontWeight: 600,
                              color: isActive ? N.accent :
                                     isAdmin  ? "#f87171" : "#fff",
                              background: isActive ? N.hover : "transparent",
                              borderLeft: isActive
                                ? `3px solid ${N.accent}`
                                : "3px solid transparent",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                              if (!isActive)
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.06)";
                            }}
                            onMouseLeave={e => {
                              if (!isActive)
                                e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {l.label}
                            {isActive && (
                              <span style={{
                                marginLeft: "auto", fontSize: 10,
                                background: N.accent, color: N.bg,
                                padding: "2px 8px", borderRadius: 20,
                                fontWeight: 900,
                              }}>NOW</span>
                            )}
                          </div>
                        );
                      })}

                      {group !== "admin" && (
                        <div style={{
                          height: 1, margin: "5px 16px",
                          background: "rgba(255,255,255,0.07)",
                        }}/>
                      )}
                    </div>
                  ))}
                </div>

                {/* Logout */}
                <div style={{
                  padding: "10px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <button
                    onClick={() => { onLogout(); setOpen(false); }}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 10,
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "transparent", color: N.red,
                      fontWeight: 700, fontSize: 13,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                    onMouseLeave={e =>
                      e.currentTarget.style.background = "transparent"}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}