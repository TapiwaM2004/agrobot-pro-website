import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

// ── Real farm photos from Unsplash (free) ──────────────────────
const BG_IMAGES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80",
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80",
  "https://images.unsplash.com/photo-1592982537447-6f2a6a0a7b8e?w=1200&q=80",
];

// ── African seed varieties ─────────────────────────────────────
const SEEDS = [
  { name: "Seedco SC403",    crop: "Maize",      flag: "🌽", trait: "Drought tolerant · 8-12 t/ha",        region: "All Zimbabwe Regions" },
  { name: "KRK 26",          crop: "Tobacco",    flag: "🍂", trait: "Premium grade · 2.5-3.5 t/ha",        region: "Mashonaland" },
  { name: "QM 302",          crop: "Cotton",     flag: "🌿", trait: "High lint% · 1.5-2.5 t/ha",           region: "Regions 3 & 4" },
  { name: "SC Soya 6",       crop: "Soya Beans", flag: "🫘", trait: "High protein · 3-4.5 t/ha",           region: "Regions 1 & 2" },
  { name: "PAN 8816",        crop: "Sorghum",    flag: "🌾", trait: "Bird resistant · 4-7 t/ha",           region: "Regions 3, 4 & 5" },
  { name: "Ruduku",          crop: "Groundnuts", flag: "🥜", trait: "Popular local · 1.5-2.5 t/ha",        region: "Regions 2 & 3" },
  { name: "Delphos",         crop: "Wheat",      flag: "🌾", trait: "Rust resistant · 5-8 t/ha",           region: "Irrigated Regions" },
  { name: "Pannar PAN 6479", crop: "Maize",      flag: "🌽", trait: "Grey leaf spot resistant · 9-12 t/ha",region: "Region 2" },
  { name: "ARDA R201",       crop: "Maize OPV",  flag: "🌽", trait: "Open pollinated · Affordable",        region: "Smallholder Farms" },
  { name: "Seedco SC633",    crop: "Maize",      flag: "🌽", trait: "Top commercial yield · 10-14 t/ha",   region: "Region 2" },
];

const INPUT_STYLE = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none",
  boxSizing: "border-box", background: "#fafafa",
};

