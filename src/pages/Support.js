import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const CATEGORIES = [
  { id:"payment",  label:"💳 Payment Issue" },
  { id:"premium",  label:"⭐ Premium Access" },
  { id:"technical",label:"🔧 Technical Problem" },
  { id:"account",  label:"👤 Account Issue" },
  { id:"feature",  label:"💡 Feature Request" },
  { id:"other",    label:"💬 Other" },
];

export default function Support({ user }) {
  const [tickets, setTickets]   = useState([]);
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [category, setCategory] = useState("technical");
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/api/support/tickets/${user.phone}`
      );
      setTickets(res.data.tickets || []);
    } catch {}
  };

  const submitTicket = async () => {
    if (!subject || !message) {
      alert("Please fill in subject and message");
      return;
    }
    setSending(true);
    try {
      const res = await axios.post(`${config.API_URL}/api/support/ticket`, {
        phone: user.phone, subject, message, category
      });
      setTicketId(res.data.ticket_id);
      setSent(true);
      setSubject("");
      setMessage("");
      loadTickets();
    } catch { alert("Failed to submit. Please try again."); }
    setSending(false);
  };

  const statusColor = (s) => ({
    open: "#ff9800", resolved: "#4caf50", pending: "#1976d2"
  }[s] || "#999");

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>
        🎫 Support & Help Center
      </h2>

      {/* Quick Links */}
      <div className="grid3" style={{ marginBottom:16 }}>
        {[
          { icon:"📞", title:"Call Us", info:config.SUPPORT_PHONE, color:"#e8f5e9" },
          { icon:"📧", title:"Email", info:"manhambaratapiwa548@gmail.com", color:"#e3f2fd" },
          { icon:"💬", title:"WhatsApp", info:"Send message to bot", color:"#f3e5f5" },
        ].map((c,i) => (
          <div key={i} className="card"
            style={{ background:c.color, textAlign:"center", padding:16 }}>
            <div style={{ fontSize:32 }}>{c.icon}</div>
            <div style={{ fontWeight:700, marginTop:6 }}>{c.title}</div>
            <div style={{ fontSize:12, color:"#666", marginTop:4 }}>{c.info}</div>
          </div>
        ))}
      </div>

      {/* Submit Ticket */}
      {!sent ? (
        <div className="card">
          <h3>📝 Submit Support Request</h3>

          {/* Category */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                style={{
                  padding:"6px 12px", borderRadius:16,
                  border:"none", cursor:"pointer",
                  fontWeight:600, fontSize:12,
                  background: category===c.id ? "#2e7d32" : "#f0f0f0",
                  color: category===c.id ? "white" : "#333"
                }}>{c.label}</button>
            ))}
          </div>

          <input className="input"
            placeholder="Subject — briefly describe your issue"
            value={subject}
            onChange={e => setSubject(e.target.value)} />

          <textarea className="input" rows={5}
            placeholder="Describe your issue in detail:
- What were you trying to do?
- What happened instead?
- Any error messages?
- Your phone number and plan"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ resize:"vertical" }} />

          <div style={{ background:"#f5f5f5", padding:12,
            borderRadius:8, fontSize:13, color:"#666", marginBottom:12 }}>
            📱 Account: <strong>{user.phone}</strong> | Plan: <strong>{user.plan?.toUpperCase()}</strong>
          </div>

          <button className="btn btn-green" onClick={submitTicket}
            disabled={sending} style={{ width:"100%" }}>
            {sending ? "Submitting..." : "📤 Submit Support Request"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ borderTop:"4px solid #4caf50", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <h3>Ticket Submitted!</h3>
          <p style={{ color:"#666", marginTop:8 }}>
            Ticket ID: <strong>{ticketId}</strong>
          </p>
          <p style={{ color:"#888", fontSize:14, marginTop:8 }}>
            We'll respond within 24 hours via WhatsApp and email.
          </p>
          <button className="btn btn-green"
            style={{ marginTop:14 }}
            onClick={() => setSent(false)}>
            Submit Another Request
          </button>
        </div>
      )}

      {/* Ticket History */}
      {tickets.length > 0 && (
        <div className="card">
          <h3>📋 My Support Tickets</h3>
          {tickets.slice().reverse().map((t, i) => (
            <div key={i} style={{
              padding:14, marginBottom:10,
              border:"1px solid #e0e0e0",
              borderRadius:10, background:"#fafafa"
            }}>
              <div style={{ display:"flex",
                justifyContent:"space-between", marginBottom:6 }}>
                <strong>#{t.id}</strong>
                <span style={{
                  color: statusColor(t.status),
                  fontWeight:700, fontSize:12
                }}>
                  ● {t.status?.toUpperCase()}
                </span>
              </div>
              <div style={{ fontWeight:600, marginBottom:4 }}>{t.subject}</div>
              <div style={{ fontSize:13, color:"#666",
                marginBottom:6 }}>{t.message?.slice(0,120)}...</div>
              <div style={{ fontSize:11, color:"#aaa" }}>
                {t.created?.slice(0,16).replace("T"," ")}
              </div>

              {/* Replies */}
              {t.replies?.length > 0 && (
                <div style={{ marginTop:10, paddingTop:10,
                  borderTop:"1px solid #e0e0e0" }}>
                  <strong style={{ fontSize:12 }}>💬 Replies:</strong>
                  {t.replies.map((r, j) => (
                    <div key={j} style={{
                      background: r.from==="admin" ? "#e8f5e9" : "#e3f2fd",
                      padding:"8px 12px", borderRadius:8,
                      marginTop:6, fontSize:13
                    }}>
                      <strong>{r.from==="admin" ? "🛠️ Support Team" : "👤 You"}:</strong>
                      <p style={{ marginTop:4 }}>{r.message}</p>
                      <span style={{ fontSize:11, color:"#aaa" }}>
                        {r.timestamp?.slice(0,16).replace("T"," ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}