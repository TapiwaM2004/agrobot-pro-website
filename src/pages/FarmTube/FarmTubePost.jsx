/**
 * FarmTubePost.jsx (v2) — Report button + YouTube embed + farmer post viewer
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import "./farmtube.css";

const API     = import.meta.env.VITE_API_URL || "";
const headers = () => ({ "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("token")||""}` });
const fmtViews= (n)=>(n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(n||0));
const timeAgo = (d)=>{ const m=Math.floor((Date.now()-new Date(d))/60000); if(m<1)return"just now"; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"}); };

function Avatar({url,name,size="md"}){
  if(url) return <img src={url} alt={name} className={`ft-avatar ft-avatar-${size}`}/>;
  return <div className={`ft-avatar ft-avatar-${size} ft-avatar-fallback`}>{(name||"F").substring(0,2).toUpperCase()}</div>;
}
function useToast(){
  const [msg,setMsg]=useState(""); const [vis,setVis]=useState(false);
  const show=(m)=>{setMsg(m);setVis(true);setTimeout(()=>setVis(false),2800);};
  const Toast=()=><div className={`ft-toast ${vis?"show":""}`}>{msg}</div>;
  return {show,Toast};
}

/* ── Custom video player ─────────────────────────────────── */
function VideoPlayer({url}){
  const ref=useRef(); const [playing,setPlaying]=useState(false); const [muted,setMuted]=useState(false);
  const [prog,setProg]=useState(0); const [dur,setDur]=useState(0);
  const toggle=()=>{if(ref.current.paused){ref.current.play();setPlaying(true);}else{ref.current.pause();setPlaying(false);}};
  const seek=(e)=>{const r=e.currentTarget.getBoundingClientRect();ref.current.currentTime=((e.clientX-r.left)/r.width)*ref.current.duration;};
  const fmtT=(s)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  return(
    <div style={{background:"#000",borderRadius:"var(--ft-radius-lg)",overflow:"hidden",position:"relative",lineHeight:0}}>
      <video ref={ref} src={url} style={{width:"100%",maxHeight:500,display:"block",cursor:"pointer"}} onClick={toggle}
             muted={muted} playsInline onTimeUpdate={()=>{if(ref.current?.duration)setProg((ref.current.currentTime/ref.current.duration)*100);}}
             onLoadedMetadata={()=>setDur(ref.current.duration)} onEnded={()=>setPlaying(false)}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.85))",padding:"28px 14px 12px"}}>
        <div onClick={seek} style={{height:4,background:"rgba(255,255,255,0.25)",borderRadius:2,cursor:"pointer",marginBottom:10,position:"relative"}}>
          <div style={{height:"100%",background:"var(--ft-gold)",borderRadius:2,width:`${prog}%`}}/>
          <div style={{position:"absolute",top:"50%",left:`${prog}%`,transform:"translate(-50%,-50%)",width:12,height:12,borderRadius:"50%",background:"var(--ft-gold)"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={toggle} style={{background:"none",border:"none",color:"#fff",fontSize:20,cursor:"pointer",padding:0}}>{playing?"⏸":"▶"}</button>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontFamily:"var(--ft-font-body)"}}>{fmtT(ref.current?.currentTime||0)} / {fmtT(dur)}</span>
          <button onClick={()=>setMuted(m=>!m)} style={{background:"none",border:"none",color:"#fff",fontSize:16,cursor:"pointer",marginLeft:"auto"}}>{muted?"🔇":"🔊"}</button>
        </div>
      </div>
      {!playing&&<div onClick={toggle} style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        <div style={{background:"rgba(0,0,0,0.55)",borderRadius:"50%",width:64,height:64,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,backdropFilter:"blur(4px)"}}>▶</div>
      </div>}
    </div>
  );
}

