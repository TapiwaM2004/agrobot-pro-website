import React, { useState } from "react";
import axios from "axios";
import config from "../config";

export default function FarmPlan({ user }) {
  const [form, setForm] = useState({
    farmSize:"", crops:"", irrigation:"no", budget:"", location:""
  });
  const [plan, setPlan]     = useState("");
  const [loading, setLoading] = useState(false);

  const getPlan = async () => {
    if (!form.farmSize || !form.crops) {
      alert("Please fill farm size and crops"); return;
    }
    setLoading(true);
    try {
      const question = `Create a professional farm planning calendar for Zimbabwe farmer:
Farm Size: ${form.farmSize}
Crops to Grow: ${form.crops}
Irrigation Available: ${form.irrigation}
Budget Range: ${form.budget || "Not specified"}
Location: ${form.location || "Zimbabwe"}

Please provide:
1. Monthly activity calendar (Sep-Aug full season)
2. Land preparation timing and method
3. Planting dates and seed rates (kg/ha)
4. Fertilizer program (basal + top dressing with dates)
5. Pest and disease monitoring schedule
6. Irrigation schedule if applicable
7. Harvest timing and post-harvest handling
8. Estimated budget breakdown per acre in USD
9. Expected yield and revenue estimate`;

      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question, phone: user.phone,
        topic: "Zimbabwe farm planning calendar seasonal schedule agronomy"
      });
      setPlan(res.data.answer);
    } catch { alert("Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>📅 Farm Planning Calendar</h2>

      {!plan ? (
        <div className="card">
          <h3>Your Farm Details</h3>

          <div className="grid2">
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Farm Size *</label>
              <input className="input" placeholder="e.g. 3 acres or 1.5 ha"
                value={form.farmSize}
                onChange={e => setForm({...form,farmSize:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Crops to Grow *</label>
              <input className="input" placeholder="e.g. Maize and Tobacco"
                value={form.crops}
                onChange={e => setForm({...form,crops:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Do You Have Irrigation?</label>
              <select className="input" value={form.irrigation}
                onChange={e => setForm({...form,irrigation:e.target.value})}>
                <option value="no">No — rain-fed only</option>
                <option value="drip">Yes — drip irrigation</option>
                <option value="furrow">Yes — furrow/flood</option>
                <option value="sprinkler">Yes — sprinkler</option>
                <option value="partial">Partial irrigation</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Budget Range</label>
              <input className="input" placeholder="e.g. $500 or $2,000 per season"
                value={form.budget}
                onChange={e => setForm({...form,budget:e.target.value})} />
            </div>
          </div>

          <label style={{ fontSize:13, color:"#666" }}>Location / District</label>
          <input className="input" placeholder="e.g. Marondera, Mashonaland East"
            value={form.location}
            onChange={e => setForm({...form,location:e.target.value})} />

          <button className="btn btn-green" onClick={getPlan}
            disabled={loading} style={{ width:"100%" }}>
            {loading ? "Creating your plan..." : "📅 Generate My Farm Plan"}
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ borderTop:"4px solid #8bc34a" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <h3>📅 Your Professional Farm Plan</h3>
              <button className="btn btn-outline"
                onClick={() => setPlan("")}>🔄 New Plan</button>
            </div>
            <div style={{ background:"#f1f8e9", padding:14, borderRadius:8, lineHeight:1.9, whiteSpace:"pre-wrap", fontSize:14 }}>
              {plan}
            </div>
          </div>

          <div className="card">
            <h3>📞 Get Expert Help</h3>
            <div className="grid2" style={{ fontSize:14 }}>
              <div>🏛️ Agritex Extension: <strong>0800 4040</strong></div>
              <div>🌾 GMB Planning: <strong>04-621000</strong></div>
              <div>🌱 Seedco Advisory: <strong>04-575111</strong></div>
              <div>📞 {config.COMPANY}: <strong>{config.SUPPORT_PHONE}</strong></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}