/**
 * TrialStatus.jsx
 * ─────────────────────────────────────────────────────────
 * Shows the farmer their trial countdown, auto-expires
 * access when days run out, and shows upgrade prompt.
 *
 * USAGE — add to your Dashboard or Navbar:
 *   import TrialStatus from "./components/TrialStatus";
 *   <TrialStatus phone={phone} onExpired={() => navigate("/upgrade")} />
 *
 * ALSO EXPORTS:
 *   useTrialStatus(phone) — hook to get trial data anywhere
 *   TrialBanner          — slim banner for top of pages
 *   TrialGate            — wraps premium content, blocks if expired
 */
import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "";

// ── Fetch trial data from backend ──────────────────────────────
async function fetchTrialData(phone) {
  if (!phone) return null;
  try {
    const res  = await fetch(`${API}/api/farmer/${phone}`);
    const data = await res.json();
    if (data.error) return null;

    const plan          = data.plan || "free";
    const trialDaysLeft = data.trial_days_left ?? 0;
    const isPremium     = data.premium || false;
    const stats         = data.stats || {};

    // Calculate exact expiry from joined date
    let expiryDate = null;
    let hoursLeft  = 0;
    const joinedStr = stats.joined || data.profile?.joined || "";
    if (joinedStr) {
      const joined    = new Date(joinedStr);
      const expiryMs  = joined.getTime() + (30 * 24 * 60 * 60 * 1000);
      expiryDate      = new Date(expiryMs);
      hoursLeft       = Math.max(0, (expiryMs - Date.now()) / (1000 * 60 * 60));
    }

    return {
      plan,
      isPremium,
      trialDaysLeft,
      hoursLeft:    Math.floor(hoursLeft),
      minutesLeft:  Math.floor((hoursLeft % 1) * 60),
      isOnTrial:    plan === "trial",
      isExpired:    plan === "free" && !isPremium,
      expiryDate,
      daysOnAgroBot: stats.days_since_joining || 0,
      totalMessages: stats.total_messages || 0,
    };
  } catch {
    return null;
  }
}

