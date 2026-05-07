import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../config";
import { ThemeContext } from "../ThemeContext";

// ── Real farm / healthy crop photo URLs (Unsplash, free) ──────
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80", // maize field Zimbabwe
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80", // green farmland sunrise
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80", // healthy tobacco
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80", // lush farm landscape
  "https://images.unsplash.com/photo-1592982537447-6f2a6a0a7b56?w=1200&q=80", // African farm sunrise
];

const FEATURE_IMAGES = {
  disease:    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=70",
  soil:       "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=70",
  marketplace:"https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=70",
  news:       "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70",
  community:  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=70",
  weather:    "https://images.unsplash.com/photo-1504608524841-42785f1c399a?w=400&q=70",
  photo:      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=70",
  prices:     "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&q=70",
  seeds:      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=70",
  help:       "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=70",
  loans:      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=70",
  farmplan:   "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70",
};

export default function Dashboard({ user, setPage }) {
  const { theme } = useContext(ThemeContext);
  const T = theme;

  const [stats,      setStats]      = useState(null);
  const [history,    setHistory]    = useState([]);
  const [question,   setQuestion]   = useState("");
  const [answer,     setAnswer]     = useState("");
  const [asking,     setAsking]     = useState(false);
  const [heroIdx,    setHeroIdx]    = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifs,     setNotifs]     = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => { loadData(); loadNotifs(); }, []);

  // Rotate hero image every 6 seconds
  useEffect(() => {
    const t = setInterval(() =>
      setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/farmer/${user.phone}`),
        axios.get(`${config.API_URL}/api/farmer/${user.phone}/conversations?limit=20`),
      ]);
      setStats(fRes.data);
      setHistory(cRes.data.conversations || []);
    } catch {}
  };

  const loadNotifs = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/api/notifications?phone=${user.phone}`
      );
      setNotifs(res.data.notifications || []);
      setNotifCount(res.data.unread || 0);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await axios.post(`${config.API_URL}/api/notifications/read`, {
        phone: user.phone, notification_id: id,
      });
      setNotifCount(c => Math.max(0, c - 1));
      setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question, phone: user.phone,
      });
      setAnswer(res.data.answer);
      loadData();
    } catch { setAnswer("Error. Please try again."); }
    setAsking(false);
  };

  const trialDays = stats?.trial_days_left ?? user?.trial_days_left ?? 0;
  const plan      = stats?.plan || user?.plan || "free";
  const daysOn    = stats?.stats?.days_since_joining || 1;
  const streak    = stats?.stats?.streak_days || 0;
  const totalMsgs = stats?.stats?.total_messages || 0;
  const name      = user.name || `Farmer ${user.phone?.slice(-4)}`;

  const freeFeatures = [
    { id:"disease",     icon:"🌿", title:"Crop Disease",       desc:"Diagnose & treat crops",        img: FEATURE_IMAGES.disease    },
    { id:"soil",        icon:"🧪", title:"Soil & Fertilizer",  desc:"Soil analysis & plans",         img: FEATURE_IMAGES.soil       },
    { id:"marketplace", icon:"🛒", title:"Marketplace",        desc:"Buy & sell products",            img: FEATURE_IMAGES.marketplace},
    { id:"news",        icon:"📰", title:"Farming News",       desc:"Zimbabwe farm updates",          img: FEATURE_IMAGES.news       },
    { id:"community",   icon:"👥", title:"Community",          desc:"Chat with farmers",              img: FEATURE_IMAGES.community  },
  ];

  const premiumFeatures = [
    { id:"weather",  icon:"🌤️", title:"GPS Weather",       desc:"7-day farm forecast",           img: FEATURE_IMAGES.weather  },
    { id:"photo",    icon:"📸", title:"Photo Analysis",    desc:"AI crop diagnosis",              img: FEATURE_IMAGES.photo    },
    { id:"prices",   icon:"💰", title:"Live Prices",       desc:"Real-time Zimbabwe prices",      img: FEATURE_IMAGES.prices   },
    { id:"seeds",    icon:"🌱", title:"Seed Guide",        desc:"Best seeds for your region",     img: FEATURE_IMAGES.seeds    },
    { id:"help",     icon:"📍", title:"Find Help",         desc:"Agritex & dealers nearby",       img: FEATURE_IMAGES.help     },
    { id:"loans",    icon:"🏦", title:"Loans & Insurance", desc:"Agricultural finance",           img: FEATURE_IMAGES.loans    },
    { id:"farmplan", icon:"📅", title:"Farm Calendar",     desc:"Seasonal planning",              img: FEATURE_IMAGES.farmplan },
  ];

  // ── Styles driven by theme ────────────────────────────────────
  const s = {
    wrap: {
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      background: T.bg,
      minHeight: "100vh",
      color: T.text,
    },
    hero: {
      position: "relative",
      height: 220,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 20,
    },
    heroImg: {
      width: "100%", height: "100%",
      objectFit: "cover",
      transition: "opacity 1.2s ease",
    },
    heroOverlay: {
      position: "absolute", inset: 0,
      background: "linear-gradient(135deg,rgba(0,0,0,0.55) 0%,rgba(0,80,0,0.3) 100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-end", padding: "22px 24px",
    },
    heroTitle: {
      color: "#fff", fontSize: 24, fontWeight: 900,
      textShadow: "0 2px 8px rgba(0,0,0,0.6)", margin: 0,
    },
    heroSub: {
      color: "rgba(255,255,255,0.85)", fontSize: 13,
      marginTop: 4, marginBottom: 0,
    },
    notifBtn: {
      position: "absolute", top: 16, right: 16,
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(8px)",
      border: "1.5px solid rgba(255,255,255,0.3)",
      borderRadius: "50%", width: 42, height: 42,
      cursor: "pointer", fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff",
    },
    badge: {
      position: "absolute", top: -5, right: -5,
      background: "#ef4444", color: "#fff",
      width: 18, height: 18, borderRadius: "50%",
      fontSize: 10, fontWeight: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    notifDropdown: {
      position: "absolute", top: 64, right: 16, zIndex: 200,
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16, width: 300, maxHeight: 380,
      overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    },
    card: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 16,
    },
    cardTitle: {
      color: T.text, fontWeight: 800, fontSize: 16,
      marginBottom: 14, marginTop: 0,
      display: "flex", alignItems: "center", gap: 8,
    },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 12, marginBottom: 18,
    },
    statBox: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${T.green}`,
      borderRadius: 14, padding: "16px 12px",
      textAlign: "center",
    },
    statVal: { fontSize: 28, fontWeight: 900, color: T.green },
    statLbl: { fontSize: 11, color: T.muted, marginTop: 2, fontWeight: 600 },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
      gap: 12,
    },
    featureCard: (locked) => ({
      borderRadius: 14, overflow: "hidden",
      border: `1.5px solid ${locked ? T.border : T.green}44`,
      cursor: "pointer", background: T.surface,
      opacity: locked ? 0.65 : 1,
      transition: "transform 0.18s, box-shadow 0.18s",
      position: "relative",
    }),
    featureImg: {
      width: "100%", height: 72, objectFit: "cover",
    },
    featureBody: {
      padding: "10px 10px 12px",
    },
    featureIcon: { fontSize: 20, marginBottom: 4 },
    featureTitle: {
      fontWeight: 700, fontSize: 12,
      color: T.text, marginBottom: 2,
    },
    featureDesc: { fontSize: 11, color: T.muted },
    lockBadge: {
      position: "absolute", top: 6, right: 6,
      background: "rgba(0,0,0,0.55)",
      color: "#fff", fontSize: 10,
      padding: "2px 6px", borderRadius: 20, fontWeight: 700,
    },
    input: {
      width: "100%", padding: "12px 14px",
      borderRadius: 12, border: `1.5px solid ${T.border}`,
      fontSize: 14, outline: "none",
      background: T.surface, color: T.text,
      boxSizing: "border-box", resize: "vertical",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    btn: (color) => ({
      padding: "11px 20px", borderRadius: 12,
      border: "none", cursor: "pointer",
      fontWeight: 700, fontSize: 13,
      background: color, color: T.bg,
      transition: "transform 0.15s, opacity 0.15s",
      fontFamily: "inherit",
    }),
    trialBar: {
      background: `linear-gradient(135deg, ${T.green}, #16a34a)`,
      borderRadius: 14, padding: "14px 18px",
      marginBottom: 16, color: "#fff",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", gap: 12, flexWrap: "wrap",
    },
    chatBox: {
      maxHeight: 320, overflowY: "auto",
      display: "flex", flexDirection: "column", gap: 10,
    },
    bubble: (isMe) => ({
      maxWidth: "82%",
      alignSelf: isMe ? "flex-end" : "flex-start",
      background: isMe ? T.green : T.surface,
      color: isMe ? T.bg : T.text,
      border: `1px solid ${T.border}`,
      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      padding: "10px 14px", fontSize: 13, lineHeight: 1.5,
    }),
    bubbleMeta: {
      fontSize: 10, color: T.muted, marginBottom: 3,
    },
  };

  return (
    <div style={s.wrap}>

      {/* ── Hero Banner ────────────────────────────────────── */}
      <div style={s.hero}>
        <img
          key={heroIdx}
          src={HERO_IMAGES[heroIdx]}
          alt="Zimbabwe farm"
          style={s.heroImg}
        />
        <div style={s.heroOverlay}>
          <h2 style={s.heroTitle}>
            Mhoro, {name}! 🌱
          </h2>
          <p style={s.heroSub}>
            {plan === "trial"   ? `🎁 ${trialDays} trial days left` :
             plan === "premium" ? "⭐ Premium Active" :
             plan === "business"? "🏆 Business Active" : "🆓 Free Plan"}
            {" · "}Day {daysOn} on AgroBot
          </p>
        </div>

        {/* Notification Bell */}
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button
            style={s.notifBtn}
            onClick={() => setShowNotifs(v => !v)}
          >
            🔔
            {notifCount > 0 && (
              <span style={s.badge}>{notifCount > 9 ? "9+" : notifCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div style={s.notifDropdown}>
              <div style={{
                padding: "14px 16px 10px",
                borderBottom: `1px solid ${T.border}`,
                fontWeight: 800, fontSize: 14, color: T.text,
                display: "flex", justifyContent: "space-between",
              }}>
                🔔 Notifications
                <button
                  onClick={() => setShowNotifs(false)}
                  style={{ background: "none", border: "none",
                    cursor: "pointer", color: T.muted, fontSize: 16 }}>×</button>
              </div>
              {notifs.length === 0 ? (
                <div style={{ padding: 20, color: T.muted,
                  fontSize: 13, textAlign: "center" }}>
                  No notifications yet
                </div>
              ) : notifs.map((n, i) => (
                <div key={i}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${T.border}`,
                    background: n.read ? "transparent" : `${T.green}11`,
                    cursor: "pointer",
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13,
                    color: T.text, marginBottom: 3 }}>
                    {!n.read && (
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: T.green, display: "inline-block",
                        marginRight: 6, verticalAlign: "middle",
                      }}/>
                    )}
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    {n.message?.slice(0, 80)}
                    {n.message?.length > 80 ? "…" : ""}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
                    {n.created?.slice(0, 16).replace("T", " ")}
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 16px", textAlign: "center" }}>
                <button
                  onClick={() => { setShowNotifs(false); setPage("notifications"); }}
                  style={{ ...s.btn(T.green), fontSize: 12, padding: "8px 16px" }}>
                  See All →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Trial / Expired Banner ──────────────────────────── */}
      {plan === "trial" && trialDays > 0 && (
        <div style={s.trialBar}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              🎁 Free Trial — {trialDays} days remaining
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3 }}>
              All premium features unlocked!
            </div>
            <div style={{
              marginTop: 8, height: 5, background: "rgba(255,255,255,0.25)",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 10,
                background: "#fff",
                width: `${((30 - trialDays) / 30) * 100}%`,
                transition: "width 0.5s",
              }}/>
            </div>
          </div>
          <button
            onClick={() => setPage("payment")}
            style={{
              background: "#fff", color: T.green,
              border: "none", borderRadius: 10,
              padding: "9px 16px", fontWeight: 800,
              fontSize: 12, cursor: "pointer",
            }}>
            Subscribe $2/mo
          </button>
        </div>
      )}

      {plan === "free" && (
        <div style={{
          background: `${T.card}`,
          border: `1.5px solid #ef444455`,
          borderRadius: 14, padding: "12px 16px",
          marginBottom: 16, display: "flex",
          justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
          <span style={{ fontSize: 13, color: T.text }}>
            ⚠️ <strong>Trial Expired</strong> — Upgrade to keep premium features
          </span>
          <button
            onClick={() => setPage("payment")}
            style={{ ...s.btn(T.green), fontSize: 12, padding: "8px 14px" }}>
            💳 Subscribe Now
          </button>
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div style={s.statGrid}>
        <div style={s.statBox}>
          <div style={s.statVal}>{daysOn}</div>
          <div style={s.statLbl}>Days on AgroBot</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statVal}>{totalMsgs}</div>
          <div style={s.statLbl}>Messages</div>
        </div>
        <div style={{ ...s.statBox, borderTopColor: "#f59e0b" }}>
          <div style={{ ...s.statVal, color: "#f59e0b" }}>{streak}🔥</div>
          <div style={s.statLbl}>Day Streak</div>
        </div>
      </div>

      {/* ── Ask AgroBot ─────────────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>💬 Ask AgroBot Anything</h3>
        <textarea
          style={s.input}
          rows={3}
          placeholder="Ask about crops, diseases, soil, seeds, prices, weather..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button
          style={{ ...s.btn(T.green), marginTop: 10 }}
          onClick={askQuestion}
          disabled={asking}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {asking ? "🤔 Thinking..." : "🌿 Ask AgroBot"}
        </button>
        {answer && (
          <div style={{
            marginTop: 14, padding: 14,
            background: `${T.green}15`,
            border: `1px solid ${T.green}33`,
            borderRadius: 12,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13,
              color: T.green, marginBottom: 6 }}>
              🤖 AgroBot:
            </div>
            <p style={{ margin: 0, lineHeight: 1.7,
              fontSize: 13, whiteSpace: "pre-wrap", color: T.text }}>
              {answer}
            </p>
          </div>
        )}
      </div>

      {/* ── Free Features ────────────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📋 Free Services</h3>
        <div style={s.featureGrid}>
          {freeFeatures.map(f => (
            <div
              key={f.id}
              style={s.featureCard(false)}
              onClick={() => setPage(f.id)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${T.green}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img src={f.img} alt={f.title} style={s.featureImg}
                onError={e => { e.target.style.display = "none"; }} />
              <div style={s.featureBody}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Features ─────────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>
          💎 Premium Services
          <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b" }}>
            {plan === "trial"                         ? `${trialDays}d trial` :
             plan === "premium" || plan === "business" ? "✅ Active"           :
             "— $2/mo"}
          </span>
        </h3>
        <div style={s.featureGrid}>
          {premiumFeatures.map(f => {
            const locked = plan === "free";
            return (
              <div
                key={f.id}
                style={s.featureCard(locked)}
                onClick={() => locked ? setPage("payment") : setPage(f.id)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = locked
                    ? "none" : `0 8px 24px ${T.green}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {locked && <div style={s.lockBadge}>🔒</div>}
                <img src={f.img} alt={f.title} style={s.featureImg}
                  onError={e => { e.target.style.display = "none"; }} />
                <div style={s.featureBody}>
                  <div style={s.featureIcon}>{f.icon}</div>
                  <div style={s.featureTitle}>{f.title}</div>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {plan === "free" && (
          <button
            onClick={() => setPage("payment")}
            style={{ ...s.btn(T.green), width: "100%", marginTop: 14,
              padding: "13px", fontSize: 14 }}>
            💳 Unlock All Premium Features
          </button>
        )}
      </div>

      {/* ── Recent Conversations ─────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>
          📋 Recent Conversations
          <span style={{ fontSize: 11, fontWeight: 400, color: T.muted }}>
            WhatsApp + Web synced
          </span>
        </h3>
        <div style={s.chatBox}>
          {history.length === 0 ? (
            <p style={{ color: T.muted, textAlign: "center",
              marginTop: 20, fontSize: 14 }}>
              No conversations yet. Use any feature above!
            </p>
          ) : history.slice().reverse().map((msg, i) => {
            const isMe = msg.role === "farmer";
            return (
              <div key={i} style={{ display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start" }}>
                <div style={s.bubbleMeta}>
                  {isMe ? "👤 You" : "🤖 AgroBot"} ·{" "}
                  {msg.timestamp?.slice(0, 16).replace("T", " ")}
                </div>
                <div style={s.bubble(isMe)}>
                  {msg.message?.slice(0, 300)}
                  {msg.message?.length > 300 ? "…" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}