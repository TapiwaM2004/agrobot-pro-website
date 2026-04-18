import React, { useState, useRef } from "react";
import axios from "axios";
import config from "../config";

export default function PhotoAnalysis({ user }) {
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [result,     setResult]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [description,setDescription]= useState("");
  const [tab,        setTab]        = useState("photo");
  const [error,      setError]      = useState("");
  const [progress,   setProgress]   = useState(0);

  const galleryRef = useRef();
  const cameraRef  = useRef();

  // ── Handle Image File ──────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg","image/jpg",
      "image/png","image/webp"
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please use JPG, PNG or WEBP format");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Image too large. Please use an image under 15MB");
      return;
    }

    setError("");
    setResult("");
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Resize Image Before Sending ────────────────────────────
  const resizeImage = (base64, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        // Get resized base64
        const resized = canvas.toDataURL("image/jpeg", 0.85);
        resolve(resized.split(",")[1]);
      };
      img.src = `data:image/jpeg;base64,${base64}`;
    });
  };

  // ── Analyse Photo ──────────────────────────────────────────
  const analysePhoto = async () => {
    if (!image) {
      setError("Please select or take a photo first");
      return;
    }

    setLoading(true);
    setResult("");
    setError("");
    setProgress(10);

    const msgs = [
      "📤 Preparing image...",
      "🔬 AI examining photo...",
      "🌿 Identifying plant...",
      "💊 Finding treatments...",
      "📋 Writing report..."
    ];

    let mi = 0;
    setLoadingMsg(msgs[0]);
    const msgInterval = setInterval(() => {
      mi = (mi + 1) % msgs.length;
      setLoadingMsg(msgs[mi]);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress(p => p < 85 ? p + 5 : p);
    }, 2000);

    try {
      // Step 1: Convert to base64
      const rawBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror   = reject;
        reader.readAsDataURL(image);
      });

      setProgress(30);

      // Step 2: Resize image
      const base64 = await resizeImage(rawBase64);
      setProgress(50);

      // Step 3: Get farmer location
      let locationContext = "";
      try {
        const fRes = await axios.get(
          `${config.API_URL}/api/farmer/${user.phone}`,
          { timeout: 5000 }
        );
        const p = fRes.data?.profile    || {};
        const r = fRes.data?.region_info || {};
        if (p.location) {
          locationContext =
            `Location: ${p.location} | ` +
            `Climate: ${r.climate || "Sub-humid"} | ` +
            `Soil: ${r.soil || "Mixed"} | ` +
            `Rainfall: ${r.rainfall || "600-800mm"} | ` +
            `Best crops: ${r.best_crops || "Maize, Tobacco"}`;
        }
      } catch {}

      setProgress(65);

      // Step 4: Send to backend
      const res = await axios.post(
        `${config.API_URL}/api/analyse-image-web`,
        {
          image_base64:     base64,
          image_type:       "image/jpeg",
          phone:            user.phone,
          location_context: locationContext
        },
        {
          timeout: 90000,
          headers: { "Content-Type": "application/json" }
        }
      );

      clearInterval(msgInterval);
      clearInterval(progressInterval);
      setProgress(100);

      if (res.data.analysis) {
        setResult(res.data.analysis);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Could not analyse image. Please try again.");
      }

    } catch (e) {
      clearInterval(msgInterval);
      clearInterval(progressInterval);

      console.error("Analysis error:", e);

      if (e.code === "ECONNABORTED" || e.message?.includes("timeout")) {
        setError(
          "Analysis took too long. Please try:\n" +
          "• A smaller/clearer image\n" +
          "• Check your internet connection"
        );
      } else if (e.response?.status === 413) {
        setError("Image too large. Please use a smaller photo.");
      } else if (e.response?.status === 500) {
        setError(
          "Server error analysing image.\n" +
          "Please describe symptoms instead using the text tab."
        );
      } else {
        setError(
          "Analysis failed. Please:\n" +
          "• Check your internet connection\n" +
          "• Try the 'Describe Symptoms' tab instead"
        );
      }
    }

    setLoading(false);
    setLoadingMsg("");
    setProgress(0);
  };

  // ── Analyse by Text Description ────────────────────────────
  const analyseDescription = async () => {
    if (!description.trim()) {
      setError("Please describe the symptoms");
      return;
    }

    setLoading(true);
    setResult("");
    setError("");
    setLoadingMsg("🔍 Analysing symptoms...");

    try {
      const res = await axios.post(
        `${config.API_URL}/api/ask`,
        {
          question:
            `CROP DISEASE DIAGNOSIS REQUEST:\n\n` +
            `${description}\n\n` +
            `Please provide a COMPLETE professional diagnosis:\n` +
            `1. CROP IDENTIFIED (common + scientific name)\n` +
            `2. DISEASE/PEST NAME (exact scientific name)\n` +
            `3. SEVERITY (Low/Moderate/High/Critical + % affected)\n` +
            `4. TREATMENT (Zimbabwe brand name + exact rate + timing)\n` +
            `5. FOLLOW-UP treatment if needed\n` +
            `6. PREVENTION for next season\n` +
            `7. URGENCY — act within X days\n` +
            `8. ESTIMATED COST in USD`,
          phone: user.phone,
          topic: "crop disease diagnosis Zimbabwe professional treatment brands"
        },
        { timeout: 30000 }
      );

      setResult(res.data.answer);
    } catch {
      setError("Could not get diagnosis. Please check connection.");
    }

    setLoading(false);
    setLoadingMsg("");
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult("");
    setError("");
    setDescription("");
    setProgress(0);
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current)  cameraRef.current.value  = "";
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>
        📸 Photo Crop Disease Analysis
      </h2>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[
          { id:"photo",       label:"📸 Upload Photo" },
          { id:"description", label:"✍️ Describe Symptoms" },
          { id:"tips",        label:"💡 Photo Tips" },
        ].map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); reset(); }}
            style={{
              padding:"9px 18px", borderRadius:8,
              border:"none", cursor:"pointer",
              fontWeight:700, fontSize:13,
              background: tab===t.id ? "#2e7d32" : "#e8f5e9",
              color:      tab===t.id ? "white"   : "#2e7d32"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          PHOTO TAB
      ══════════════════════════════════════════════════ */}
      {tab === "photo" && (
        <>
          {/* Hidden file inputs */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display:"none" }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            onChange={e => handleFile(e.target.files[0])}
            style={{ display:"none" }}
          />

          {!result ? (
            <>
              <div className="card"
                style={{ borderTop:"4px solid #e91e63" }}>
                <h3>📸 Upload Crop Photo for AI Diagnosis</h3>

                {/* Preview / Drop Zone */}
                <div style={{
                  border:"2px dashed #4caf50",
                  borderRadius:12,
                  padding: preview ? 0 : "36px 20px",
                  textAlign:"center",
                  cursor:"pointer",
                  background:"#f9fbe7",
                  marginBottom:14,
                  overflow:"hidden"
                }}
                  onClick={() => galleryRef.current?.click()}>

                  {preview ? (
                    <div style={{ position:"relative" }}>
                      <img
                        src={preview}
                        alt="Selected crop"
                        style={{
                          width:"100%",
                          maxHeight:320,
                          objectFit:"contain",
                          borderRadius:10
                        }}
                      />
                      <div style={{
                        position:"absolute",
                        bottom:8, right:8,
                        background:"rgba(0,0,0,0.6)",
                        color:"white",
                        padding:"3px 10px",
                        borderRadius:20,
                        fontSize:12
                      }}>
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:52, marginBottom:10 }}>
                        🌿
                      </div>
                      <p style={{
                        fontWeight:700,
                        color:"#2e7d32",
                        fontSize:15
                      }}>
                        Click here to select photo
                      </p>
                      <p style={{
                        color:"#888",
                        fontSize:13,
                        marginTop:4
                      }}>
                        JPG, PNG or WEBP • Max 15MB
                      </p>
                    </>
                  )}
                </div>

                {/* Camera / Gallery Buttons */}
                <div style={{
                  display:"flex", gap:8, marginBottom:14
                }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex:1 }}
                    onClick={() => galleryRef.current?.click()}>
                    🖼️ Choose from Gallery
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex:1 }}
                    onClick={() => cameraRef.current?.click()}>
                    📷 Take Photo Now
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background:"#ffebee",
                    color:"#c62828",
                    padding:"10px 14px",
                    borderRadius:8,
                    fontSize:13,
                    marginBottom:12,
                    whiteSpace:"pre-wrap"
                  }}>
                    ❌ {error}
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div style={{
                    background:"#e8f5e9",
                    padding:16,
                    borderRadius:8,
                    textAlign:"center",
                    marginBottom:12
                  }}>
                    <div style={{ fontSize:32, marginBottom:6 }}>
                      🔬
                    </div>
                    <p style={{
                      fontWeight:700,
                      color:"#2e7d32",
                      fontSize:15
                    }}>
                      {loadingMsg}
                    </p>
                    <p style={{
                      fontSize:13,
                      color:"#888",
                      marginTop:4,
                      marginBottom:10
                    }}>
                      Please wait up to 30 seconds...
                    </p>
                    {/* Progress Bar */}
                    <div style={{
                      background:"#c8e6c9",
                      borderRadius:10,
                      height:8,
                      overflow:"hidden"
                    }}>
                      <div style={{
                        background:"#2e7d32",
                        height:8,
                        borderRadius:10,
                        width:`${progress}%`,
                        transition:"width 0.5s"
                      }} />
                    </div>
                    <p style={{
                      fontSize:11,
                      color:"#888",
                      marginTop:6
                    }}>
                      {progress}% complete
                    </p>
                  </div>
                )}

                {/* Analyse Button */}
                <button
                  className="btn btn-green"
                  onClick={analysePhoto}
                  disabled={loading || !image}
                  style={{
                    width:"100%",
                    fontSize:15,
                    padding:"14px"
                  }}>
                  {loading
                    ? loadingMsg
                    : image
                      ? "🔬 Analyse This Photo Now"
                      : "📷 Select a Photo First"}
                </button>
              </div>

              {/* What AI checks */}
              <div className="card">
                <h3>🔬 What Our AI Checks</h3>
                <div className="grid2" style={{
                  fontSize:14, lineHeight:2.2
                }}>
                  <div>🌿 Crop identification</div>
                  <div>🔍 Disease name</div>
                  <div>📊 Severity level</div>
                  <div>💊 Treatment brands</div>
                  <div>💰 Cost estimate</div>
                  <div>⏰ Urgency level</div>
                  <div>🛡️ Prevention tips</div>
                  <div>📏 Exact product rates</div>
                </div>
              </div>
            </>
          ) : (
            /* Result */
            <>
              <div className="card"
                style={{ borderTop:"4px solid #4caf50" }}>
                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  marginBottom:14,
                  flexWrap:"wrap",
                  gap:8
                }}>
                  <h3>🌿 AI Analysis Result</h3>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize:13 }}
                    onClick={reset}>
                    🔄 Analyse Another
                  </button>
                </div>

                {preview && (
                  <img src={preview} alt="Analysed crop"
                    style={{
                      width:"100%",
                      maxHeight:200,
                      objectFit:"contain",
                      borderRadius:8,
                      border:"1px solid #e0e0e0",
                      marginBottom:14
                    }}
                  />
                )}

                <div style={{
                  background:"#f1f8e9",
                  padding:16,
                  borderRadius:10,
                  lineHeight:1.9,
                  whiteSpace:"pre-wrap",
                  fontSize:14
                }}>
                  {result}
                </div>
              </div>

              <div className="card">
                <h3>🛒 Buy Treatment Products</h3>
                <div className="grid2" style={{ fontSize:14 }}>
                  <div>🌿 Agricura: <strong>04-621567</strong></div>
                  <div>🧪 ZFC: <strong>04-700751</strong></div>
                  <div>🛒 Windmill: <strong>04-309411</strong></div>
                  <div>📞 Agritex: <strong>0800 4040</strong></div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          DESCRIPTION TAB
      ══════════════════════════════════════════════════ */}
      {tab === "description" && (
        <>
          {!result ? (
            <div className="card">
              <h3>✍️ Describe Crop Symptoms</h3>
              <p style={{
                color:"#666", fontSize:14, marginBottom:12
              }}>
                No photo? Describe what you see for AI diagnosis.
              </p>

              <textarea
                className="input"
                rows={8}
                placeholder={
                  "Describe in detail:\n" +
                  "• What crop is it? (e.g. Maize, Tobacco)\n" +
                  "• What do leaves look like?\n" +
                  "  - Yellow spots? Brown patches? Holes?\n" +
                  "  - Wilting? White powder? Rust?\n" +
                  "• Stems or roots affected?\n" +
                  "• How many plants are affected?\n" +
                  "• When did you first notice?\n" +
                  "• Any treatments already tried?"
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize:"vertical" }}
              />

              {error && (
                <div style={{
                  background:"#ffebee",
                  color:"#c62828",
                  padding:"10px 14px",
                  borderRadius:8,
                  fontSize:13,
                  marginBottom:12
                }}>
                  ❌ {error}
                </div>
              )}

              {loading && (
                <div style={{
                  background:"#e8f5e9",
                  padding:12,
                  borderRadius:8,
                  textAlign:"center",
                  marginBottom:12
                }}>
                  <p style={{
                    color:"#2e7d32",
                    fontWeight:700
                  }}>
                    🔍 {loadingMsg}
                  </p>
                </div>
              )}

              <button
                className="btn btn-green"
                onClick={analyseDescription}
                disabled={loading}
                style={{ width:"100%" }}>
                {loading ? "🔍 Analysing..." : "🔍 Get Diagnosis"}
              </button>
            </div>
          ) : (
            <>
              <div className="card"
                style={{ borderTop:"4px solid #4caf50" }}>
                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  marginBottom:12,
                  flexWrap:"wrap",
                  gap:8
                }}>
                  <h3>🌿 Diagnosis Result</h3>
                  <button className="btn btn-outline" onClick={reset}>
                    🔄 New Analysis
                  </button>
                </div>
                <div style={{
                  background:"#f1f8e9",
                  padding:16,
                  borderRadius:10,
                  lineHeight:1.9,
                  whiteSpace:"pre-wrap",
                  fontSize:14
                }}>
                  {result}
                </div>
              </div>

              <div className="card">
                <h3>📸 More Accurate Diagnosis</h3>
                <p style={{
                  color:"#666", fontSize:14, marginBottom:10
                }}>
                  Upload a photo for visual AI confirmation
                </p>
                <button className="btn btn-green"
                  onClick={() => { setTab("photo"); reset(); }}>
                  📸 Upload Photo Now
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          TIPS TAB
      ══════════════════════════════════════════════════ */}
      {tab === "tips" && (
        <div className="card">
          <h3>💡 Tips for Best AI Results</h3>

          <div style={{ lineHeight:2.4, fontSize:14 }}>
            {[
              ["✅","Take in good natural daylight — not direct sun"],
              ["✅","Get close — symptoms must be clearly visible"],
              ["✅","Include BOTH healthy and affected leaves"],
              ["✅","Take multiple angles: top, underside, stem"],
              ["✅","Hold camera steady — no blur"],
              ["✅","Best time: morning 7am to 10am"],
              ["✅","If wilting — include roots if possible"],
              ["❌","Avoid dark or blurry photos"],
              ["❌","Avoid photos taken at night"],
              ["❌","Don't crop out the whole leaf"],
            ].map(([icon, tip], i) => (
              <div key={i} style={{ display:"flex", gap:10 }}>
                <span>{icon}</span>
                <span style={{
                  color: icon==="✅" ? "#2e7d32" : "#c62828"
                }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            background:"#e3f2fd",
            padding:14,
            borderRadius:8,
            marginTop:16
          }}>
            <strong>📱 Camera Not Working?</strong>
            <p style={{ fontSize:13, color:"#555", marginTop:6 }}>
              If the camera button doesn't open on your device:
            </p>
            <ol style={{
              fontSize:13, color:"#555",
              paddingLeft:18, lineHeight:2,
              marginTop:6
            }}>
              <li>Take the photo with your phone camera first</li>
              <li>Come back here and click <strong>"Choose from Gallery"</strong></li>
              <li>Select the photo you just took</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}