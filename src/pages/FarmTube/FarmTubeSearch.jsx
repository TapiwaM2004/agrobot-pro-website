/**
 * FarmTubeSearch.jsx
 * Search results — channels + posts
 * Route: /farm-tube/search?q=...
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "./farmtube.css";

const API     = import.meta.env.VITE_API_URL || "";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const fmtNum  = (n) => (n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n));
const timeAgo = (d) => {
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

function Avatar({ url, name, size="md" }) {
  if (url) return <img src={url} alt={name} className={`ft-avatar ft-avatar-${size}`} />;
  return (
    <div className={`ft-avatar ft-avatar-${size} ft-avatar-fallback`}>
      {(name||"F").substring(0,2).toUpperCase()}
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState(""); const [vis, setVis] = useState(false);
  const show = (m) => { setMsg(m); setVis(true); setTimeout(()=>setVis(false),2500); };
  const Toast = () => <div className={`ft-toast ${vis?"show":""}`}>{msg}</div>;
  return { show, Toast };
}

export default function FarmTubeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate   = useNavigate();
  const { show, Toast } = useToast();

  const q = searchParams.get("q") || "";
  const [input,    setInput]   = useState(q);
  const [results,  setResults] = useState({ channels:[], posts:[], query:"" });
  const [loading,  setLoading] = useState(false);
  const [tab,      setTab]     = useState("all");
  const [followMap,setFollowMap]= useState({});  // channelId → bool

  const search = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/farmtube/search?q=${encodeURIComponent(query)}`, { headers:headers() });
      const data = await res.json();
      setResults(data);
      // Seed follow map
      const fm = {};
      (data.channels||[]).forEach(c => { fm[c.id] = c.is_following; });
      setFollowMap(fm);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (q) search(q); }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) { setSearchParams({ q: input.trim() }); }
  };

  const handleFollow = async (channelId) => {
    try {
      const res  = await fetch(`${API}/api/farmtube/channel/${channelId}/follow`, { method:"POST", headers:headers() });
      const data = await res.json();
      setFollowMap(prev => ({ ...prev, [channelId]:data.active }));
      show(data.message);
    } catch { show("Error"); }
  };

  const channels = results.channels || [];
  const posts    = results.posts    || [];
  const hasResults = channels.length > 0 || posts.length > 0;

  return (
    <div className="ft-root">
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>

        <form onSubmit={handleSearch} className="ft-nav-search">
          <span className="ft-nav-search-icon">🔍</span>
          <input className="ft-input"
                 placeholder="Search farmers, crops, tips…"
                 value={input}
                 onChange={e => setInput(e.target.value)} />
        </form>

        <Link to="/farm-tube" className="ft-btn ft-btn-ghost" style={{ marginLeft:"auto" }}>← Back</Link>
      </nav>

      <div className="ft-page">

        {/* Heading */}
        {q && (
          <div style={{ marginBottom:22 }}>
            <h1 className="ft-display" style={{ margin:"0 0 4px", fontSize:22 }}>
              Results for "<span style={{ color:"var(--ft-gold)" }}>{q}</span>"
            </h1>
            {!loading && hasResults && (
              <p style={{ color:"var(--ft-subtext)", fontSize:13, margin:0 }}>
                {channels.length} farmer{channels.length!==1?"s":""} · {posts.length} post{posts.length!==1?"s":""}
              </p>
            )}
          </div>
        )}

        {loading && <div className="ft-spinner" />}

        {!loading && q && !hasResults && (
          <div className="ft-empty">
            <div className="ft-empty-icon">🌾</div>
            <h3>No results for "{q}"</h3>
            <p>Try searching for a crop, province, or farmer name.</p>
          </div>
        )}

        {!loading && !q && (
          <div className="ft-empty">
            <div className="ft-empty-icon">🔍</div>
            <h3>Search FarmTube</h3>
            <p>Find farmers, videos, photos, and tips from across Zimbabwe.</p>
          </div>
        )}

        {!loading && hasResults && (
          <>
            {/* Tabs */}
            <div className="ft-tabs" style={{ marginBottom:24 }}>
              {[
                { id:"all",      label:`All (${channels.length + posts.length})` },
                { id:"channels", label:`Farmers (${channels.length})` },
                { id:"posts",    label:`Posts (${posts.length})` },
              ].map(t => (
                <button key={t.id} className={`ft-tab ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Channels section */}
            {(tab==="all" || tab==="channels") && channels.length > 0 && (
              <div style={{ marginBottom:32 }}>
                {tab==="all" && <p className="ft-label" style={{ margin:"0 0 14px" }}>🌿 Farmers</p>}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {channels.map(ch => (
                    <div key={ch.id} style={{
                      background:"var(--ft-card)", border:"1px solid var(--ft-border)",
                      borderRadius:"var(--ft-radius-lg)", padding:"14px 16px",
                      display:"flex", alignItems:"center", gap:14,
                      transition:"var(--ft-transition)",
                    }}
                    onMouseOver={e=>e.currentTarget.style.borderColor="var(--ft-green-dim)"}
                    onMouseOut={e=>e.currentTarget.style.borderColor="var(--ft-border)"}>
                      <div style={{ cursor:"pointer" }} onClick={() => navigate(`/farm-tube/channel/${ch.id}`)}>
                        <Avatar url={ch.avatar_url} name={ch.channel_name} size="lg" />
                      </div>
                      <div style={{ flex:1, minWidth:0, cursor:"pointer" }}
                           onClick={() => navigate(`/farm-tube/channel/${ch.id}`)}>
                        <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:15 }}>
                          {ch.channel_name}
                          {ch.is_verified && <span className="ft-verified" style={{ marginLeft:4 }}>✦</span>}
                        </p>
                        <p style={{ margin:"0 0 4px", fontSize:12, color:"var(--ft-subtext)" }}>
                          @{ch.handle}
                          {ch.location && <> · 📍 {ch.location}</>}
                          {ch.farm_type && <> · 🌱 {ch.farm_type}</>}
                        </p>
                        <p style={{ margin:0, fontSize:12, color:"var(--ft-muted)" }}>
                          {fmtNum(ch.follower_count)} followers · {fmtNum(ch.post_count)} posts
                        </p>
                        {ch.bio && (
                          <p style={{ margin:"4px 0 0", fontSize:13, color:"var(--ft-subtext)",
                                     overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {ch.bio}
                          </p>
                        )}
                      </div>
                      <button
                        className={`ft-btn ${followMap[ch.id]?"ft-btn-outline":"ft-btn-primary"}`}
                        style={{ flexShrink:0, padding:"7px 14px", fontSize:13 }}
                        onClick={() => handleFollow(ch.id)}>
                        {followMap[ch.id] ? "✓ Following" : "+ Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts section */}
            {(tab==="all" || tab==="posts") && posts.length > 0 && (
              <div>
                {tab==="all" && <p className="ft-label" style={{ margin:"0 0 14px" }}>🎬 Posts</p>}
                <div className="ft-grid">
                  {posts.map(post => (
                    <div key={post.id} className="ft-card"
                         onClick={() => navigate(`/farm-tube/post/${post.id}`)}
                         style={{ cursor:"pointer" }}>
                      <div style={{ position:"relative" }}>
                        {post.thumbnail_url
                          ? <img src={post.thumbnail_url} alt={post.title} className="ft-thumb" />
                          : <div className="ft-thumb-placeholder" style={{ fontSize:32 }}>
                              {post.media_type==="video"?"🎬":"📸"}
                            </div>
                        }
                        <span className={`ft-badge ft-badge-${post.media_type}`}
                              style={{ position:"absolute", bottom:8, right:8 }}>
                          {post.media_type==="video" ? "▶ Video" : "📷 Photo"}
                        </span>
                      </div>
                      <div style={{ padding:"10px 12px 12px", display:"flex", gap:8 }}>
                        {post.channel && (
                          <Avatar url={post.channel.avatar_url} name={post.channel.channel_name} size="sm" />
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:600, lineHeight:1.3,
                                     display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                                     overflow:"hidden" }}>
                            {post.title}
                          </p>
                          {post.channel && (
                            <p style={{ margin:"0 0 3px", fontSize:11, color:"var(--ft-subtext)" }}>
                              {post.channel.channel_name}
                            </p>
                          )}
                          <p style={{ margin:0, fontSize:11, color:"var(--ft-muted)" }}>
                            {fmtNum(post.views)} views · {timeAgo(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Toast />
    </div>
  );
}