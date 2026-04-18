import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

export default function Admin() {
  const [authed,    setAuthed]    = useState(false);
  const [password,  setPassword]  = useState("");
  const [authError, setAuthError] = useState("");
  const [data,      setData]      = useState(null);
  const [tab,       setTab]       = useState("dashboard");
  const [loading,   setLoading]   = useState(false);
  const [adminPass, setAdminPass] = useState(() => {
  return localStorage.getItem("agrobot_admin_pass") || "AGROBOT_ADMIN_2026";
});

  // Password change
  const [currentPass,  setCurrentPass]  = useState("");
  const [newPass,      setNewPass]      = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [passMsg,      setPassMsg]      = useState(null);
  const [changingPass, setChangingPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [lastChanged,  setLastChanged]  = useState("");

  // Notification form
  const [notifTitle,  setNotifTitle]  = useState("");
  const [notifMsg,    setNotifMsg]    = useState("");
  const [notifType,   setNotifType]   = useState("update");
  const [notifTarget, setNotifTarget] = useState("all");

  // Ticket reply
  const [replyTicket, setReplyTicket] = useState("");
  const [replyMsg,    setReplyMsg]    = useState("");

  // Account fix
  const [fixPhone,  setFixPhone]  = useState("");
  const [fixAction, setFixAction] = useState("reset_trial");
  const [fixNote,   setFixNote]   = useState("");
  const [fixDays,   setFixDays]   = useState(30);

  // Payment verify
  const [payPhone,  setPayPhone]  = useState("");
  const [payRef,    setPayRef]    = useState("");
  const [payAmount, setPayAmount] = useState("");

  // ── LOGIN — Simple Local Check ────────────────────────────────
 // Replace the login function:
const login = () => {
  const trimmed = password.trim();
  if (!trimmed) {
    setAuthError("Please enter the admin password");
    return;
  }
  const stored = localStorage.getItem("agrobot_admin_pass") || "AGROBOT_ADMIN_2026";
  if (trimmed === stored) {
    setAuthed(true);
    setAdminPass(trimmed);
    setAuthError("");
  } else {
    setAuthError("Wrong password! Try again.");
  }
};

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/api/admin/dashboard`,
        { headers: { "x-admin-secret": adminPass } }
      );
      setData(res.data);
    } catch (e) {
      console.error("Admin load error:", e);
    }
    setLoading(false);
  };

  // ── CHANGE PASSWORD ───────────────────────────────────────────
  // Replace the changePassword function:
const changePassword = async () => {
  setPassMsg(null);
  if (!currentPass || !newPass || !confirmPass) {
    setPassMsg({ type:"error", text:"Please fill in all three fields" });
    return;
  }
  if (newPass.length < 8) {
    setPassMsg({ type:"error", text:"New password must be at least 8 characters" });
    return;
  }
  if (newPass !== confirmPass) {
    setPassMsg({ type:"error", text:"New passwords do not match" });
    return;
  }
  if (newPass === currentPass) {
    setPassMsg({ type:"error", text:"New password must be different from current" });
    return;
  }
  const stored = localStorage.getItem("agrobot_admin_pass") || "AGROBOT_ADMIN_2026";
  if (currentPass !== stored) {
    setPassMsg({ type:"error", text:"Current password is incorrect" });
    return;
  }

  // Save to localStorage — this persists!
  localStorage.setItem("agrobot_admin_pass", newPass);
  setAdminPass(newPass);
  setLastChanged(new Date().toISOString());

  setPassMsg({
    type:"success",
    text:"✅ Password changed! Use new password next login."
  });
  setCurrentPass("");
  setNewPass("");
  setConfirmPass("");
};

  // ── SEND NOTIFICATION ─────────────────────────────────────────
  const sendNotification = async () => {
    if (!notifTitle || !notifMsg) {
      alert("Please fill in title and message");
      return;
    }
    try {
      const res = await axios.post(
        `${config.API_URL}/api/notifications/send`,
        {
          secret:  adminPass,
          title:   notifTitle,
          message: notifMsg,
          type:    notifType,
          target:  notifTarget
        }
      );
      alert(`✅ Sent to ${res.data.sent_to} users!`);
      setNotifTitle("");
      setNotifMsg("");
    } catch {
      alert("Failed to send notification. Check connection.");
    }
  };

  // ── REPLY TO TICKET ───────────────────────────────────────────
  const replyToTicket = async (resolve = false) => {
    if (!replyTicket || !replyMsg) {
      alert("Please enter ticket ID and your reply");
      return;
    }
    try {
      await axios.post(`${config.API_URL}/api/support/reply`, {
        secret:    adminPass,
        ticket_id: replyTicket,
        reply:     replyMsg,
        resolve
      });
      alert("✅ Reply sent to farmer!");
      setReplyTicket("");
      setReplyMsg("");
      loadData();
    } catch {
      alert("Failed to send reply.");
    }
  };

  // ── FIX ACCOUNT ───────────────────────────────────────────────
  const fixAccount = async () => {
    if (!fixPhone) {
      alert("Please enter farmer phone number");
      return;
    }
    try {
      const res = await axios.post(
        `${config.API_URL}/api/support/admin-fix`,
        {
          secret: adminPass,
          phone:  fixPhone,
          action: fixAction,
          note:   fixNote,
          days:   fixDays
        }
      );
      alert(`✅ ${res.data.message}`);
      setFixPhone("");
      setFixNote("");
      loadData();
    } catch {
      alert("Failed to fix account. Check connection.");
    }
  };

  // ── ACTIVATE PREMIUM ──────────────────────────────────────────
  const activatePremium = async (phone, plan) => {
    try {
      await axios.post(`${config.API_URL}/api/activate-premium`, {
        secret: adminPass,
        phone,
        plan
      });
      alert(`✅ Premium activated for ${phone}`);
      loadData();
    } catch {
      alert("Failed to activate premium.");
    }
  };

  // ── VERIFY PAYMENT ────────────────────────────────────────────
  const verifyPayment = async () => {
    if (!payPhone || !payRef) {
      alert("Enter phone number and reference");
      return;
    }
    try {
      const res = await axios.post(
        `${config.API_URL}/api/payment/verify-manual`,
        {
          phone:     payPhone,
          reference: payRef,
          amount:    payAmount
        }
      );
      if (res.data.success) {
        alert(`✅ Premium activated for ${payPhone}!`);
        setPayPhone("");
        setPayRef("");
        setPayAmount("");
        loadData();
      } else {
        alert(`❌ ${res.data.message}`);
      }
    } catch (e) {
      alert(`Error: ${e.response?.data?.message || e.message}`);
    }
  };

  // ── STRENGTH HELPERS ──────────────────────────────────────────
  const getStrength = (p) => {
    if (!p) return { pct:0, color:"#e0e0e0", label:"" };
    if (p.length < 6)  return { pct:25,  color:"#f44336", label:"Too weak" };
    if (p.length < 8)  return { pct:50,  color:"#ff9800", label:"Weak — needs 8+ chars" };
    if (p.length < 12) return { pct:75,  color:"#2196f3", label:"Good" };
    return { pct:100, color:"#4caf50", label:"Strong ✅" };
  };

  // ─────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#1b5e20,#4caf50)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20
    }}>
      <div className="card" style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:8 }}>🔐</div>
        <h2 style={{ color:"#2e7d32", marginBottom:4 }}>Admin Panel</h2>
        <p style={{ color:"#888", fontSize:14, marginBottom:20 }}>
          TM AGRO Solutions
        </p>

        {/* Password Input */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <input
            className="input"
            style={{ marginBottom:0, paddingRight:44, textAlign:"left" }}
            type={showPassword ? "text" : "password"}
            placeholder="Enter Admin Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            autoComplete="off"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position:"absolute", right:10, top:"50%",
              transform:"translateY(-50%)",
              background:"none", border:"none",
              cursor:"pointer", fontSize:18
            }}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Error Message */}
        {authError && (
          <div style={{
            background:"#ffebee", color:"#c62828",
            padding:"10px 14px", borderRadius:8,
            fontSize:13, marginBottom:12,
            border:"1px solid #ef9a9a"
          }}>
            ❌ {authError}
          </div>
        )}

        <button
          className="btn btn-green"
          style={{ width:"100%", marginBottom:14, padding:"12px" }}
          onClick={login}>
          🔓 Login to Admin Panel
        </button>

        <div style={{
          background:"#f5f5f5", padding:10,
          borderRadius:8, fontSize:12, color:"#888"
        }}>
          <p>Forgot password?</p>
          <p>📞 {config.SUPPORT_PHONE}</p>
          <p>📧 manhambaratapiwa548@gmail.com</p>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign:"center", padding:80, color:"#888" }}>
      <div style={{ fontSize:48 }}>⏳</div>
      <p style={{ marginTop:16, fontSize:16 }}>Loading admin dashboard...</p>
    </div>
  );

  const s = data?.summary || {};

  const TABS = [
    { id:"dashboard", label:"📊 Dashboard" },
    { id:"farmers",   label:"👥 Farmers" },
    { id:"tickets",   label:"🎫 Support" },
    { id:"notify",    label:"📢 Notify" },
    { id:"fix",       label:"🔧 Fix Account" },
    { id:"payments",  label:"💳 Payments" },
    { id:"password",  label:"🔑 Password" },
  ];

  // ─────────────────────────────────────────────────────────────
  // MAIN ADMIN PANEL
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:16, maxWidth:1200, margin:"0 auto" }}>

      {/* Header */}
      <div style={{
        background:"#1b5e20", padding:"16px 20px",
        borderRadius:12, color:"white",
        display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:20
      }}>
        <div>
          <h2 style={{ color:"#f9a825", margin:0, fontSize:20 }}>
            🔐 Admin Panel
          </h2>
          <p style={{ margin:0, fontSize:13, opacity:0.8 }}>
            TM AGRO Solutions — AgroBot Pro
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-gold" onClick={loadData}>
            🔄 Refresh
          </button>
          <button
            onClick={() => { setAuthed(false); setPassword(""); }}
            style={{
              background:"transparent",
              border:"1px solid rgba(255,255,255,0.5)",
              color:"white", padding:"8px 16px",
              borderRadius:8, cursor:"pointer", fontSize:13
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display:"flex", gap:8,
        flexWrap:"wrap", marginBottom:20
      }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding:"9px 16px", borderRadius:8,
              border: t.id==="password" ? "2px solid #f9a825" : "none",
              cursor:"pointer", fontWeight:700, fontSize:13,
              background: tab===t.id ? "#2e7d32" : "#e8f5e9",
              color:      tab===t.id ? "white"   : "#2e7d32"
            }}>
            {t.label}
            {t.id==="tickets" && (s.open_tickets||0) > 0 && (
              <span style={{
                marginLeft:6, background:"#f44336",
                color:"white", padding:"1px 7px",
                borderRadius:10, fontSize:11
              }}>
                {s.open_tickets}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          DASHBOARD TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "dashboard" && (
        <>
          {/* Stats Grid */}
          <div className="grid3" style={{ marginBottom:16 }}>
            {[
              { label:"Total Farmers",   value:s.total_farmers||0,             bg:"#1b5e20" },
              { label:"Premium Active",  value:s.premium_active||0,            bg:"#1565c0" },
              { label:"Trial Active",    value:s.trial_active||0,              bg:"#e65100" },
              { label:"Monthly Revenue", value:`$${s.monthly_revenue_usd||0}`, bg:"#2e7d32" },
              { label:"Open Tickets",    value:s.open_tickets||0,              bg:"#c62828" },
              { label:"Total Messages",  value:s.total_conversations||0,       bg:"#6a1b9a" },
            ].map((item,i) => (
              <div key={i} className="stat-box"
                style={{ background:item.bg }}>
                <h2 style={{ color:"#f9a825" }}>{item.value}</h2>
                <p>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Expiring Soon */}
          {(data?.expiring_soon?.length || 0) > 0 && (
            <div className="card"
              style={{ borderTop:"4px solid #f44336", marginBottom:16 }}>
              <h3>⚠️ Expiring Soon ({data.expiring_soon.length})</h3>
              {data.expiring_soon.map((f,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"8px 0",
                  borderBottom:"1px solid #f0f0f0", fontSize:14,
                  flexWrap:"wrap", gap:8
                }}>
                  <span>📱 {f.phone}</span>
                  <span style={{
                    color: f.days_left <= 1 ? "#f44336" : "#ff9800",
                    fontWeight:700
                  }}>
                    {f.days_left} days left
                  </span>
                  <span style={{ color:"#888" }}>
                    {f.plan?.toUpperCase()}
                  </span>
                  <button className="btn btn-green"
                    style={{ padding:"4px 12px", fontSize:12 }}
                    onClick={() => activatePremium(f.phone, f.plan)}>
                    Extend 30 Days
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Payments */}
          <div className="card">
            <h3>💳 Recent Payments</h3>
            {!data?.recent_payments?.length ? (
              <p style={{ color:"#888", fontSize:14 }}>No payments yet</p>
            ) : (
              data.recent_payments.map((p,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"8px 0",
                  borderBottom:"1px solid #f0f0f0",
                  fontSize:14, flexWrap:"wrap", gap:8
                }}>
                  <span>📱 {p.phone}</span>
                  <span style={{ color:"#2e7d32", fontWeight:700 }}>
                    ${p.amount||"—"}
                  </span>
                  <span>{p.plan?.toUpperCase()}</span>
                  <span style={{ color:"#aaa", fontSize:12 }}>
                    {p.activated?.slice(0,10)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          FARMERS TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "farmers" && (
        <div className="card">
          <h3>👥 All Farmers ({data?.farmers_list?.length || 0})</h3>
          <div style={{ overflowX:"auto" }}>
            <table style={{
              width:"100%", borderCollapse:"collapse", fontSize:13
            }}>
              <thead>
                <tr style={{ background:"#e8f5e9" }}>
                  {["Phone","Location","Plan","Trial Days","Days Active","Messages","Joined","Action"].map(h => (
                    <th key={h} style={{
                      padding:"8px 12px", textAlign:"left",
                      borderBottom:"2px solid #c8e6c9",
                      whiteSpace:"nowrap", color:"#2e7d32"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.farmers_list || []).map((f,i) => (
                  <tr key={i} style={{
                    background: i%2===0 ? "white" : "#f9fbe7",
                    borderBottom:"1px solid #f0f0f0"
                  }}>
                    <td style={{ padding:"7px 12px",
                      fontFamily:"monospace", fontSize:12 }}>
                      {f.phone}
                    </td>
                    <td style={{ padding:"7px 12px" }}>
                      {f.location
                        ? f.location.charAt(0).toUpperCase() + f.location.slice(1)
                        : "—"}
                    </td>
                    <td style={{ padding:"7px 12px" }}>
                      <span style={{
                        background:
                          f.plan==="premium" || f.plan==="business"
                            ? "#e8f5e9"
                            : f.plan==="trial"
                              ? "#fff3e0"
                              : "#f5f5f5",
                        color:
                          f.plan==="premium" || f.plan==="business"
                            ? "#2e7d32"
                            : f.plan==="trial"
                              ? "#e65100"
                              : "#666",
                        padding:"2px 8px", borderRadius:10,
                        fontWeight:700, fontSize:11
                      }}>
                        {f.plan?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding:"7px 12px", textAlign:"center" }}>
                      {f.plan==="trial" ? f.trial_days_left : "—"}
                    </td>
                    <td style={{ padding:"7px 12px", textAlign:"center" }}>
                      {f.days_active}
                    </td>
                    <td style={{ padding:"7px 12px", textAlign:"center" }}>
                      {f.messages}
                    </td>
                    <td style={{ padding:"7px 12px", whiteSpace:"nowrap" }}>
                      {f.joined}
                    </td>
                    <td style={{ padding:"7px 12px" }}>
                      <button className="btn btn-green"
                        style={{ padding:"3px 10px", fontSize:11 }}
                        onClick={() => {
                          setFixPhone(f.phone);
                          setTab("fix");
                        }}>
                        Fix
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          SUPPORT TICKETS TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "tickets" && (
        <>
          {/* Reply Form */}
          <div className="card" style={{ marginBottom:16 }}>
            <h3>💬 Reply to Ticket</h3>
            <input className="input"
              placeholder="Ticket ID (e.g. TKT1A2B3C4D)"
              value={replyTicket}
              onChange={e => setReplyTicket(e.target.value)} />
            <textarea className="input" rows={4}
              placeholder="Your reply to the farmer..."
              value={replyMsg}
              onChange={e => setReplyMsg(e.target.value)}
              style={{ resize:"vertical" }} />
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-green"
                onClick={() => replyToTicket(false)}>
                📤 Send Reply
              </button>
              <button className="btn btn-gold"
                onClick={() => replyToTicket(true)}>
                ✅ Reply & Mark Resolved
              </button>
            </div>
          </div>

          {/* Tickets List */}
          <div className="card">
            <h3>🎫 All Tickets
              <span style={{
                marginLeft:8, background:"#f44336",
                color:"white", padding:"2px 9px",
                borderRadius:10, fontSize:12
              }}>
                {s.open_tickets||0} open
              </span>
            </h3>
            {!data?.recent_tickets?.length ? (
              <p style={{ color:"#888", fontSize:14 }}>No tickets yet</p>
            ) : (
              data.recent_tickets.map((t,i) => (
                <div key={i} style={{
                  padding:14, marginBottom:10,
                  border:`2px solid ${t.status==="open" ? "#ff9800" : "#4caf50"}`,
                  borderRadius:10, background:"#fafafa"
                }}>
                  <div style={{
                    display:"flex", justifyContent:"space-between",
                    marginBottom:6, flexWrap:"wrap", gap:8
                  }}>
                    <strong style={{ fontFamily:"monospace" }}>
                      #{t.id}
                    </strong>
                    <span style={{
                      color: t.status==="open" ? "#ff9800" : "#4caf50",
                      fontWeight:700, fontSize:12
                    }}>
                      ● {t.status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize:13, marginBottom:4 }}>
                    📱 <strong>{t.user_phone || t.phone}</strong>
                  </div>
                  <div style={{ fontWeight:600, marginBottom:4 }}>
                    {t.subject}
                  </div>
                  <div style={{
                    fontSize:13, color:"#666", marginBottom:6
                  }}>
                    {t.message?.slice(0,200)}
                    {t.message?.length > 200 ? "..." : ""}
                  </div>
                  <div style={{ fontSize:11, color:"#aaa", marginBottom:8 }}>
                    {t.created?.slice(0,16).replace("T"," ")}
                  </div>
                  {t.replies?.length > 0 && (
                    <div style={{
                      background:"#e8f5e9", padding:"8px 12px",
                      borderRadius:8, fontSize:13, marginBottom:8
                    }}>
                      💬 {t.replies.length} reply(ies) sent
                    </div>
                  )}
                  <button className="btn btn-outline"
                    style={{ padding:"4px 12px", fontSize:12 }}
                    onClick={() => {
                      setReplyTicket(t.id);
                      window.scrollTo(0,0);
                    }}>
                    ↑ Reply to #{t.id}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          NOTIFICATIONS TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "notify" && (
        <div className="card">
          <h3>📢 Send Notification to Farmers</h3>
          <p style={{ color:"#666", fontSize:14, marginBottom:16 }}>
            Appears in app notifications AND sent via WhatsApp.
          </p>

          <div className="grid2">
            <div>
              <label style={{
                fontSize:13, color:"#666",
                display:"block", marginBottom:4
              }}>
                Notification Type
              </label>
              <select className="input" value={notifType}
                onChange={e => setNotifType(e.target.value)}>
                <option value="update">🔔 App Update</option>
                <option value="fix">🔧 Bug Fix / Improvement</option>
                <option value="warning">⚠️ Important Warning</option>
                <option value="promo">🎁 Promotion / Offer</option>
                <option value="news">📰 Farming News</option>
              </select>
            </div>
            <div>
              <label style={{
                fontSize:13, color:"#666",
                display:"block", marginBottom:4
              }}>
                Send To
              </label>
              <select className="input" value={notifTarget}
                onChange={e => setNotifTarget(e.target.value)}>
                <option value="all">👥 All Farmers</option>
                <option value="premium">⭐ Premium Users Only</option>
                <option value="trial">🎁 Trial Users Only</option>
              </select>
            </div>
          </div>

          <label style={{
            fontSize:13, color:"#666",
            display:"block", marginBottom:4
          }}>
            Title *
          </label>
          <input className="input"
            placeholder="e.g. New Feature Added!"
            value={notifTitle}
            onChange={e => setNotifTitle(e.target.value)} />

          <label style={{
            fontSize:13, color:"#666",
            display:"block", marginBottom:4
          }}>
            Message *
          </label>
          <textarea className="input" rows={6}
            placeholder="Write your message to farmers..."
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
            style={{ resize:"vertical" }} />

          <button className="btn btn-green"
            onClick={sendNotification}
            style={{ width:"100%" }}>
            📢 Send Notification Now
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          FIX ACCOUNT TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "fix" && (
        <div className="card">
          <h3>🔧 Fix Farmer Account</h3>

          <label style={{
            fontSize:13, color:"#666",
            display:"block", marginBottom:4
          }}>
            Farmer Phone Number *
          </label>
          <input className="input"
            placeholder="e.g. 263771234567"
            value={fixPhone}
            onChange={e => setFixPhone(e.target.value)} />

          <label style={{
            fontSize:13, color:"#666",
            display:"block", marginBottom:4
          }}>
            Action *
          </label>
          <select className="input" value={fixAction}
            onChange={e => setFixAction(e.target.value)}>
            <option value="reset_trial">
              🎁 Reset 30-Day Trial
            </option>
            <option value="extend_premium">
              ⭐ Extend Premium
            </option>
            <option value="send_message">
              💬 Send WhatsApp Message
            </option>
            <option value="clear_history">
              🗑️ Clear Chat History
            </option>
            <option value="refund_reset">
              💳 Deactivate Premium (Refund)
            </option>
          </select>

          {fixAction === "extend_premium" && (
            <>
              <label style={{
                fontSize:13, color:"#666",
                display:"block", marginBottom:4
              }}>
                Days to Extend
              </label>
              <input className="input" type="number"
                value={fixDays}
                onChange={e => setFixDays(parseInt(e.target.value)||30)}
                min={1} max={365} />
            </>
          )}

          <label style={{
            fontSize:13, color:"#666",
            display:"block", marginBottom:4
          }}>
            Note / Message to Farmer (optional)
          </label>
          <textarea className="input" rows={3}
            placeholder="Optional note sent to farmer via WhatsApp..."
            value={fixNote}
            onChange={e => setFixNote(e.target.value)} />

          <button className="btn btn-green"
            onClick={fixAccount}
            style={{ width:"100%" }}>
            🔧 Apply Fix Now
          </button>

          <div style={{
            background:"#fff8e1", padding:12,
            borderRadius:8, marginTop:12, fontSize:13
          }}>
            ⚠️ All changes automatically send a WhatsApp notification
            to the farmer.
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          PAYMENTS TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "payments" && (
        <>
          <div className="card" style={{ marginBottom:16 }}>
            <h3>💳 Manually Verify Payment</h3>
            <p style={{ color:"#666", fontSize:14, marginBottom:14 }}>
              Use when farmer has paid but system didn't auto-confirm.
            </p>

            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              Farmer Phone *
            </label>
            <input className="input"
              placeholder="e.g. 263771234567"
              value={payPhone}
              onChange={e => setPayPhone(e.target.value)} />

            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              Payment Reference *
            </label>
            <input className="input"
              placeholder="e.g. AGRO341018"
              value={payRef}
              onChange={e => setPayRef(e.target.value)} />

            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              Amount Paid
            </label>
            <input className="input"
              placeholder="e.g. 2 or 10"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)} />

            <button className="btn btn-green"
              onClick={verifyPayment}
              style={{ width:"100%" }}>
              ✅ Verify & Activate Premium
            </button>
          </div>

          <div className="card">
            <h3>💳 Recent Payments</h3>
            {!data?.recent_payments?.length ? (
              <p style={{ color:"#888", fontSize:14 }}>No payments yet</p>
            ) : (
              data.recent_payments.map((p,i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"8px 0",
                  borderBottom:"1px solid #f0f0f0",
                  fontSize:14, flexWrap:"wrap", gap:8
                }}>
                  <span>📱 {p.phone}</span>
                  <span style={{
                    color:"#2e7d32", fontWeight:700
                  }}>
                    ${p.amount||"—"}
                  </span>
                  <span>{p.plan?.toUpperCase()}</span>
                  <span style={{ color:"#aaa", fontSize:12 }}>
                    {p.activated?.slice(0,10)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          PASSWORD TAB
      ════════════════════════════════════════════════════════ */}
      {tab === "password" && (
        <div style={{ maxWidth:500 }}>
          <div className="card"
            style={{ borderTop:"4px solid #f9a825" }}>
            <h3>🔑 Change Admin Password</h3>

            {lastChanged && (
              <div style={{
                background:"#f5f5f5", padding:"8px 12px",
                borderRadius:8, fontSize:13,
                color:"#888", marginBottom:16
              }}>
                🕐 Last changed:{" "}
                {new Date(lastChanged).toLocaleString()}
              </div>
            )}

            {/* Tips */}
            <div style={{
              background:"#e8f5e9", padding:12,
              borderRadius:8, fontSize:13, marginBottom:16
            }}>
              <strong>💡 Strong Password Tips:</strong>
              <ul style={{
                paddingLeft:16, marginTop:6, lineHeight:2
              }}>
                <li>At least 8 characters long</li>
                <li>Mix letters, numbers and symbols</li>
                <li>Example: AgroBot@2026!</li>
              </ul>
            </div>

            {/* Current Password */}
            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              Current Password *
            </label>
            <div style={{ position:"relative", marginBottom:14 }}>
              <input className="input"
                type={showPassword ? "text" : "password"}
                style={{ marginBottom:0, paddingRight:44 }}
                placeholder="Your current admin password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)} />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position:"absolute", right:10, top:"50%",
                  transform:"translateY(-50%)",
                  background:"none", border:"none",
                  cursor:"pointer", fontSize:18
                }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* New Password */}
            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              New Password *
            </label>
            <div style={{ position:"relative", marginBottom:6 }}>
              <input className="input"
                type={showNew ? "text" : "password"}
                style={{ marginBottom:0, paddingRight:44 }}
                placeholder="Minimum 8 characters"
                value={newPass}
                onChange={e => setNewPass(e.target.value)} />
              <button
                onClick={() => setShowNew(!showNew)}
                style={{
                  position:"absolute", right:10, top:"50%",
                  transform:"translateY(-50%)",
                  background:"none", border:"none",
                  cursor:"pointer", fontSize:18
                }}>
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Strength Bar */}
            {newPass && (() => {
              const s = getStrength(newPass);
              return (
                <div style={{ marginBottom:14 }}>
                  <div style={{
                    background:"#e0e0e0",
                    borderRadius:10, height:6
                  }}>
                    <div style={{
                      height:6, borderRadius:10,
                      width:`${s.pct}%`,
                      background:s.color,
                      transition:"all 0.3s"
                    }} />
                  </div>
                  <div style={{
                    fontSize:11, color:s.color,
                    marginTop:4, fontWeight:600
                  }}>
                    {s.label}
                  </div>
                </div>
              );
            })()}

            {/* Confirm Password */}
            <label style={{
              fontSize:13, color:"#666",
              display:"block", marginBottom:4
            }}>
              Confirm New Password *
            </label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <input className="input"
                type={showConfirm ? "text" : "password"}
                style={{ marginBottom:0, paddingRight:72 }}
                placeholder="Type new password again"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)} />
              {/* Match Check */}
              {confirmPass && (
                <span style={{
                  position:"absolute", right:42, top:"50%",
                  transform:"translateY(-50%)", fontSize:18
                }}>
                  {newPass === confirmPass ? "✅" : "❌"}
                </span>
              )}
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position:"absolute", right:10, top:"50%",
                  transform:"translateY(-50%)",
                  background:"none", border:"none",
                  cursor:"pointer", fontSize:18
                }}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Message */}
            {passMsg && (
              <div style={{
                background: passMsg.type==="success"
                  ? "#e8f5e9" : "#ffebee",
                color: passMsg.type==="success"
                  ? "#2e7d32" : "#c62828",
                padding:"10px 14px", borderRadius:8,
                fontSize:14, marginBottom:16,
                border:`1px solid ${passMsg.type==="success"
                  ? "#4caf50" : "#ef9a9a"}`
              }}>
                {passMsg.text}
              </div>
            )}

            <button className="btn btn-green"
              onClick={changePassword}
              disabled={changingPass}
              style={{ width:"100%", marginBottom:14 }}>
              {changingPass
                ? "⏳ Changing Password..."
                : "🔑 Change Password"}
            </button>

            <div style={{
              background:"#fff3e0", padding:12,
              borderRadius:8, fontSize:13
            }}>
              ⚠️ <strong>Important:</strong> After changing your
              password, you must use the new password next time
              you log in. Store it somewhere safe!
            </div>
          </div>
        </div>
      )}

    </div>
  );
}