import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const PLANS = [
  {
    id: "premium",
    name: "💎 Premium",
    price: 2,
    color: "#2e7d32",
    border: "#4caf50",
    bg: "#e8f5e9",
    features: [
      "🌤️ GPS Weather & Climate Forecast",
      "📸 Photo Crop Disease Analysis",
      "📍 Find Agricultural Help Nearby",
      "💰 Live Regional Market Prices",
      "🌱 Seed Brand Recommendations",
      "🏦 Loan & Insurance Advisory",
      "📅 Professional Farm Planning",
      "⚡ Priority AI Responses",
    ]
  },
  {
    id: "business",
    name: "🏆 Business",
    price: 10,
    color: "#e65100",
    border: "#f9a825",
    bg: "#fff8e1",
    features: [
      "✅ Everything in Premium PLUS:",
      "👨‍💼 Dedicated AI Farm Consultant",
      "🌍 Export Market Connections",
      "📦 Bulk Buyer & Seller Matching",
      "📋 Custom Weekly Farm Reports",
      "🏗️ Multiple Farm Management",
      "📱 Priority WhatsApp Support",
    ]
  }
];

export default function Payment({ user, onSuccess }) {
  const [step,      setStep]      = useState("select");
  const [plan,      setPlan]      = useState(null);
  const [phone,     setPhone]     = useState("");
  const [method,    setMethod]    = useState("ecocash");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [txRef,     setTxRef]     = useState("");
  const [countdown, setCountdown] = useState(120);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (user?.phone) {
      const clean = user.phone
        .replace("263","0")
        .replace("+263","0");
      setPhone(clean);
    }
  }, [user]);

  // Countdown while waiting
  useEffect(() => {
    if (step !== "waiting") return;
    if (countdown <= 0) { setStep("failed"); return; }
    const t = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  // Poll for payment
  useEffect(() => {
    if (step !== "waiting") return;
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(
          `${config.API_URL}/api/payment/status/${txRef}`
        );
        if (res.data.status === "confirmed" || res.data.active) {
          clearInterval(poll);
          setStep("success");
          if (onSuccess) onSuccess(res.data.plan || plan?.id);
        }
        setPollCount(c => c+1);
      } catch {}
    }, 5000);
    return () => clearInterval(poll);
  }, [step, txRef]);

  const formatPhone = (p) =>
    p.replace(/\s/g,"").replace(/^0/,"263").replace(/^\+/,"");

  const initiatePayment = async () => {
    if (!phone || phone.replace(/\D/g,"").length < 9) {
      setError("Please enter a valid phone number"); return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${config.API_URL}/api/payment/initiate-ussd`,
        {
          phone:       user.phone,
          payer_phone: formatPhone(phone),
          plan:        plan.id,
          amount:      plan.price,
          method,
          farmer_name: user.name || "Farmer"
        }
      );
      if (res.data.success) {
        setTxRef(res.data.reference);
        setCountdown(120);
        setStep("waiting");
      } else {
        setError(res.data.message || "Failed to initiate payment");
      }
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Could not connect to payment system. Try again."
      );
    }
    setLoading(false);
  };

  // ── SELECT PLAN ────────────────────────────────────────────
  if (step === "select") return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:6 }}>
        💎 Choose Your Plan
      </h2>
      <p style={{ color:"#888", fontSize:14, marginBottom:20 }}>
        Pay with EcoCash or OneMoney directly from this page
      </p>

      <div className="grid2" style={{ marginBottom:20 }}>
        {PLANS.map(p => (
          <div key={p.id}
            onClick={() => { setPlan(p); setStep("phone"); }}
            style={{
              border:`3px solid ${p.border}`,
              borderRadius:14, padding:20,
              cursor:"pointer", background:p.bg,
              transition:"transform 0.15s, box-shadow 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform="scale(1.02)";
              e.currentTarget.style.boxShadow=`0 6px 20px ${p.border}44`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform="scale(1)";
              e.currentTarget.style.boxShadow="none";
            }}
          >
            <div style={{ fontSize:36, marginBottom:8 }}>
              {p.id==="premium" ? "💎" : "🏆"}
            </div>
            <h3 style={{ color:p.color, marginBottom:4 }}>{p.name}</h3>
            <div style={{
              fontSize:32, fontWeight:"bold",
              color:p.color, marginBottom:12
            }}>
              ${p.price}
              <span style={{ fontSize:14, fontWeight:400, color:"#888" }}>
                /month
              </span>
            </div>
            <div style={{
              background:p.color, color:"white",
              padding:"5px 14px", borderRadius:20,
              fontSize:12, fontWeight:700,
              display:"inline-block", marginBottom:14
            }}>
              Select This Plan →
            </div>
            <div style={{ fontSize:13, lineHeight:1.9 }}>
              {p.features.map((f,i) => (
                <div key={i} style={{ color:"#444" }}>{f}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ENTER PHONE ────────────────────────────────────────────
  if (step === "phone") return (
    <div style={{ maxWidth:480, margin:"0 auto" }}>
      <button onClick={() => { setStep("select"); setError(""); }}
        style={{
          background:"none", border:"none",
          cursor:"pointer", color:"#2e7d32",
          fontSize:14, fontWeight:600,
          marginBottom:16, padding:0
        }}>
        ← Back to Plans
      </button>

      <div className="card" style={{
        borderTop:`4px solid ${plan.border}`
      }}>
        {/* Plan summary */}
        <div style={{
          background:plan.bg, padding:14,
          borderRadius:10, marginBottom:20,
          display:"flex", justifyContent:"space-between",
          alignItems:"center"
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:plan.color }}>
              {plan.name}
            </div>
            <div style={{ fontSize:13, color:"#888" }}>30 days access</div>
          </div>
          <div style={{
            fontWeight:"bold", fontSize:24, color:plan.color
          }}>
            ${plan.price}
          </div>
        </div>

        <h3 style={{ marginBottom:14 }}>
          📱 Select Payment Method
        </h3>

        {/* Method Selector */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { id:"ecocash",  label:"💚 EcoCash",  code:"*151#" },
            { id:"onemoney", label:"🔵 OneMoney", code:"*111#" },
          ].map(m => (
            <button key={m.id}
              onClick={() => setMethod(m.id)}
              style={{
                flex:1, padding:"10px 8px", borderRadius:8,
                border:`2px solid ${method===m.id ? plan.color : "#e0e0e0"}`,
                cursor:"pointer", fontWeight:700, fontSize:14,
                background: method===m.id ? plan.bg : "white",
                color:      method===m.id ? plan.color : "#888"
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Phone Input */}
        <label style={{
          fontSize:13, color:"#666",
          display:"block", marginBottom:6
        }}>
          {method==="ecocash" ? "💚 EcoCash" : "🔵 OneMoney"} Number
        </label>
        <div style={{ position:"relative", marginBottom:8 }}>
          <div style={{
            position:"absolute", left:12, top:"50%",
            transform:"translateY(-50%)",
            fontWeight:700, color:"#2e7d32", fontSize:14
          }}>
            🇿🇼 +263
          </div>
          <input
            className="input"
            style={{ paddingLeft:80, marginBottom:0, fontSize:16 }}
            type="tel"
            placeholder="771234567"
            value={phone.replace(/^0/,"").replace(/^263/,"")}
            onChange={e => setPhone(e.target.value)}
            maxLength={9}
          />
        </div>

        <p style={{ fontSize:12, color:"#888", marginBottom:16 }}>
          ℹ️ A payment request will be sent to this number.
          You will enter your PIN on your phone to confirm.
        </p>

        {error && (
          <div style={{
            background:"#ffebee", color:"#c62828",
            padding:"10px 14px", borderRadius:8,
            fontSize:13, marginBottom:12
          }}>
            ❌ {error}
          </div>
        )}

        <button
          className="btn btn-green"
          style={{ width:"100%", fontSize:15, padding:"14px" }}
          onClick={() => { setStep("confirm"); setError(""); }}
          disabled={!phone || phone.replace(/\D/g,"").length < 9}>
          Next — Review Payment →
        </button>
      </div>
    </div>
  );

  // ── CONFIRM ────────────────────────────────────────────────
  if (step === "confirm") return (
    <div style={{ maxWidth:480, margin:"0 auto" }}>
      <button onClick={() => { setStep("phone"); setError(""); }}
        style={{
          background:"none", border:"none",
          cursor:"pointer", color:"#2e7d32",
          fontSize:14, fontWeight:600,
          marginBottom:16, padding:0
        }}>
        ← Back
      </button>

      <div className="card" style={{
        borderTop:`4px solid ${plan.border}`
      }}>
        <h3 style={{ marginBottom:20 }}>✅ Confirm Payment</h3>

        {/* Summary Table */}
        <div style={{
          borderRadius:10, overflow:"hidden",
          marginBottom:20
        }}>
          {[
            { label:"Plan",     value:plan.name },
            { label:"Amount",   value:`$${plan.price} USD` },
            { label:"Method",   value:method==="ecocash" ? "💚 EcoCash" : "🔵 OneMoney" },
            { label:"Pay From", value:`+263 ${phone.replace(/^0/,"").replace(/^263/,"")}` },
            { label:"Pay To",   value:"TM AGRO Solutions" },
            { label:"Period",   value:"30 days access" },
          ].map((row,i) => (
            <div key={i} style={{
              display:"flex", justifyContent:"space-between",
              padding:"11px 14px",
              background:i%2===0 ? "#f5f5f5" : "white",
              fontSize:14
            }}>
              <span style={{ color:"#888" }}>{row.label}</span>
              <span style={{ fontWeight:700 }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{
          background:"#e8f5e9", padding:14,
          borderRadius:10, marginBottom:20
        }}>
          <strong style={{ fontSize:14 }}>📱 How this works:</strong>
          <ol style={{
            fontSize:13, paddingLeft:18,
            lineHeight:2.2, marginTop:8, color:"#444"
          }}>
            <li>Tap <strong>"Pay Now"</strong> below</li>
            <li>Your phone gets a payment prompt</li>
            <li>Enter your <strong>PIN</strong> to confirm</li>
            <li>Premium activates <strong>automatically!</strong> ✅</li>
          </ol>
        </div>

        {error && (
          <div style={{
            background:"#ffebee", color:"#c62828",
            padding:"10px 14px", borderRadius:8,
            fontSize:13, marginBottom:12
          }}>
            ❌ {error}
          </div>
        )}

        <button
          className="btn btn-green"
          style={{ width:"100%", fontSize:16, padding:"16px", marginBottom:10 }}
          onClick={initiatePayment}
          disabled={loading}>
          {loading ? "⏳ Sending request..." : `💳 Pay $${plan.price} Now`}
        </button>

        <p style={{ textAlign:"center", fontSize:12, color:"#aaa" }}>
          🔒 Your PIN is never shared with us
        </p>
      </div>
    </div>
  );

  // ── WAITING ────────────────────────────────────────────────
  if (step === "waiting") return (
    <div style={{ maxWidth:480, margin:"0 auto", textAlign:"center" }}>
      <div className="card" style={{ padding:32 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>📱</div>
        <h3 style={{ color:"#2e7d32", marginBottom:8 }}>
          Payment Request Sent!
        </h3>

        <div style={{
          background: method==="ecocash" ? "#e8f5e9" : "#e3f2fd",
          padding:16, borderRadius:12, marginBottom:20
        }}>
          <p style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>
            Check your phone now!
          </p>
          <p style={{ fontSize:14, color:"#555" }}>
            A {method==="ecocash" ? "EcoCash" : "OneMoney"} payment
            request was sent to:
          </p>
          <p style={{
            fontSize:20, fontWeight:"bold",
            color:"#2e7d32", margin:"8px 0"
          }}>
            +263 {phone.replace(/^0/,"").replace(/^263/,"")}
          </p>
          <p style={{ fontSize:13, color:"#666" }}>
            Enter your PIN to confirm ${plan.price}
          </p>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, color:"#888", marginBottom:6 }}>
            Request expires in
          </div>
          <div style={{
            fontSize:40, fontWeight:"bold",
            color: countdown < 30 ? "#f44336" : "#2e7d32"
          }}>
            {Math.floor(countdown/60)}:
            {String(countdown%60).padStart(2,"0")}
          </div>
          <div style={{
            background:"#e0e0e0", borderRadius:10,
            height:8, marginTop:8
          }}>
            <div style={{
              background: countdown<30 ? "#f44336" : "#4caf50",
              height:8, borderRadius:10,
              width:`${(countdown/120)*100}%`,
              transition:"width 1s linear"
            }} />
          </div>
        </div>

        <div style={{
          background:"#e8f5e9", padding:10,
          borderRadius:8, fontSize:13,
          color:"#2e7d32", marginBottom:16
        }}>
          ⏳ Checking payment... (Check #{pollCount+1})
        </div>

        <button
          onClick={() => setStep("failed")}
          style={{
            background:"none", border:"none",
            color:"#f44336", cursor:"pointer",
            fontSize:13, textDecoration:"underline"
          }}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── SUCCESS ────────────────────────────────────────────────
  if (step === "success") return (
    <div style={{
      maxWidth:480, margin:"0 auto", textAlign:"center"
    }}>
      <div className="card" style={{ padding:32 }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
        <h2 style={{ color:"#2e7d32", marginBottom:8 }}>
          Payment Successful!
        </h2>
        <div style={{
          background:"#e8f5e9", padding:20,
          borderRadius:12, marginBottom:20
        }}>
          <div style={{
            fontSize:22, fontWeight:"bold",
            color:"#2e7d32", marginBottom:6
          }}>
            {plan?.name} ACTIVATED ✅
          </div>
          <div style={{ fontSize:14, color:"#555" }}>
            Valid 30 days • All features unlocked
          </div>
        </div>
        <button
          className="btn btn-green"
          style={{ width:"100%", fontSize:15, padding:"14px" }}
          onClick={() => {
            if (onSuccess) onSuccess(plan?.id);
          }}>
          🌱 Start Using Premium Features
        </button>
      </div>
    </div>
  );

  // ── FAILED ─────────────────────────────────────────────────
  if (step === "failed") return (
    <div style={{
      maxWidth:480, margin:"0 auto", textAlign:"center"
    }}>
      <div className="card" style={{ padding:32 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>😕</div>
        <h3 style={{ color:"#c62828", marginBottom:8 }}>
          Payment Not Confirmed
        </h3>
        <div style={{
          background:"#fff3e0", padding:14,
          borderRadius:10, textAlign:"left",
          marginBottom:20, fontSize:14, lineHeight:2
        }}>
          <div>⏱️ Payment prompt expired</div>
          <div>❌ PIN entered incorrectly</div>
          <div>💰 Insufficient balance</div>
          <div>📵 Phone off or no signal</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-green" style={{ flex:1 }}
            onClick={() => {
              setStep("confirm");
              setCountdown(120);
              setError("");
            }}>
            🔄 Try Again
          </button>
          <button className="btn btn-outline" style={{ flex:1 }}
            onClick={() => setStep("select")}>
            ← Change Plan
          </button>
        </div>
        <div style={{
          marginTop:16, padding:14,
          background:"#f5f5f5", borderRadius:10,
          fontSize:13, color:"#666"
        }}>
          Need help? 📞 {config.SUPPORT_PHONE}
        </div>
      </div>
    </div>
  );

  return null;
}