import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

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

const SEEDS = [
  { name: "Seedco SC403",    crop: "Maize",      flag: "🌽", trait: "Drought tolerant · 8-12 t/ha",         region: "All Zimbabwe Regions" },
  { name: "KRK 26",          crop: "Tobacco",    flag: "🍂", trait: "Premium grade · 2.5-3.5 t/ha",         region: "Mashonaland" },
  { name: "QM 302",          crop: "Cotton",     flag: "🌿", trait: "High lint% · 1.5-2.5 t/ha",            region: "Regions 3 & 4" },
  { name: "SC Soya 6",       crop: "Soya Beans", flag: "🫘", trait: "High protein · 3-4.5 t/ha",            region: "Regions 1 & 2" },
  { name: "PAN 8816",        crop: "Sorghum",    flag: "🌾", trait: "Bird resistant · 4-7 t/ha",            region: "Regions 3, 4 & 5" },
  { name: "Ruduku",          crop: "Groundnuts", flag: "🥜", trait: "Popular local · 1.5-2.5 t/ha",         region: "Regions 2 & 3" },
  { name: "Delphos",         crop: "Wheat",      flag: "🌾", trait: "Rust resistant · 5-8 t/ha",            region: "Irrigated Regions" },
  { name: "Pannar PAN 6479", crop: "Maize",      flag: "🌽", trait: "Grey leaf spot resistant · 9-12 t/ha", region: "Region 2" },
  { name: "ARDA R201",       crop: "Maize OPV",  flag: "🌽", trait: "Open pollinated · Affordable",         region: "Smallholder Farms" },
  { name: "Seedco SC633",    crop: "Maize",      flag: "🌽", trait: "Top commercial · 10-14 t/ha",          region: "Region 2" },
];

// Modes: login | register | forgot_step1 | forgot_step2 | change_password
const INPUT = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none",
  boxSizing: "border-box", background: "#fafafa",
};

const BTN = (disabled) => ({
  width: "100%", marginTop: 16, padding: "13px", fontSize: 15,
  fontWeight: 800, borderRadius: 12, border: "none", cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "#ccc" : "#2e7d32", color: "white", transition: "background 0.2s",
});

const LINK = { color: "#2e7d32", fontWeight: 700, cursor: "pointer", textDecoration: "underline" };

