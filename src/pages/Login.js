import React, { useState } from "react";
import axios from "axios";
import config from "../config";

export default function Login({ onLogin }) {
  const [phone,   setPhone]   = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleLogin = async () => {
    const cleaned = phone.replace(/\s/g,"");
    if (cleaned.length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formatted = cleaned.replace(/^0/,"263").replace(/^\+/,"");
      const res = await axios.post(`${config.API_URL}/api/register`, {
        phone: formatted, name, platform:"web"
      });
      onLogin({ ...res.data, phone:formatted, name });
    } catch {
      setError("Login failed. Please check your internet connection.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#1b5e20,#4caf50)",
      display:"flex", alignItems:"center",
      justifyContent:"center", padding:20
    }}>
      <div className="card" style={{ maxWidth:420, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:64 }}>🌱</div>
          <h2 style={{ color:"#2e7d32", marginBottom:4 }}>
            AgroBot Pro
          </h2>
          <p style={{ color:"#888", fontSize:14 }}>
            TM AGRO Solutions — Zimbabwe
          </p>
          <div style={{
            background:"#fff8e1", padding:"8px 16px",
            borderRadius:20, display:"inline-block",
            marginTop:10, fontSize:13,
            color:"#e65100", fontWeight:700
          }}>
            🎁 30-Day Free Trial — All Features Unlocked!
          </div>
        </div>

        <input className="input"
          placeholder="Your Name (optional)"
          value={name}
          onChange={e => setName(e.target.value)} />

        <input className="input"
          placeholder="Phone Number  e.g. 0771234567"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          type="tel"
          onKeyDown={e => e.key==="Enter" && handleLogin()} />

        {error && (
          <div style={{
            background:"#ffebee", color:"#c62828",
            padding:"8px 12px", borderRadius:8,
            fontSize:13, marginBottom:12,
            border:"1px solid #ef9a9a"
          }}>
            ❌ {error}
          </div>
        )}

        <button
          className="btn btn-green"
          style={{ width:"100%", marginBottom:12, padding:"13px" }}
          onClick={handleLogin}
          disabled={loading}>
          {loading ? "Connecting..." : "🌿 Login / Register"}
        </button>

        <p style={{
          textAlign:"center", fontSize:12,
          color:"#999", marginBottom:4
        }}>
          Your WhatsApp history syncs automatically
        </p>
        <p style={{ textAlign:"center", fontSize:12, color:"#999" }}>
          📞 {config.SUPPORT_PHONE}
        </p>
      </div>
    </div>
  );
}