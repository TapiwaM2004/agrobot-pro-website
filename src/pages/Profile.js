import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../config";
import Payment from "./Payment";
import { ThemeContext } from "../ThemeContext";

const PROFILE_COVERS = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
];

export default function Profile({ user, onLogout, setPage }) {
  const { theme: T } = useContext(ThemeContext);

  const [stats,       setStats]       = useState(null);
  const [plan,        setPlan]        = useState(user?.plan || "free");
  const [showPayment, setShowPayment] = useState(false);
  const [locInput,    setLocInput]    = useState("");
  const [locMsg,      setLocMsg]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [coverIdx]                    = useState(
    () => Math.floor(Math.random() * PROFILE_COVERS.length)
  );

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/farmer/${user.phone}`);
      setStats(res.data);
      setPlan(res.data.plan || "free");
    } catch {}
  };

  const saveLocation = async () => {
    if (!locInput.trim()) return;
    setSaving(true);
    setLocMsg(null);
    try {
      const res = await axios.post(`${config.API_URL}/api/verify-location`, {
        phone: user.phone, location: locInput,
      });
      if (res.data.success) {
        setLocMsg({
          t: "s",
          m: `✅ Set to ${res.data.matched_city} · ${res.data.region_info?.climate} · ${res.data.region_info?.best_crops}`,
        });
        load();
        setLocInput("");
      }
    } catch {
      setLocMsg({ t: "e", m: "❌ Could not verify. Please try again." });
    }
    setSaving(false);
  };

  const trialDays  = stats?.trial_days_left ?? 0;
  const daysOn     = stats?.stats?.days_since_joining || 1;
  const totalMsgs  = stats?.stats?.total_messages     || 0;
  const streak     = stats?.stats?.streak_days        || 0;
  const daysActive = stats?.stats?.total_days_active  || 0;
  const mktPosts   = stats?.stats?.marketplace_posts  || 0;
  const commPosts  = stats?.stats?.community_posts    || 0;
  const location   = stats?.profile?.location         || "Not set";

  const planColor =
    plan === "premium" || plan === "business" ? T.green :
    plan === "trial"                          ? T.gold  : T.muted;

  const planLabel =
    plan === "premium"  ? "⭐ PREMIUM"  :
    plan === "business" ? "🏆 BUSINESS" :
    plan === "trial"    ? "🎁 TRIAL"    : "🆓 FREE";

  const s = {
    wrap: {
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      color: T.text, paddingBottom: 40,
    },
    // Cover + avatar block
    coverWrap: {
      position: "relative",
      height: 160,
      borderRadius: "18px 18px 0 0",
      overflow: "hidden",
      background: T.card,
    },
    coverImg: {
      width: "100%", height: "100%",
      objectFit: "cover",
    },
    coverOverlay: {
      position: "absolute", inset: 0,
      background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45))",
    },
    avatarWrap: {
      position: "absolute", bottom: -32, left: 24,
    },
    avatar: {
      width: 68, height: 68, borderRadius: "50%",
      background: `linear-gradient(135deg, ${T.green}, #16a34a)`,
      display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 28,
      border: `3px solid ${T.card}`,
      boxShadow: `0 4px 16px rgba(0,0,0,0.25)`,
    },
    // Header card (sits below cover)
    headerCard: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderTop: "none",
      borderRadius: "0 0 18px 18px",
      padding: "44px 24px 20px",
      marginBottom: 14,
    },
    nameRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", flexWrap: "wrap", gap: 10,
    },
    name: {
      fontSize: 22, fontWeight: 900, color: T.text,
      margin: 0, lineHeight: 1.2,
    },
    planBadge: {
      background: `${planColor}22`,
      color: planColor,
      border: `1.5px solid ${planColor}55`,
      padding: "5px 14px", borderRadius: 20,
      fontSize: 12, fontWeight: 800,
    },
    metaRow: {
      display: "flex", flexWrap: "wrap", gap: 16,
      marginTop: 10, fontSize: 13, color: T.muted,
    },
    metaItem: { display: "flex", alignItems: "center", gap: 5 },
    // Stats grid
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 10, marginBottom: 14,
    },
    statBox: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${T.green}`,
      borderRadius: 14, padding: "14px 10px",
      textAlign: "center",
    },
    statVal:  { fontSize: 24, fontWeight: 900, color: T.green },
    statLbl:  { fontSize: 10, color: T.muted, marginTop: 3, fontWeight: 600 },
    // Extra stats row
    extraGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 10, marginBottom: 14,
    },
    extraBox: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "12px 10px",
      textAlign: "center",
    },
    extraVal: { fontSize: 18, fontWeight: 800, color: T.text },
    extraLbl: { fontSize: 10, color: T.muted, marginTop: 2 },
    // Section card
    card: {
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 18, padding: "20px 22px",
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 15, fontWeight: 800, color: T.text,
      marginTop: 0, marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    },
    // Plan cards
    planGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12, marginBottom: 16,
    },
    planCard: (active, accent) => ({
      border: `2px solid ${active ? accent : T.border}`,
      borderRadius: 14, padding: "18px 16px",
      textAlign: "center",
      background: active ? `${accent}0d` : T.surface,
      transition: "transform 0.18s",
      cursor: "pointer",
    }),
    input: {
      width: "100%", padding: "12px 14px",
      borderRadius: 12, border: `1.5px solid ${T.border}`,
      fontSize: 14, outline: "none",
      background: T.surface, color: T.text,
      boxSizing: "border-box", fontFamily: "inherit",
      transition: "border-color 0.2s",
      marginBottom: 10,
    },
    btn: (color) => ({
      padding: "11px 20px", borderRadius: 12,
      border: "none", cursor: "pointer",
      fontWeight: 700, fontSize: 13,
      background: color, color: T.bg,
      fontFamily: "inherit", transition: "opacity 0.2s",
    }),
    btnOutline: {
      width: "100%", padding: "12px",
      borderRadius: 12,
      border: `1.5px solid #ef444455`,
      background: "transparent", color: "#ef4444",
      fontWeight: 700, fontSize: 14,
      cursor: "pointer", fontFamily: "inherit",
    },
    trialBar: {
      background: `linear-gradient(135deg, ${T.green}, #16a34a)`,
      borderRadius: 14, padding: "14px 18px",
      marginBottom: 14, color: "#fff",
    },
    alert: (t) => ({
      padding: "10px 14px", borderRadius: 10,
      fontSize: 13, marginBottom: 10,
      background: t === "s" ? `${T.green}18` : `#ef444418`,
      color: t === "s" ? T.green : "#ef4444",
      border: `1px solid ${t === "s" ? T.green : "#ef4444"}33`,
    }),
  };

  if (showPayment) return (
    <div style={s.wrap}>
      <button
        onClick={() => setShowPayment(false)}
        style={{
          background: "none", border: "none",
          color: T.green, fontSize: 14, fontWeight: 600,
          cursor: "pointer", marginBottom: 16,
          padding: 0, display: "flex", alignItems: "center", gap: 6,
        }}>
        ← Back to Profile
      </button>
      <Payment
        user={user}
        onSuccess={(newPlan) => {
          setPlan(newPlan);
          setShowPayment(false);
          load();
        }}
      />
    </div>
  );

  return (
    <div style={s.wrap}>

      {/* ── Cover + Avatar ─────────────────────────────────── */}
      <div style={s.coverWrap}>
        <img
          src={PROFILE_COVERS[coverIdx]}
          alt="Farm cover"
          style={s.coverImg}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={s.coverOverlay} />
        <div style={s.avatarWrap}>
          <div style={s.avatar}>🌱</div>
        </div>
      </div>

      {/* ── Name / Plan Header ─────────────────────────────── */}
      <div style={s.headerCard}>
        <div style={s.nameRow}>
          <div>
            <h2 style={s.name}>
              {user.name || `Farmer ${user.phone?.slice(-4)}`}
            </h2>
            <div style={s.metaRow}>
              <span style={s.metaItem}>📱 {user.phone}</span>
              <span style={s.metaItem}>
                📍 {location.charAt(0).toUpperCase() + location.slice(1)}
              </span>
              <span style={s.metaItem}>📅 Member {daysOn} days</span>
            </div>
          </div>
          <span style={s.planBadge}>{planLabel}</span>
        </div>

        {/* Trial progress */}
        {plan === "trial" && trialDays > 0 && (
          <div style={{
            marginTop: 14, background: `${T.gold}15`,
            border: `1px solid ${T.gold}33`,
            borderRadius: 10, padding: "10px 14px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700,
              color: T.gold, marginBottom: 6 }}>
              🎁 Trial — {trialDays} days left
            </div>
            <div style={{
              height: 5, background: T.border,
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 10,
                background: T.gold,
                width: `${((30 - trialDays) / 30) * 100}%`,
              }}/>
            </div>
          </div>
        )}
      </div>

      {/* ── Core Stats ─────────────────────────────────────── */}
      <div style={s.statsGrid}>
        <div style={s.statBox}>
          <div style={s.statVal}>{daysOn}</div>
          <div style={s.statLbl}>Days on AgroBot</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statVal}>{totalMsgs}</div>
          <div style={s.statLbl}>Total Messages</div>
        </div>
        <div style={{ ...s.statBox, borderTopColor: "#f59e0b" }}>
          <div style={{ ...s.statVal, color: "#f59e0b" }}>
            {streak}🔥
          </div>
          <div style={s.statLbl}>Day Streak</div>
        </div>
      </div>

      {/* ── Extra Stats ────────────────────────────────────── */}
      <div style={s.extraGrid}>
        <div style={s.extraBox}>
          <div style={s.extraVal}>{daysActive}</div>
          <div style={s.extraLbl}>Active Days</div>
        </div>
        <div style={s.extraBox}>
          <div style={s.extraVal}>{mktPosts}</div>
          <div style={s.extraLbl}>Market Posts</div>
        </div>
        <div style={s.extraBox}>
          <div style={s.extraVal}>{commPosts}</div>
          <div style={s.extraLbl}>Community</div>
        </div>
      </div>

      {/* ── Subscription ───────────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>💎 Subscription</h3>

        {(plan === "premium" || plan === "business") ? (
          <div style={{
            background: `${T.green}15`,
            border: `1px solid ${T.green}33`,
            borderRadius: 12, padding: "16px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.green }}>
                ✅ {plan === "premium" ? "Premium" : "Business"} Active
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                All features unlocked
              </div>
            </div>
            <button
              style={s.btn(T.green)}
              onClick={() => setShowPayment(true)}>
              🔄 Renew
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
              {plan === "trial"
                ? `Trial ends in ${trialDays} days. Subscribe to keep all features!`
                : "Subscribe to unlock all premium features!"}
            </p>

            <div style={s.planGrid}>
              <div
                style={s.planCard(false, T.green)}
                onClick={() => setShowPayment(true)}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 30, marginBottom: 6 }}>💎</div>
                <div style={{ fontWeight: 800, fontSize: 15,
                  color: T.green, marginBottom: 4 }}>Premium</div>
                <div style={{ fontWeight: 900, fontSize: 26,
                  color: T.text, lineHeight: 1 }}>
                  $2
                  <span style={{ fontSize: 12, fontWeight: 400,
                    color: T.muted }}>/mo</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                  All premium features
                </div>
              </div>

              <div
                style={s.planCard(false, T.gold)}
                onClick={() => setShowPayment(true)}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 30, marginBottom: 6 }}>🏆</div>
                <div style={{ fontWeight: 800, fontSize: 15,
                  color: T.gold, marginBottom: 4 }}>Business</div>
                <div style={{ fontWeight: 900, fontSize: 26,
                  color: T.text, lineHeight: 1 }}>
                  $10
                  <span style={{ fontSize: 12, fontWeight: 400,
                    color: T.muted }}>/mo</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                  Premium + export markets
                </div>
              </div>
            </div>

            <button
              style={{ ...s.btn(T.green), width: "100%",
                padding: "14px", fontSize: 14 }}
              onClick={() => setShowPayment(true)}>
              💳 Pay with EcoCash / OneMoney
            </button>
            <p style={{ textAlign: "center", fontSize: 11,
              color: T.muted, marginTop: 8 }}>
              Instant activation after payment ✅
            </p>
          </>
        )}
      </div>

      {/* ── Update Location ────────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📍 Update Farm Location</h3>
        <p style={{ color: T.muted, fontSize: 13,
          marginTop: 0, marginBottom: 14 }}>
          Type your farm area for more accurate AI advice and pricing.
        </p>
        <input
          style={s.input}
          placeholder="e.g. Marondera, Beatrice, Mvurwi..."
          value={locInput}
          onChange={e => setLocInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && saveLocation()}
        />
        {locMsg && <div style={s.alert(locMsg.t)}>{locMsg.m}</div>}
        <button
          style={s.btn(T.green)}
          onClick={saveLocation}
          disabled={saving}>
          {saving ? "⏳ Verifying..." : "📍 Save Location"}
        </button>
      </div>

      {/* ── Account & Support ──────────────────────────────── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>⚙️ Account</h3>
        <div style={{ fontSize: 13, color: T.muted,
          lineHeight: 1.9, marginBottom: 16 }}>
          <div>📱 WhatsApp history syncs automatically</div>
          <div>📞 Support: <strong style={{ color: T.text }}>
            {config.SUPPORT_PHONE}</strong></div>
          <div>📧 <strong style={{ color: T.text }}>
            manhambaratapiwa548@gmail.com</strong></div>
          <div>🌐 <strong style={{ color: T.text }}>
            agrobot.co.zw</strong></div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={s.btn(T.green)}
            onClick={() => setPage("settings")}>
            🎨 Change Theme
          </button>
          <button
            style={s.btn(T.blue)}
            onClick={() => setPage("support")}>
            🎫 Support Ticket
          </button>
        </div>
      </div>

      {/* ── Logout ─────────────────────────────────────────── */}
      <div style={s.card}>
        <button
          style={s.btnOutline}
          onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.background = "#ef444414"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          🚪 Logout
        </button>
      </div>

    </div>
  );
}