export default function Login({ onLogin }) {
  const [mode,      setMode]    = useState("login");
  const [phone,     setPhone]   = useState("");
  const [name,      setName]    = useState("");
  const [pass,      setPass]    = useState("");
  const [confirm,   setConfirm] = useState("");
  const [oldPass,   setOldPass] = useState("");
  const [otp,       setOtp]     = useState("");
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState("");
  const [success,   setSuccess] = useState("");
  const [showPass,  setShowP]   = useState(false);
  const [bgIdx,     setBgIdx]   = useState(0);
  const [seedIdx,   setSeedIdx] = useState(0);
  const [fadeIn,    setFadeIn]  = useState(true);
  const [checking,  setChecking]= useState(true);

  // Background rotation
  useEffect(() => {
    const t = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => { setBgIdx(i => (i+1) % BG_IMAGES.length); setFadeIn(true); }, 500);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Seed rotation
  useEffect(() => {
    const t = setInterval(() => setSeedIdx(i => (i+1) % SEEDS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Auto-login on page load — fast token check
  useEffect(() => {
    const p = localStorage.getItem("agrobot_phone");
    const t = localStorage.getItem("agrobot_token");
    if (!p || !t) { setChecking(false); return; }
    axios.post(`${config.API_URL}/api/verify-token`, { phone: p, token: t }, { timeout: 5000 })
      .then(r => { if (r.data.success) onLogin({ ...r.data, phone: p }); else clearSession(); })
      .catch(() => clearSession())
      .finally(() => setChecking(false));
  }, []);

  const clearSession = () => {
    localStorage.removeItem("agrobot_phone");
    localStorage.removeItem("agrobot_token");
  };

  const fmt = r => r.replace(/\s/g,"").replace(/^0/,"263").replace(/^\+/,"");
  const clr = () => { setPass(""); setConfirm(""); setOldPass(""); setOtp(""); setError(""); setSuccess(""); };
  const sw  = m  => { setMode(m); clr(); };

  // ── REGISTER ────────────────────────────────────────────────
  const doRegister = async () => {
    setError("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter a valid phone number");
    if (!name.trim())        return setError("Please enter your name");
    if (pass.length < 4)     return setError("Password must be at least 4 characters");
    if (pass !== confirm)    return setError("Passwords do not match");
    setLoading(true);
    try {
      const f = fmt(phone);
      const r = await axios.post(`${config.API_URL}/api/register`,
        { phone: f, name, password: pass, platform: "web" }, { timeout: 8000 });
      localStorage.setItem("agrobot_phone", f);
      localStorage.setItem("agrobot_token", r.data.token);
      onLogin({ ...r.data, phone: f, name });
    } catch(e) {
      if (e.response?.status === 409) {
        setError("Number already registered. Redirecting to login...");
        setTimeout(() => sw("login"), 1500);
      } else {
        setError("Registration failed. Check your connection.");
      }
    }
    setLoading(false);
  };

  // ── LOGIN ────────────────────────────────────────────────────
  const doLogin = async () => {
    setError("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter a valid phone number");
    if (!pass) return setError("Enter your password");
    setLoading(true);
    try {
      const f = fmt(phone);
      const r = await axios.post(`${config.API_URL}/api/login`,
        { phone: f, password: pass }, { timeout: 8000 });
      localStorage.setItem("agrobot_phone", f);
      localStorage.setItem("agrobot_token", r.data.token);
      onLogin({ ...r.data, phone: f });
    } catch(e) {
      const err = e.response?.data?.error || "";
      if (err === "not_registered") {
        setError("No account found. Redirecting to register...");
        setTimeout(() => sw("register"), 1500);
      } else if (err === "wrong_password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Login failed. Check your connection.");
      }
    }
    setLoading(false);
  };

  // ── FORGOT PASSWORD — Step 1: Send OTP ──────────────────────
  const doForgotStep1 = async () => {
    setError("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter your registered phone number");
    setLoading(true);
    try {
      const f = fmt(phone);
      await axios.post(`${config.API_URL}/api/forgot-password`,
        { phone: f }, { timeout: 10000 });
      setSuccess(`✅ Reset code sent to WhatsApp +${f.slice(0,3)}...${f.slice(-4)}`);
      setTimeout(() => { setSuccess(""); sw("forgot_step2"); }, 1500);
    } catch(e) {
      const err = e.response?.data?.error || "";
      if (err === "not_registered") {
        setError("No account found for this number.");
      } else {
        setError("Failed to send reset code. Check your connection.");
      }
    }
    setLoading(false);
  };

  // ── FORGOT PASSWORD — Step 2: Verify OTP + New Password ─────
  const doForgotStep2 = async () => {
    setError("");
    if (!otp || otp.length !== 6) return setError("Enter the 6-digit code from WhatsApp");
    if (pass.length < 4)  return setError("New password must be at least 4 characters");
    if (pass !== confirm)  return setError("Passwords do not match");
    setLoading(true);
    try {
      const f = fmt(phone);
      const r = await axios.post(`${config.API_URL}/api/reset-password`,
        { phone: f, otp, new_password: pass }, { timeout: 8000 });
      localStorage.setItem("agrobot_phone", f);
      localStorage.setItem("agrobot_token", r.data.token);
      onLogin({ ...r.data, phone: f });
    } catch(e) {
      const err = e.response?.data?.error || "";
      setError(err || "Failed to reset password. Try again.");
    }
    setLoading(false);
  };

  // ── CHANGE PASSWORD ──────────────────────────────────────────
  const doChangePass = async () => {
    setError("");
    if (phone.replace(/\s/g,"").length < 9) return setError("Enter your phone number");
    if (!oldPass)         return setError("Enter your current password");
    if (pass.length < 4)  return setError("New password must be at least 4 characters");
    if (pass !== confirm)  return setError("Passwords do not match");
    if (pass === oldPass)  return setError("New password must be different");
    setLoading(true);
    try {
      const f = fmt(phone);
      await axios.post(`${config.API_URL}/api/change-password`,
        { phone: f, old_password: oldPass, new_password: pass }, { timeout: 8000 });
      setSuccess("✅ Password changed! Please login.");
      clr();
      setTimeout(() => sw("login"), 2000);
    } catch(e) {
      const err = e.response?.data?.error || "";
      setError(err === "Current password is incorrect"
        ? "Current password is incorrect." : "Failed. Check your connection.");
    }
    setLoading(false);
  };

  const submit = () => {
    if (mode === "login")          doLogin();
    else if (mode === "register")  doRegister();
    else if (mode === "forgot_step1") doForgotStep1();
    else if (mode === "forgot_step2") doForgotStep2();
    else if (mode === "change_password") doChangePass();
  };

  const seed = SEEDS[seedIdx];

  // Auto-login loading screen
  if (checking) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1b5e20,#4caf50)",
        display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
        <div style={{ fontSize:56 }}>🌿</div>
        <p style={{ color:"#fff", fontSize:18, fontWeight:700, margin:0 }}>AgroBot Pro</p>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:0 }}>Signing you in...</p>
      </div>
    );
  }

  const isForgot = mode === "forgot_step1" || mode === "forgot_step2";

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      {/* Background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`url(${BG_IMAGES[bgIdx]})`,
        backgroundSize:"cover", backgroundPosition:"center",
        transition:"opacity 0.5s", opacity:fadeIn?1:0, zIndex:0 }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(135deg,rgba(0,0,0,0.6),rgba(27,94,32,0.75))", zIndex:1 }}/>

      <div style={{ position:"relative", zIndex:2, minHeight:"100vh",
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"20px 16px" }}>

        {/* Seed banner */}
        <div style={{ background:"rgba(255,255,255,0.13)", backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.2)", borderRadius:50, padding:"8px 20px",
          marginBottom:16, display:"flex", alignItems:"center", gap:10,
          maxWidth:400, width:"100%" }}>
          <span style={{ fontSize:20 }}>{seed.flag}</span>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:12 }}>🌱 {seed.name} — {seed.crop}</div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11 }}>{seed.trait} · {seed.region}</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)",
          borderRadius:20, padding:"26px 22px", maxWidth:400, width:"100%",
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:18 }}>
            <div style={{ fontSize:46 }}>🌿</div>
            <h1 style={{ color:"#1b5e20", fontSize:22, fontWeight:900, margin:"4px 0 2px" }}>AgroBot Pro</h1>
            <p style={{ color:"#777", fontSize:12, margin:0 }}>TM AGRO Solutions · Zimbabwe</p>
            {!isForgot && mode !== "change_password" && (
              <div style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:11, fontWeight:700,
                padding:"3px 12px", borderRadius:20, display:"inline-block", marginTop:7 }}>
                🎁 30-Day Free Trial · All Features Unlocked
              </div>
            )}
          </div>

          {/* Tabs — login/register */}
          {!isForgot && mode !== "change_password" && (
            <div style={{ display:"flex", background:"#f5f5f5", borderRadius:12, padding:4, marginBottom:16 }}>
              {[{k:"login",l:"🔑 Login"},{k:"register",l:"✅ Register"}].map(t => (
                <button key={t.k} onClick={() => sw(t.k)} style={{
                  flex:1, padding:"8px 0", border:"none", borderRadius:10, cursor:"pointer",
                  fontWeight:700, fontSize:13,
                  background: mode===t.k ? "#2e7d32" : "transparent",
                  color:      mode===t.k ? "white"   : "#888",
                  transition:"all 0.2s" }}>{t.l}</button>
              ))}
            </div>
          )}

          {/* Special headers */}
          {isForgot && (
            <div style={{ textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:28 }}>{mode==="forgot_step1" ? "🔐" : "📱"}</div>
              <h3 style={{ color:"#1b5e20", margin:"4px 0 2px", fontSize:17 }}>
                {mode==="forgot_step1" ? "Recover Account" : "Enter Reset Code"}
              </h3>
              <p style={{ color:"#888", fontSize:12, margin:0 }}>
                {mode==="forgot_step1"
                  ? "Enter your phone — we'll WhatsApp you a reset code"
                  : "Check your WhatsApp for the 6-digit code"}
              </p>
            </div>
          )}
          {mode === "change_password" && (
            <div style={{ textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:28 }}>🔒</div>
              <h3 style={{ color:"#1b5e20", margin:"4px 0 0", fontSize:17 }}>Change Password</h3>
            </div>
          )}

          {/* Form */}
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>

            {/* Name — register only */}
            {mode === "register" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>Full Name *</label>
                <input style={INPUT} placeholder="e.g. John Moyo" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            {/* Phone */}
            {mode !== "forgot_step2" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>Phone Number *</label>
                <input style={INPUT} placeholder="e.g. 0771234567" value={phone}
                  onChange={e => setPhone(e.target.value)} type="tel" />
              </div>
            )}

            {/* OTP — forgot step 2 */}
            {mode === "forgot_step2" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>6-Digit Code from WhatsApp *</label>
                <input style={{ ...INPUT, textAlign:"center", letterSpacing:8, fontSize:22, fontWeight:700 }}
                  placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                  type="tel" maxLength={6} />
              </div>
            )}

            {/* Current password — change password */}
            {mode === "change_password" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>Current Password *</label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...INPUT, paddingRight:42 }} placeholder="Current password"
                    value={oldPass} onChange={e => setOldPass(e.target.value)}
                    type={showPass ? "text" : "password"} />
                  <button onClick={() => setShowP(s=>!s)} style={{ position:"absolute", right:12,
                    top:"50%", transform:"translateY(-50%)", background:"none", border:"none",
                    cursor:"pointer", fontSize:15, color:"#888" }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
            )}

            {/* Password — all modes except forgot_step1 */}
            {mode !== "forgot_step1" && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>
                  {mode === "change_password" || mode === "forgot_step2" ? "New Password *" : "Password *"}
                </label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...INPUT, paddingRight:42 }}
                    placeholder={mode === "register" ? "Create password (min 4 chars)"
                      : mode === "forgot_step2" || mode === "change_password" ? "New password"
                      : "Your password"}
                    value={pass} onChange={e => setPass(e.target.value)}
                    type={showPass ? "text" : "password"}
                    onKeyDown={e => e.key==="Enter" && submit()} />
                  <button onClick={() => setShowP(s=>!s)} style={{ position:"absolute", right:12,
                    top:"50%", transform:"translateY(-50%)", background:"none", border:"none",
                    cursor:"pointer", fontSize:15, color:"#888" }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>
            )}

            {/* Confirm password */}
            {(mode === "register" || mode === "change_password" || mode === "forgot_step2") && (
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#555", display:"block", marginBottom:3 }}>
                  {mode === "forgot_step2" || mode === "change_password" ? "Confirm New Password *" : "Confirm Password *"}
                </label>
                <input style={INPUT} placeholder="Repeat password" value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  type={showPass ? "text" : "password"}
                  onKeyDown={e => e.key==="Enter" && submit()} />
              </div>
            )}
          </div>

          {/* Error / Success */}
          {error   && <div style={{ background:"#ffebee", color:"#c62828", padding:"9px 14px",
            borderRadius:10, fontSize:13, marginTop:11, border:"1px solid #ef9a9a" }}>❌ {error}</div>}
          {success && <div style={{ background:"#e8f5e9", color:"#2e7d32", padding:"9px 14px",
            borderRadius:10, fontSize:13, marginTop:11, border:"1px solid #a5d6a7" }}>{success}</div>}

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={BTN(loading)}>
            {loading ? "⏳ Please wait..."
              : mode === "login"          ? "🔑 Login to AgroBot"
              : mode === "register"       ? "🌿 Create Account"
              : mode === "forgot_step1"   ? "📱 Send Reset Code via WhatsApp"
              : mode === "forgot_step2"   ? "🔓 Reset Password"
              : "🔒 Change Password"}
          </button>

          {/* Bottom links */}
          <div style={{ textAlign:"center", marginTop:13, fontSize:13, color:"#888" }}>
            {mode === "login" && (<>
              <p style={{ margin:"0 0 5px" }}>New farmer? <span style={LINK} onClick={() => sw("register")}>Register here</span></p>
              <p style={{ margin:0, fontSize:12 }}>
                <span style={LINK} onClick={() => sw("forgot_step1")}>Forgot password?</span>
                {"  ·  "}
                <span style={LINK} onClick={() => sw("change_password")}>Change password</span>
              </p>
            </>)}
            {mode === "register" && (
              <p style={{ margin:0 }}>Already registered? <span style={LINK} onClick={() => sw("login")}>Login here</span></p>
            )}
            {(isForgot || mode === "change_password") && (
              <p style={{ margin:0 }}><span style={LINK} onClick={() => sw("login")}>← Back to Login</span></p>
            )}
            {mode === "forgot_step1" && (
              <p style={{ margin:"5px 0 0", fontSize:12 }}>
                Remembered it? <span style={LINK} onClick={() => sw("login")}>Login instead</span>
              </p>
            )}
            {mode === "forgot_step2" && (
              <p style={{ margin:"5px 0 0", fontSize:12 }}>
                Didn't get the code? <span style={LINK} onClick={() => sw("forgot_step1")}>Resend code</span>
              </p>
            )}
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"#bbb", marginTop:11, marginBottom:0 }}>
            📞 {config.SUPPORT_PHONE} · 🔒 Secured
          </p>
        </div>

        {/* Background nav dots */}
        <div style={{ display:"flex", gap:6, marginTop:14 }}>
          {BG_IMAGES.map((_,i) => (
            <div key={i} onClick={() => setBgIdx(i)} style={{
              width: i===bgIdx?20:8, height:8, borderRadius:4,
              background: i===bgIdx?"#fff":"rgba(255,255,255,0.4)",
              cursor:"pointer", transition:"all 0.3s" }}/>
          ))}
        </div>
      </div>
    </div>
  );
}