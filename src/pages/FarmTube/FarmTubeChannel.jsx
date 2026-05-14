/**
 * FarmTubeChannel.jsx
 * Farmer channel page — banner, stats, posts grid.
 * Routes:
 *   /farm-tube/channel/:channelId
 *   /farm-tube/create-channel  (when channelId not present)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./farmtube.css";

const API = import.meta.env.VITE_API_URL || "";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtViews = (n) => (n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n));
const fmtCount = (n) => (n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n));
const timeAgo  = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h/24); if (dy < 30) return `${dy}d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"2-digit" });
};
const fmtDur = (s) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` : "";

function Avatar({ url, name, size = "md" }) {
  if (url) return <img src={url} alt={name} className={`ft-avatar ft-avatar-${size}`} />;
  return (
    <div className={`ft-avatar ft-avatar-${size} ft-avatar-fallback`}
         style={{ fontSize: size==="xl"?32:size==="lg"?22:16 }}>
      {(name||"F").substring(0,2).toUpperCase()}
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState("");
  const [vis, setVis] = useState(false);
  const show = (m, err=false) => {
    setMsg(m); setVis(true);
    setTimeout(() => setVis(false), 2800);
  };
  const Toast = () => (
    <div className={`ft-toast ${vis?"show":""}`}>{msg}</div>
  );
  return { show, Toast };
}

// ── Create Channel Form ───────────────────────────────────────────────────────
function CreateChannelForm({ onCreated }) {
  const [form, setForm]   = useState({ channel_name:"", handle:"", bio:"", location:"", farm_type:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAutoHandle = (name) => {
    const h = name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0,30);
    set("handle", h);
  };

  const submit = async () => {
    if (!form.channel_name || !form.handle) { setError("Name and handle are required."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/create`, {
        method: "POST", headers: headers(), body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      onCreated(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="ft-root" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{
        background: "var(--ft-card)", border:"1px solid var(--ft-border)",
        borderRadius:"var(--ft-radius-lg)", padding:36, maxWidth:480, width:"100%",
      }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🌾</div>
          <h1 className="ft-display" style={{ margin:0, fontSize:26 }}>Create Your Channel</h1>
          <p style={{ color:"var(--ft-subtext)", margin:"8px 0 0", fontSize:14 }}>
            Share your farming journey with Zimbabwe
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Channel Name *</label>
            <input className="ft-input" placeholder="e.g. Chiweshe Maize Farm"
                   value={form.channel_name}
                   onChange={e => { set("channel_name", e.target.value); handleAutoHandle(e.target.value); }} />
          </div>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Handle *</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                             color:"var(--ft-subtext)", fontSize:14 }}>@</span>
              <input className="ft-input" style={{ paddingLeft:26 }}
                     placeholder="yourhandle"
                     value={form.handle}
                     onChange={e => set("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} />
            </div>
          </div>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Farm Type</label>
            <input className="ft-input" placeholder="e.g. Maize, Livestock, Horticulture"
                   value={form.farm_type}
                   onChange={e => set("farm_type", e.target.value)} />
          </div>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Location</label>
            <input className="ft-input" placeholder="e.g. Mashonaland East, Zimbabwe"
                   value={form.location}
                   onChange={e => set("location", e.target.value)} />
          </div>
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Bio</label>
            <textarea className="ft-textarea" placeholder="Tell the community about your farm…"
                      value={form.bio}
                      onChange={e => set("bio", e.target.value)} />
          </div>

          {error && <p style={{ color:"var(--ft-danger)", fontSize:13, margin:0 }}>⚠ {error}</p>}

          <button className="ft-btn ft-btn-primary"
                  style={{ width:"100%", justifyContent:"center", padding:"12px 0", fontSize:15 }}
                  onClick={submit} disabled={loading}>
            {loading ? "Creating…" : "🌱 Create Channel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post Grid Card ────────────────────────────────────────────────────────────
function MiniPostCard({ post, onClick }) {
  return (
    <div className="ft-card" onClick={onClick} style={{ cursor:"pointer" }}>
      <div style={{ position:"relative" }}>
        {post.thumbnail_url
          ? <img src={post.thumbnail_url} alt={post.title} className="ft-thumb" />
          : <div className="ft-thumb-placeholder" style={{ fontSize:28 }}>
              {post.media_type==="video" ? "🎬" : "📸"}
            </div>
        }
        {post.media_type==="video" && post.duration_secs > 0 && (
          <span style={{
            position:"absolute", bottom:6, right:8,
            background:"rgba(0,0,0,0.75)", color:"#fff",
            fontSize:11, borderRadius:4, padding:"2px 6px", fontWeight:600,
          }}>
            {fmtDur(post.duration_secs)}
          </span>
        )}
      </div>
      <div style={{ padding:"10px 12px 12px" }}>
        <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, lineHeight:1.3,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {post.title}
        </p>
        <p style={{ margin:0, fontSize:11, color:"var(--ft-subtext)" }}>
          {fmtViews(post.views)} views · {timeAgo(post.created_at)}
        </p>
      </div>
    </div>
  );
}

// ── Edit Channel Modal ────────────────────────────────────────────────────────
function EditModal({ channel, onClose, onSaved }) {
  const [form, setForm] = useState({
    channel_name: channel.channel_name,
    bio:          channel.bio,
    location:     channel.location,
    farm_type:    channel.farm_type,
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const save = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/update`, {
        method:"PUT", headers:headers(), body:JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      onSaved(data);
    } catch(e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }} onClick={onClose}>
      <div style={{
        background:"var(--ft-card)", border:"1px solid var(--ft-border)",
        borderRadius:"var(--ft-radius-lg)", padding:28, width:"100%", maxWidth:440,
      }} onClick={e=>e.stopPropagation()}>
        <h3 className="ft-display" style={{ margin:"0 0 20px", fontSize:18 }}>Edit Channel</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { k:"channel_name", label:"Channel Name", ph:"" },
            { k:"farm_type",    label:"Farm Type",    ph:"" },
            { k:"location",     label:"Location",     ph:"" },
          ].map(({ k,label,ph }) => (
            <div key={k}>
              <label className="ft-label" style={{ display:"block", marginBottom:6 }}>{label}</label>
              <input className="ft-input" value={form[k]} placeholder={ph}
                     onChange={e => set(k,e.target.value)} />
            </div>
          ))}
          <div>
            <label className="ft-label" style={{ display:"block", marginBottom:6 }}>Bio</label>
            <textarea className="ft-textarea" value={form.bio}
                      onChange={e => set("bio", e.target.value)} />
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="ft-btn ft-btn-outline" onClick={onClose} style={{ flex:1, justifyContent:"center" }}>Cancel</button>
          <button className="ft-btn ft-btn-primary" onClick={save} disabled={loading}
                  style={{ flex:1, justifyContent:"center" }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FarmTubeChannel() {
  const { channelId }     = useParams();
  const navigate          = useNavigate();
  const { show, Toast }   = useToast();

  const [channel,    setChannel]    = useState(null);
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [myChannel,  setMyChannel]  = useState(null);
  const [showEdit,   setShowEdit]   = useState(false);
  const [followLoading, setFL]      = useState(false);

  // Load my channel
  useEffect(() => {
    fetch(`${API}/api/farmtube/channel/me`, { headers:headers() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if(d?.id) setMyChannel(d); })
      .catch(()=>{});
  }, []);

  // Load channel data
  useEffect(() => {
    if (!channelId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/farmtube/channel/${channelId}`, { headers:headers() }).then(r=>r.json()),
      fetch(`${API}/api/farmtube/channel/${channelId}/posts`, { headers:headers() }).then(r=>r.json()),
    ]).then(([ch, ps]) => {
      setChannel(ch);
      setPosts(ps.posts || []);
    }).catch(()=>{}).finally(() => setLoading(false));
  }, [channelId]);

  if (!channelId) {
    if (myChannel) { navigate(`/farm-tube/channel/${myChannel.id}`); return null; }
    return <CreateChannelForm onCreated={ch => { setMyChannel(ch); navigate(`/farm-tube/channel/${ch.id}`); }} />;
  }

  if (loading) return (
    <div className="ft-root" style={{ minHeight:"100vh" }}>
      <div className="ft-spinner" />
    </div>
  );

  if (!channel) return (
    <div className="ft-root" style={{ minHeight:"100vh" }}>
      <div className="ft-empty">
        <div className="ft-empty-icon">🔍</div>
        <h3>Channel not found</h3>
        <p>This farmer channel doesn't exist.</p>
        <Link to="/farm-tube" className="ft-btn ft-btn-outline" style={{ marginTop:16 }}>← Back to FarmTube</Link>
      </div>
    </div>
  );

  const isOwner  = myChannel?.id === channel.id;

  const handleFollow = async () => {
    setFL(true);
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/${channel.id}/follow`, {
        method:"POST", headers:headers()
      });
      const data = await res.json();
      setChannel(prev => ({
        ...prev,
        is_following:   data.active,
        follower_count: data.count,
      }));
      show(data.message);
    } catch(e) { show("Error — try again"); }
    finally { setFL(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    const fd = new FormData(); fd.append("file", file);
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/${channel.id}/avatar`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${localStorage.getItem("token")||""}` },
        body:fd,
      });
      const data = await res.json();
      setChannel(prev => ({ ...prev, avatar_url: data.avatar_url }));
      show("Avatar updated ✓");
    } catch { show("Upload failed"); }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    const fd = new FormData(); fd.append("file", file);
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/${channel.id}/banner`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${localStorage.getItem("token")||""}` },
        body:fd,
      });
      const data = await res.json();
      setChannel(prev => ({ ...prev, banner_url: data.banner_url }));
      show("Banner updated ✓");
    } catch { show("Upload failed"); }
  };

  return (
    <div className="ft-root">
      {/* Nav */}
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          {isOwner && (
            <Link to="/farm-tube/upload" className="ft-btn ft-btn-primary" style={{ fontSize:13, padding:"7px 14px" }}>
              + Upload
            </Link>
          )}
        </div>
      </nav>

      {/* Banner */}
      <div style={{
        position:"relative", height:200, overflow:"hidden",
        background:"linear-gradient(135deg,#0f2a1c,#1a4028,#0a1a10)",
      }}>
        {channel.banner_url
          ? <img src={channel.banner_url} alt="banner"
                 style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <div style={{
              width:"100%", height:"100%",
              background:"linear-gradient(135deg, #0f2a1c 0%, #1a4028 50%, #122a1e 100%)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:40, opacity:0.3,
            }}>🌾🌿🌾🌿🌾</div>
        }

        {isOwner && (
          <label style={{
            position:"absolute", top:12, right:12,
            background:"rgba(0,0,0,0.55)", borderRadius:8, padding:"6px 12px",
            cursor:"pointer", fontSize:12, color:"#fff", fontWeight:500,
            backdropFilter:"blur(6px)",
          }}>
            📷 Change Banner
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleBannerUpload} />
          </label>
        )}
      </div>

      {/* Profile row */}
      <div className="ft-page">
        <div style={{
          display:"flex", alignItems:"flex-end", gap:16,
          marginTop:-48, marginBottom:24, flexWrap:"wrap",
        }}>
          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <Avatar url={channel.avatar_url} name={channel.channel_name} size="xl" />
            {isOwner && (
              <label style={{
                position:"absolute", bottom:0, right:0,
                background:"var(--ft-gold)", borderRadius:"50%",
                width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", fontSize:13, border:"2px solid var(--ft-bg)",
              }}>
                ✏
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:180, paddingBottom:4 }}>
            <h1 className="ft-display" style={{ margin:"0 0 2px", fontSize:22 }}>
              {channel.channel_name}
              {channel.is_verified && <span className="ft-verified" style={{ marginLeft:6 }}>✦</span>}
            </h1>
            <p style={{ margin:"0 0 6px", fontSize:13, color:"var(--ft-subtext)" }}>
              @{channel.handle}
              {channel.location && <> · 📍 {channel.location}</>}
              {channel.farm_type && <> · 🌱 {channel.farm_type}</>}
            </p>
            {channel.bio && (
              <p style={{ margin:0, fontSize:13, color:"var(--ft-text)", opacity:0.85, maxWidth:480 }}>
                {channel.bio}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
            {isOwner ? (
              <>
                <button className="ft-btn ft-btn-outline" onClick={() => setShowEdit(true)}>
                  ✏ Edit Channel
                </button>
                <Link to="/farm-tube/analytics" className="ft-btn ft-btn-ghost">📊 Analytics</Link>
              </>
            ) : (
              <button
                className={`ft-btn ${channel.is_following ? "ft-btn-outline" : "ft-btn-primary"}`}
                onClick={handleFollow} disabled={followLoading}
              >
                {followLoading ? "…" : channel.is_following ? "✓ Following" : "+ Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display:"flex", gap:32, padding:"16px 20px",
          background:"var(--ft-surface)", border:"1px solid var(--ft-border)",
          borderRadius:"var(--ft-radius-lg)", marginBottom:28,
          flexWrap:"wrap", justifyContent:"center",
        }}>
          {[
            { num: fmtCount(channel.follower_count), label:"Followers" },
            { num: fmtCount(channel.post_count),     label:"Posts" },
            { num: fmtViews(channel.total_views),    label:"Total Views" },
          ].map(s => (
            <div key={s.label} className="ft-stat">
              <span className="ft-stat-num">{s.num}</span>
              <span className="ft-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="ft-empty">
            <div className="ft-empty-icon">🌾</div>
            <h3>{isOwner ? "Your channel is empty" : "No posts yet"}</h3>
            <p>{isOwner ? "Start sharing your farm story!" : `${channel.channel_name} hasn't posted yet.`}</p>
            {isOwner && (
              <Link to="/farm-tube/upload" className="ft-btn ft-btn-primary" style={{ marginTop:16 }}>
                + Upload First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="ft-grid">
            {posts.map(post => (
              <MiniPostCard key={post.id} post={post}
                            onClick={() => navigate(`/farm-tube/post/${post.id}`)} />
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <EditModal channel={channel}
                   onClose={() => setShowEdit(false)}
                   onSaved={updated => { setChannel(prev => ({ ...prev, ...updated })); setShowEdit(false); show("Channel updated ✓"); }} />
      )}

      <Toast />
    </div>
  );
}