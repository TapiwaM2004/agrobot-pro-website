import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const CROPS = ["maize","tobacco","soya","wheat","cotton","sorghum","groundnuts"];

export default function Seeds({ user }) {
  const [crop, setCrop]     = useState("maize");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(crop); }, [crop]);

  const load = async (c) => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/api/seeds`, {
        params: { location: user?.profile?.location || "harare", crop: c }
      });
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  const seeds = data?.seed_recommendations?.[crop] || [];

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>🌱 Seed Recommendations</h2>

      {data && (
        <div className="card" style={{ marginBottom:14 }}>
          <h3>📍 Your Region — {data.climate}</h3>
          <p style={{ color:"#666", fontSize:14 }}>Best crops: {data.best_crops}</p>
        </div>
      )}

      {/* Crop Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {CROPS.map(c => (
          <button
            key={c}
            onClick={() => setCrop(c)}
            style={{
              padding:"7px 14px", borderRadius:20, border:"none",
              cursor:"pointer", fontWeight:600, fontSize:13,
              background: crop===c ? "#2e7d32" : "#e8f5e9",
              color:       crop===c ? "white"   : "#2e7d32"
            }}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:30, color:"#888" }}>
          Loading seed data...
        </div>
      ) : seeds.length === 0 ? (
        <div className="card" style={{ color:"#888", textAlign:"center", padding:30 }}>
          No seed data for {crop} in your region.
        </div>
      ) : (
        seeds.map((s, i) => (
          <div className="card" key={i}
            style={{ borderLeft:`4px solid ${i===0?"#f9a825":"#4caf50"}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start" }}>
              <div>
                <h3 style={{ marginBottom:4 }}>
                  {["🥇","🥈","🥉","📌"][i] || "📌"} {s.brand} — {s.variety}
                </h3>
                <p style={{ color:"#666", fontSize:14 }}>{s.traits}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                <div style={{ fontWeight:"bold", color:"#2e7d32", fontSize:20 }}>
                  ~${s.price_per_kg}<span style={{ fontSize:12, color:"#888" }}>/kg</span>
                </div>
                <div style={{ fontSize:11, color:"#aaa" }}>seed price</div>
              </div>
            </div>
            <div className="grid2" style={{ marginTop:10, fontSize:13 }}>
              <div>📊 Yield: <strong>{s.yield}</strong></div>
              <div>📅 Days: <strong>{s.days}</strong></div>
            </div>
          </div>
        ))
      )}

      {/* Suppliers */}
      {data?.suppliers?.length > 0 && (
        <div className="card">
          <h3>📍 Buy Seeds Near You</h3>
          {data.suppliers.slice(0,4).map((s, i) => (
            <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid #f0f0f0" }}>
              <strong>{s[0]}</strong><br/>
              <span style={{ fontSize:13, color:"#666" }}>📌 {s[1]} | 📞 {s[2]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}