/* ── YouTube embed ───────────────────────────────────────── */
function YouTubePlayer({embedUrl,thumbnailUrl,title}){
  const [playing,setPlaying]=useState(false);
  if(!playing) return(
    <div style={{position:"relative",borderRadius:"var(--ft-radius-lg)",overflow:"hidden",cursor:"pointer",lineHeight:0}} onClick={()=>setPlaying(true)}>
      <img src={thumbnailUrl} alt={title} style={{width:"100%",maxHeight:500,objectFit:"cover",display:"block"}}/>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:"rgba(255,0,0,0.9)",borderRadius:12,width:72,height:50,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>▶</div>
      </div>
      <span className="ft-badge" style={{position:"absolute",bottom:10,left:12,background:"rgba(255,0,0,0.85)",color:"#fff",fontSize:11}}>▶ YouTube</span>
    </div>
  );
  return(
    <div style={{borderRadius:"var(--ft-radius-lg)",overflow:"hidden",lineHeight:0,background:"#000"}}>
      <iframe src={embedUrl} width="100%" height="480" style={{display:"block",border:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={title}/>
    </div>
  );
}

/* ── 🚩 Report modal ─────────────────────────────────────── */
function ReportModal({postId,onClose,onReported}){
  const [reason,setReason]=useState(""); const [description,setDescription]=useState("");
  const [reasons,setReasons]=useState([]); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{
    fetch(`${API}/api/farmtube/report-reasons`,{headers:headers()}).then(r=>r.json()).then(d=>setReasons(d.reasons||[])).catch(()=>{});
  },[]);
  const submit=async()=>{
    if(!reason){setError("Please select a reason.");return;}
    setLoading(true);setError("");
    try{
      const fd=new FormData(); fd.append("reason",reason); fd.append("description",description);
      const res=await fetch(`${API}/api/farmtube/post/${postId}/report`,{method:"POST",headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`},body:fd});
      const data=await res.json();
      if(!res.ok) throw new Error(typeof data.detail==="object"?data.detail.message:data.detail||"Report failed");
      onReported(data.message);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"var(--ft-card)",border:"1px solid var(--ft-border)",borderRadius:"var(--ft-radius-lg)",padding:28,width:"100%",maxWidth:420}} onClick={e=>e.stopPropagation()}>
        <h3 className="ft-display" style={{margin:"0 0 4px",fontSize:18}}>🚩 Report Post</h3>
        <p style={{fontSize:13,color:"var(--ft-subtext)",margin:"0 0 20px"}}>Help keep FarmTube a genuine farming community.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {reasons.map(r=>(
            <label key={r.value} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",borderRadius:"var(--ft-radius)",background:reason===r.value?"rgba(200,168,75,0.1)":"var(--ft-surface)",border:`1px solid ${reason===r.value?"var(--ft-gold)":"var(--ft-border)"}`,transition:"var(--ft-transition)"}}>
              <input type="radio" name="reason" value={r.value} checked={reason===r.value} onChange={()=>setReason(r.value)} style={{accentColor:"var(--ft-gold)"}}/>
              <span style={{fontSize:13}}>{r.label}</span>
            </label>
          ))}
        </div>
        <textarea className="ft-textarea" style={{minHeight:68,marginBottom:10}} placeholder="Additional details (optional)…" value={description} onChange={e=>setDescription(e.target.value)} maxLength={500}/>
        {error&&<p style={{color:"var(--ft-danger)",fontSize:13,margin:"0 0 10px"}}>⚠ {error}</p>}
        <div style={{display:"flex",gap:10}}>
          <button className="ft-btn ft-btn-outline" onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</button>
          <button className="ft-btn ft-btn-danger" onClick={submit} disabled={loading||!reason} style={{flex:1,justifyContent:"center"}}>{loading?"Sending…":"🚩 Submit Report"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Comment ─────────────────────────────────────────────── */
function CommentItem({comment}){
  return(
    <div style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid var(--ft-border)"}}>
      <Avatar url={comment.avatar_url} name={comment.username} size="sm"/>
      <div>
        <p style={{margin:"0 0 3px"}}><span style={{fontWeight:600,fontSize:13}}>{comment.username||"Farmer"}</span><span style={{fontSize:11,color:"var(--ft-muted)",marginLeft:8}}>{timeAgo(comment.created_at)}</span></p>
        <p style={{margin:0,fontSize:14,lineHeight:1.5}}>{comment.content}</p>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function FarmTubePost(){
  const {postId}=useParams(); const navigate=useNavigate(); const location=useLocation();
  const {show,Toast}=useToast();
  const isYouTube=postId?.startsWith("yt_");
  const [post,setPost]=useState(null); const [comments,setComments]=useState([]);
  const [loading,setLoading]=useState(true); const [likeLoading,setLikeLoading]=useState(false);
  const [followLoading,setFollowLoading]=useState(false); const [newComment,setNewComment]=useState("");
  const [posting,setPosting]=useState(false); const [showReport,setShowReport]=useState(false); const [reported,setReported]=useState(false);

  useEffect(()=>{
    if(isYouTube){ const state=location.state; if(state?.youtube_id){setPost(state);setLoading(false);}else navigate("/farm-tube"); return; }
    setLoading(true);
    fetch(`${API}/api/farmtube/post/${postId}`,{headers:headers()}).then(r=>r.json()).then(d=>setPost(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[postId]);

  useEffect(()=>{
    if(!postId||isYouTube) return;
    fetch(`${API}/api/farmtube/post/${postId}/comments?page=1`,{headers:headers()}).then(r=>r.json()).then(d=>setComments(d.comments||[])).catch(()=>{});
  },[postId]);

  const handleLike=async()=>{
    if(isYouTube){show("Open on YouTube to like this video.");return;}
    setLikeLoading(true);
    try{ const res=await fetch(`${API}/api/farmtube/post/${post.id}/like`,{method:"POST",headers:headers()}); const data=await res.json(); setPost(p=>({...p,is_liked:data.active,like_count:data.count})); show(data.message); }
    catch{show("Error");}finally{setLikeLoading(false);}
  };
  const handleFollow=async()=>{
    if(!post?.channel)return; setFollowLoading(true);
    try{ const res=await fetch(`${API}/api/farmtube/channel/${post.channel.id}/follow`,{method:"POST",headers:headers()}); const data=await res.json(); setPost(p=>({...p,channel:{...p.channel,is_following:data.active,follower_count:data.count}})); show(data.message); }
    catch{show("Error");}finally{setFollowLoading(false);}
  };
  const handleComment=async()=>{
    if(!newComment.trim())return; setPosting(true);
    try{ const res=await fetch(`${API}/api/farmtube/post/${post.id}/comment`,{method:"POST",headers:headers(),body:JSON.stringify({content:newComment.trim()})}); const data=await res.json(); if(!res.ok)throw new Error(data.detail); setComments(p=>[data,...p]); setPost(p=>({...p,comment_count:p.comment_count+1})); setNewComment(""); }
    catch(e){show(e.message||"Failed");}finally{setPosting(false);}
  };

  if(loading) return <div className="ft-root" style={{minHeight:"100vh"}}><div className="ft-spinner"/></div>;
  if(!post) return(
    <div className="ft-root" style={{minHeight:"100vh"}}>
      <div className="ft-empty"><div className="ft-empty-icon">🔍</div><h3>Post not found</h3>
        <Link to="/farm-tube" className="ft-btn ft-btn-outline" style={{marginTop:16}}>← FarmTube</Link>
      </div>
    </div>
  );

  const ch=post.channel;
  const tags=post.tags?post.tags.split(",").map(t=>t.trim()).filter(Boolean):[];

  return(
    <div className="ft-root">
      <nav className="ft-nav">
        <Link to="/farm-tube" className="ft-logo">🌾 FarmTube</Link>
        {isYouTube&&<span className="ft-badge" style={{background:"rgba(255,0,0,0.15)",color:"#ff5555",marginLeft:8}}>▶ YouTube</span>}
        <button className="ft-btn ft-btn-ghost" onClick={()=>navigate(-1)} style={{marginLeft:"auto"}}>← Back</button>
      </nav>

      <div className="ft-page" style={{maxWidth:960}}>
        <div style={{display:"flex",gap:28,alignItems:"flex-start",flexWrap:"wrap"}}>

          {/* Left */}
          <div style={{flex:"1 1 560px",minWidth:0}}>
            {isYouTube
              ?<YouTubePlayer embedUrl={post.embed_url} thumbnailUrl={post.thumbnail_url} title={post.title}/>
              :post.media_type==="video"
                ?<VideoPlayer url={post.media_url}/>
                :<img src={post.media_url} alt={post.title} style={{width:"100%",borderRadius:"var(--ft-radius-lg)",display:"block",maxHeight:520,objectFit:"contain",background:"#000"}}/>
            }

            <div style={{marginTop:18}}>
              <h1 className="ft-display" style={{margin:"0 0 8px",fontSize:"clamp(18px,3vw,26px)",lineHeight:1.2}}>{post.title}</h1>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:14}}>
                <span style={{fontSize:13,color:"var(--ft-subtext)"}}>{fmtViews(post.views)} views · {timeAgo(post.created_at)}</span>
                {tags.map(t=>(<span key={t} onClick={()=>navigate(`/farm-tube/search?q=${t}`)} style={{background:"var(--ft-surface)",border:"1px solid var(--ft-border)",borderRadius:50,padding:"3px 10px",fontSize:12,color:"var(--ft-subtext)",cursor:"pointer"}}>#{t}</span>))}
              </div>

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
                <button className={`ft-btn ${post.is_liked?"ft-btn-primary":"ft-btn-outline"}`} onClick={handleLike} disabled={likeLoading}>{post.is_liked?"❤️":"🤍"} {post.like_count||0} Like{post.like_count!==1?"s":""}</button>
                <button className="ft-btn ft-btn-outline" onClick={()=>{navigator.clipboard?.writeText(window.location.href);show("Link copied!");}}>🔗 Share</button>
                {!isYouTube&&!reported&&<button className="ft-btn ft-btn-ghost" style={{color:"var(--ft-danger)",opacity:0.75}} onClick={()=>setShowReport(true)}>🚩 Report</button>}
                {reported&&<span style={{fontSize:13,color:"var(--ft-muted)",display:"flex",alignItems:"center"}}>✓ Reported</span>}
                {isYouTube&&<a href={post.media_url} target="_blank" rel="noopener noreferrer" className="ft-btn ft-btn-outline" style={{color:"#ff5555",borderColor:"rgba(255,85,85,0.3)"}}>↗ Open on YouTube</a>}
              </div>

              {post.description&&<div style={{background:"var(--ft-surface)",border:"1px solid var(--ft-border)",borderRadius:"var(--ft-radius)",padding:"14px 16px",fontSize:14,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{post.description}</div>}

              {isYouTube&&post.channel_url&&(
                <div style={{marginTop:14,padding:"14px 16px",background:"rgba(255,0,0,0.06)",border:"1px solid rgba(255,85,85,0.2)",borderRadius:"var(--ft-radius)",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>📺</span>
                  <div><p style={{margin:0,fontSize:13,fontWeight:600}}>{post.channel_name}</p><p style={{margin:"2px 0 0",fontSize:12,color:"var(--ft-subtext)"}}>YouTube Channel</p></div>
                  <a href={post.channel_url} target="_blank" rel="noopener noreferrer" className="ft-btn ft-btn-outline" style={{marginLeft:"auto",fontSize:12,padding:"6px 12px"}}>View →</a>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{flex:"1 1 280px",minWidth:260}}>
            {ch&&!isYouTube&&(
              <div style={{background:"var(--ft-surface)",border:"1px solid var(--ft-border)",borderRadius:"var(--ft-radius-lg)",padding:18,marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{cursor:"pointer"}} onClick={()=>navigate(`/farm-tube/channel/${ch.id}`)}><Avatar url={ch.avatar_url} name={ch.channel_name} size="lg"/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:"0 0 2px",fontWeight:700,fontSize:15,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={()=>navigate(`/farm-tube/channel/${ch.id}`)}>
                      {ch.channel_name}{ch.is_verified&&<span className="ft-verified" style={{marginLeft:4}}>✦</span>}
                    </p>
                    <p style={{margin:0,fontSize:12,color:"var(--ft-subtext)"}}>{fmtViews(ch.follower_count)} followers</p>
                    {ch.farm_type&&<span className="ft-badge ft-badge-green" style={{marginTop:4}}>🌱 {ch.farm_type}</span>}
                  </div>
                </div>
                {ch.bio&&<p style={{fontSize:13,color:"var(--ft-subtext)",margin:"0 0 14px",lineHeight:1.5}}>{ch.bio}</p>}
                <button className={`ft-btn ${ch.is_following?"ft-btn-outline":"ft-btn-primary"}`} style={{width:"100%",justifyContent:"center"}} onClick={handleFollow} disabled={followLoading}>
                  {followLoading?"…":ch.is_following?"✓ Following":"+ Follow Channel"}
                </button>
              </div>
            )}

            {!isYouTube&&(
              <div style={{background:"var(--ft-surface)",border:"1px solid var(--ft-border)",borderRadius:"var(--ft-radius-lg)",padding:18}}>
                <p className="ft-label" style={{margin:"0 0 14px"}}>💬 Comments ({post.comment_count||0})</p>
                <div style={{marginBottom:16}}>
                  <textarea className="ft-textarea" style={{minHeight:68,marginBottom:8}} placeholder="Share your thoughts…" value={newComment} onChange={e=>setNewComment(e.target.value)}/>
                  <button className="ft-btn ft-btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={handleComment} disabled={posting||!newComment.trim()}>{posting?"Posting…":"Post Comment"}</button>
                </div>
                <div style={{maxHeight:400,overflowY:"auto"}}>
                  {comments.length===0
                    ?<p style={{fontSize:13,color:"var(--ft-muted)",textAlign:"center",padding:"20px 0"}}>No comments yet. Be the first!</p>
                    :comments.map(c=><CommentItem key={c.id} comment={c}/>)
                  }
                </div>
              </div>
            )}

            {isYouTube&&(
              <div style={{background:"var(--ft-surface)",border:"1px solid var(--ft-border)",borderRadius:"var(--ft-radius-lg)",padding:18,textAlign:"center"}}>
                <p style={{fontSize:32,margin:"0 0 10px"}}>💬</p>
                <p style={{fontSize:14,color:"var(--ft-subtext)",margin:"0 0 14px"}}>Comments for this video are on YouTube.</p>
                <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="ft-btn ft-btn-outline" style={{justifyContent:"center",width:"100%"}}>Comment on YouTube ↗</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport&&<ReportModal postId={post.id} onClose={()=>setShowReport(false)} onReported={(msg)=>{setShowReport(false);setReported(true);show(msg);}}/>}
      <Toast/>
    </div>
  );
}