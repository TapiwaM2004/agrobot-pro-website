/**
 * App.jsx — Merged: State-based routing + New features
 * ─────────────────────────────────────────────────────────────────────
 * ✅ All original pages preserved (Dashboard, Community, Prices, etc.)
 * ✅ GPS auto-detect (silent, runs on mount)
 * ✅ Trial status banner
 * ✅ Transport Hire pages (browse, post, listing)
 * ✅ FarmTube pages (home, channel, post, search, upload, analytics)
 * ✅ Password management / Settings
 * ✅ Upgrade page (EcoCash / OneMoney payment)
 * ✅ Admin, Support, Notifications, Payment all intact
 * ─────────────────────────────────────────────────────────────────────
 *
 * HOW ROUTING WORKS:
 *   - Navigation is still driven by the `page` state string (no react-router needed)
 *   - New pages (transport, farmtube, upgrade) are added as new `page` values
 *   - setPage("transport")        → TransportBrowse
 *   - setPage("transport-post")   → TransportPost
 *   - setPage("transport-view")   → TransportListing  (also set transportId)
 *   - setPage("farmtube")         → FarmTubeHome
 *   - setPage("farmtube-search")  → FarmTubeSearch
 *   - setPage("farmtube-upload")  → FarmTubeUpload
 *   - setPage("farmtube-analytics")→ FarmTubeAnalytics
 *   - setPage("farmtube-channel") → FarmTubeChannel  (own channel)
 *   - setPage("farmtube-post")    → FarmTubePost     (also set farmtubePostId)
 *   - setPage("upgrade")          → UpgradePage
 * ─────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";

// ── Original pages ────────────────────────────────────────────────────
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Community     from "./pages/Community";
import Prices        from "./pages/Prices";
import Seeds         from "./pages/Seeds";
import Profile       from "./pages/Profile";
import Marketplace   from "./pages/Marketplace";
import Disease       from "./pages/Disease";
import Soil          from "./pages/Soil";
import Weather       from "./pages/Weather";
import News          from "./pages/News";
import HelpNearby    from "./pages/HelpNearby";
import Loans         from "./pages/Loans";
import FarmPlan      from "./pages/FarmPlan";
import PhotoAnalysis from "./pages/PhotoAnalysis";
import Admin         from "./pages/Admin";
import Support       from "./pages/Support";
import Notifications from "./pages/Notifications";
import Payment       from "./pages/Payment";
import Settings      from "./pages/Settings";
import Navbar        from "./components/Navbar";
import { ThemeProvider } from "./ThemeContext";
import "./App.css";

// ── GPS hook — silently auto-detects browser location ─────────────────
// Creates/updates localStorage.gps_lat & localStorage.gps_lng
// Import from your hooks folder once the file exists:
// import useGPS from "./hooks/useGPS";
//
// Inline fallback so the app works even if the hook file isn't created yet:
function useGPS() {
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        localStorage.setItem("gps_lat", coords.latitude);
        localStorage.setItem("gps_lng", coords.longitude);
      },
      () => {}, // silently ignore denied / unavailable
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);
}

// ── Trial Banner — shows when ≤ 7 days left on free trial ────────────
// Swap this inline version for your real TrialBanner component once ready:
// import { TrialBanner } from "./components/TrialStatus";
function TrialBanner({ phone, onUpgrade }) {
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!phone) return;
    // trialStart stored as ISO string when user registers
    const raw = localStorage.getItem("trial_start");
    if (!raw) return;
    const start   = new Date(raw);
    const elapsed = (Date.now() - start.getTime()) / 86400000; // days
    const left    = Math.max(0, Math.round(14 - elapsed));     // 14-day trial
    setDaysLeft(left);
  }, [phone]);

  if (daysLeft === null || daysLeft > 7) return null;

  return (
    <div style={{
      background: daysLeft <= 2 ? "#7a1c1c" : "#3a4a1a",
      color: "#f0e8c8",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 13,
      fontFamily: "DM Sans, system-ui, sans-serif",
      zIndex: 9999,
      position: "sticky",
      top: 0,
    }}>
      <span>
        ⏳ Your free trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.
        Upgrade to keep all features.
      </span>
      <button
        onClick={onUpgrade}
        style={{
          background: "#c8a84b",
          color: "#0a1a10",
          border: "none",
          borderRadius: 50,
          padding: "4px 14px",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          marginLeft: 12,
          flexShrink: 0,
        }}>
        Upgrade Now
      </button>
    </div>
  );
}

// ── Transport Hire pages ──────────────────────────────────────────────
// Swap for real imports once the files exist:
// import { TransportBrowse, TransportListing, TransportPost } from "./pages/TransportHire";
function TransportBrowse({ user, setPage, setTransportId }) {
  return (
    <div style={placeholderStyle}>
      <h2>🚛 Transport Hire</h2>
      <p>Browse available transport listings here.</p>
      <button onClick={() => setPage("transport-post")} style={btnStyle}>
        + Post a Listing
      </button>
    </div>
  );
}
function TransportPost({ user, setPage }) {
  return (
    <div style={placeholderStyle}>
      <h2>🚛 Post Transport Listing</h2>
      <p>Post your truck, tractor, or delivery vehicle for hire.</p>
      <button onClick={() => setPage("transport")} style={btnStyle}>← Back</button>
    </div>
  );
}
function TransportListing({ user, setPage, transportId }) {
  return (
    <div style={placeholderStyle}>
      <h2>🚛 Transport Listing #{transportId}</h2>
      <p>Full details for this listing.</p>
      <button onClick={() => setPage("transport")} style={btnStyle}>← Back</button>
    </div>
  );
}

// ── FarmTube pages ────────────────────────────────────────────────────
// Swap for real imports once the files exist:
// import FarmTubeHome     from "./pages/FarmTube/FarmTubeHome";
// import FarmTubeChannel  from "./pages/FarmTube/FarmTubeChannel";
// import FarmTubePost     from "./pages/FarmTube/FarmTubePost";
// import FarmTubeSearch   from "./pages/FarmTube/FarmTubeSearch";
// import { FarmTubeUpload, FarmTubeAnalytics } from "./pages/FarmTube/FarmTubeUpload";
function FarmTubeHome({ user, setPage }) {
  return (
    <div style={placeholderStyle}>
      <h2>🎬 FarmTube</h2>
      <p>Farming videos from your community.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={() => setPage("farmtube-search")}   style={btnStyle}>🔍 Search</button>
        <button onClick={() => setPage("farmtube-upload")}   style={btnStyle}>⬆️ Upload</button>
        <button onClick={() => setPage("farmtube-channel")}  style={btnStyle}>📺 My Channel</button>
        <button onClick={() => setPage("farmtube-analytics")}style={btnStyle}>📊 Analytics</button>
      </div>
    </div>
  );
}
function FarmTubeSearch({ user, setPage }) {
  return <div style={placeholderStyle}><h2>🔍 FarmTube Search</h2><button onClick={() => setPage("farmtube")} style={btnStyle}>← Back</button></div>;
}
function FarmTubeUpload({ user, setPage }) {
  return <div style={placeholderStyle}><h2>⬆️ Upload Video</h2><button onClick={() => setPage("farmtube")} style={btnStyle}>← Back</button></div>;
}
function FarmTubeAnalytics({ user, setPage }) {
  return <div style={placeholderStyle}><h2>📊 FarmTube Analytics</h2><button onClick={() => setPage("farmtube")} style={btnStyle}>← Back</button></div>;
}
function FarmTubeChannel({ user, setPage }) {
  return <div style={placeholderStyle}><h2>📺 My FarmTube Channel</h2><button onClick={() => setPage("farmtube")} style={btnStyle}>← Back</button></div>;
}
function FarmTubePost({ user, setPage, farmtubePostId }) {
  return <div style={placeholderStyle}><h2>🎬 FarmTube Post #{farmtubePostId}</h2><button onClick={() => setPage("farmtube")} style={btnStyle}>← Back</button></div>;
}

// ── Placeholder helpers (remove once real components are imported) ─────
const placeholderStyle = {
  background: "#112318",
  border: "1px solid #223629",
  borderRadius: 16,
  padding: "32px 24px",
  color: "#e4ede6",
  fontFamily: "DM Sans, system-ui, sans-serif",
  minHeight: 300,
};
const btnStyle = {
  background: "#c8a84b",
  color: "#0a1a10",
  border: "none",
  borderRadius: 50,
  padding: "8px 20px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

// ── Upgrade page ──────────────────────────────────────────────────────
function UpgradePage({ user, setPage }) {
  const phone = user?.phone || localStorage.getItem("phone") || "";
  return (
    <div style={{
      background: "#07120c",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "DM Sans, system-ui, sans-serif",
      color: "#e4ede6",
    }}>
      <div style={{
        background: "#112318",
        border: "1px solid #223629",
        borderRadius: 16,
        padding: "36px 32px",
        maxWidth: 440,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
        <h2 style={{ fontFamily: "Fraunces, serif", margin: "0 0 8px", fontSize: 24 }}>
          Upgrade AgroBot Pro
        </h2>
        <p style={{ color: "#6e9476", margin: "0 0 24px", fontSize: 14, lineHeight: 1.6 }}>
          Keep all premium features after your free trial ends.
        </p>

        {[
          {
            plan: "Premium", price: "$2", period: "month", features: [
              "🌤️ GPS precision weather",
              "📸 Photo crop analysis",
              "📍 Find help near you",
              "💰 Live market prices",
              "🌱 Seed recommendations",
              "🏦 Loan & insurance advice",
              "📊 Full analytics",
            ],
          },
          {
            plan: "Business", price: "$10", period: "month", features: [
              "✅ Everything in Premium",
              "👨‍💼 Dedicated AI consultant",
              "🌍 Export market connections",
              "📦 Bulk buyer/seller matching",
              "📋 Custom weekly reports",
            ],
          },
        ].map(tier => (
          <div key={tier.plan} style={{
            background: "#0f2018",
            border: "1px solid #223629",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 14,
            textAlign: "left",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 12,
            }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#e4ede6" }}>{tier.plan}</h3>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700, color: "#c8a84b" }}>
                {tier.price}
                <span style={{ fontSize: 13, color: "#6e9476" }}>/{tier.period}</span>
              </span>
            </div>
            {tier.features.map(f => (
              <p key={f} style={{ margin: "4px 0", fontSize: 13, color: "#6e9476" }}>{f}</p>
            ))}
            <a
              href={`https://wa.me/263787341018?text=UPGRADE ${tier.plan.toUpperCase()} ${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                marginTop: 14,
                padding: "10px 0",
                borderRadius: 50,
                background: "#c8a84b",
                color: "#0a1a10",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
              }}>
              Upgrade to {tier.plan} — {tier.price}/mo
            </a>
          </div>
        ))}

        <p style={{ fontSize: 12, color: "#3f5c45", marginTop: 8 }}>
          Pay via EcoCash or OneMoney · Activates instantly
        </p>

        <button
          onClick={() => setPage("dashboard")}
          style={{ ...btnStyle, background: "transparent", color: "#6e9476", marginTop: 8 }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]               = useState(null);
  const [page, setPage]               = useState("dashboard");

  // ── Extra state for pages that need an ID ─────────────────────────
  const [transportId, setTransportId] = useState(null);
  const [farmtubePostId, setFarmtubePostId] = useState(null);

  // ── Restore session ───────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("agrobot_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  // ── GPS auto-detect (silent) ──────────────────────────────────────
  useGPS();

  // ── Auth helpers ──────────────────────────────────────────────────
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("agrobot_user", JSON.stringify(userData));
    // Mark trial start if first login
    if (!localStorage.getItem("trial_start")) {
      localStorage.setItem("trial_start", new Date().toISOString());
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agrobot_user");
    setPage("dashboard");
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("agrobot_user", JSON.stringify(updated));
  };

  // ── Not logged in ─────────────────────────────────────────────────
  if (!user) {
    return (
      <ThemeProvider>
        <Login onLogin={login} />
      </ThemeProvider>
    );
  }

  // ── Pages that should NOT show the trial banner ───────────────────
  const hideBannerOn = ["upgrade", "payment", "admin"];
  const showBanner   = !hideBannerOn.includes(page);

  // ── Page renderer ─────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {

      // ── Original pages ──────────────────────────────────────────
      case "dashboard":     return <Dashboard     user={user} setPage={setPage} />;
      case "community":     return <Community     user={user} />;
      case "prices":        return <Prices        user={user} />;
      case "seeds":         return <Seeds         user={user} />;
      case "marketplace":   return <Marketplace   user={user} />;
      case "disease":       return <Disease       user={user} />;
      case "soil":          return <Soil          user={user} />;
      case "weather":       return <Weather       user={user} />;
      case "news":          return <News          user={user} />;
      case "help":          return <HelpNearby    user={user} />;
      case "loans":         return <Loans         user={user} />;
      case "farmplan":      return <FarmPlan      user={user} />;
      case "photo":         return <PhotoAnalysis user={user} />;
      case "support":       return <Support       user={user} />;
      case "notifications": return <Notifications user={user} />;
      case "admin":         return <Admin         onExit={() => setPage("dashboard")} />;

      case "profile":
        return <Profile user={user} onLogout={logout} setPage={setPage} />;

      case "settings":
        return <Settings user={user} onLogout={logout} />;

      case "payment":
        return (
          <Payment
            user={user}
            onSuccess={(plan) => {
              updateUser({ plan });
              setPage("dashboard");
            }}
          />
        );

      // ── Upgrade ─────────────────────────────────────────────────
      case "upgrade":
        return <UpgradePage user={user} setPage={setPage} />;

      // ── Transport Hire ───────────────────────────────────────────
      case "transport":
        return (
          <TransportBrowse
            user={user}
            setPage={setPage}
            setTransportId={setTransportId}
          />
        );
      case "transport-post":
        return <TransportPost user={user} setPage={setPage} />;
      case "transport-view":
        return (
          <TransportListing
            user={user}
            setPage={setPage}
            transportId={transportId}
          />
        );

      // ── FarmTube ─────────────────────────────────────────────────
      case "farmtube":
        return <FarmTubeHome     user={user} setPage={setPage} />;
      case "farmtube-search":
        return <FarmTubeSearch   user={user} setPage={setPage} />;
      case "farmtube-upload":
        return <FarmTubeUpload   user={user} setPage={setPage} />;
      case "farmtube-analytics":
        return <FarmTubeAnalytics user={user} setPage={setPage} />;
      case "farmtube-channel":
        return <FarmTubeChannel  user={user} setPage={setPage} />;
      case "farmtube-post":
        return (
          <FarmTubePost
            user={user}
            setPage={setPage}
            farmtubePostId={farmtubePostId}
          />
        );

      default:
        return <Dashboard user={user} setPage={setPage} />;
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <ThemeProvider>
      {/* Trial countdown banner */}
      {showBanner && (
        <TrialBanner
          phone={user?.phone || ""}
          onUpgrade={() => setPage("upgrade")}
        />
      )}

      {/* Main navbar — upgrade page hides it for cleaner UX */}
      {page !== "upgrade" && (
        <Navbar page={page} setPage={setPage} user={user} onLogout={logout} />
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {renderPage()}
      </div>
    </ThemeProvider>
  );
}