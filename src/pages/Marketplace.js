import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

export default function Marketplace({ user }) {
  const [sellers, setSellers] = useState([]);
  const [buyers,  setBuyers]  = useState([]);
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState("sellers");
  const [form,    setForm]    = useState({ type:"sell", item:"", location:"", price:"", phone:user.phone||"", quantity:"", budget:"" });
  const [posting, setPosting] = useState(false);
  const [showForm,setShowForm]= useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/api/marketplace`, {
        params: { search }
      });
      setSellers(res.data.sellers || []);
      setBuyers(res.data.buyers  || []);
    } catch {}
  };

  const post = async () => {
    if (!form.item || !form.location || !form.phone) {
      alert("Please fill: item, location, phone"); return;
    }
    setPosting(true);
    try {
      const endpoint = form.type === "sell" ? "/api/marketplace/sell" : "/api/marketplace/buy";
      await axios.post(`${config.API_URL}${endpoint}`, {
        ...form, platform: "web"
      });
      alert("✅ Posted successfully!");
      setShowForm(false);
      setForm({ type:"sell", item:"", location:"", price:"", phone:user.phone||"", quantity:"", budget:"" });
      load();
    } catch { alert("Failed to post. Please try again."); }
    setPosting(false);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ color:"#2e7d32" }}>🛒 Marketplace</h2>
        <button className="btn btn-green" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Post Listing"}
        </button>
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="card" style={{ borderTop:"4px solid #2e7d32" }}>
          <h3>📢 New Listing</h3>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {["sell","buy"].map(t => (
              <button key={t} className={`btn ${form.type===t?"btn-green":"btn-outline"}`}
                onClick={() => setForm({...form, type:t})}>
                {t === "sell" ? "I Want to SELL" : "I Want to BUY"}
              </button>
            ))}
          </div>
          <input className="input" placeholder={form.type==="sell" ? "What are you selling? (e.g. 50 x 50kg maize)" : "What do you want to buy?"}
            value={form.item} onChange={e => setForm({...form,item:e.target.value})} />
          {form.type === "sell" ? (
            <input className="input" placeholder="Price (e.g. $50/bag)"
              value={form.price} onChange={e => setForm({...form,price:e.target.value})} />
          ) : (
            <input className="input" placeholder="Your budget (e.g. $45/bag)"
              value={form.budget} onChange={e => setForm({...form,budget:e.target.value})} />
          )}
          <input className="input" placeholder="Your location (e.g. Marondera)"
            value={form.location} onChange={e => setForm({...form,location:e.target.value})} />
          <input className="input" placeholder="Contact phone number"
            value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
          <button className="btn btn-green" onClick={post} disabled={posting}>
            {posting ? "Posting..." : "✅ Post Listing"}
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input className="input" style={{ marginBottom:0, flex:1 }}
          placeholder="Search listings..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-green" onClick={load}>Search</button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["sellers","buyers"].map(t => (
          <button key={t} className={`btn ${tab===t?"btn-green":"btn-outline"}`}
            onClick={() => setTab(t)}>
            {t==="sellers" ? `🏪 Sellers (${sellers.length})` : `🤝 Buyers (${buyers.length})`}
          </button>
        ))}
      </div>

      {/* Listings */}
      {(tab==="sellers" ? sellers : buyers).length === 0 ? (
        <div className="card" style={{ textAlign:"center", color:"#888", padding:30 }}>
          No {tab} yet. Be the first to post!
        </div>
      ) : (
        (tab==="sellers" ? sellers : buyers).slice(-20).reverse().map((item, i) => (
          <div className="card" key={i} style={{ borderLeft:"4px solid #4caf50" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <strong style={{ fontSize:15 }}>
                  {tab==="sellers" ? "📦" : "🤝 WANTED:"} {item.item}
                </strong>
                {item.category && <span style={{ marginLeft:8, fontSize:12, color:"#888" }}>{item.category}</span>}
              </div>
              <div style={{ fontSize:13, color:"#888" }}>
                {item.timestamp?.slice(0,10)}
              </div>
            </div>
            <div style={{ fontSize:14, color:"#555", marginTop:8 }}>
              📍 {item.location}
              {tab==="sellers"
                ? <span> | 💰 {item.price}</span>
                : <span> | 💰 Budget: {item.budget||"Negotiable"} | Qty: {item.quantity||"Flexible"}</span>
              }
            </div>
            <div style={{ marginTop:8 }}>
              <a href={`tel:${item.phone}`} className="btn btn-green"
                style={{ fontSize:13, padding:"6px 14px", textDecoration:"none" }}>
                📞 {item.phone}
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}