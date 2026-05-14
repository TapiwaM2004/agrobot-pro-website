/**
 * useGPS.jsx
 * Auto GPS detection — add one line to App.jsx and GPS works everywhere.
 *
 * USAGE in App.jsx:
 *   import useGPS from "./hooks/useGPS";
 *   function App() { useGPS(); return <Routes>...</Routes>; }
 */
import { useEffect, useRef } from "react";

const API       = import.meta.env.VITE_API_URL || "";
const CACHE_KEY = "agrobot_gps_cache";
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes

export default function useGPS() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    const phone = localStorage.getItem("phone") || "";
    if (!phone) return;

    // Dont re-request if we sent GPS recently
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && cached.phone === phone && Date.now() - cached.timestamp < CACHE_TTL) return;
    } catch {}

    if (!navigator.geolocation) return;
    sent.current = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res  = await fetch(`${API}/api/location/save-gps`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, lat: latitude, lon: longitude }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              phone, lat: latitude, lon: longitude,
              nearest: data.nearest, region: data.region,
              timestamp: Date.now(),
            }));
            window.dispatchEvent(new CustomEvent("agrobot:gps-saved", { detail: data }));
          }
        } catch (err) {
          console.log("[GPS] Backend save failed:", err.message);
        }
      },
      (error) => console.log("[GPS] Unavailable:", error.message),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: CACHE_TTL }
    );
  }, []);
}

export function useGPSLocation() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.timestamp < CACHE_TTL)
      return { lat: cached.lat, lon: cached.lon, nearest: cached.nearest, region: cached.region };
  } catch {}
  return { lat: null, lon: null, nearest: null, region: null };
}

export function GPSStatusBadge() {
  const { nearest, region } = useGPSLocation();
  if (!nearest) return null;
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:5,
      background:"rgba(69,176,106,0.12)",color:"#45b06a",
      borderRadius:50,padding:"3px 10px",fontSize:12,fontWeight:600,
      border:"1px solid rgba(69,176,106,0.2)",
    }}>
      🛰️ {nearest.charAt(0).toUpperCase() + nearest.slice(1)}
      {region && <span style={{opacity:0.7}}> · Region {region}</span>}
    </span>
  );
}