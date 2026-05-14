/**
 * PasswordManager.jsx
 * ─────────────────────────────────────────────────────────
 * Handles password setup and change for both:
 *   - Farmers (web users) → POST /api/auth/change-password
 *   - Admin               → POST /api/admin/change-password
 *
 * Usage:
 *   <PasswordManager type="user" phone="263772..." />
 *   <PasswordManager type="admin" />
 */
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

const S = {
  wrap: {
    background:"#112318",border:"1px solid #223629",borderRadius:14,
    padding:24,maxWidth:440,width:"100%",
  },
  title: {
    fontFamily:"Fraunces,serif",fontSize:20,fontWeight:700,
    color:"#e4ede6",margin:"0 0 6px",
  },
  sub: { fontSize:13,color:"#6e9476",margin:"0 0 22px" },
  label: {
    display:"block",fontSize:11,color:"#3f5c45",
    textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,
  },
  input: {
    width:"100%",background:"#0f2018",border:"1.5px solid #223629",
    borderRadius:8,color:"#e4ede6",fontSize:14,padding:"10px 14px",
    boxSizing:"border-box",outline:"none",
    fontFamily:"DM Sans,system-ui,sans-serif",marginBottom:14,
    transition:"border-color 0.15s",
  },
  btn: {
    width:"100%",padding:"12px 0",borderRadius:50,
    background:"#c8a84b",border:"none",color:"#0a1a10",
    fontSize:15,fontWeight:700,cursor:"pointer",
    fontFamily:"DM Sans,system-ui,sans-serif",
  },
  success: {
    background:"rgba(69,176,106,0.1)",border:"1px solid rgba(69,176,106,0.3)",
    borderRadius:10,padding:"12px 14px",fontSize:13,color:"#45b06a",
    marginBottom:14,
  },
  error: {
    background:"rgba(224,92,92,0.1)",border:"1px solid rgba(224,92,92,0.3)",
    borderRadius:10,padding:"12px 14px",fontSize:13,color:"#e05c5c",
    marginBottom:14,
  },
};

export default function PasswordManager({ type = "user", phone = "" }) {
  const isAdmin = type === "admin";

  const [form, setForm] = useState({
    current_password:  "",
    new_password:      "",
    confirm_password:  "",
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setError(""); setSuccess(""); };

  const validate = () => {
    if (!form.current_password)
      return "Please enter your current password.";
    if (!form.new_password || form.new_password.length < 6)
      return "New password must be at least 6 characters.";
    if (form.new_password !== form.confirm_password)
      return "New passwords do not match.";
    if (form.new_password === form.current_password)
      return "New password must be different from your current password.";
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true); setError(""); setSuccess("");

    const endpoint = isAdmin
      ? `${API}/api/admin/change-password`
      : `${API}/api/auth/change-password`;

    const body = isAdmin
      ? form
      : { phone, ...form };

    try {
      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Password changed successfully!");
        setForm({ current_password:"", new_password:"", confirm_password:"" });
      } else {
        setError(data.error || "Failed to change password. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>
        {isAdmin ? "🔐 Admin Password" : "🔑 Change Password"}
      </h2>
      <p style={S.sub}>
        {isAdmin
          ? "Update the admin panel password. Minimum 8 characters."
          : "Update your account password. Minimum 6 characters."}
      </p>

      {success && <div style={S.success}>{success}</div>}
      {error   && <div style={S.error}>{error}</div>}

      {[
        { k:"current_password",  label:"Current Password",      ph:"Enter current password" },
        { k:"new_password",      label:"New Password",          ph:"At least 6 characters" },
        { k:"confirm_password",  label:"Confirm New Password",  ph:"Repeat new password" },
      ].map(f => (
        <div key={f.k}>
          <label style={S.label}>{f.label}</label>
          <div style={{position:"relative"}}>
            <input
              type={showPass ? "text" : "password"}
              placeholder={f.ph}
              value={form[f.k]}
              onChange={e => set(f.k, e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{...S.input,paddingRight:40}}
              onFocus={e  => e.target.style.borderColor = "#c8a84b"}
              onBlur={e   => e.target.style.borderColor = "#223629"}
            />
            {f.k === "current_password" && (
              <button
                onClick={() => setShowPass(v => !v)}
                style={{
                  position:"absolute",right:12,top:"50%",transform:"translateY(-60%)",
                  background:"none",border:"none",cursor:"pointer",
                  color:"#6e9476",fontSize:16,padding:0,
                }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Password strength indicator */}
      {form.new_password.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{
            height:4,borderRadius:2,background:"#223629",
            marginBottom:4,overflow:"hidden",
          }}>
            <div style={{
              height:"100%",borderRadius:2,transition:"0.3s ease",
              width: form.new_password.length >= 10 ? "100%"
                   : form.new_password.length >= 8  ? "66%"
                   : form.new_password.length >= 6  ? "33%" : "10%",
              background: form.new_password.length >= 10 ? "#45b06a"
                        : form.new_password.length >= 8  ? "#c8a84b"
                        : form.new_password.length >= 6  ? "#e07070" : "#e05c5c",
            }}/>
          </div>
          <span style={{fontSize:11,color:"#6e9476"}}>
            Strength: {
              form.new_password.length >= 10 ? "Strong 💪"
            : form.new_password.length >= 8  ? "Good 👍"
            : form.new_password.length >= 6  ? "Fair ⚠️"
            : "Too short ❌"
            }
          </span>
        </div>
      )}

      <button onClick={submit} disabled={loading} style={S.btn}>
        {loading ? "Saving…" : "Save New Password"}
      </button>
    </div>
  );
}


/**
 * SetupPassword — shown to users who registered without a password
 * (e.g. OTP-only login). Lets them create one.
 */
export function SetupPassword({ phone, onDone }) {
  const [form,    setForm]    = useState({ new_password:"", confirm_password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k,v) => { setForm(f => ({...f,[k]:v})); setError(""); };

  const submit = async () => {
    if (!form.new_password || form.new_password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/setup-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone, password: form.new_password }),
      });
      const data = await res.json();
      if (data.success) {
        onDone && onDone();
      } else {
        setError(data.error || "Failed to set password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>🔑 Create Your Password</h2>
      <p style={S.sub}>Set a password to log in faster next time.</p>

      {error && <div style={S.error}>{error}</div>}

      {[
        { k:"new_password",     label:"New Password",     ph:"At least 6 characters" },
        { k:"confirm_password", label:"Confirm Password", ph:"Repeat your password"  },
      ].map(f => (
        <div key={f.k}>
          <label style={S.label}>{f.label}</label>
          <input
            type="password" placeholder={f.ph}
            value={form[f.k]} onChange={e => set(f.k, e.target.value)}
            style={S.input}
            onFocus={e => e.target.style.borderColor="#c8a84b"}
            onBlur={e  => e.target.style.borderColor="#223629"}
          />
        </div>
      ))}

      <button onClick={submit} disabled={loading} style={S.btn}>
        {loading ? "Saving…" : "Set Password"}
      </button>
    </div>
  );
}