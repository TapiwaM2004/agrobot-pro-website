import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const SECTIONS = [
  { title:"🌾 Grains & Oilseeds", keys:["maize","wheat","soya","sorghum","sunflower","groundnuts"] },
  { title:"🌿 Cash Crops",        keys:["tobacco","cotton","sugar_beans"] },
  { title:"🥬 Horticulture",      keys:["tomatoes","onions","potatoes"] },
  { title:"🐄 Livestock",         keys:["cattle","goats","chickens"] },
];

export default function Prices({ user }) {
  const [prices, setPrices]   = useState({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/api/market-prices`);
      setPrices(res.data.prices || {});
      setUpdated(res.data.last_updated?.slice(0,16).replace("T"," ") || "");
    } catch {}
    setLoading(false);
  };

  const trend = (t) => {
    if (t === "rising")  return <span className="price-up">📈 Rising</span>;
    if (t === "falling") return <span className="price-down">📉 Falling</span>;
    return <span className="price-flat">➡️ Stable</span>;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ color:"#2e7d32" }}>💰 Live Market Prices</h2>
        <button className="btn btn-green" onClick={load}>🔄 Refresh</button>
      </div>

      {updated && (
        <p style={{ color:"#888", fontSize:13, marginBottom:14 }}>
          📡 Updated: {updated} | Refreshes every 6 hours
        </p>
      )}

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:40, color:"#888" }}>
          Loading live prices...
        </div>
      ) : (
        SECTIONS.map(s => (
          <div className="card" key={s.title}>
            <h3>{s.title}</h3>
            <div className="grid3">
              {s.keys.map(k => {
                const p = prices[k];
                if (!p) return null;
                return (
                  <div key={k} style={{
                    padding:12, background:"#f9f9f9",
                    borderRadius:8, border:"1px solid #eee"
                  }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
                      {k.replace("_"," ").toUpperCase()}
                    </div>
                    <div style={{ fontSize:22, fontWeight:"bold", color:"#2e7d32" }}>
                      ${p.local_price || p.price}
                      <span style={{ fontSize:12, color:"#888", fontWeight:400 }}>/{p.unit}</span>
                    </div>
                    <div style={{ fontSize:12, marginTop:4 }}>{trend(p.trend)}</div>
                    {p.gmb && (
                      <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>GMB: ${p.gmb}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="card">
        <h3>📞 Key Market Contacts</h3>
        <div className="grid2" style={{ fontSize:14 }}>
          <div>🌾 GMB: 04-621000</div>
          <div>🍂 Tobacco Floor: 04-791623</div>
          <div>🧪 ZFC: 04-700751</div>
          <div>🌿 Cotton Co: 039-262811</div>
        </div>
      </div>
    </div>
  );
}