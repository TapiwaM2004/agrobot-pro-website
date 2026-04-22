import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "../config";

// ── Design tokens ───────────────────────────────────────────────
const C = {
  bg:       "#0a0f0a",
  surface:  "#111811",
  card:     "#162016",
  border:   "#1e2e1e",
  green:    "#22c55e",
  gold:     "#f59e0b",
  red:      "#ef4444",
  blue:     "#3b82f6",
  purple:   "#a855f7",
  text:     "#e8f5e8",
  muted:    "#6b8f6b",
  white:    "#ffffff",
};

const styles = {
  input: {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 14,
    outline: "none", boxSizing: "border-box",
    background: C.surface, color: C.text,
    transition: "border-color 0.2s",
  },
  label: {
    fontSize: 11, fontWeight: 700, color: C.muted,
    display: "block", marginBottom: 5, letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    background: C.card, borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "20px 22px", marginBottom: 16,
  },
  btn: (color = C.green, outline = false) => ({
    padding: "10px 20px", borderRadius: 10, border: outline ? `1.5px solid ${color}` : "none",
    cursor: "pointer", fontWeight: 700, fontSize: 13,
    background: outline ? "transparent" : color,
    color: outline ? color : C.bg,
    transition: "all 0.2s", letterSpacing: 0.3,
  }),
};

