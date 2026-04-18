import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const TYPE_COLORS = {
  update:  { bg:"#e3f2fd", border:"#1976d2", icon:"🔔" },
  fix:     { bg:"#e8f5e9", border:"#4caf50", icon:"🔧" },
  warning: { bg:"#fff8e1", border:"#f9a825", icon:"⚠️" },
  promo:   { bg:"#fce4ec", border:"#e91e63", icon:"🎁" },
  news:    { bg:"#f3e5f5", border:"#9c27b0", icon:"📰" },
};

export default function Notifications({ user }) {
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/api/notifications?phone=${user.phone}`
      );
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await axios.post(`${config.API_URL}/api/notifications/read`, {
        phone: user.phone, notification_id: id
      });
      setNotifs(prev =>
        prev.map(n => n.id===id ? {...n, read:true} : n)
      );
      setUnread(prev => Math.max(0, prev-1));
    } catch {}
  };

  return (
    <div>
      <div style={{ display:"flex",
        justifyContent:"space-between",
        alignItems:"center", marginBottom:14 }}>
        <h2 style={{ color:"#2e7d32" }}>
          🔔 Notifications
          {unread > 0 && (
            <span style={{
              marginLeft:8, background:"#e91e63",
              color:"white", padding:"2px 8px",
              borderRadius:12, fontSize:13
            }}>{unread}</span>
          )}
        </h2>
        <button className="btn btn-outline" onClick={loadNotifs}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:40 }}>
          Loading notifications...
        </div>
      ) : notifs.length === 0 ? (
        <div className="card" style={{ textAlign:"center",
          padding:40, color:"#888" }}>
          <div style={{ fontSize:48 }}>🔔</div>
          <p style={{ marginTop:12 }}>No notifications yet.</p>
          <p style={{ fontSize:13 }}>
            Updates, fixes and announcements will appear here.
          </p>
        </div>
      ) : (
        notifs.map((n, i) => {
          const style = TYPE_COLORS[n.type] || TYPE_COLORS.update;
          return (
            <div key={i}
              onClick={() => !n.read && markRead(n.id)}
              style={{
                padding:16, marginBottom:10, borderRadius:10,
                background: n.read ? "#fafafa" : style.bg,
                border:`2px solid ${n.read ? "#e0e0e0" : style.border}`,
                cursor: n.read ? "default" : "pointer",
                opacity: n.read ? 0.8 : 1,
                transition:"all 0.2s"
              }}>
              <div style={{ display:"flex",
                justifyContent:"space-between",
                alignItems:"start", marginBottom:8 }}>
                <div style={{ display:"flex",
                  alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>{style.icon}</span>
                  <strong style={{ fontSize:15 }}>{n.title}</strong>
                  {!n.read && (
                    <span style={{
                      background:"#e91e63", color:"white",
                      padding:"1px 6px", borderRadius:10,
                      fontSize:10, fontWeight:700
                    }}>NEW</span>
                  )}
                </div>
                <span style={{ fontSize:11, color:"#aaa" }}>
                  {n.created?.slice(0,16).replace("T"," ")}
                </span>
              </div>
              <p style={{ fontSize:14, color:"#444",
                lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                {n.message}
              </p>
              {!n.read && (
                <p style={{ fontSize:11, color:"#aaa",
                  marginTop:6 }}>
                  Click to mark as read
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}