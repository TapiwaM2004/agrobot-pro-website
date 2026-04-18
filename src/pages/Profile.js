import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Payment from "./Payment";

export default function Profile({ user, onLogout, setPage }) {
  const [stats,       setStats]       = useState(null);
  const [plan,        setPlan]        = useState(user?.plan || "free");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/api/farmer/${user.phone}`
      );
      setStats(res.data);
      setPlan(res.data.plan || "free");
    } catch {}
  };

  const trialDays = stats?.trial_days_left ?? 0;
  const daysOn    = stats?.stats?.days_since_joining || 1;
  const location  = stats?.profile?.location || "Not set";

  if (showPayment) return (
    <div>
      <button
        onClick={() => setShowPayment(false)}
        style={{
          background:"none", border:"none",
          color:"#2e7d32", fontSize:14,
          fontWeight:600, cursor:"pointer",
          marginBottom:16, padding:0, display:"block"
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
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>
        👤 My Profile
      </h2>

      {/* Profile Card */}
      <div className="card">
        <div style={{
          display:"flex", justifyContent:"space-between",
          alignItems:"start", flexWrap:"wrap", gap:12,
          marginBottom:16
        }}>
          <div>
            <h3 style={{ marginBottom:4 }}>
              {user.name || `Farmer ${user.phone?.slice(-4)}`}
            </h3>
            <p style={{ color:"#666", fontSize:14 }}>
              📱 {user.phone}
            </p>
            <p style={{ color:"#666", fontSize:14 }}>
              📍 {location.charAt(0).toUpperCase()+location.slice(1)}
            </p>
          </div>
          <span style={{
            padding:"4px 14px", borderRadius:20,
            fontWeight:700, fontSize:13,
            background:
              plan==="premium"||plan==="business" ? "#e8f5e9" :
              plan==="trial" ? "#fff3e0" : "#f5f5f5",
            color:
              plan==="premium"||plan==="business" ? "#2e7d32" :
              plan==="trial" ? "#e65100" : "#666"
          }}>
            {plan==="premium"  ? "⭐ PREMIUM"    :
             plan==="business" ? "🏆 BUSINESS"   :
             plan==="trial"    ? "🎁 TRIAL"      : "🆓 FREE"}
          </span>
        </div>

        <div className="grid3">
          <div style={{ textAlign:"center" }}>
            <div style={{
              fontWeight:"bold", color:"#2e7d32", fontSize:22
            }}>
              {daysOn}
            </div>
            <div style={{ fontSize:12, color:"#888" }}>
              Days on AgroBot
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{
              fontWeight:"bold", color:"#2e7d32", fontSize:22
            }}>
              {stats?.stats?.total_messages || 0}
            </div>
            <div style={{ fontSize:12, color:"#888" }}>Messages</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{
              fontWeight:"bold", color:"#2e7d32", fontSize:22
            }}>
              {stats?.stats?.streak_days || 0}🔥
            </div>
            <div style={{ fontSize:12, color:"#888" }}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      {plan === "trial" && trialDays > 0 && (
        <div className="trial-bar">
          <div style={{ flex:1 }}>
            <strong>🎁 Free Trial — {trialDays} days left</strong>
            <p style={{ fontSize:12, marginTop:2, opacity:0.9 }}>
              Subscribe to keep all features!
            </p>
            <div className="progress" style={{ marginTop:6 }}>
              <div className="progress-fill"
                style={{ width:`${((30-trialDays)/30)*100}%` }}/>
            </div>
          </div>
        </div>
      )}

      {/* Subscription */}
      <div className="card">
        <h3>💎 Subscription</h3>

        {(plan==="premium"||plan==="business") ? (
          <div>
            <div style={{
              background:"#e8f5e9", padding:16,
              borderRadius:10, marginBottom:14,
              display:"flex", justifyContent:"space-between",
              alignItems:"center"
            }}>
              <div>
                <div style={{
                  fontWeight:700, fontSize:16, color:"#2e7d32"
                }}>
                  ✅ {plan==="premium" ? "Premium" : "Business"} Active
                </div>
                <div style={{ fontSize:13, color:"#666" }}>
                  All features unlocked
                </div>
              </div>
              <button className="btn btn-green"
                onClick={() => setShowPayment(true)}>
                🔄 Renew
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color:"#666", fontSize:14, marginBottom:16 }}>
              {plan==="trial"
                ? `Trial ends in ${trialDays} days. Subscribe to keep all features!`
                : "Subscribe to unlock all premium features!"}
            </p>

            {/* Plan preview */}
            <div className="grid2" style={{ marginBottom:16 }}>
              <div style={{
                border:"2px solid #4caf50", borderRadius:12,
                padding:16, textAlign:"center"
              }}>
                <div style={{ fontSize:28 }}>💎</div>
                <div style={{
                  fontWeight:700, fontSize:18,
                  color:"#2e7d32", margin:"6px 0"
                }}>Premium</div>
                <div style={{
                  fontWeight:"bold", fontSize:24, color:"#2e7d32"
                }}>
                  $2
                  <span style={{
                    fontSize:12, fontWeight:400, color:"#888"
                  }}>/month</span>
                </div>
              </div>
              <div style={{
                border:"2px solid #f9a825", borderRadius:12,
                padding:16, textAlign:"center"
              }}>
                <div style={{ fontSize:28 }}>🏆</div>
                <div style={{
                  fontWeight:700, fontSize:18,
                  color:"#e65100", margin:"6px 0"
                }}>Business</div>
                <div style={{
                  fontWeight:"bold", fontSize:24, color:"#e65100"
                }}>
                  $10
                  <span style={{
                    fontSize:12, fontWeight:400, color:"#888"
                  }}>/month</span>
                </div>
              </div>
            </div>

            <button className="btn btn-green"
              style={{ width:"100%", fontSize:16, padding:"14px" }}
              onClick={() => setShowPayment(true)}>
              💳 Pay with EcoCash / OneMoney
            </button>
            <p style={{
              textAlign:"center", fontSize:12,
              color:"#888", marginTop:8
            }}>
              Instant activation after payment ✅
            </p>
          </div>
        )}
      </div>

      {/* Verify Location */}
      <div className="card">
        <h3>📍 Update Your Location</h3>
        <p style={{ color:"#666", fontSize:14, marginBottom:12 }}>
          Type your farm area for more accurate AI advice.
        </p>
        <input className="input" id="verify-loc"
          placeholder="e.g. Marondera, Beatrice, Mvurwi..." />
        <button className="btn btn-green"
          onClick={async () => {
            const loc = document.getElementById("verify-loc").value;
            if (!loc) { alert("Enter your location"); return; }
            try {
              const res = await axios.post(
                `${config.API_URL}/api/verify-location`,
                { phone:user.phone, location:loc }
              );
              if (res.data.success) {
                alert(`✅ Location set to: ${res.data.matched_city}\nClimate: ${res.data.region_info?.climate}\nBest crops: ${res.data.region_info?.best_crops}`);
                load();
              }
            } catch {
              alert("Could not verify. Please try again.");
            }
          }}>
          📍 Save Location
        </button>
      </div>

      {/* Account */}
      <div className="card">
        <h3>⚙️ Account</h3>
        <p style={{ fontSize:14, color:"#666", marginBottom:14 }}>
          📱 WhatsApp history syncs automatically<br/>
          📞 Support: {config.SUPPORT_PHONE}<br/>
          📧 {config.SUPPORT_EMAIL}
        </p>
        <button className="btn btn-outline" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}