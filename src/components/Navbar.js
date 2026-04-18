import React, { useState } from "react";

export default function Navbar({ page, setPage, user, onLogout }) {
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [moreOpen,    setMoreOpen]    = useState(false);

  const freeLinks = [
    { id:"dashboard",     label:"🏠 Home" },
    { id:"disease",       label:"🌿 Disease" },
    { id:"soil",          label:"🧪 Soil" },
    { id:"marketplace",   label:"🛒 Market" },
    { id:"news",          label:"📰 News" },
    { id:"community",     label:"👥 Community" },
  ];

  const premiumLinks = [
    { id:"weather",   label:"🌤️ Weather" },
    { id:"photo",     label:"📸 Photo AI" },
    { id:"prices",    label:"💰 Prices" },
    { id:"seeds",     label:"🌱 Seeds" },
    { id:"help",      label:"📍 Help" },
    { id:"loans",     label:"🏦 Finance" },
    { id:"farmplan",  label:"📅 Farm Plan" },
  ];

  const moreLinks = [
    { id:"support",       label:"🎫 Support" },
    { id:"notifications", label:"🔔 Alerts" },
    { id:"profile",       label:"👤 Profile" },
    { id:"payment",       label:"💳 Subscribe" },
  ];

  const plan = user?.plan || "free";

  const btnStyle = (id) => ({
    background: page===id ? "#f9a825" : "transparent",
    color:      page===id ? "#1b5e20" : "white",
    border:"none", padding:"5px 9px", borderRadius:6,
    cursor:"pointer", fontWeight:600, fontSize:12,
    whiteSpace:"nowrap"
  });

  const DropMenu = ({ links, label, isOpen, setOpen, highlight }) => (
    <div style={{ position:"relative" }}>
      <button
        onClick={() => { setOpen(!isOpen); }}
        style={{
          background: (isOpen || highlight) ? "#f9a825" : "#2e7d32",
          color:      (isOpen || highlight) ? "#1b5e20" : "white",
          border:"none", padding:"5px 9px", borderRadius:6,
          cursor:"pointer", fontWeight:600, fontSize:12
        }}>
        {label} ▾
      </button>
      {isOpen && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position:"fixed", top:0, left:0,
              right:0, bottom:0, zIndex:150
            }}
          />
          <div style={{
            position:"absolute", top:"110%", left:0,
            background:"white", borderRadius:8, padding:6,
            boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
            minWidth:165, zIndex:200
          }}>
            {links.map(l => (
              <div key={l.id}
                onClick={() => { setPage(l.id); setOpen(false); }}
                style={{
                  padding:"8px 12px", cursor:"pointer",
                  borderRadius:6, fontSize:13,
                  background: page===l.id ? "#e8f5e9" : "transparent",
                  color:"#1b5e20", fontWeight:600
                }}
                onMouseEnter={e => e.currentTarget.style.background="#e8f5e9"}
                onMouseLeave={e => e.currentTarget.style.background=page===l.id?"#e8f5e9":"transparent"}
              >
                {l.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <nav style={{
      background:"#1b5e20", color:"white",
      padding:"10px 16px", position:"sticky",
      top:0, zIndex:100,
      boxShadow:"0 2px 8px rgba(0,0,0,0.3)"
    }}>
      <div style={{
        display:"flex", justifyContent:"space-between",
        alignItems:"center", gap:8
      }}>
        {/* Brand */}
        <div style={{
          fontWeight:"bold", fontSize:16,
          color:"#f9a825", whiteSpace:"nowrap"
        }}>
          🌱 AgroBot Pro
        </div>

        {/* Links */}
        <div style={{
          display:"flex", gap:3, alignItems:"center",
          flexWrap:"wrap", flex:1, justifyContent:"center"
        }}>
          {freeLinks.map(l => (
            <button key={l.id}
              onClick={() => setPage(l.id)}
              style={btnStyle(l.id)}>
              {l.label}
            </button>
          ))}

          <DropMenu
            links={premiumLinks}
            label="💎 Premium"
            isOpen={premiumOpen}
            setOpen={setPremiumOpen}
            highlight={premiumLinks.some(l=>l.id===page)}
          />

          <DropMenu
            links={moreLinks}
            label="⚙️ More"
            isOpen={moreOpen}
            setOpen={setMoreOpen}
            highlight={moreLinks.some(l=>l.id===page)}
          />

          {/* Admin */}
          <button
            onClick={() => setPage("admin")}
            style={{
              background: page==="admin" ? "#f9a825" : "#c62828",
              color:      page==="admin" ? "#1b5e20" : "white",
              border:"none", padding:"5px 9px", borderRadius:6,
              cursor:"pointer", fontWeight:700, fontSize:12
            }}>
            🔐 Admin
          </button>

          {/* Logout */}
          <button onClick={onLogout} style={{
            background:"transparent",
            border:"1px solid rgba(255,255,255,0.4)",
            color:"white", padding:"5px 9px",
            borderRadius:6, cursor:"pointer", fontSize:12
          }}>
            Exit
          </button>
        </div>
      </div>

      {/* Plan Badge */}
      <div style={{ textAlign:"center", marginTop:3 }}>
        <span style={{
          fontSize:10, padding:"2px 10px",
          borderRadius:10, fontWeight:700,
          background:
            plan==="premium" || plan==="business" ? "#4caf50" :
            plan==="trial"   ? "#ff9800" : "#757575",
          color:"white"
        }}>
          {plan==="premium"  ? "⭐ PREMIUM"     :
           plan==="business" ? "🏆 BUSINESS"    :
           plan==="trial"    ? "🎁 FREE TRIAL"  : "🆓 FREE PLAN"}
        </span>
      </div>
    </nav>
  );
}