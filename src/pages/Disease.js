import React, { useState } from "react";
import axios from "axios";
import config from "../config";

export default function Disease({ user }) {
  const [crop, setCrop]         = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [affected, setAffected] = useState("");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);

  const CROPS = ["Maize","Tobacco","Soya","Wheat","Cotton",
                 "Tomatoes","Onions","Potatoes","Groundnuts","Sorghum"];

  const analyse = async () => {
    if (!crop || !symptoms) {
      alert("Please select a crop and describe symptoms");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question: `Crop: ${crop}. Symptoms: ${symptoms}. Affected: ${affected}. 
Diagnose and provide Zimbabwe treatment with product brands and rates.`,
        phone: user.phone,
        topic: "crop disease diagnosis Zimbabwe treatment"
      });
      setResult(res.data.answer);
    } catch { alert("Error. Try again."); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>
        🌿 Crop Disease & Pest Advisor
      </h2>

      {!result ? (
        <>
          <div className="card">
            <h3>Select Crop</h3>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {CROPS.map(c => (
                <button key={c} onClick={() => setCrop(c)}
                  style={{
                    padding:"7px 14px", borderRadius:20, border:"none",
                    cursor:"pointer", fontWeight:600, fontSize:13,
                    background: crop===c ? "#2e7d32" : "#e8f5e9",
                    color: crop===c ? "white" : "#2e7d32"
                  }}>{c}</button>
              ))}
            </div>
            <input className="input" style={{ marginTop:12 }}
              placeholder="Or type crop name..."
              value={crop} onChange={e => setCrop(e.target.value)} />
          </div>

          <div className="card">
            <h3>Describe the Problem</h3>
            <textarea className="input" rows={4}
              placeholder="What do you see? e.g. Yellow leaves, brown spots, wilting, holes in leaves, white powder..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              style={{ resize:"vertical" }}
            />
            <select className="input" value={affected}
              onChange={e => setAffected(e.target.value)}>
              <option value="">How much is affected?</option>
              <option>A few plants (under 5%)</option>
              <option>Small patch (5-10%)</option>
              <option>Spreading (10-30%)</option>
              <option>Large area (30-60%)</option>
              <option>Most of crop (over 60%)</option>
            </select>
            <button className="btn btn-green"
              onClick={analyse} disabled={loading}
              style={{ width:"100%" }}>
              {loading ? "🔍 Analysing..." : "🔍 Get Diagnosis & Treatment"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="card" style={{ borderTop:"4px solid #4caf50" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <h3>🌿 Diagnosis: {crop}</h3>
              <button className="btn btn-outline"
                onClick={() => { setResult(""); setCrop(""); setSymptoms(""); }}>
                🔄 New Analysis
              </button>
            </div>
            <div style={{ background:"#f1f8e9", padding:14, borderRadius:8,
              lineHeight:1.8, whiteSpace:"pre-wrap", fontSize:14 }}>
              {result}
            </div>
          </div>

          <div className="card">
            <h3>🛒 Buy Treatment Products</h3>
            <div className="grid2" style={{ fontSize:14 }}>
              <div>🌿 Agricura: <strong>04-621567</strong></div>
              <div>🧪 ZFC Chemicals: <strong>04-700751</strong></div>
              <div>🛒 Windmill Agro: <strong>04-309411</strong></div>
              <div>📞 Agritex: <strong>0800 4040</strong> (free)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}