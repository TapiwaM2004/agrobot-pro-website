/**
 * FarmTubeHome.jsx (v2)
 * Tabs: Discover | Trending | Following | 🎬 YouTube
 * YouTube agricultural videos mixed into Discover & Trending.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./farmtube.css";

const API = import.meta.env.VITE_API_URL || "";
const headers = () => ({ "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("token")||""}` });

const fmtViews=(n)=>(n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(n||0));
const fmtDur  =(s)=>{ if(!s)return""; const m=Math.floor(s/60),sc=s%60; return`${m}:${String(sc).padStart(2,"0")}`; };
const timeAgo =(d)=>{ const m=Math.floor((Date.now()-new Date(d))/60000); if(m<1)return"just now"; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; const dy=Math.floor(h/24); if(dy<7)return`${dy}d ago`; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); };

function Avatar({url,name,size="md"}){
  if(url) return <img src={url} alt={name} className={`ft-avatar ft-avatar-${size}`}/>;
  return <div className={`ft-avatar ft-avatar-${size} ft-avatar-fallback`} style={{fontSize:size==="sm"?11:16}}>{(name||"F").substring(0,2).toUpperCase()}</div>;
}

/* ── Farmer post card ──────────────────────────────────────── */
function PostCard({post}){
  const navigate=useNavigate();
  return(
    <div className="ft-card" onClick={()=>navigate(`/farm-tube/post/${post.id}`)} style={{cursor:"pointer"}}>
      <div style={{position:"relative"}}>
        {post.thumbnail_url
          ?<img src={post.thumbnail_url} alt={post.title} className="ft-thumb"/>
          :<div className="ft-thumb-placeholder">{post.media_type==="video"?"🎬":"📸"}</div>
        }
        <span className={`ft-badge ft-badge-${post.media_type}`} style={{position:"absolute",bottom:8,right:8}}>
          {post.media_type==="video"?<>▶ {fmtDur(post.duration_secs)||"Video"}</>:<>📷 Photo</>}
        </span>
      </div>
      <div style={{padding:"12px 14px 14px",display:"flex",gap:10}}>
        {post.channel&&(
          <div onClick={e=>{e.stopPropagation();navigate(`/farm-tube/channel/${post.channel.id}`);}}>
            <Avatar url={post.channel.avatar_url} name={post.channel.channel_name} size="sm"/>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:"0 0 4px",fontWeight:600,fontSize:14,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{post.title}</p>
          {post.channel&&<p style={{margin:"0 0 4px",fontSize:12,color:"var(--ft-subtext)"}}>{post.channel.channel_name}{post.channel.is_verified&&<span className="ft-verified"> ✦</span>}</p>}
          <p style={{margin:0,fontSize:12,color:"var(--ft-muted)"}}>{fmtViews(post.views)} views · {timeAgo(post.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── YouTube card ─────────────────────────────────────────── */
function YouTubeCard({video}){
  const navigate=useNavigate();
  const go=()=>navigate(`/farm-tube/post/${video.id}`,{state:video});
  return(
    <div className="ft-card" onClick={go} style={{cursor:"pointer"}}>
      <div style={{position:"relative"}}>
        {video.thumbnail_url
          ?<img src={video.thumbnail_url} alt={video.title} className="ft-thumb"/>
          :<div className="ft-thumb-placeholder">🎬</div>
        }
        <span className="ft-badge" style={{position:"absolute",bottom:8,right:8,background:"rgba(255,0,0,0.85)",color:"#fff",fontSize:11}}>▶ YouTube</span>
      </div>
      <div style={{padding:"12px 14px 14px"}}>
        <p style={{margin:"0 0 4px",fontWeight:600,fontSize:14,lineHeight:1.35,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{video.title}</p>
        <p style={{margin:"0 0 4px",fontSize:12,color:"var(--ft-subtext)"}}>{video.channel_name}</p>
        <p style={{margin:0,fontSize:12,color:"var(--ft-muted)"}}>{fmtViews(video.views)} views · {timeAgo(video.created_at)}</p>
      </div>
    </div>
  );
}

/* ── Unified card ─────────────────────────────────────────── */
function AnyCard({item}){ return item.is_youtube?<YouTubeCard video={item}/>:<PostCard post={item}/>; }

/* ── YouTube-only feed ─────────────────────────────────────── */
function YouTubeFeed(){
  const [videos,setVideos]=useState([]); const [loading,setLoading]=useState(true);
  const [query,setQuery]=useState(""); const [page,setPage]=useState(1); const [hasMore,setHasMore]=useState(true);
  const loaderRef=useRef();

  const fetchVids=useCallback(async(p=1,q="")=>{
    setLoading(true);
    try{
      const url=`${API}/api/farmtube/youtube/feed?page=${p}${q?`&query=${encodeURIComponent(q)}`:""}`;
      const res=await fetch(url,{headers:headers()}); const data=await res.json();
      setVideos(prev=>p===1?data.videos:[...prev,...data.videos]);
      setHasMore(data.has_more); setPage(p);
    }catch(e){console.error(e);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{ fetchVids(1,""); },[]);

  useEffect(()=>{
    if(!loaderRef.current)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&hasMore&&!loading)fetchVids(page+1,query);},{rootMargin:"200px"});
    obs.observe(loaderRef.current); return()=>obs.disconnect();
  },[hasMore,loading,page,query,fetchVids]);

  const farmingTopics=["Zimbabwe Farming","Maize Crop","Livestock Africa","Irrigation Tips","Horticulture","Poultry Farming","Organic Africa","Soil Health"];

  return(
    <>
      {/* Topic chips */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {farmingTopics.map(t=>(
          <button key={t} onClick={()=>{setQuery(t);fetchVids(1,t);}}
                  className="ft-btn ft-btn-ghost"
                  style={{borderRadius:50,border:"1px solid var(--ft-border)",fontSize:12,
                          background:query===t?"var(--ft-card)":"transparent",
                          color:query===t?"var(--ft-gold)":"var(--ft-subtext)",padding:"6px 14px"}}>
            {t}
          </button>
        ))}
      </div>

      {loading&&videos.length===0?<div className="ft-spinner"/>
        :<>
          <div className="ft-grid">{videos.map(v=><YouTubeCard key={v.id} video={v}/>)}</div>
          <div ref={loaderRef} style={{height:60,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {loading&&<div className="ft-spinner" style={{margin:0,width:24,height:24,borderWidth:2}}/>}
            {!hasMore&&videos.length>0&&<p style={{color:"var(--ft-muted)",fontSize:13}}>✦ You've seen all videos</p>}
          </div>
        </>
      }
    </>
  );
}

/* ── Mixed feed (farmer posts + YouTube) ────────────────────── */
function MixedFeed({endpoint}){
  const [items,setItems]=useState([]); const [page,setPage]=useState(1); const [hasMore,setHasMore]=useState(true);
  const [loading,setLoading]=useState(false); const [init,setInit]=useState(false);
  const loaderRef=useRef();

  const fetchPage=useCallback(async(pageNum)=>{
    if(loading)return; setLoading(true);
    try{
      // Fetch farmer posts
      const res=await fetch(`${API}/api/farmtube/${endpoint}?page=${pageNum}`,{headers:headers()});
      const data=await res.json();
      let farmerPosts=data.posts||[];

      // On page 1 also mix in some YouTube videos
      let mixed=farmerPosts;
      if(pageNum===1){
        try{
          const ytRes=await fetch(`${API}/api/farmtube/youtube/${endpoint==="trending"?"trending":"feed"}`,{headers:headers()});
          const ytData=await ytRes.json();
          const ytVids=(ytData.videos||[]).slice(0,4);
          // Interleave: after every 3 farmer posts, insert 1 YouTube video
          mixed=[]; let yi=0;
          farmerPosts.forEach((p,i)=>{ mixed.push(p); if((i+1)%3===0&&yi<ytVids.length){mixed.push(ytVids[yi++]);} });
          while(yi<ytVids.length){mixed.push(ytVids[yi++]);}
        }catch{}
      }

      setItems(prev=>pageNum===1?mixed:[...prev,...farmerPosts]);
      setHasMore(data.has_more); setPage(pageNum);
    }catch(e){console.error(e);}finally{setLoading(false);setInit(true);}
  },[endpoint,loading]);

  useEffect(()=>{setItems([]);setPage(1);setHasMore(true);setInit(false);fetchPage(1);},[endpoint]);

  useEffect(()=>{
    if(!loaderRef.current)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&hasMore&&!loading)fetchPage(page+1);},{rootMargin:"200px"});
    obs.observe(loaderRef.current); return()=>obs.disconnect();
  },[hasMore,loading,page,fetchPage]);

  if(!init)return <div className="ft-spinner"/>;
  if(!items.length)return(
    <div className="ft-empty">
      <div className="ft-empty-icon">{endpoint==="feed"?"🌱":"🎬"}</div>
      <h3>{endpoint==="feed"?"Your feed is empty":"No posts yet"}</h3>
      <p>{endpoint==="feed"?"Follow some farmers to see their content here.":"Be the first to share your farm story!"}</p>
    </div>
  );
  return(
    <>
      <div className="ft-grid">{items.map((item,i)=><AnyCard key={item.id||i} item={item}/>)}</div>
      <div ref={loaderRef} style={{height:60,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {loading&&hasMore&&<div className="ft-spinner" style={{margin:0,width:24,height:24,borderWidth:2}}/>}
        {!hasMore&&items.length>0&&<p style={{color:"var(--ft-muted)",fontSize:13}}>✦ You've seen all posts</p>}
      </div>
    </>
  );
}

/* ── Following feed (no YouTube) ─────────────────────────────── */
function FollowingFeed(){
  const [posts,setPosts]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch(`${API}/api/farmtube/feed?page=1`,{headers:headers()}).then(r=>r.json()).then(d=>setPosts(d.posts||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  if(loading)return <div className="ft-spinner"/>;
  if(!posts.length)return(
    <div className="ft-empty"><div className="ft-empty-icon">🌱</div><h3>Your feed is empty</h3><p>Follow some farmers to see their content here.</p></div>
  );
  return <div className="ft-grid">{posts.map(p=><PostCard key={p.id} post={p}/>)}</div>;
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function FarmTubeHome(){
  const [tab,setTab]=useState("discover"); const [hasChannel,setHasChannel]=useState(false);
  const [q,setQ]=useState(""); const navigate=useNavigate();

  useEffect(()=>{
    fetch(`${API}/api/farmtube/channel/me`,{headers:headers()}).then(r=>r.ok?r.json():null).then(d=>{if(d?.id)setHasChannel(true);}).catch(()=>{});
  },[]);

  const handleSearch=(e)=>{e.preventDefault();if(q.trim())navigate(`/farm-tube/search?q=${encodeURIComponent(q.trim())}`);};

  return(
    <div className="ft-root">
      {/* Nav */}
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>
        <form onSubmit={handleSearch} className="ft-nav-search">
          <span className="ft-nav-search-icon">🔍</span>
          <input className="ft-input" placeholder="Search farmers, crops, tips…" value={q} onChange={e=>setQ(e.target.value)}/>
        </form>
        <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
          {hasChannel&&<Link to="/farm-tube/upload" className="ft-btn ft-btn-primary" style={{fontSize:13,padding:"7px 14px"}}>+ Upload</Link>}
          <Link to="/farm-tube/analytics" className="ft-btn ft-btn-outline" style={{fontSize:13,padding:"7px 12px"}}>📊</Link>
        </div>
      </nav>

      {/* Hero */}
      {tab==="discover"&&(
        <div style={{background:"linear-gradient(135deg,#0f2a1c 0%,#1a3020 60%,#0a1a10 100%)",borderBottom:"1px solid var(--ft-border)",padding:"32px 24px",textAlign:"center"}}>
          <h1 className="ft-display" style={{margin:"0 0 8px",fontSize:"clamp(24px,4vw,40px)"}}>
            <span style={{color:"var(--ft-gold)"}}>Farm</span>Tube Zimbabwe
          </h1>
          <p style={{color:"var(--ft-subtext)",margin:"0 0 20px",fontSize:15,maxWidth:500,marginInline:"auto"}}>
            Watch, learn & share real farming stories from Zimbabwe & across Africa 🌍
          </p>
          {!hasChannel&&(
            <button className="ft-btn ft-btn-primary" onClick={()=>navigate("/farm-tube/create-channel")}>🌱 Start Your Channel</button>
          )}
        </div>
      )}

      <div className="ft-page">
        {/* Tabs */}
        <div className="ft-tabs" style={{marginBottom:20}}>
          {[
            {id:"discover",  label:"🌍 Discover"},
            {id:"trending",  label:"🔥 Trending"},
            {id:"following", label:"🌱 Following"},
            {id:"youtube",   label:"▶ YouTube Africa"},
          ].map(t=>(
            <button key={t.id} className={`ft-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* YouTube info banner */}
        {tab==="youtube"&&(
          <div style={{background:"rgba(255,0,0,0.06)",border:"1px solid rgba(255,85,85,0.2)",borderRadius:"var(--ft-radius-lg)",padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>▶</span>
            <div>
              <p style={{margin:0,fontWeight:600,fontSize:14}}>Agricultural YouTube Videos</p>
              <p style={{margin:"2px 0 0",fontSize:13,color:"var(--ft-subtext)"}}>Curated farming content from Zimbabwe & across Africa. All videos open in FarmTube's built-in player.</p>
            </div>
          </div>
        )}

        {/* Content */}
        {tab==="discover"  && <MixedFeed endpoint="discover"/>}
        {tab==="trending"  && <MixedFeed endpoint="trending"/>}
        {tab==="following" && <FollowingFeed/>}
        {tab==="youtube"   && <YouTubeFeed/>}
      </div>
    </div>
  );
}