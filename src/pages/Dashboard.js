import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

export default function Dashboard({ user, setPage }) {
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [question,setQuestion]= useState("");
  const [answer,  setAnswer]  = useState("");
  const [asking,  setAsking]  = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/farmer/${user.phone}`),
        axios.get(`${config.API_URL}/api/farmer/${user.phone}/conversations?limit=20`)
      ]);
      setStats(fRes.data);
      setHistory(cRes.data.conversations || []);
    } catch {}
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    try {
      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question, phone:user.phone
      });
      setAnswer(res.data.answer);
      loadData();
    } catch { setAnswer("Error. Please try again."); }
    setAsking(false);
  };

  const trialDays = stats?.trial_days_left ?? user?.trial_days_left ?? 0;
  const plan      = stats?.plan || user?.plan || "free";
  const daysOn    = stats?.stats?.days_since_joining  || 1;
  const streak    = stats?.stats?.streak_days          || 0;
  const totalMsgs = stats?.stats?.total_messages       || 0;

  const freeFeatures = [
    { id:"disease",    icon:"🌿", title:"Crop Disease & Pest",    desc:"Diagnose and treat crop problems",     color:"#e8f5e9", border:"#4caf50" },
    { id:"soil",       icon:"🧪", title:"Soil Health & Fertilizer", desc:"Soil analysis and fertilizer plan",  color:"#fff8e1", border:"#f9a825" },
    { id:"marketplace",icon:"🛒", title:"Marketplace",              desc:"Buy and sell agricultural products", color:"#e3f2fd", border:"#1976d2" },
    { id:"news",       icon:"📰", title:"Farming News",             desc:"Latest Zimbabwe farming updates",    color:"#fce4ec", border:"#e91e63" },
    { id:"community",  icon:"👥", title:"Farmer Community",         desc:"Chat with farmers across Zimbabwe",  color:"#f3e5f5", border:"#9c27b0" },
  ];

  const premiumFeatures = [
    { id:"weather",  icon:"🌤️", title:"GPS Weather Forecast",     desc:"7-day precision farm forecast",       color:"#e3f2fd", border:"#1976d2" },
    { id:"photo",    icon:"📸", title:"Photo Crop Analysis",       desc:"AI diagnoses from your photo",        color:"#fce4ec", border:"#e91e63" },
    { id:"prices",   icon:"💰", title:"Live Market Prices",        desc:"Real-time Zimbabwe prices",           color:"#fff8e1", border:"#f9a825" },
    { id:"seeds",    icon:"🌱", title:"Seed Recommendations",      desc:"Best seeds for your region",          color:"#e8f5e9", border:"#4caf50" },
    { id:"help",     icon:"📍", title:"Find Help Near You",        desc:"Agritex, GMB, agro-dealers nearby",   color:"#fff3e0", border:"#ff9800" },
    { id:"loans",    icon:"🏦", title:"Loan & Insurance",          desc:"Agricultural finance guidance",        color:"#e8eaf6", border:"#3f51b5" },
    { id:"farmplan", icon:"📅", title:"Farm Planning Calendar",    desc:"Professional seasonal farm plan",     color:"#f1f8e9", border:"#8bc34a" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom:14, color:"#2e7d32" }}>
        🌱 Welcome, {user.name || `Farmer ${user.phone?.slice(-4)}`}!
      </h2>

      {/* Trial Banner */}
      {plan === "trial" && trialDays > 0 && (
        <div className="trial-bar">
          <div style={{ flex:1 }}>
            <strong>🎁 Free Trial — {trialDays} days remaining</strong>
            <p style={{ fontSize:12, marginTop:2 }}>
              All premium features unlocked!
            </p>
            <div className="progress" style={{ marginTop:6 }}>
              <div className="progress-fill"
                style={{ width:`${((30-trialDays)/30)*100}%` }} />
            </div>
          </div>
          <button className="btn btn-gold"
            style={{ marginLeft:16 }}
            onClick={() => setPage("payment")}>
            Subscribe $2/mo
          </button>
        </div>
      )}

      {plan === "free" && (
        <div style={{
          background:"#ffebee",
          border:"1px solid #ef9a9a",
          borderRadius:10, padding:12, marginBottom:16,
          display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:8
        }}>
          <span>
            ⚠️ <strong>Trial Expired</strong> — Upgrade to keep premium features
          </span>
          <button className="btn btn-green"
            style={{ padding:"6px 14px" }}
            onClick={() => setPage("payment")}>
            💳 Subscribe Now
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid3" style={{ marginBottom:18 }}>
        <div className="stat-box">
          <h2>{daysOn}</h2>
          <p>Days on AgroBot</p>
        </div>
        <div className="stat-box">
          <h2>{totalMsgs}</h2>
          <p>Total Messages</p>
        </div>
        <div className="stat-box">
          <h2>{streak}🔥</h2>
          <p>Day Streak</p>
        </div>
      </div>

      {/* Ask AgroBot */}
      <div className="card">
        <h3>💬 Ask AgroBot Anything</h3>
        <textarea className="input" rows={3}
          placeholder="Ask about crops, diseases, soil, seeds, prices, weather..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          style={{ resize:"vertical" }} />
        <button className="btn btn-green"
          onClick={askQuestion} disabled={asking}>
          {asking ? "🤔 Thinking..." : "🌿 Ask AgroBot"}
        </button>
        {answer && (
          <div style={{
            marginTop:14, padding:14,
            background:"#e8f5e9", borderRadius:8
          }}>
            <strong>🤖 AgroBot:</strong>
            <p style={{
              marginTop:8, lineHeight:1.7,
              fontSize:14, whiteSpace:"pre-wrap"
            }}>
              {answer}
            </p>
          </div>
        )}
      </div>

      {/* Free Features */}
      <div className="card">
        <h3>📋 Free Services</h3>
        <div className="grid3">
          {freeFeatures.map(f => (
            <div key={f.id}
              onClick={() => setPage(f.id)}
              style={{
                padding:14, borderRadius:10, cursor:"pointer",
                background:f.color, border:`2px solid ${f.border}`,
                transition:"transform 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            >
              <div style={{ fontSize:28, marginBottom:6 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
                {f.title}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div className="card">
        <h3>
          💎 Premium Services
          <span style={{
            marginLeft:8, fontSize:12,
            fontWeight:400, color:"#f57f17"
          }}>
            {plan==="trial"   ? `(${trialDays} trial days left)` :
             plan==="premium" || plan==="business" ? "✅ Active" :
             "— Upgrade $2/mo"}
          </span>
        </h3>
        <div className="grid3">
          {premiumFeatures.map(f => (
            <div key={f.id}
              onClick={() => setPage(f.id)}
              style={{
                padding:14, borderRadius:10, cursor:"pointer",
                background: plan==="free" ? "#f5f5f5" : f.color,
                border:`2px solid ${plan==="free" ? "#e0e0e0" : f.border}`,
                opacity: plan==="free" ? 0.75 : 1,
                transition:"transform 0.15s", position:"relative"
              }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            >
              {plan==="free" && (
                <div style={{
                  position:"absolute", top:6, right:6,
                  fontSize:12, background:"#9e9e9e",
                  color:"white", padding:"1px 7px",
                  borderRadius:10
                }}>🔒</div>
              )}
              <div style={{ fontSize:28, marginBottom:6 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
                {f.title}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>{f.desc}</div>
            </div>
          ))}
        </div>
        {plan === "free" && (
          <button className="btn btn-green"
            style={{ width:"100%", marginTop:12 }}
            onClick={() => setPage("payment")}>
            💳 Unlock All Premium Features
          </button>
        )}
      </div>

      {/* Recent Conversations */}
      <div className="card">
        <h3>📋 Recent Conversations
          <span style={{ fontSize:12, fontWeight:400,
            color:"#888", marginLeft:8 }}>
            (WhatsApp + Web synced)
          </span>
        </h3>
        <div className="chat-box">
          {history.length === 0 && (
            <p style={{
              color:"#aaa", textAlign:"center",
              marginTop:30, fontSize:14
            }}>
              No conversations yet. Use any feature above!
            </p>
          )}
          {history.slice().reverse().map((msg,i) => (
            <div key={i}
              className={`msg ${msg.role==="farmer"?"me":"bot"}`}>
              <div className="msg-meta">
                {msg.role==="farmer" ? "👤 You" : "🤖 AgroBot"} •{" "}
                {msg.timestamp?.slice(0,16).replace("T"," ")} •{" "}
                <span style={{ color:"#aaa" }}>
                  {msg.platform || "whatsapp"}
                </span>
              </div>
              <div className="bubble">
                {msg.message?.slice(0,300)}
                {msg.message?.length > 300 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}