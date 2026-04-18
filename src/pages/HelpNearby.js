import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const LOCATIONS = ["Harare","Bulawayo","Mutare","Masvingo","Gweru","Marondera","Chinhoyi","Bindura"];

export default function HelpNearby({ user }) {
  const [location, setLocation] = useState(
    user?.profile?.location || "harare"
  );
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(location); }, []);

  const load = async (loc) => {
    setLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question: `List all agricultural help centers, Agritex offices, GMB depots, agro-dealers, seed suppliers, and farm finance offices near ${loc} Zimbabwe. Include names, addresses, phone numbers and opening hours.`,
        phone: user.phone,
        topic: "agricultural support centers Zimbabwe location directory"
      });
      setResult(res.data.answer);
    } catch { setResult("Could not load. Please try again."); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>📍 Find Agricultural Help Near You</h2>

      <div className="card">
        <h3>Select Your Location</h3>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {LOCATIONS.map(l => (
            <button key={l}
              onClick={() => { setLocation(l.toLowerCase()); load(l); }}
              style={{
                padding:"7px 14px", borderRadius:16, border:"none",
                cursor:"pointer", fontWeight:600, fontSize:13,
                background: location===l.toLowerCase() ? "#2e7d32" : "#e8f5e9",
                color: location===l.toLowerCase() ? "white" : "#2e7d32"
              }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:40 }}>
          Finding help near you...
        </div>
      ) : result ? (
        <>
          <div className="card" style={{ borderTop:"4px solid #ff9800" }}>
            <h3>📍 Agricultural Support — {location.charAt(0).toUpperCase()+location.slice(1)}</h3>
            <div style={{ whiteSpace:"pre-wrap", lineHeight:1.9, fontSize:14 }}>
              {result}
            </div>
          </div>

          <div className="card">
            <h3>📞 National Contacts Always Available</h3>
            <div className="grid2" style={{ fontSize:14 }}>
              <div>🏛️ Agritex Helpline: <strong>0800 4040</strong> (free)</div>
              <div>🌾 GMB National: <strong>04-621000</strong></div>
              <div>🏦 Agribank: <strong>04-700476</strong></div>
              <div>🌱 FAO Zimbabwe: <strong>04-776591</strong></div>
              <div>🧪 ZFC Seeds: <strong>04-700751</strong></div>
              <div>📞 {config.COMPANY}: <strong>{config.SUPPORT_PHONE}</strong></div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}