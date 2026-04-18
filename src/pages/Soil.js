import React, { useState } from "react";
import axios from "axios";
import config from "../config";

export default function Soil({ user }) {
  const [form, setForm] = useState({
    color:"", texture:"", drainage:"",
    prev_crop:"", next_crop:"", size:"", problems:""
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    if (!form.next_crop) { alert("Please fill in what crop you want to grow"); return; }
    setLoading(true);
    try {
      const question = `Soil health analysis request:
Soil Color: ${form.color || "Not specified"}
Texture: ${form.texture || "Not specified"}
Drainage: ${form.drainage || "Not specified"}
Previous Crop: ${form.prev_crop || "Not specified"}
Next Crop: ${form.next_crop}
Field Size: ${form.size || "Not specified"}
Problems Noticed: ${form.problems || "None mentioned"}

Please provide: estimated pH range, ZFC fertilizer recommendations with kg/ha rates, lime requirements, best crops, and seasonal amendment schedule with costs in USD.`;

      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question, phone: user.phone,
        topic: "soil health analysis fertilizer Zimbabwe ZFC recommendations"
      });
      setResult(res.data.answer);
    } catch { alert("Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>🧪 Soil Health & Fertilizer Analysis</h2>

      {!result ? (
        <div className="card">
          <h3>Tell Us About Your Soil</h3>

          <div className="grid2">
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Soil Color</label>
              <select className="input" value={form.color}
                onChange={e => setForm({...form,color:e.target.value})}>
                <option value="">Select color...</option>
                <option>Dark brown/Black (fertile)</option>
                <option>Red (iron-rich)</option>
                <option>Pale/Light brown</option>
                <option>Grey (waterlogged)</option>
                <option>Yellow</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Soil Texture</label>
              <select className="input" value={form.texture}
                onChange={e => setForm({...form,texture:e.target.value})}>
                <option value="">Select texture...</option>
                <option>Sandy (falls apart)</option>
                <option>Clay (heavy, sticky)</option>
                <option>Loam (crumbly, ideal)</option>
                <option>Silty</option>
                <option>Mixed/Unknown</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Drainage</label>
              <select className="input" value={form.drainage}
                onChange={e => setForm({...form,drainage:e.target.value})}>
                <option value="">Select drainage...</option>
                <option>Very good (dries fast)</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor (stays wet)</option>
                <option>Waterlogged</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Field Size</label>
              <input className="input" placeholder="e.g. 2 acres or 0.5 ha"
                value={form.size}
                onChange={e => setForm({...form,size:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Previous Crop Grown</label>
              <input className="input" placeholder="e.g. Maize, Tobacco, Fallow"
                value={form.prev_crop}
                onChange={e => setForm({...form,prev_crop:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Crop You Want to Grow *</label>
              <input className="input" placeholder="e.g. Maize, Tobacco, Soya..."
                value={form.next_crop}
                onChange={e => setForm({...form,next_crop:e.target.value})} />
            </div>
          </div>

          <label style={{ fontSize:13, color:"#666" }}>Problems Noticed</label>
          <textarea className="input" rows={3}
            placeholder="e.g. Stunted growth, yellowing, poor yields last season, soil crusting..."
            value={form.problems}
            onChange={e => setForm({...form,problems:e.target.value})}
            style={{ resize:"vertical" }}
          />

          <button className="btn btn-green" onClick={analyse}
            disabled={loading} style={{ width:"100%" }}>
            {loading ? "🔬 Analysing Soil..." : "🔬 Get Soil Analysis & Fertilizer Plan"}
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ borderTop:"4px solid #f9a825" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <h3>🧪 Your Soil Analysis Report</h3>
              <button className="btn btn-outline"
                onClick={() => setResult("")}>🔄 New Analysis</button>
            </div>
            <div style={{ background:"#fffde7", padding:14, borderRadius:8, lineHeight:1.8, whiteSpace:"pre-wrap", fontSize:14 }}>
              {result}
            </div>
          </div>

          <div className="card">
            <h3>🛒 Buy Fertilizer & Soil Amendments</h3>
            <div className="grid2" style={{ fontSize:14 }}>
              <div>🧪 ZFC Fertilizers: <strong>04-700751</strong></div>
              <div>🌱 Windmill Agro: <strong>04-309411</strong></div>
              <div>🔬 Soil Testing Lab (Marondera): <strong>079-22234</strong></div>
              <div>📞 Agritex Soils: <strong>04-700181</strong></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}