export default function Login({ onLogin }) {
  const [mode,     setMode]    = useState("login");
  const [phone,    setPhone]   = useState("");
  const [name,     setName]    = useState("");
  const [password, setPass]    = useState("");
  const [confirm,  setConfirm] = useState("");
  const [oldPass,  setOldPass] = useState("");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");
  const [showPass, setShowPass]= useState(false);
  const [bgIndex,  setBgIndex] = useState(0);
  const [seedIdx,  setSeedIdx] = useState(0);
  const [fadeIn,   setFadeIn]  = useState(true);
  const [autoLogging, setAutoLogging] = useState(true);

  // Rotate background every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => { setBgIndex(i => (i+1) % BG_IMAGES.length); setFadeIn(true); }, 500);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Rotate seeds every 3s
  useEffect(() => {
    const t = setInterval(() => setSeedIdx(i => (i+1) % SEEDS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Auto-login from saved session
  useEffect(() => {
    const savedPhone = localStorage.getItem("agrobot_phone");
    const savedToken = localStorage.getItem("agrobot_token");
    if (savedPhone && savedToken) {
      axios.post(`${config.API_URL}/api/verify-token`, { phone: savedPhone, token: savedToken })
        .then(res => {
          if (res.data.success) onLogin({ ...res.data, phone: savedPhone });
          else { localStorage.removeItem("agrobot_phone"); localStorage.removeItem("agrobot_token"); }
        })
        .catch(() => { localStorage.removeItem("agrobot_phone"); localStorage.removeItem("agrobot_token"); })
        .finally(() => setAutoLogging(false));
    } else {
      setAutoLogging(false);
    }
  }, []);

  const fmt  = r => r.replace(/\s/g,"").replace(/^0/,"263").replace(/^\+/,"");
  const clr  = () => { setPass(""); setConfirm(""); setOldPass(""); setError(""); setSuccess(""); };
  const sw   = m  => { setMode(m); clr(); };

  const handleRegister = async () => {
    setError(""); setSuccess("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter a valid phone number");
    if (!name.trim())          return setError("Please enter your name");
    if (password.length < 4)  return setError("Password must be at least 4 characters");
    if (password !== confirm)  return setError("Passwords do not match");
    setLoading(true);
    try {
      const formatted = fmt(phone);
      const res = await axios.post(`${config.API_URL}/api/register`, {
        phone: formatted, name, password, platform: "web",
      });
      localStorage.setItem("agrobot_phone", formatted);
      localStorage.setItem("agrobot_token", res.data.token);
      onLogin({ ...res.data, phone: formatted, name });
    } catch(e) {
      const status = e.response?.status;
      const err    = e.response?.data?.error || "";
      if (status === 409 || err === "already_registered") {
        setError("Number already registered. Switching to login...");
        setTimeout(() => sw("login"), 1500);
      } else {
        setError("Registration failed. Check your connection.");
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError(""); setSuccess("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter a valid phone number");
    if (!password) return setError("Enter your password");
    setLoading(true);
    try {
      const formatted = fmt(phone);
      const res = await axios.post(`${config.API_URL}/api/login`, {
        phone: formatted, password,
      });
      localStorage.setItem("agrobot_phone", formatted);
      localStorage.setItem("agrobot_token", res.data.token);
      onLogin({ ...res.data, phone: formatted });
    } catch(e) {
      const err = e.response?.data?.error || "";
      if (err === "not_registered") {
        setError("No account found. Switching to register...");
        setTimeout(() => sw("register"), 1500);
      } else if (err === "wrong_password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Login failed. Check your connection.");
      }
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setError(""); setSuccess("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter a valid phone number");
    if (!oldPass)               return setError("Enter your current password");
    if (password.length < 4)   return setError("New password must be at least 4 characters");
    if (password !== confirm)   return setError("New passwords do not match");
    if (password === oldPass)   return setError("New password must be different from current");
    setLoading(true);
    try {
      const formatted = fmt(phone);
      await axios.post(`${config.API_URL}/api/change-password`, {
        phone: formatted, old_password: oldPass, new_password: password,
      });
      setSuccess("✅ Password changed! Please login with your new password.");
      clr();
      setTimeout(() => sw("login"), 2000);
    } catch(e) {
      const err = e.response?.data?.error || "";
      setError(err === "Current password is incorrect"
        ? "Current password is incorrect."
        : "Failed. Check your connection.");
    }
    setLoading(false);
  };

  const submit = () => {
    if (mode === "login")            handleLogin();
    else if (mode === "register")    handleRegister();
    else                             handleChangePassword();
  };

  const seed = SEEDS[seedIdx];

  // Auto-login loading screen
  if (autoLogging) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1b5e20,#4caf50)",
        display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:60 }}>🌿</div>
        <p style={{ color:"#fff", fontSize:18, fontWeight:700 }}>AgroBot Pro</p>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:14 }}>Signing you in...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", fontFamily:"Georgia, serif" }}>

      {/* Background */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:`url(${BG_IMAGES[bgIndex]})`,
        backgroundSize:"cover", backgroundPosition:"center",
        transition:"opacity 0.5s", opacity:fadeIn ? 1 : 0, zIndex:0,
      }}/>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(135deg,rgba(0,0,0,0.6),rgba(27,94,32,0.75))",
        zIndex:1,
      }}/>

      {/* Main content */}
      <div style={{
        position:"relative", zIndex:2, minHeight:"100vh",
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"20px 16px",
      }}>

        {/* Seed banner */}
        <div style={{
          background:"rgba(255,255,255,0.13)", backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.2)", borderRadius:50,
          padding:"8px 20px", marginBottom:16,
          display:"flex", alignItems:"center", gap:10,
          maxWidth:400, width:"100%",
        }}>
          <span style={{ fontSize:22 }}>{seed.flag}</span>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:12 }}>🌱 {seed.name} — {seed.crop}</div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>{seed.trait} · {seed.region}</div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)",
          borderRadius:20, padding:"28px 24px", maxWidth:400, width:"100%",
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
        }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48 }}>🌿</div>
            <h1 style={{ color:"#1b5e20", fontSize:24, fontWeight:900, margin:"6px 0 2px" }}>AgroBot Pro</h1>
            <p style={{ color:"#777", fontSize:12, margin:0 }}>TM AGRO Solutions · Zimbabwe</p>
            {mode !== "change_password" && (
              <div style={{
                background:"#e8f5e9", color:"#2e7d32", fontSize:11,
                fontWeight:700, padding:"4px 12px", borderRadius:20,
                display:"inline-block", marginTop:8,
              }}>🎁 30-Day Free Trial · All Features Unlocked</div>
            )}
          </div>

          {/* Tabs */}
          {mode !== "change_password" && (
            <div style={{ display:"flex", background:"#f5f5f5", borderRadius:12, padding:4, marginBottom:18 }}>
              {[{k:"login",l:"🔑 Login"},{k:"register",l:"✅ Register"}].map(t => (
                <button key={t.k} onClick={() => sw(t.k)} style={{
                  flex:1, padding:"9px 0", border:"none", borderRadius:10, cursor:"pointer",
                  fontWeight:700, fontSize:13,
                  background: mode===t.k ? "#2e7d32" : "transparent",
                  color:      mode===t.k ? "white"   : "#888",
                  transition:"all 0.2s",
                }}>{t.l}</button>
              ))}
            </div>
          )}

          {/* Change password title */}
          {mode === "change_password" && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:28 }}>🔒</div>
              <h3 style={{ color:"#1b5e20", margin:"4px 0 0" }}>Change Password</h3>
            </div>
          )}

          {/* Form fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {mode === "register" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:4 }}>Full Name *</label>
                <input style={INPUT_STYLE} placeholder="e.g. John Moyo"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:4 }}>Phone Number *</label>
              <input style={INPUT_STYLE} placeholder="e.g. 0771234567"
                value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            </div>

            {mode === "change_password" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:4 }}>Current Password *</label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...INPUT_STYLE, paddingRight:42 }} placeholder="Your current password"
                    value={oldPass} onChange={e => setOldPass(e.target.value)}
                    type={showPass ? "text" : "password"} />
                  <button onClick={() => setShowPass(s => !s)} style={{
                    position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#888",
                  }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:4 }}>
                {mode === "change_password" ? "New Password *" : "Password *"}
              </label>
              <div style={{ position:"relative" }}>
                <input style={{ ...INPUT_STYLE, paddingRight:42 }}
                  placeholder={mode === "register" ? "Create password (min 4 chars)" : mode === "change_password" ? "New password" : "Your password"}
                  value={password} onChange={e => setPass(e.target.value)}
                  type={showPass ? "text" : "password"}
                  onKeyDown={e => e.key === "Enter" && submit()} />
                <button onClick={() => setShowPass(s => !s)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#888",
                }}>{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {(mode === "register" || mode === "change_password") && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:4 }}>
                  {mode === "change_password" ? "Confirm New Password *" : "Confirm Password *"}
                </label>
                <input style={INPUT_STYLE} placeholder="Repeat password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  type={showPass ? "text" : "password"}
                  onKeyDown={e => e.key === "Enter" && submit()} />
              </div>
            )}
          </div>

          {error   && <div style={{ background:"#ffebee", color:"#c62828", padding:"10px 14px", borderRadius:10, fontSize:13, marginTop:12, border:"1px solid #ef9a9a" }}>❌ {error}</div>}
          {success && <div style={{ background:"#e8f5e9", color:"#2e7d32", padding:"10px 14px", borderRadius:10, fontSize:13, marginTop:12, border:"1px solid #a5d6a7" }}>{success}</div>}

          <button onClick={submit} disabled={loading} style={{
            width:"100%", marginTop:16, padding:"13px", fontSize:15,
            fontWeight:800, borderRadius:12, border:"none", cursor:"pointer",
            background: loading ? "#ccc" : "#2e7d32", color:"white",
          }}>
            {loading ? "⏳ Please wait..."
              : mode === "login"    ? "🔑 Login to AgroBot"
              : mode === "register" ? "🌿 Create Account"
              : "🔒 Change Password"}
          </button>

          <div style={{ textAlign:"center", marginTop:14 }}>
            {mode === "login" && (<>
              <p style={{ fontSize:13, color:"#888", margin:"0 0 6px" }}>
                New farmer?{" "}
                <span style={{ color:"#2e7d32", fontWeight:700, cursor:"pointer" }} onClick={() => sw("register")}>Register here</span>
              </p>
              <p style={{ fontSize:12, color:"#aaa", margin:0 }}>
                <span style={{ color:"#2e7d32", cursor:"pointer" }} onClick={() => sw("change_password")}>Forgot / Change password?</span>
              </p>
            </>)}
            {mode === "register" && (
              <p style={{ fontSize:13, color:"#888", margin:0 }}>
                Already registered?{" "}
                <span style={{ color:"#2e7d32", fontWeight:700, cursor:"pointer" }} onClick={() => sw("login")}>Login here</span>
              </p>
            )}
            {mode === "change_password" && (
              <p style={{ fontSize:13, color:"#888", margin:0 }}>
                <span style={{ color:"#2e7d32", fontWeight:700, cursor:"pointer" }} onClick={() => sw("login")}>← Back to Login</span>
              </p>
            )}
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"#bbb", marginTop:12, marginBottom:0 }}>
            📞 {config.SUPPORT_PHONE} · 🔒 Your data is secure
          </p>
        </div>

        {/* Background dots */}
        <div style={{ display:"flex", gap:6, marginTop:16 }}>
          {BG_IMAGES.map((_,i) => (
            <div key={i} onClick={() => setBgIndex(i)} style={{
              width: i===bgIndex ? 20 : 8, height:8, borderRadius:4,
              background: i===bgIndex ? "#fff" : "rgba(255,255,255,0.4)",
              cursor:"pointer", transition:"all 0.3s",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}