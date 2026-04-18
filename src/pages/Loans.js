import React, { useState } from "react";
import axios from "axios";
import config from "../config";

export default function Loans({ user }) {
  const [form, setForm] = useState({
    farmSize:"", mainCrops:"", need:"both",
    turnover:"", borrowed:"no", province:""
  });
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    if (!form.farmSize || !form.mainCrops) {
      alert("Please fill farm size and main crops"); return;
    }
    setLoading(true);
    try {
      const question = `Agricultural finance request for Zimbabwe farmer:
Farm Size: ${form.farmSize}
Main Crops: ${form.mainCrops}
Need: ${form.need}
Annual Turnover: ${form.turnover || "Not specified"}
Previous loans: ${form.borrowed}
Province: ${form.province || "Not specified"}

Please advise on:
1. Best loan products from Agribank, CBZ Agri, ZB Bank, AFC
2. Current interest rates and repayment terms
3. Crop insurance options (Old Mutual, Zimnat, Cell Insurance)
4. Required documents for application
5. Government subsidies currently available
6. NGO funding programs
7. Step by step application process`;

      const res = await axios.post(`${config.API_URL}/api/ask`, {
        question, phone: user.phone,
        topic: "agricultural finance loans insurance Zimbabwe Agribank CBZ"
      });
      setResult(res.data.answer);
    } catch { alert("Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>🏦 Loan & Insurance Advisory</h2>

      {!result ? (
        <div className="card">
          <h3>Tell Us About Your Farm</h3>

          <div className="grid2">
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Farm Size *</label>
              <input className="input" placeholder="e.g. 5 acres or 2 hectares"
                value={form.farmSize}
                onChange={e => setForm({...form,farmSize:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Main Crops *</label>
              <input className="input" placeholder="e.g. Maize, Tobacco, Soya"
                value={form.mainCrops}
                onChange={e => setForm({...form,mainCrops:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>What Do You Need?</label>
              <select className="input" value={form.need}
                onChange={e => setForm({...form,need:e.target.value})}>
                <option value="loan">Loan only</option>
                <option value="insurance">Insurance only</option>
                <option value="both">Both loan and insurance</option>
                <option value="subsidy">Government subsidy/grant</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Annual Turnover (approx)</label>
              <input className="input" placeholder="e.g. $5,000 per year"
                value={form.turnover}
                onChange={e => setForm({...form,turnover:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Have You Borrowed Before?</label>
              <select className="input" value={form.borrowed}
                onChange={e => setForm({...form,borrowed:e.target.value})}>
                <option value="no">No — first time</option>
                <option value="yes_good">Yes — good repayment</option>
                <option value="yes_issues">Yes — had some issues</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, color:"#666" }}>Province</label>
              <input className="input" placeholder="e.g. Mashonaland East"
                value={form.province}
                onChange={e => setForm({...form,province:e.target.value})} />
            </div>
          </div>

          <button className="btn btn-green" onClick={getAdvice}
            disabled={loading} style={{ width:"100%" }}>
            {loading ? "Getting advice..." : "🏦 Get Finance Advisory"}
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ borderTop:"4px solid #3f51b5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <h3>🏦 Your Finance Advisory</h3>
              <button className="btn btn-outline"
                onClick={() => setResult("")}>🔄 New Query</button>
            </div>
            <div style={{ background:"#e8eaf6", padding:14, borderRadius:8, lineHeight:1.8, whiteSpace:"pre-wrap", fontSize:14 }}>
              {result}
            </div>
          </div>

          <div className="card">
            <h3>📞 Direct Finance Contacts</h3>
            <div className="grid2" style={{ fontSize:14 }}>
              <div>🏦 Agribank: <strong>04-700476</strong></div>
              <div>🏦 CBZ Agri: <strong>04-250579</strong></div>
              <div>🏦 AFC Zimbabwe: <strong>04-700592</strong></div>
              <div>🏦 ZB Bank Agri: <strong>04-758081</strong></div>
              <div>🛡️ Old Mutual Agri: <strong>04-308000</strong></div>
              <div>🛡️ Zimnat Insurance: <strong>04-252361</strong></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}