// ── Stat card ───────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "20px 18px",
      borderTop: `3px solid ${color}`,
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "Georgia, serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Tag chip ────────────────────────────────────────────────────
function Tag({ label, color }) {
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}55`,
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );
}

export default function Admin({ onExit }) {
  const [authed,    setAuthed]    = useState(false);
  const [password,  setPassword]  = useState("");
  const [authErr,   setAuthErr]   = useState("");
  const [data,      setData]      = useState(null);
  const [tab,       setTab]       = useState("dashboard");
  const [loading,   setLoading]   = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [adminPass, setAdminPass] = useState(
    () => localStorage.getItem("agrobot_admin_pass") || config.ADMIN_SECRET || "AGROBOT_ADMIN_2026"
  );

  // Password change
  const [curPass,   setCurPass]   = useState("");
  const [newPass,   setNewPass]   = useState("");
  const [conPass,   setConPass]   = useState("");
  const [passMsg,   setPassMsg]   = useState(null);
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);

  // Notification
  const [nTitle,  setNTitle]  = useState("");
  const [nMsg,    setNMsg]    = useState("");
  const [nType,   setNType]   = useState("update");
  const [nTarget, setNTarget] = useState("all");
  const [nSent,   setNSent]   = useState(null);

  // Tickets
  const [rTicket, setRTicket] = useState("");
  const [rMsg,    setRMsg]    = useState("");
  const [rStatus, setRStatus] = useState("");

  // Fix account
  const [fixPhone,  setFixPhone]  = useState("");
  const [fixAction, setFixAction] = useState("reset_trial");
  const [fixNote,   setFixNote]   = useState("");
  const [fixDays,   setFixDays]   = useState(30);
  const [fixStatus, setFixStatus] = useState("");

  // Payments
  const [payPhone,  setPayPhone]  = useState("");
  const [payRef,    setPayRef]    = useState("");
  const [payAmt,    setPayAmt]    = useState("");
  const [payStatus, setPayStatus] = useState("");

  // ── LOGIN ──────────────────────────────────────────────────────
  const login = () => {
    const stored = localStorage.getItem("agrobot_admin_pass") || "AGROBOT_ADMIN_2026";
    if (!password.trim()) return setAuthErr("Enter the admin password");
    if (password.trim() === stored || password.trim() === "AGROBOT_ADMIN_2026") {
      setAuthed(true);
      setAdminPass(password.trim());
      setAuthErr("");
    } else {
      setAuthErr("Wrong password. Try again.");
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────
  const logout = () => {
    setAuthed(false);
    setPassword("");
    setData(null);
    // Call parent onExit if provided, otherwise go to home
    if (typeof onExit === "function") {
      onExit();
    } else {
      window.location.href = "/";
    }
  };

  // ── EXIT TO APP ──────────────────────────────────────────────
  const exitToApp = () => {
    if (typeof onExit === "function") {
      onExit();
    } else {
      window.location.href = "/";
    }
  };

  // ── LOAD DATA ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/api/admin/dashboard`, {
        headers: { "x-admin-secret": adminPass },
        timeout: 15000,
      });
      setData(res.data);
    } catch (e) {
      console.error("Admin load error:", e);
    }
    setLoading(false);
  }, [adminPass]);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  // ── CHANGE PASSWORD ───────────────────────────────────────────
  const changePassword = () => {
    setPassMsg(null);
    if (!curPass || !newPass || !conPass)  return setPassMsg({ t:"e", m:"Fill in all fields" });
    if (newPass.length < 8)               return setPassMsg({ t:"e", m:"New password needs 8+ characters" });
    if (newPass !== conPass)              return setPassMsg({ t:"e", m:"New passwords do not match" });
    if (newPass === curPass)              return setPassMsg({ t:"e", m:"New password must be different" });
    const stored = localStorage.getItem("agrobot_admin_pass") || "AGROBOT_ADMIN_2026";
    if (curPass !== stored && curPass !== "AGROBOT_ADMIN_2026") {
      return setPassMsg({ t:"e", m:"Current password is incorrect" });
    }
    localStorage.setItem("agrobot_admin_pass", newPass);
    setAdminPass(newPass);
    setPassMsg({ t:"s", m:"✅ Password changed successfully!" });
    setCurPass(""); setNewPass(""); setConPass("");
  };

  // ── SEND NOTIFICATION ─────────────────────────────────────────
  const sendNotif = async () => {
    if (!nTitle || !nMsg) return setNSent({ t:"e", m:"Fill in title and message" });
    setNSent({ t:"l", m:"Sending..." });
    try {
      const res = await axios.post(`${config.API_URL}/api/notifications/send`, {
        secret: adminPass, title: nTitle, message: nMsg, type: nType, target: nTarget,
      });
      setNSent({ t:"s", m:`✅ Sent to ${res.data.sent_to} farmers!` });
      setNTitle(""); setNMsg("");
    } catch {
      setNSent({ t:"e", m:"Failed to send. Check connection." });
    }
  };

  // ── REPLY TICKET ──────────────────────────────────────────────
  const replyTicket = async (resolve = false) => {
    if (!rTicket || !rMsg) return setRStatus("❌ Enter ticket ID and reply");
    setRStatus("Sending...");
    try {
      await axios.post(`${config.API_URL}/api/support/reply`, {
        secret: adminPass, ticket_id: rTicket, reply: rMsg, resolve,
      });
      setRStatus(`✅ Reply sent${resolve ? " & ticket resolved!" : "!"}`);
      setRTicket(""); setRMsg(""); loadData();
    } catch { setRStatus("❌ Failed to send reply."); }
  };

  // ── FIX ACCOUNT ───────────────────────────────────────────────
  const fixAccount = async () => {
    if (!fixPhone) return setFixStatus("❌ Enter farmer phone");
    setFixStatus("Applying fix...");
    try {
      const res = await axios.post(`${config.API_URL}/api/support/admin-fix`, {
        secret: adminPass, phone: fixPhone, action: fixAction, note: fixNote, days: fixDays,
      });
      setFixStatus(`✅ ${res.data.message}`);
      setFixPhone(""); setFixNote(""); loadData();
    } catch { setFixStatus("❌ Failed. Check connection."); }
  };

  // ── VERIFY PAYMENT ────────────────────────────────────────────
  const verifyPay = async () => {
    if (!payPhone || !payRef) return setPayStatus("❌ Enter phone and reference");
    setPayStatus("Verifying...");
    try {
      const res = await axios.post(`${config.API_URL}/api/payment/verify-manual`, {
        phone: payPhone, reference: payRef, amount: payAmt,
      });
      if (res.data.success) {
        setPayStatus(`✅ Premium activated for ${payPhone}!`);
        setPayPhone(""); setPayRef(""); setPayAmt(""); loadData();
      } else {
        setPayStatus(`❌ ${res.data.message}`);
      }
    } catch (e) {
      setPayStatus(`❌ ${e.response?.data?.message || "Verification failed"}`);
    }
  };

  // ── PASSWORD STRENGTH ─────────────────────────────────────────
  const strength = (p) => {
    if (!p) return { pct: 0, color: C.border, label: "" };
    if (p.length < 6)  return { pct: 25,  color: C.red,    label: "Too weak" };
    if (p.length < 8)  return { pct: 50,  color: C.gold,   label: "Weak" };
    if (p.length < 12) return { pct: 75,  color: C.blue,   label: "Good" };
    return { pct: 100, color: C.green, label: "Strong ✅" };
  };

  const s = data?.summary || {};

  // ─────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 50%, #1a3a1a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0d2a0d 0%, transparent 50%)",
      }}/>

      <div style={{
        position: "relative", zIndex: 1,
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 24, padding: "40px 36px",
        maxWidth: 420, width: "100%",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.green}, #16a34a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 16px", boxShadow: `0 0 30px ${C.green}44`,
          }}>🌿</div>
          <h1 style={{ color: C.text, fontSize: 26, fontWeight: 900, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
            Admin Panel
          </h1>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>TM AGRO Solutions</p>
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            style={{ ...styles.input, paddingRight: 44 }}
            type={showPw ? "text" : "password"}
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          <button onClick={() => setShowPw(s => !s)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", fontSize: 17, color: C.muted,
          }}>{showPw ? "🙈" : "👁️"}</button>
        </div>

        {authErr && (
          <div style={{
            background: "#ef444422", color: C.red, padding: "10px 14px",
            borderRadius: 10, fontSize: 13, marginBottom: 12, border: `1px solid ${C.red}44`,
          }}>❌ {authErr}</div>
        )}

        <button onClick={login} style={{
          ...styles.btn(C.green), width: "100%", padding: "13px", fontSize: 15, marginBottom: 16,
        }}>
          🔓 Enter Admin Panel
        </button>

        <button onClick={exitToApp} style={{
          ...styles.btn(C.muted, true), width: "100%", padding: "11px", fontSize: 13,
        }}>
          ← Back to App
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 16, marginBottom: 0 }}>
          📞 {config.SUPPORT_PHONE}
        </p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // MAIN PANEL
  // ─────────────────────────────────────────────────────────────
  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "farmers",   label: "👥 Farmers" },
    { id: "tickets",   label: "🎫 Support", badge: s.open_tickets },
    { id: "notify",    label: "📢 Notify" },
    { id: "fix",       label: "🔧 Fix Account" },
    { id: "payments",  label: "💳 Payments" },
    { id: "password",  label: "🔑 Password" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif" }}>

      {/* Top navbar */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.green}, #16a34a)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🌿</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>AgroBot Admin</div>
            <div style={{ fontSize: 11, color: C.muted }}>TM AGRO Solutions</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadData} style={{ ...styles.btn(C.green, true), padding: "7px 14px", fontSize: 12 }}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
          <button onClick={exitToApp} style={{ ...styles.btn(C.blue, true), padding: "7px 14px", fontSize: 12 }}>
            ← App
          </button>
          <button onClick={logout} style={{ ...styles.btn(C.red, true), padding: "7px 14px", fontSize: 12 }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 16px", borderRadius: 10, border: "none",
              cursor: "pointer", fontWeight: 700, fontSize: 12,
              background: tab === t.id ? C.green : C.card,
              color:      tab === t.id ? C.bg    : C.muted,
              border:     tab === t.id ? "none"  : `1px solid ${C.border}`,
              position: "relative", whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}>
              {t.label}
              {t.badge > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: C.red, color: "#fff",
                  width: 18, height: 18, borderRadius: "50%",
                  fontSize: 10, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD ══════════════════════════════════════════ */}
        {tab === "dashboard" && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <p>Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
                  <StatCard label="Registered Farms"    value={s.total_registered_farms  || s.total_farmers || 0} icon="🌱" color={C.green}  />
                  <StatCard label="With Password"       value={s.registered_with_password || 0}                   icon="🔐" color={C.blue}   />
                  <StatCard label="Premium Active"      value={s.premium_active           || 0}                   icon="⭐" color={C.gold}   />
                  <StatCard label="Trial Active"        value={s.trial_active             || 0}                   icon="🎁" color={C.purple} />
                  <StatCard label="Active Today"        value={s.active_today             || 0}                   icon="📱" color={C.green}  />
                  <StatCard label="Monthly Revenue"     value={`$${s.monthly_revenue_usd  || 0}`}                 icon="💰" color={C.gold}   />
                  <StatCard label="Open Tickets"        value={s.open_tickets             || 0}                   icon="🎫" color={C.red}    />
                  <StatCard label="Total Messages"      value={s.total_messages           || 0}                   icon="💬" color={C.blue}   />
                  <StatCard label="Community Posts"     value={s.community_posts          || 0}                   icon="👥" color={C.purple} />
                  <StatCard label="Marketplace"         value={s.marketplace_listings     || 0}                   icon="🛒" color={C.green}  />
                </div>

                {/* Top locations */}
                {data?.top_locations?.length > 0 && (
                  <div style={{ ...styles.card, marginBottom: 16 }}>
                    <h3 style={{ color: C.text, marginTop: 0, marginBottom: 14, fontSize: 15 }}>📍 Top Farming Locations</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {data.top_locations.map((loc, i) => (
                        <div key={i} style={{
                          background: C.surface, border: `1px solid ${C.border}`,
                          borderRadius: 10, padding: "8px 14px",
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{ color: C.green, fontWeight: 700 }}>{loc.location || "Unknown"}</span>
                          <span style={{ background: C.green, color: C.bg, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 900 }}>{loc.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expiring soon */}
                {data?.expiring_soon?.length > 0 && (
                  <div style={{ ...styles.card, borderTop: `3px solid ${C.red}` }}>
                    <h3 style={{ color: C.red, marginTop: 0, fontSize: 15 }}>⚠️ Expiring Soon ({data.expiring_soon.length})</h3>
                    {data.expiring_soon.map((f, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 0", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 8,
                      }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13 }}>📱 {f.phone}</span>
                        <Tag label={`${f.days_left}d left`} color={f.days_left <= 1 ? C.red : C.gold} />
                        <Tag label={f.plan?.toUpperCase()} color={C.blue} />
                        <button onClick={() => { setFixPhone(f.phone); setFixAction("extend_premium"); setTab("fix"); }}
                          style={{ ...styles.btn(C.green), padding: "5px 12px", fontSize: 11 }}>
                          Extend
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent payments */}
                <div style={styles.card}>
                  <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>💳 Recent Payments</h3>
                  {!data?.recent_payments?.length ? (
                    <p style={{ color: C.muted, fontSize: 14 }}>No payments yet</p>
                  ) : data.recent_payments.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, flexWrap: "wrap", gap: 8,
                    }}>
                      <span style={{ fontFamily: "monospace" }}>📱 {p.phone}</span>
                      <Tag label={`$${p.amount || "—"}`} color={C.green} />
                      <Tag label={p.plan?.toUpperCase() || "—"} color={C.blue} />
                      <span style={{ color: C.muted, fontSize: 11 }}>{p.activated?.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ══ FARMERS ════════════════════════════════════════════ */}
        {tab === "farmers" && (
          <div style={styles.card}>
            <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>
              👥 Registered Farms — {data?.farmers_list?.length || 0} total
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Phone", "Name", "Location", "Plan", "Password", "Days Active", "Messages", "Joined", "Action"].map(h => (
                      <th key={h} style={{
                        padding: "10px 12px", textAlign: "left",
                        background: C.surface, color: C.muted,
                        borderBottom: `2px solid ${C.border}`,
                        fontWeight: 700, fontSize: 11, letterSpacing: 1,
                        textTransform: "uppercase", whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.farmers_list || []).map((f, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surface}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: C.muted }}>{f.phone}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{f.name || "—"}</td>
                      <td style={{ padding: "9px 12px" }}>{f.location ? f.location.charAt(0).toUpperCase() + f.location.slice(1) : "—"}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <Tag label={f.plan?.toUpperCase() || "FREE"} color={
                          f.plan === "premium" || f.plan === "business" ? C.green :
                          f.plan === "trial" ? C.gold : C.muted
                        }/>
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <Tag label={f.has_password ? "✅ Set" : "❌ None"} color={f.has_password ? C.green : C.red}/>
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "center", color: C.muted }}>{f.days_active}</td>
                      <td style={{ padding: "9px 12px", textAlign: "center", color: C.muted }}>{f.messages}</td>
                      <td style={{ padding: "9px 12px", color: C.muted, whiteSpace: "nowrap" }}>{f.joined}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <button onClick={() => { setFixPhone(f.phone); setTab("fix"); }}
                          style={{ ...styles.btn(C.green, true), padding: "4px 10px", fontSize: 11 }}>
                          Fix
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.farmers_list?.length && (
                <p style={{ color: C.muted, fontSize: 14, padding: "20px 0" }}>No farmers registered yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ══ SUPPORT TICKETS ════════════════════════════════════ */}
        {tab === "tickets" && (
          <>
            <div style={{ ...styles.card, borderTop: `3px solid ${C.blue}` }}>
              <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>💬 Reply to Ticket</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Ticket ID</label>
                <input style={styles.input} placeholder="e.g. TKT1A2B3C4D"
                  value={rTicket} onChange={e => setRTicket(e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Your Reply</label>
                <textarea style={{ ...styles.input, resize: "vertical" }} rows={4}
                  placeholder="Write your reply to the farmer..."
                  value={rMsg} onChange={e => setRMsg(e.target.value)} />
              </div>
              {rStatus && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12,
                  background: rStatus.includes("✅") ? "#22c55e22" : "#ef444422",
                  color: rStatus.includes("✅") ? C.green : C.red,
                  border: `1px solid ${rStatus.includes("✅") ? C.green : C.red}44`,
                }}>{rStatus}</div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => replyTicket(false)} style={styles.btn(C.blue)}>📤 Send Reply</button>
                <button onClick={() => replyTicket(true)}  style={styles.btn(C.green)}>✅ Reply & Resolve</button>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>
                🎫 All Tickets
                {s.open_tickets > 0 && <Tag label={`${s.open_tickets} open`} color={C.red}/>}
              </h3>
              {!data?.recent_tickets?.length ? (
                <p style={{ color: C.muted, fontSize: 14 }}>No tickets yet.</p>
              ) : data.recent_tickets.map((t, i) => (
                <div key={i} style={{
                  padding: 16, marginBottom: 12, borderRadius: 12,
                  border: `1px solid ${t.status === "open" ? C.gold : C.green}44`,
                  background: C.surface,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: C.text }}>#{t.id}</span>
                    <Tag label={t.status?.toUpperCase()} color={t.status === "open" ? C.gold : C.green}/>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>📱 {t.user_phone || t.phone}</div>
                  <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>{t.subject}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
                    {t.message?.slice(0, 200)}{t.message?.length > 200 ? "..." : ""}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                    {t.created?.slice(0, 16).replace("T", " ")}
                  </div>
                  <button onClick={() => { setRTicket(t.id); window.scrollTo(0, 0); }}
                    style={{ ...styles.btn(C.blue, true), padding: "5px 12px", fontSize: 11 }}>
                    ↑ Reply to this ticket
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ NOTIFICATIONS ══════════════════════════════════════ */}
        {tab === "notify" && (
          <div style={{ ...styles.card, borderTop: `3px solid ${C.gold}` }}>
            <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>📢 Send Notification to Farmers</h3>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
              Appears in the app AND sent via WhatsApp to all targeted farmers.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={styles.label}>Type</label>
                <select style={styles.input} value={nType} onChange={e => setNType(e.target.value)}>
                  <option value="update">🔔 App Update</option>
                  <option value="fix">🔧 Bug Fix</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="promo">🎁 Promotion</option>
                  <option value="news">📰 Farming News</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Send To</label>
                <select style={styles.input} value={nTarget} onChange={e => setNTarget(e.target.value)}>
                  <option value="all">👥 All Farmers ({s.total_registered_farms || s.total_farmers || 0})</option>
                  <option value="premium">⭐ Premium Only ({s.premium_active || 0})</option>
                  <option value="trial">🎁 Trial Only ({s.trial_active || 0})</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Title *</label>
              <input style={styles.input} placeholder="e.g. New Feature: Live Weather!" value={nTitle} onChange={e => setNTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Message *</label>
              <textarea style={{ ...styles.input, resize: "vertical" }} rows={5}
                placeholder="Write your message to farmers..." value={nMsg} onChange={e => setNMsg(e.target.value)} />
            </div>

            {nSent && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12,
                background: nSent.t === "s" ? "#22c55e22" : nSent.t === "e" ? "#ef444422" : "#3b82f622",
                color:      nSent.t === "s" ? C.green    : nSent.t === "e" ? C.red       : C.blue,
                border: `1px solid ${nSent.t === "s" ? C.green : nSent.t === "e" ? C.red : C.blue}44`,
              }}>{nSent.m}</div>
            )}

            <button onClick={sendNotif} style={{ ...styles.btn(C.gold), width: "100%", padding: "13px", fontSize: 15 }}>
              📢 Send Notification Now
            </button>
          </div>
        )}

        {/* ══ FIX ACCOUNT ════════════════════════════════════════ */}
        {tab === "fix" && (
          <div style={{ ...styles.card, borderTop: `3px solid ${C.purple}`, maxWidth: 550 }}>
            <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>🔧 Fix Farmer Account</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Farmer Phone Number *</label>
              <input style={styles.input} placeholder="e.g. 263771234567" value={fixPhone} onChange={e => setFixPhone(e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Action *</label>
              <select style={styles.input} value={fixAction} onChange={e => setFixAction(e.target.value)}>
                <option value="reset_trial">🎁 Reset 30-Day Trial</option>
                <option value="extend_premium">⭐ Extend Premium</option>
                <option value="send_message">💬 Send WhatsApp Message</option>
                <option value="clear_history">🗑️ Clear Chat History</option>
                <option value="refund_reset">💳 Deactivate Premium</option>
              </select>
            </div>
            {fixAction === "extend_premium" && (
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Days to Extend</label>
                <input style={styles.input} type="number" value={fixDays}
                  onChange={e => setFixDays(parseInt(e.target.value) || 30)} min={1} max={365} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Note / WhatsApp Message (optional)</label>
              <textarea style={{ ...styles.input, resize: "vertical" }} rows={3}
                placeholder="Optional message sent to farmer..." value={fixNote} onChange={e => setFixNote(e.target.value)} />
            </div>

            {fixStatus && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12,
                background: fixStatus.includes("✅") ? "#22c55e22" : "#ef444422",
                color: fixStatus.includes("✅") ? C.green : C.red,
                border: `1px solid ${fixStatus.includes("✅") ? C.green : C.red}44`,
              }}>{fixStatus}</div>
            )}

            <button onClick={fixAccount} style={{ ...styles.btn(C.purple), width: "100%", padding: "13px" }}>
              🔧 Apply Fix Now
            </button>
            <div style={{ background: "#f59e0b22", border: `1px solid ${C.gold}44`, padding: 12, borderRadius: 10, marginTop: 14, fontSize: 13, color: C.gold }}>
              ⚠️ All fixes automatically send a WhatsApp notification to the farmer.
            </div>
          </div>
        )}

        {/* ══ PAYMENTS ═══════════════════════════════════════════ */}
        {tab === "payments" && (
          <>
            <div style={{ ...styles.card, borderTop: `3px solid ${C.green}`, maxWidth: 550, marginBottom: 16 }}>
              <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>💳 Manually Verify Payment</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
                Use when farmer paid but system didn't auto-confirm.
              </p>
              {[
                ["Farmer Phone *", payPhone, setPayPhone, "e.g. 263771234567", "tel"],
                ["Payment Reference *", payRef, setPayRef, "e.g. AGRO341018", "text"],
                ["Amount Paid", payAmt, setPayAmt, "e.g. 2 or 10", "text"],
              ].map(([lbl, val, setter, ph, type]) => (
                <div key={lbl} style={{ marginBottom: 12 }}>
                  <label style={styles.label}>{lbl}</label>
                  <input style={styles.input} placeholder={ph} value={val}
                    onChange={e => setter(e.target.value)} type={type} />
                </div>
              ))}
              {payStatus && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12,
                  background: payStatus.includes("✅") ? "#22c55e22" : "#ef444422",
                  color: payStatus.includes("✅") ? C.green : C.red,
                  border: `1px solid ${payStatus.includes("✅") ? C.green : C.red}44`,
                }}>{payStatus}</div>
              )}
              <button onClick={verifyPay} style={{ ...styles.btn(C.green), width: "100%", padding: "13px" }}>
                ✅ Verify & Activate Premium
              </button>
            </div>

            <div style={styles.card}>
              <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>💳 Recent Payments</h3>
              {!data?.recent_payments?.length ? (
                <p style={{ color: C.muted, fontSize: 14 }}>No payments yet.</p>
              ) : data.recent_payments.map((p, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 8,
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: C.muted }}>📱 {p.phone}</span>
                  <Tag label={`$${p.amount || "—"}`} color={C.green}/>
                  <Tag label={p.plan?.toUpperCase() || "—"} color={C.blue}/>
                  <span style={{ fontSize: 11, color: C.muted }}>{p.activated?.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ PASSWORD ═══════════════════════════════════════════ */}
        {tab === "password" && (
          <div style={{ ...styles.card, borderTop: `3px solid ${C.gold}`, maxWidth: 480 }}>
            <h3 style={{ color: C.text, marginTop: 0, fontSize: 15 }}>🔑 Change Admin Password</h3>

            <div style={{
              background: "#22c55e11", border: `1px solid ${C.green}33`,
              borderRadius: 10, padding: 12, marginBottom: 18, fontSize: 13, color: C.muted,
            }}>
              💡 Use 8+ characters with letters, numbers and symbols.<br/>
              Example: <span style={{ color: C.green, fontFamily: "monospace" }}>AgroBot@2026!</span>
            </div>

            {[
              ["Current Password *", curPass, setCurPass, "Your current password", showPw, setShowPw],
              ["New Password *",     newPass, setNewPass, "Minimum 8 characters",  showNew, setShowNew],
            ].map(([lbl, val, setter, ph, show, setShow]) => (
              <div key={lbl} style={{ marginBottom: 12 }}>
                <label style={styles.label}>{lbl}</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...styles.input, paddingRight: 44 }} type={show ? "text" : "password"}
                    placeholder={ph} value={val} onChange={e => setter(e.target.value)} />
                  <button onClick={() => setShow(s => !s)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted,
                  }}>{show ? "🙈" : "👁️"}</button>
                </div>
              </div>
            ))}

            {/* Strength bar */}
            {newPass && (() => {
              const str = strength(newPass);
              return (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: C.border, borderRadius: 10, height: 5 }}>
                    <div style={{ height: 5, borderRadius: 10, width: `${str.pct}%`, background: str.color, transition: "all 0.3s" }}/>
                  </div>
                  <div style={{ fontSize: 11, color: str.color, marginTop: 4, fontWeight: 700 }}>{str.label}</div>
                </div>
              );
            })()}

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Confirm New Password *</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...styles.input, paddingRight: 60 }} type={showNew ? "text" : "password"}
                  placeholder="Repeat new password" value={conPass} onChange={e => setConPass(e.target.value)} />
                {conPass && (
                  <span style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>
                    {newPass === conPass ? "✅" : "❌"}
                  </span>
                )}
                <button onClick={() => setShowNew(s => !s)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted,
                }}>{showNew ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {passMsg && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14,
                background: passMsg.t === "s" ? "#22c55e22" : "#ef444422",
                color:      passMsg.t === "s" ? C.green    : C.red,
                border: `1px solid ${passMsg.t === "s" ? C.green : C.red}44`,
              }}>{passMsg.m}</div>
            )}

            <button onClick={changePassword} style={{ ...styles.btn(C.gold), width: "100%", padding: "13px" }}>
              🔑 Change Password
            </button>
          </div>
        )}

      </div>
    </div>
  );
}