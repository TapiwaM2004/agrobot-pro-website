/**
 * FarmTubeUpload.jsx  — Upload a new video or photo post
 * FarmTubeAnalytics.jsx — Channel analytics dashboard
 *
 * Routes:
 *   /farm-tube/upload
 *   /farm-tube/analytics
 *
 * Both are exported from this single file.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./farmtube.css";

const API     = import.meta.env.VITE_API_URL || "";
const headers = (contentType = true) => ({
  ...(contentType ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtNum  = (n) => (n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n));
const fmtSize = (b) => b >= 1e6 ? (b/1e6).toFixed(1)+" MB" : (b/1e3).toFixed(0)+" KB";

function useToast() {
  const [msg, setMsg] = useState("");
  const [vis, setVis] = useState(false);
  const show = (m) => { setMsg(m); setVis(true); setTimeout(()=>setVis(false),3000); };
  const Toast = () => <div className={`ft-toast ${vis?"show":""}`}>{msg}</div>;
  return { show, Toast };
}

// ════════════════════════════════════════════════════════════
//  UPLOAD COMPONENT
// ════════════════════════════════════════════════════════════

export function FarmTubeUpload() {
  const navigate = useNavigate();
  const { show, Toast } = useToast();

  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [mediaType,    setMediaType]    = useState(null);
  const [form,         setForm]         = useState({ title:"", description:"", tags:"" });
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [drag,         setDrag]         = useState(false);
  const [rejected,     setRejected]     = useState("");   // AI moderation rejection message
  const [rejectionTip, setRejectionTip] = useState("");
  const inputRef = useRef(null);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const processFile = useCallback((f) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    const isImage = f.type.startsWith("image/");
    if (!isVideo && !isImage) { show("⚠ Only videos and images are supported."); return; }
    if (isVideo && f.size > 500 * 1024 * 1024) { show("⚠ Video must be under 500 MB."); return; }
    if (isImage && f.size > 20  * 1024 * 1024) { show("⚠ Image must be under 20 MB."); return; }

    setFile(f);
    setMediaType(isVideo ? "video" : "image");
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (!form.title) set("title", f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g," "));
  }, [form.title]);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  const upload = async () => {
    if (!file || !form.title.trim()) { show("⚠ Title is required."); return; }
    setUploading(true); setProgress(5);

    const fd = new FormData();
    fd.append("file",        file);
    fd.append("title",       form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("tags",        form.tags.trim());

    // Simulated progress (XMLHttpRequest for real progress)
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      setProgress(100);
      if (xhr.status === 422) {
        // 🛡 AI Moderation rejection
        try {
          const err    = JSON.parse(xhr.responseText);
          const detail = typeof err.detail === "object" ? err.detail : { message: err.detail };
          setRejected(detail.message || "Upload rejected — not farming content.");
          setRejectionTip(detail.tip || "");
        } catch { setRejected("Upload rejected — content does not appear to be farming related."); }
        setUploading(false); setProgress(0); return;
      }
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        show("✓ Uploaded successfully!");
        setTimeout(() => navigate(`/farm-tube/post/${data.id}`), 800);
      } else {
        try { show("⚠ " + JSON.parse(xhr.responseText).detail); } catch { show("Upload failed."); }
        setUploading(false); setProgress(0);
      }
    };
    xhr.onerror = () => { show("Upload failed — check your connection."); setUploading(false); setProgress(0); };
    xhr.open("POST", `${API}/api/farmtube/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")||""}`);
    xhr.send(fd);
  };

  return (
    <div className="ft-root">
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>
        <button className="ft-btn ft-btn-ghost" onClick={() => navigate(-1)} style={{ marginLeft:"auto" }}>
          ✕ Cancel
        </button>
      </nav>

      <div className="ft-page" style={{ maxWidth:720 }}>
        <h1 className="ft-display" style={{ margin:"0 0 6px", fontSize:26 }}>Upload to FarmTube</h1>
        <p style={{ color:"var(--ft-subtext)", fontSize:14, margin:"0 0 28px" }}>
          Share a video or photo from your farm with the community 🌱
        </p>

        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? "var(--ft-gold)" : "var(--ft-border)"}`,
              borderRadius: "var(--ft-radius-lg)",
              background: drag ? "rgba(200,168,75,0.05)" : "var(--ft-surface)",
              padding: "60px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "var(--ft-transition)",
              marginBottom: 28,
            }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
            <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 6px" }}>
              Drag & drop your video or photo here
            </p>
            <p style={{ color: "var(--ft-subtext)", fontSize: 13, margin: "0 0 18px" }}>
              Videos up to 500 MB · Images up to 20 MB · MP4, MOV, JPG, PNG, WebP
            </p>
            <button className="ft-btn ft-btn-primary" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse Files
            </button>
            <input ref={inputRef} type="file" accept="video/*,image/*"
                   style={{ display:"none" }} onChange={e => processFile(e.target.files[0])} />
          </div>
        ) : (
          /* Preview */
          <div style={{
            background:"var(--ft-card)", border:"1px solid var(--ft-border)",
            borderRadius:"var(--ft-radius-lg)", marginBottom:24, overflow:"hidden",
          }}>
            {mediaType === "video"
              ? <video src={preview} controls
                       style={{ width:"100%", maxHeight:360, display:"block", background:"#000" }} />
              : <img src={preview} alt="preview"
                     style={{ width:"100%", maxHeight:400, objectFit:"contain", display:"block", background:"#000" }} />
            }
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"12px 16px", borderTop:"1px solid var(--ft-border)",
            }}>
              <span className={`ft-badge ft-badge-${mediaType}`}>
                {mediaType === "video" ? "🎬 Video" : "📸 Image"}
              </span>
              <span style={{ fontSize:12, color:"var(--ft-subtext)" }}>
                {file.name} — {fmtSize(file.size)}
              </span>
              <button className="ft-btn ft-btn-ghost" style={{ marginLeft:"auto", fontSize:13 }}
                      onClick={() => { setFile(null); setPreview(null); setMediaType(null); }}>
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        {/* Form fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Title *</label>
            <input className="ft-input" placeholder="e.g. Harvesting Maize — Mashonaland 2025"
                   value={form.title} onChange={e => set("title", e.target.value)} maxLength={200} />
            <p style={{ fontSize:11, color:"var(--ft-muted)", margin:"4px 0 0" }}>
              {form.title.length}/200
            </p>
          </div>

          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Description</label>
            <textarea className="ft-textarea" style={{ minHeight:100 }}
                      placeholder="Tell the community what this is about, tips you're sharing, your location, etc."
                      value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Tags</label>
            <input className="ft-input" placeholder="maize, harvest, drip-irrigation  (comma separated)"
                   value={form.tags} onChange={e => set("tags", e.target.value)} />
            <p style={{ fontSize:11, color:"var(--ft-muted)", margin:"4px 0 0" }}>
              Help other farmers discover your content with relevant tags.
            </p>
          </div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div style={{ marginTop:24 }}>
            <div style={{
              height:6, background:"var(--ft-border)", borderRadius:3, overflow:"hidden",
            }}>
              <div style={{
                height:"100%", background:"var(--ft-gold)",
                borderRadius:3, width:`${progress}%`,
                transition:"width 0.3s ease",
              }} />
            </div>
            <p style={{ fontSize:13, color:"var(--ft-subtext)", margin:"8px 0 0", textAlign:"center" }}>
              Uploading… {progress}%
            </p>
          </div>
        )}

        {/* 🛡 AI Moderation rejection banner */}
        {rejected && (
          <div style={{
            background:"rgba(224,92,92,0.08)", border:"1px solid rgba(224,92,92,0.35)",
            borderRadius:"var(--ft-radius-lg)", padding:"16px 18px", marginTop:20,
          }}>
            <p style={{margin:"0 0 6px",fontWeight:700,fontSize:14,color:"var(--ft-danger)"}}>
              🛡 Upload Rejected by FarmTube AI
            </p>
            <p style={{margin:"0 0 8px",fontSize:13,color:"var(--ft-text)"}}>{rejected}</p>
            {rejectionTip && <p style={{margin:0,fontSize:12,color:"var(--ft-subtext)",fontStyle:"italic"}}>{rejectionTip}</p>}
          </div>
        )}

        {/* Submit */}
        {!uploading && (
          <div style={{ display:"flex", gap:12, marginTop:28 }}>
            <button className="ft-btn ft-btn-outline" onClick={() => navigate(-1)}
                    style={{ flex:1, justifyContent:"center" }}>
              Cancel
            </button>
            <button className="ft-btn ft-btn-primary"
                    style={{ flex:2, justifyContent:"center", fontSize:15, padding:"12px 0" }}
                    onClick={upload} disabled={!file || !form.title.trim()}>
              🚀 Publish to FarmTube
            </button>
          </div>
        )}
      </div>

      <Toast />
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  ANALYTICS COMPONENT
// ════════════════════════════════════════════════════════════