// ── Main hook ──────────────────────────────────────────────────
export function useTrialStatus(phone) {
  const [trial,   setTrial]   = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchTrialData(phone);
    setTrial(data);
    setLoading(false);

    // If trial just expired, clear any cached access flags
    if (data && data.isExpired) {
      localStorage.removeItem("agrobot_premium");
    }
    // Cache trial status locally so UI is instant on next load
    if (data) {
      localStorage.setItem("agrobot_trial_cache", JSON.stringify({
        ...data,
        cachedAt: Date.now(),
      }));
    }
  }, [phone]);

  useEffect(() => {
    // Show cached data instantly, then refresh from server
    try {
      const cached = JSON.parse(localStorage.getItem("agrobot_trial_cache") || "null");
      if (cached && Date.now() - cached.cachedAt < 5 * 60 * 1000) {
        setTrial(cached);
        setLoading(false);
      }
    } catch {}

    refresh();

    // Refresh every 60 seconds so UI stays in sync
    const interval = setInterval(refresh, 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { trial, loading, refresh };
}

// ── Colours ────────────────────────────────────────────────────
function trialColor(daysLeft) {
  if (daysLeft > 14) return { bg:"rgba(69,176,106,0.1)",  border:"rgba(69,176,106,0.3)",  text:"#45b06a" };
  if (daysLeft > 7)  return { bg:"rgba(200,168,75,0.1)",  border:"rgba(200,168,75,0.3)",  text:"#c8a84b" };
  if (daysLeft > 3)  return { bg:"rgba(230,140,50,0.1)",  border:"rgba(230,140,50,0.3)",  text:"#e68c32" };
  return               { bg:"rgba(224,92,92,0.1)",  border:"rgba(224,92,92,0.3)",  text:"#e05c5c" };
}

// ── Full Trial Status Card ─────────────────────────────────────
export default function TrialStatus({ phone, onExpired, onUpgrade }) {
  const { trial, loading } = useTrialStatus(phone);

  useEffect(() => {
    if (trial?.isExpired && onExpired) onExpired();
  }, [trial?.isExpired]);

  if (loading) return null;
  if (!trial)  return null;

  // Premium users — show green badge only
  if (trial.isPremium) {
    return (
      <div style={{
        background:"rgba(69,176,106,0.08)",border:"1px solid rgba(69,176,106,0.25)",
        borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,
      }}>
        <span style={{fontSize:24}}>⭐</span>
        <div>
          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14,color:"#45b06a"}}>
            Premium Active — {trial.plan.toUpperCase()}
          </p>
          <p style={{margin:0,fontSize:12,color:"#6e9476"}}>
            All features unlocked · {trial.daysOnAgroBot} days on AgroBot
          </p>
        </div>
      </div>
    );
  }

  // Trial active
  if (trial.isOnTrial) {
    const col = trialColor(trial.trialDaysLeft);
    const pct = Math.min(100, (trial.trialDaysLeft / 30) * 100);
    return (
      <div style={{
        background: col.bg, border:`1px solid ${col.border}`,
        borderRadius:12, padding:"16px 18px",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14,color:col.text}}>
              🎁 Free Trial
            </p>
            <p style={{margin:0,fontSize:13,color:"#6e9476"}}>
              {trial.trialDaysLeft > 0
                ? <>
                    <strong style={{color:col.text,fontSize:22}}>{trial.trialDaysLeft}</strong>
                    <span> day{trial.trialDaysLeft !== 1 ? "s" : ""} remaining</span>
                    {trial.trialDaysLeft <= 1 && trial.hoursLeft > 0 &&
                      <span style={{color:col.text}}> ({trial.hoursLeft}h {trial.minutesLeft}m)</span>
                    }
                  </>
                : "Trial ends today!"
              }
            </p>
          </div>
          <button
            onClick={onUpgrade}
            style={{
              background:"#c8a84b",border:"none",borderRadius:50,
              padding:"8px 20px",color:"#0a1a10",fontSize:13,fontWeight:700,
              cursor:"pointer",fontFamily:"DM Sans,system-ui,sans-serif",whiteSpace:"nowrap",
            }}>
            Upgrade $2/mo →
          </button>
        </div>

        {/* Progress bar */}
        <div style={{marginTop:12,height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
          <div style={{
            height:"100%",borderRadius:3,
            width:`${pct}%`,background:col.text,
            transition:"width 0.5s ease",
          }}/>
        </div>
        <p style={{margin:"6px 0 0",fontSize:11,color:"#3f5c45"}}>
          Day {30 - trial.trialDaysLeft} of 30
          {trial.expiryDate && ` · Expires ${trial.expiryDate.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}`}
        </p>
      </div>
    );
  }

  // Trial expired — free plan
  return (
    <div style={{
      background:"rgba(224,92,92,0.08)",border:"1px solid rgba(224,92,92,0.3)",
      borderRadius:12,padding:"16px 18px",
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:14,color:"#e05c5c"}}>
            😔 Free Trial Ended
          </p>
          <p style={{margin:0,fontSize:13,color:"#6e9476"}}>
            Your 30-day trial has ended. Upgrade to keep all features.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          style={{
            background:"#c8a84b",border:"none",borderRadius:50,
            padding:"8px 20px",color:"#0a1a10",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"DM Sans,system-ui,sans-serif",whiteSpace:"nowrap",
          }}>
          Upgrade Now →
        </button>
      </div>
      <div style={{
        marginTop:14,background:"rgba(224,92,92,0.06)",borderRadius:10,
        padding:"12px 14px",fontSize:13,color:"#6e9476",lineHeight:1.6,
      }}>
        💎 <strong style={{color:"#c8a84b"}}>Premium $2/month</strong> — GPS weather, photo analysis,
        live prices, find help nearby, seed recommendations, loan advisory<br/>
        🏆 <strong style={{color:"#c8a84b"}}>Business $10/month</strong> — Premium + export connections,
        dedicated consultant, custom reports
      </div>
    </div>
  );
}


// ── Slim Banner for top of pages ───────────────────────────────
export function TrialBanner({ phone, onUpgrade }) {
  const { trial } = useTrialStatus(phone);
  if (!trial || trial.isPremium || trial.trialDaysLeft > 7) return null;

  const col = trialColor(trial.trialDaysLeft);
  const msg = trial.isExpired
    ? "Your free trial has ended."
    : `${trial.trialDaysLeft} day${trial.trialDaysLeft !== 1 ? "s" : ""} left in your free trial.`;

  return (
    <div style={{
      background:col.bg, borderBottom:`1px solid ${col.border}`,
      padding:"8px 20px", display:"flex", alignItems:"center",
      justifyContent:"center", gap:12, flexWrap:"wrap",
    }}>
      <span style={{fontSize:13,color:col.text,fontWeight:500}}>
        {trial.isExpired ? "😔" : "⏰"} {msg}
      </span>
      <button onClick={onUpgrade} style={{
        background:"#c8a84b",border:"none",borderRadius:50,
        padding:"4px 14px",color:"#0a1a10",fontSize:12,fontWeight:700,
        cursor:"pointer",fontFamily:"DM Sans,system-ui,sans-serif",
      }}>
        Upgrade $2/mo
      </button>
    </div>
  );
}


// ── Gate — blocks premium content if trial expired ─────────────
export function TrialGate({ phone, children, fallback }) {
  const { trial, loading } = useTrialStatus(phone);

  if (loading) return (
    <div style={{padding:40,textAlign:"center",color:"#6e9476",fontSize:14}}>
      Checking your access…
    </div>
  );

  if (!trial) return fallback || null;

  // Allow access if premium OR on active trial
  if (trial.isPremium || trial.isOnTrial) return children;

  // Blocked — trial expired
  return fallback || (
    <div style={{
      background:"rgba(224,92,92,0.08)",border:"1px solid rgba(224,92,92,0.25)",
      borderRadius:14,padding:"32px 24px",textAlign:"center",
    }}>
      <div style={{fontSize:48,marginBottom:12}}>🔒</div>
      <h3 style={{fontFamily:"Fraunces,serif",margin:"0 0 8px",fontSize:20,color:"#e4ede6"}}>
        Premium Feature
      </h3>
      <p style={{color:"#6e9476",margin:"0 0 20px",fontSize:14}}>
        Your 30-day free trial has ended. Upgrade to access this feature.
      </p>
      <a href="/upgrade" style={{
        background:"#c8a84b",borderRadius:50,padding:"10px 28px",
        color:"#0a1a10",fontSize:14,fontWeight:700,textDecoration:"none",
        display:"inline-block",
      }}>
        Upgrade for $2/month
      </a>
    </div>
  );
}