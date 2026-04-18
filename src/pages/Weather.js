import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const REGIONS = [
  { name:"Harare",        lat:-17.8252, lon:31.0335 },
  { name:"Bulawayo",      lat:-20.1325, lon:28.6264 },
  { name:"Mutare",        lat:-18.9707, lon:32.6709 },
  { name:"Masvingo",      lat:-20.0635, lon:30.8335 },
  { name:"Gweru",         lat:-19.4500, lon:29.8167 },
  { name:"Marondera",     lat:-18.1833, lon:31.5500 },
  { name:"Chinhoyi",      lat:-17.3667, lon:30.2000 },
  { name:"Bindura",       lat:-17.3000, lon:31.3333 },
  { name:"Nyanga",        lat:-18.2167, lon:32.7500 },
  { name:"Chipinge",      lat:-20.1833, lon:32.6167 },
];

export default function Weather({ user }) {
  const [weather, setWeather]   = useState(null);
  const [advice, setAdvice]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(REGIONS[0]);
  const [useGPS, setUseGPS]     = useState(false);

  useEffect(() => { loadWeather(selected.lat, selected.lon, selected.name); }, []);

  const loadWeather = async (lat, lon, name) => {
    setLoading(true);
    setAdvice("");
    try {
      const res = await axios.get(`${config.API_URL}/api/weather/${lat}/${lon}`);
      setWeather({ ...res.data, name });

      // Get AI farming advice
      const f = res.data.forecast;
      if (f) {
        const totalRain = f.precipitation_sum?.reduce((a,b)=>a+b,0).toFixed(0);
        const avgMax    = (f.temperature_2m_max?.reduce((a,b)=>a+b,0)/7).toFixed(1);
        const advRes = await axios.post(`${config.API_URL}/api/ask`, {
          question: `Farm near ${name} Zimbabwe. Weather this week: avg ${avgMax}°C, ${totalRain}mm rain. March end of rainy season. Give 5 specific farming tips for this week.`,
          phone: user.phone,
          topic: "Zimbabwe farm weather advisory March harvest"
        });
        setAdvice(advRes.data.answer);
      }
    } catch { alert("Could not load weather. Check connection."); }
    setLoading(false);
  };

  const getGPS = () => {
    if (!navigator.geolocation) { alert("GPS not available"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        loadWeather(lat, lon, "Your Farm (GPS)");
        setUseGPS(true);
      },
      () => alert("Could not get GPS location")
    );
  };

  const f = weather?.forecast;

  const weatherIcon = (rain, prob) => {
    if (rain > 20) return "⛈️";
    if (rain > 5)  return "🌧️";
    if (rain > 1)  return "🌦️";
    if (prob > 50) return "⛅";
    return "☀️";
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>🌤️ Weather & Climate Forecast</h2>

      {/* Location Selector */}
      <div className="card">
        <h3>Select Your Location</h3>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {REGIONS.map(r => (
            <button key={r.name}
              onClick={() => { setSelected(r); loadWeather(r.lat,r.lon,r.name); setUseGPS(false); }}
              style={{
                padding:"6px 12px", borderRadius:16, border:"none",
                cursor:"pointer", fontWeight:600, fontSize:12,
                background: selected.name===r.name && !useGPS ? "#2e7d32" : "#e8f5e9",
                color: selected.name===r.name && !useGPS ? "white" : "#2e7d32"
              }}>{r.name}</button>
          ))}
        </div>
        <button className="btn btn-gold" onClick={getGPS}>
          🛰️ Use My GPS Location (Most Accurate)
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:40 }}>
          Loading weather data...
        </div>
      ) : weather && f ? (
        <>
          <div className="card">
            <h3>🌤️ 7-Day Forecast — {weather.name}</h3>
            <p style={{ color:"#888", fontSize:13, marginBottom:12 }}>
              Region {weather.region_info?.region} | {weather.region_info?.climate}
            </p>

            <div style={{ overflowX:"auto" }}>
              <div style={{ display:"flex", gap:8, minWidth:500 }}>
                {f.time?.map((date, i) => (
                  <div key={i} style={{
                    flex:1, background:"#f1f8e9", borderRadius:10,
                    padding:10, textAlign:"center", minWidth:70
                  }}>
                    <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>
                      {new Date(date).toLocaleDateString("en",{weekday:"short"})}
                    </div>
                    <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>{date}</div>
                    <div style={{ fontSize:24 }}>
                      {weatherIcon(f.precipitation_sum?.[i]||0, f.precipitation_probability_max?.[i]||0)}
                    </div>
                    <div style={{ fontSize:13, fontWeight:"bold", color:"#1b5e20", margin:"4px 0" }}>
                      {f.temperature_2m_max?.[i]}°C
                    </div>
                    <div style={{ fontSize:12, color:"#888" }}>
                      {f.temperature_2m_min?.[i]}°C
                    </div>
                    <div style={{ fontSize:11, color:"#1976d2", marginTop:4 }}>
                      💧 {f.precipitation_sum?.[i]}mm
                    </div>
                    <div style={{ fontSize:11, color:"#666" }}>
                      {f.precipitation_probability_max?.[i]}% chance
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid3" style={{ marginTop:14 }}>
              <div style={{ background:"#e3f2fd", padding:10, borderRadius:8, textAlign:"center" }}>
                <div style={{ fontWeight:"bold", color:"#1976d2" }}>
                  {f.precipitation_sum?.reduce((a,b)=>a+b,0).toFixed(0)}mm
                </div>
                <div style={{ fontSize:12, color:"#666" }}>Total Rain This Week</div>
              </div>
              <div style={{ background:"#fff8e1", padding:10, borderRadius:8, textAlign:"center" }}>
                <div style={{ fontWeight:"bold", color:"#f57f17" }}>
                  {(f.temperature_2m_max?.reduce((a,b)=>a+b,0)/7).toFixed(1)}°C
                </div>
                <div style={{ fontSize:12, color:"#666" }}>Avg Max Temperature</div>
              </div>
              <div style={{ background:"#e8f5e9", padding:10, borderRadius:8, textAlign:"center" }}>
                <div style={{ fontWeight:"bold", color:"#2e7d32" }}>
                  {weather.region_info?.best_crops?.split(",")[0]}
                </div>
                <div style={{ fontSize:12, color:"#666" }}>Top Crop For Region</div>
              </div>
            </div>
          </div>

          {advice && (
            <div className="card" style={{ borderTop:"4px solid #4caf50" }}>
              <h3>🌱 Professional Farming Advisory</h3>
              <div style={{ background:"#f1f8e9", padding:14, borderRadius:8, lineHeight:1.8, whiteSpace:"pre-wrap", fontSize:14 }}>
                {advice}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}