export function FarmTubeAnalytics() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("overview");

  useEffect(() => {
    fetch(`${API}/api/farmtube/analytics`, { headers:headers() })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="ft-root" style={{ minHeight:"100vh" }}>
      <div className="ft-spinner" />
    </div>
  );

  if (!data || data.detail) return (
    <div className="ft-root" style={{ minHeight:"100vh" }}>
      <div className="ft-empty">
        <div className="ft-empty-icon">📊</div>
        <h3>No channel found</h3>
        <p>Create a channel to see your analytics.</p>
        <Link to="/farm-tube/create-channel" className="ft-btn ft-btn-primary" style={{ marginTop:16 }}>
          Create Channel
        </Link>
      </div>
    </div>
  );

  const maxViews = Math.max(...(data.daily_stats.map(d => d.views)), 1);
  const maxLikes = Math.max(...(data.daily_stats.map(d => d.likes)), 1);

  return (
    <div className="ft-root">
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>
        <Link to="/farm-tube/upload" className="ft-btn ft-btn-primary"
              style={{ marginLeft:"auto", fontSize:13, padding:"7px 14px" }}>
          + Upload
        </Link>
      </nav>

      <div className="ft-page">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <button className="ft-btn ft-btn-ghost" onClick={() => navigate(-1)}>←</button>
          <h1 className="ft-display" style={{ margin:0, fontSize:22 }}>Channel Analytics</h1>
        </div>

        {/* Tabs */}
        <div className="ft-tabs" style={{ marginBottom:24 }}>
          {["overview","posts","audience"].map(t => (
            <button key={t} className={`ft-tab ${tab===t?"active":""}`}
                    onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <>
            {/* KPI cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14, marginBottom:28 }}>
              {[
                { icon:"👁", label:"Total Views",       val: fmtNum(data.total_views),     sub:"all time" },
                { icon:"❤️", label:"Total Likes",       val: fmtNum(data.total_likes),     sub:"all time" },
                { icon:"💬", label:"Total Comments",    val: fmtNum(data.total_comments),  sub:"all time" },
                { icon:"👥", label:"Followers",         val: fmtNum(data.total_followers), sub:"all time" },
                { icon:"🎬", label:"Posts Published",   val: fmtNum(data.total_posts),     sub:"active" },
                { icon:"📈", label:"Views This Week",   val: fmtNum(data.views_this_week), sub:"last 7 days" },
              ].map(card => (
                <div key={card.label} style={{
                  background:"var(--ft-card)", border:"1px solid var(--ft-border)",
                  borderRadius:"var(--ft-radius-lg)", padding:"18px 16px",
                }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{card.icon}</div>
                  <p style={{ margin:"0 0 2px", fontSize:11, color:"var(--ft-subtext)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    {card.label}
                  </p>
                  <p className="ft-display" style={{ margin:"0 0 2px", fontSize:26 }}>{card.val}</p>
                  <p style={{ margin:0, fontSize:11, color:"var(--ft-muted)" }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Views chart — 14 days */}
            <div style={{
              background:"var(--ft-card)", border:"1px solid var(--ft-border)",
              borderRadius:"var(--ft-radius-lg)", padding:24, marginBottom:20,
            }}>
              <p className="ft-label" style={{ margin:"0 0 20px" }}>📈 Views — last 14 days</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120 }}>
                {data.daily_stats.map((d,i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div title={`${d.views} views`} style={{
                      width:"100%", background:"var(--ft-gold)",
                      borderRadius:"4px 4px 0 0",
                      height: `${Math.max(4, (d.views/maxViews)*100)}px`,
                      opacity: 0.85,
                      transition:"height 0.4s ease",
                    }} />
                    <span style={{ fontSize:9, color:"var(--ft-muted)", transform:"rotate(-40deg)", transformOrigin:"center",
                                   whiteSpace:"nowrap" }}>
                      {d.date.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Likes chart */}
            <div style={{
              background:"var(--ft-card)", border:"1px solid var(--ft-border)",
              borderRadius:"var(--ft-radius-lg)", padding:24,
            }}>
              <p className="ft-label" style={{ margin:"0 0 20px" }}>❤️ Likes — last 14 days</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
                {data.daily_stats.map((d,i) => (
                  <div key={i} style={{ flex:1 }}>
                    <div title={`${d.likes} likes`} style={{
                      width:"100%",
                      background:"#e05c5c",
                      borderRadius:"4px 4px 0 0",
                      height: `${Math.max(3, (d.likes/maxLikes)*72)}px`,
                      opacity:0.75,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Top Posts ── */}
        {tab === "posts" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {data.top_posts.length === 0
              ? <div className="ft-empty"><div className="ft-empty-icon">🎬</div><h3>No posts yet</h3></div>
              : data.top_posts.map((post, idx) => (
                <div key={post.id}
                     onClick={() => navigate(`/farm-tube/post/${post.id}`)}
                     style={{
                       background:"var(--ft-card)", border:"1px solid var(--ft-border)",
                       borderRadius:"var(--ft-radius-lg)", padding:"14px 16px",
                       display:"flex", gap:14, alignItems:"center", cursor:"pointer",
                       transition:"var(--ft-transition)",
                     }}
                     onMouseOver={e => e.currentTarget.style.borderColor="var(--ft-green-dim)"}
                     onMouseOut={e  => e.currentTarget.style.borderColor="var(--ft-border)"}>
                  <span style={{
                    fontFamily:"var(--ft-font-head)", fontSize:22, fontWeight:700,
                    color: idx===0?"var(--ft-gold)":idx===1?"#c0c0c0":idx===2?"#cd7f32":"var(--ft-muted)",
                    width:28, textAlign:"center", flexShrink:0,
                  }}>
                    {idx+1}
                  </span>
                  {post.thumbnail_url
                    ? <img src={post.thumbnail_url} alt={post.title}
                           style={{ width:72, height:48, objectFit:"cover", borderRadius:6, flexShrink:0 }} />
                    : <div style={{ width:72, height:48, background:"var(--ft-surface)", borderRadius:6,
                                   display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                        {post.media_type==="video"?"🎬":"📸"}
                      </div>
                  }
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:"0 0 4px", fontWeight:600, fontSize:14,
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {post.title}
                    </p>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:"var(--ft-subtext)" }}>👁 {fmtNum(post.views)}</span>
                      <span style={{ fontSize:12, color:"var(--ft-subtext)" }}>❤ {fmtNum(post.like_count)}</span>
                      <span style={{ fontSize:12, color:"var(--ft-subtext)" }}>💬 {fmtNum(post.comment_count)}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Audience ── */}
        {tab === "audience" && (
          <div style={{
            background:"var(--ft-card)", border:"1px solid var(--ft-border)",
            borderRadius:"var(--ft-radius-lg)", padding:28, textAlign:"center",
          }}>
            <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
            <h2 className="ft-display" style={{ margin:"0 0 8px", fontSize:24 }}>
              {fmtNum(data.total_followers)}
            </h2>
            <p style={{ color:"var(--ft-subtext)", margin:"0 0 28px", fontSize:14 }}>Total Followers</p>
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, maxWidth:300, margin:"0 auto",
            }}>
              {[
                { label:"Views / Post",    val: data.total_posts ? fmtNum(Math.round(data.total_views/data.total_posts)) : "—" },
                { label:"Likes / Post",    val: data.total_posts ? fmtNum(Math.round(data.total_likes/data.total_posts)) : "—" },
                { label:"Comments / Post", val: data.total_posts ? fmtNum(Math.round(data.total_comments/data.total_posts)) : "—" },
                { label:"Views this Month",val: fmtNum(data.views_this_month) },
              ].map(s => (
                <div key={s.label} style={{
                  background:"var(--ft-surface)", borderRadius:"var(--ft-radius)",
                  padding:"14px 12px", textAlign:"center",
                }}>
                  <p className="ft-display" style={{ margin:"0 0 4px", fontSize:22 }}>{s.val}</p>
                  <p style={{ margin:0, fontSize:11, color:"var(--ft-subtext)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export = Upload (most common use)
export default FarmTubeUpload;