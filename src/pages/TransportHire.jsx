/**
 * TransportHire.jsx
 * Farming Transport & Equipment Hire Platform
 * Routes:
 *   /transport          — Browse listings
 *   /transport/post     — Post your vehicle/machine
 *   /transport/:id      — Single listing view + book
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});
const phone = () => localStorage.getItem("phone") || "";

const TYPES = {
  truck:     { label: "Truck / Lorry",          icon: "🚛" },
  tractor:   { label: "Tractor",                icon: "🚜" },
  harvester: { label: "Combine Harvester",       icon: "🌾" },
  planter:   { label: "Planter / Seeder",        icon: "🌱" },
  sprayer:   { label: "Sprayer",                 icon: "💧" },
  baler:     { label: "Baler / Wrapper",         icon: "📦" },
  generator: { label: "Generator / Pump",        icon: "⚡" },
  grader:    { label: "Grader / Leveller",       icon: "🏗️" },
  other:     { label: "Other Farm Equipment",    icon: "🔧" },
};

function useToast() {
  const [msg, setMsg] = useState(""); const [vis, setVis] = useState(false);
  const show = (m) => { setMsg(m); setVis(true); setTimeout(() => setVis(false), 3000); };
  const Toast = () => (
    <div style={{
      position:"fixed",bottom:24,left:"50%",transform:`translateX(-50%) translateY(${vis?0:80}px)`,
      background:"#1a3020",border:"1px solid #2d5a38",borderRadius:50,padding:"10px 20px",
      fontSize:14,fontWeight:500,color:"#e4ede6",boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
      zIndex:9999,opacity:vis?1:0,transition:"0.3s ease",whiteSpace:"nowrap",
    }}>{msg}</div>
  );
  return { show, Toast };
}

// ── Transport Card ──────────────────────────────────────────────
function TransportCard({ listing, onClick }) {
  const info = TYPES[listing.type] || TYPES.other;
  return (
    <div onClick={onClick} style={{
      background:"#162b1e",border:"1px solid #223629",borderRadius:12,overflow:"hidden",
      cursor:"pointer",transition:"0.18s ease",
    }}
    onMouseOver={e=>e.currentTarget.style.borderColor="#2d7347"}
    onMouseOut={e=>e.currentTarget.style.borderColor="#223629"}>

      {/* Image or icon */}
      <div style={{
        height:160,background:"#0f2018",display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",overflow:"hidden",
      }}>
        {listing.image_url
          ? <img src={listing.image_url} alt={listing.title}
                 style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:56}}>{info.icon}</span>
        }
        <span style={{
          position:"absolute",top:10,left:10,background:"rgba(200,168,75,0.9)",
          borderRadius:50,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#0a1a10",
        }}>
          {info.icon} {info.label}
        </span>
        {!listing.available && (
          <div style={{
            position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <span style={{color:"#ff6b6b",fontWeight:700,fontSize:16}}>Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{padding:"14px 16px"}}>
        <h3 style={{margin:"0 0 6px",fontSize:15,fontWeight:700,color:"#e4ede6",lineHeight:1.3}}>
          {listing.title}
        </h3>
        <p style={{margin:"0 0 4px",fontSize:13,color:"#6e9476"}}>
          📍 {listing.location}
        </p>
        {listing.capacity && (
          <p style={{margin:"0 0 4px",fontSize:12,color:"#6e9476"}}>
            ⚙️ {listing.capacity}
          </p>
        )}
        {listing.routes && (
          <p style={{margin:"0 0 8px",fontSize:12,color:"#6e9476"}}>
            🗺️ {listing.routes}
          </p>
        )}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {listing.price_per_km && (
            <span style={{background:"rgba(69,176,106,0.12)",color:"#45b06a",
                          borderRadius:50,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              ${listing.price_per_km}/km
            </span>
          )}
          {listing.price_per_day && (
            <span style={{background:"rgba(200,168,75,0.12)",color:"#c8a84b",
                          borderRadius:50,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              ${listing.price_per_day}/day
            </span>
          )}
          {(!listing.price_per_km && !listing.price_per_day) && (
            <span style={{background:"rgba(200,168,75,0.12)",color:"#c8a84b",
                          borderRadius:50,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              {listing.price_note || "Negotiable"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Browse Listings ─────────────────────────────────────────────
function TransportBrowse() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("");
  const [search,   setSearch]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/transport?limit=50`, { headers: headers() })
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l =>
    (filter ? l.type === filter : true) &&
    (search ? l.title.toLowerCase().includes(search.toLowerCase()) ||
              l.location.toLowerCase().includes(search.toLowerCase()) : true)
  );

  return (
    <div style={{background:"#07120c",minHeight:"100vh",color:"#e4ede6",fontFamily:"DM Sans,system-ui,sans-serif"}}>
      {/* Nav */}
      <nav style={{
        position:"sticky",top:0,zIndex:100,background:"rgba(7,18,12,0.9)",
        backdropFilter:"blur(16px)",borderBottom:"1px solid #223629",
        padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:16,
      }}>
        <Link to="/" style={{fontFamily:"Fraunces,serif",fontSize:18,fontWeight:700,
                              color:"#c8a84b",textDecoration:"none"}}>
          🌾 AgroBot
        </Link>
        <span style={{color:"#3f5c45"}}>›</span>
        <span style={{fontSize:15,fontWeight:600}}>🚛 Transport Hire</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Link to="/transport/post" style={{
            background:"#c8a84b",color:"#0a1a10",borderRadius:50,padding:"7px 16px",
            fontSize:13,fontWeight:600,textDecoration:"none",
          }}>
            + Post Listing
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background:"linear-gradient(135deg,#0f2a1c,#1a3020,#0a1a10)",
        borderBottom:"1px solid #223629",padding:"32px 24px",textAlign:"center",
      }}>
        <h1 style={{margin:"0 0 8px",fontSize:"clamp(22px,4vw,36px)",
                    fontFamily:"Fraunces,serif",fontWeight:700}}>
          🚛 <span style={{color:"#c8a84b"}}>Transport</span> & Equipment Hire
        </h1>
        <p style={{color:"#6e9476",margin:"0 0 20px",fontSize:15,maxWidth:500,marginInline:"auto"}}>
          Hire trucks, tractors, harvesters and farming equipment from fellow farmers across Zimbabwe
        </p>

        {/* Search */}
        <div style={{maxWidth:400,margin:"0 auto",position:"relative"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",
                        color:"#6e9476",fontSize:16}}>🔍</span>
          <input
            style={{
              width:"100%",background:"#112318",border:"1.5px solid #223629",
              borderRadius:50,color:"#e4ede6",fontSize:14,padding:"10px 14px 10px 40px",
              boxSizing:"border-box",outline:"none",fontFamily:"DM Sans,system-ui,sans-serif",
            }}
            placeholder="Search by vehicle, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>
        {/* Type filter pills */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
          <button onClick={() => setFilter("")}
                  style={{
                    borderRadius:50,padding:"7px 16px",fontSize:13,fontWeight:600,
                    cursor:"pointer",border:"1.5px solid",fontFamily:"DM Sans,system-ui,sans-serif",
                    background: filter==="" ? "#c8a84b" : "transparent",
                    color:      filter==="" ? "#0a1a10"  : "#6e9476",
                    borderColor:filter==="" ? "#c8a84b"  : "#223629",
                  }}>
            All Types
          </button>
          {Object.entries(TYPES).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(key)}
                    style={{
                      borderRadius:50,padding:"7px 14px",fontSize:13,fontWeight:600,
                      cursor:"pointer",border:"1.5px solid",fontFamily:"DM Sans,system-ui,sans-serif",
                      background: filter===key ? "#c8a84b"  : "transparent",
                      color:      filter===key ? "#0a1a10"  : "#6e9476",
                      borderColor:filter===key ? "#c8a84b"  : "#223629",
                    }}>
              {val.icon} {val.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"80px 20px",color:"#6e9476"}}>
            <div style={{
              width:36,height:36,border:"3px solid #223629",borderTopColor:"#c8a84b",
              borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto 16px",
            }}/>
            Loading transport listings…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 20px",color:"#6e9476"}}>
            <div style={{fontSize:52,marginBottom:16}}>🚛</div>
            <h3 style={{fontFamily:"Fraunces,serif",margin:"0 0 8px",color:"#e4ede6"}}>
              {search || filter ? "No listings match your search" : "No listings yet"}
            </h3>
            <p style={{margin:"0 0 20px",fontSize:14}}>
              Be the first to list your truck or farming equipment!
            </p>
            <Link to="/transport/post" style={{
              background:"#c8a84b",color:"#0a1a10",borderRadius:50,padding:"10px 24px",
              fontSize:14,fontWeight:600,textDecoration:"none",
            }}>
              + Post Your Vehicle
            </Link>
          </div>
        ) : (
          <>
            <p style={{color:"#6e9476",fontSize:13,marginBottom:16}}>
              {filtered.length} listing{filtered.length!==1?"s":""} available
            </p>
            <div style={{
              display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18,
            }}>
              {filtered.map(l => (
                <TransportCard key={l.id} listing={l}
                               onClick={() => navigate(`/transport/${l.id}`)}/>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Single Listing + Book ───────────────────────────────────────
function TransportListing() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { show, Toast } = useToast();
  const [listing,  setListing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name:"", phone_num:"", hire_date:"", duration:"", pickup:"", destination:"", message:""
  });

  useEffect(() => {
    fetch(`${API}/api/transport/${id}`, { headers: headers() })
      .then(r => r.json())
      .then(d => setListing(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!form.phone_num) { show("⚠️ Your phone number is required"); return; }
    setBooking(true);
    try {
      const res  = await fetch(`${API}/api/transport/${id}/book`, {
        method:"POST", headers: headers(),
        body: JSON.stringify({
          phone:       form.phone_num,
          name:        form.name || `Farmer ${form.phone_num.slice(-4)}`,
          hire_date:   form.hire_date,
          duration:    form.duration,
          pickup:      form.pickup,
          destination: form.destination,
          message:     form.message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        show("✅ Hire request sent! Owner will contact you via WhatsApp.");
        setShowForm(false);
      } else {
        show("⚠️ " + (data.error || "Request failed"));
      }
    } catch { show("Error sending request. Try again."); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div style={{background:"#07120c",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#6e9476",fontSize:16}}>Loading…</div>
    </div>
  );

  if (!listing || listing.error) return (
    <div style={{background:"#07120c",minHeight:"100vh",display:"flex",alignItems:"center",
                 justifyContent:"center",flexDirection:"column",gap:16,color:"#6e9476"}}>
      <div style={{fontSize:48}}>🔍</div>
      <p>Listing not found.</p>
      <Link to="/transport" style={{color:"#c8a84b"}}>← Back to Transport</Link>
    </div>
  );

  const info = TYPES[listing.type] || TYPES.other;

  return (
    <div style={{background:"#07120c",minHeight:"100vh",color:"#e4ede6",fontFamily:"DM Sans,system-ui,sans-serif"}}>
      <nav style={{
        position:"sticky",top:0,zIndex:100,background:"rgba(7,18,12,0.9)",
        backdropFilter:"blur(16px)",borderBottom:"1px solid #223629",
        padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:16,
      }}>
        <Link to="/" style={{fontFamily:"Fraunces,serif",fontSize:18,fontWeight:700,color:"#c8a84b",textDecoration:"none"}}>
          🌾 AgroBot
        </Link>
        <span style={{color:"#3f5c45"}}>›</span>
        <Link to="/transport" style={{color:"#6e9476",textDecoration:"none",fontSize:14}}>Transport Hire</Link>
        <button onClick={() => navigate(-1)} style={{
          marginLeft:"auto",background:"transparent",border:"1.5px solid #223629",
          color:"#6e9476",borderRadius:50,padding:"6px 14px",cursor:"pointer",fontSize:13,
          fontFamily:"DM Sans,system-ui,sans-serif",
        }}>← Back</button>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start"}}>

          {/* Left — image + details */}
          <div style={{flex:"1 1 480px",minWidth:0}}>
            <div style={{
              borderRadius:14,overflow:"hidden",background:"#0f2018",
              height:300,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,
            }}>
              {listing.image_url
                ? <img src={listing.image_url} alt={listing.title}
                       style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:80}}>{info.icon}</span>
              }
            </div>

            <span style={{
              background:"rgba(200,168,75,0.15)",color:"#c8a84b",
              borderRadius:50,padding:"4px 14px",fontSize:12,fontWeight:600,marginBottom:12,display:"inline-block",
            }}>
              {info.icon} {info.label}
            </span>

            <h1 style={{margin:"10px 0 8px",fontFamily:"Fraunces,serif",fontSize:"clamp(20px,3vw,28px)"}}>
              {listing.title}
            </h1>

            {listing.description && (
              <p style={{color:"#6e9476",lineHeight:1.6,fontSize:14,margin:"0 0 16px"}}>
                {listing.description}
              </p>
            )}

            {/* Specs */}
            <div style={{
              background:"#112318",border:"1px solid #223629",borderRadius:12,
              padding:"16px 18px",display:"flex",flexWrap:"wrap",gap:16,marginBottom:16,
            }}>
              {[
                { label:"📍 Location",  val: listing.location },
                { label:"⚙️ Capacity",  val: listing.capacity },
                { label:"🗺️ Routes",    val: listing.routes },
                { label:"💰 Per km",    val: listing.price_per_km ? `$${listing.price_per_km}` : null },
                { label:"💰 Per day",   val: listing.price_per_day ? `$${listing.price_per_day}` : null },
                { label:"💬 Price note",val: listing.price_note },
                { label:"👁️ Views",    val: listing.views || 0 },
              ].filter(s => s.val).map(s => (
                <div key={s.label} style={{minWidth:120}}>
                  <p style={{margin:"0 0 2px",fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</p>
                  <p style={{margin:0,fontSize:14,fontWeight:600,color:"#e4ede6"}}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact + book */}
          <div style={{flex:"1 1 260px",minWidth:240}}>
            <div style={{
              background:"#112318",border:"1px solid #223629",borderRadius:14,
              padding:22,marginBottom:16,
            }}>
              <p style={{
                margin:"0 0 14px",fontSize:11,color:"#3f5c45",
                textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,
              }}>Contact Owner Directly</p>

              <a href={`tel:${listing.contact_phone}`} style={{
                display:"flex",alignItems:"center",gap:10,background:"#1a3020",
                borderRadius:10,padding:"12px 14px",textDecoration:"none",marginBottom:10,
              }}>
                <span style={{fontSize:20}}>📞</span>
                <div>
                  <p style={{margin:0,fontSize:13,fontWeight:700,color:"#e4ede6"}}>{listing.contact_phone}</p>
                  <p style={{margin:0,fontSize:11,color:"#6e9476"}}>Call or WhatsApp</p>
                </div>
              </a>

              {listing.whatsapp && (
                <a href={`https://wa.me/${listing.whatsapp.replace(/\D/g,"")}?text=Hi! I saw your ${listing.title} on AgroBot Transport Hire.`}
                   target="_blank" rel="noopener noreferrer" style={{
                     display:"flex",alignItems:"center",gap:10,background:"rgba(37,211,102,0.1)",
                     border:"1px solid rgba(37,211,102,0.2)",borderRadius:10,padding:"12px 14px",
                     textDecoration:"none",marginBottom:10,
                   }}>
                  <span style={{fontSize:20}}>💬</span>
                  <div>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:"#25d366"}}>WhatsApp Owner</p>
                    <p style={{margin:0,fontSize:11,color:"#6e9476"}}>Fastest response</p>
                  </div>
                </a>
              )}

              <p style={{
                margin:"14px 0 8px",fontSize:11,color:"#3f5c45",
                textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,
              }}>Or Send Hire Request</p>

              {!showForm ? (
                <button
                  disabled={!listing.available}
                  onClick={() => setShowForm(true)}
                  style={{
                    width:"100%",padding:"12px 0",borderRadius:50,
                    background: listing.available ? "#c8a84b" : "#3f5c45",
                    color: listing.available ? "#0a1a10" : "#6e9476",
                    border:"none",fontSize:15,fontWeight:700,cursor: listing.available ? "pointer" : "not-allowed",
                    fontFamily:"DM Sans,system-ui,sans-serif",
                  }}>
                  {listing.available ? "📋 Send Hire Request" : "Currently Unavailable"}
                </button>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    { key:"name",        label:"Your Name",         ph:"John Moyo",          type:"text" },
                    { key:"phone_num",   label:"Your Phone *",      ph:"0772 123 456",       type:"tel" },
                    { key:"hire_date",   label:"Hire Date",         ph:"15 Jan 2026",        type:"text" },
                    { key:"duration",    label:"Duration",          ph:"1 day / 3 trips",    type:"text" },
                    { key:"pickup",      label:"Pickup Location",   ph:"Marondera Farm",     type:"text" },
                    { key:"destination", label:"Destination",       ph:"Mbare Market, Harare","type":"text" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.ph}
                        value={form[f.key]}
                        onChange={e => setForm(prev => ({...prev,[f.key]:e.target.value}))}
                        style={{
                          width:"100%",background:"#1a3020",border:"1.5px solid #223629",
                          borderRadius:8,color:"#e4ede6",fontSize:13,padding:"9px 12px",
                          boxSizing:"border-box",outline:"none",fontFamily:"DM Sans,system-ui,sans-serif",
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:4}}>
                      Message (optional)
                    </label>
                    <textarea
                      placeholder="Any extra details for the owner…"
                      value={form.message}
                      onChange={e => setForm(prev => ({...prev,message:e.target.value}))}
                      style={{
                        width:"100%",background:"#1a3020",border:"1.5px solid #223629",
                        borderRadius:8,color:"#e4ede6",fontSize:13,padding:"9px 12px",
                        boxSizing:"border-box",outline:"none",resize:"vertical",minHeight:72,
                        fontFamily:"DM Sans,system-ui,sans-serif",
                      }}
                    />
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={() => setShowForm(false)} style={{
                      flex:1,padding:"10px 0",borderRadius:50,background:"transparent",
                      border:"1.5px solid #223629",color:"#6e9476",fontSize:13,cursor:"pointer",
                      fontFamily:"DM Sans,system-ui,sans-serif",
                    }}>Cancel</button>
                    <button onClick={handleBook} disabled={booking} style={{
                      flex:2,padding:"10px 0",borderRadius:50,background:"#c8a84b",
                      border:"none",color:"#0a1a10",fontSize:14,fontWeight:700,
                      cursor:booking?"not-allowed":"pointer",fontFamily:"DM Sans,system-ui,sans-serif",
                    }}>
                      {booking ? "Sending…" : "🚛 Send Request"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              background:"rgba(200,168,75,0.06)",border:"1px solid rgba(200,168,75,0.2)",
              borderRadius:12,padding:"14px 16px",fontSize:13,color:"#c8a84b",lineHeight:1.6,
            }}>
              💡 <strong>Tip:</strong> WhatsApp the owner directly for the fastest response. Agree on price and terms before the hire date.
            </div>
          </div>
        </div>
      </div>

      <Toast/>
    </div>
  );
}

// ── Post a Listing ──────────────────────────────────────────────
function TransportPost() {
  const navigate = useNavigate();
  const { show, Toast } = useToast();
  const [form, setForm] = useState({
    type:"truck", title:"", description:"", capacity:"", location:"",
    routes:"Nationwide", price_per_km:"", price_per_day:"", price_note:"Negotiable",
    contact_phone:"", whatsapp:"", available:true,
  });
  const [imgFile,    setImgFile]    = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const set = (k, v) => setForm(f => ({...f,[k]:v}));

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { show("⚠️ Image must be under 10 MB"); return; }
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!form.title || !form.location || !form.contact_phone) {
      show("⚠️ Title, location and contact phone are required"); return;
    }

    setSubmitting(true);
    let image_url = "";

    // Upload image first if provided
    if (imgFile) {
      setUploading(true);
      try {
        const reader = new FileReader();
        const b64    = await new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(imgFile);
        });
        const res    = await fetch(`${API}/api/transport/upload-image`, {
          method:"POST", headers: headers(),
          body: JSON.stringify({ image_base64: b64 }),
        });
        const data   = await res.json();
        image_url    = data.image_url || "";
      } catch { show("⚠️ Image upload failed — posting without photo"); }
      finally { setUploading(false); }
    }

    try {
      const res  = await fetch(`${API}/api/transport/post`, {
        method:"POST", headers: headers(),
        body: JSON.stringify({
          ...form,
          phone:     localStorage.getItem("phone") || form.contact_phone,
          image_url,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        show("✅ Listing posted successfully!");
        setTimeout(() => navigate(`/transport/${data.id}`), 1000);
      } else {
        show("⚠️ " + (data.error || "Post failed"));
      }
    } catch { show("Error posting listing. Try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{background:"#07120c",minHeight:"100vh",color:"#e4ede6",fontFamily:"DM Sans,system-ui,sans-serif"}}>
      <nav style={{
        position:"sticky",top:0,zIndex:100,background:"rgba(7,18,12,0.9)",
        backdropFilter:"blur(16px)",borderBottom:"1px solid #223629",
        padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:16,
      }}>
        <Link to="/" style={{fontFamily:"Fraunces,serif",fontSize:18,fontWeight:700,color:"#c8a84b",textDecoration:"none"}}>🌾 AgroBot</Link>
        <span style={{color:"#3f5c45"}}>›</span>
        <Link to="/transport" style={{color:"#6e9476",textDecoration:"none",fontSize:14}}>Transport Hire</Link>
        <button onClick={() => navigate(-1)} style={{
          marginLeft:"auto",background:"transparent",border:"1.5px solid #223629",
          color:"#6e9476",borderRadius:50,padding:"6px 14px",cursor:"pointer",fontSize:13,
          fontFamily:"DM Sans,system-ui,sans-serif",
        }}>✕ Cancel</button>
      </nav>

      <div style={{maxWidth:680,margin:"0 auto",padding:"28px 20px"}}>
        <h1 style={{margin:"0 0 6px",fontFamily:"Fraunces,serif",fontSize:26}}>
          Post Transport / Equipment
        </h1>
        <p style={{color:"#6e9476",margin:"0 0 28px",fontSize:14}}>
          List your truck or farming machine for hire. Farmers across Zimbabwe will find you. 🚛
        </p>

        {/* Vehicle type */}
        <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>
          Equipment Type *
        </label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:20}}>
          {Object.entries(TYPES).map(([key,val]) => (
            <button key={key} onClick={() => set("type",key)} style={{
              padding:"10px 8px",borderRadius:10,cursor:"pointer",textAlign:"center",
              border:"1.5px solid",fontFamily:"DM Sans,system-ui,sans-serif",fontSize:12,fontWeight:600,
              background: form.type===key ? "rgba(200,168,75,0.15)" : "transparent",
              color:      form.type===key ? "#c8a84b" : "#6e9476",
              borderColor:form.type===key ? "#c8a84b" : "#223629",
              transition:"0.15s ease",
            }}>
              <div style={{fontSize:24,marginBottom:4}}>{val.icon}</div>
              {val.label}
            </button>
          ))}
        </div>

        {/* Photo upload */}
        <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>
          📸 Vehicle / Machine Photo
        </label>
        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border:"2px dashed #223629",borderRadius:12,padding:"40px 20px",
              textAlign:"center",cursor:"pointer",marginBottom:20,color:"#3f5c45",
              transition:"0.15s ease",
            }}
            onMouseOver={e=>e.currentTarget.style.borderColor="#c8a84b"}
            onMouseOut={e=>e.currentTarget.style.borderColor="#223629"}>
            <div style={{fontSize:36,marginBottom:8}}>📷</div>
            <p style={{margin:"0 0 4px",fontSize:14,fontWeight:600,color:"#6e9476"}}>Upload a photo</p>
            <p style={{margin:0,fontSize:12}}>JPG, PNG, WebP — up to 10 MB</p>
            <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
                   onChange={e => handleImage(e.target.files[0])}/>
          </div>
        ) : (
          <div style={{marginBottom:20,position:"relative"}}>
            <img src={preview} alt="preview" style={{
              width:"100%",borderRadius:12,maxHeight:220,objectFit:"cover",display:"block",
            }}/>
            <button onClick={() => { setPreview(null); setImgFile(null); }} style={{
              position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.65)",
              border:"none",color:"#fff",borderRadius:50,width:30,height:30,cursor:"pointer",
              fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",
            }}>✕</button>
          </div>
        )}

        {/* Form fields */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[
            { k:"title",         label:"Listing Title *",      ph:"e.g. 10-Tonne Isuzu Truck" },
            { k:"capacity",      label:"Capacity / Power",     ph:"e.g. 10 tonnes | 75HP" },
            { k:"location",      label:"Based In (Location) *",ph:"e.g. Harare, Marondera" },
            { k:"routes",        label:"Routes / Coverage",    ph:"e.g. Harare–Bulawayo, Nationwide" },
            { k:"price_per_km",  label:"Price per km (USD)",   ph:"e.g. 0.50" },
            { k:"price_per_day", label:"Price per day (USD)",  ph:"e.g. 120" },
            { k:"price_note",    label:"Price Note",           ph:"e.g. Negotiable, includes driver" },
            { k:"contact_phone", label:"Contact Phone *",      ph:"e.g. 0772 123 456" },
            { k:"whatsapp",      label:"WhatsApp Number",      ph:"e.g. 0772 123 456" },
          ].map(f => (
            <div key={f.k}>
              <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>
                {f.label}
              </label>
              <input
                placeholder={f.ph}
                value={form[f.k]}
                onChange={e => set(f.k, e.target.value)}
                style={{
                  width:"100%",background:"#112318",border:"1.5px solid #223629",
                  borderRadius:8,color:"#e4ede6",fontSize:14,padding:"10px 14px",
                  boxSizing:"border-box",outline:"none",fontFamily:"DM Sans,system-ui,sans-serif",
                  transition:"0.15s ease",
                }}
                onFocus={e=>e.target.style.borderColor="#c8a84b"}
                onBlur={e=>e.target.style.borderColor="#223629"}
              />
            </div>
          ))}
          <div>
            <label style={{fontSize:11,color:"#3f5c45",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>
              Description
            </label>
            <textarea
              placeholder="Describe your vehicle/equipment: year, condition, features, what it can do…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              style={{
                width:"100%",background:"#112318",border:"1.5px solid #223629",
                borderRadius:8,color:"#e4ede6",fontSize:14,padding:"10px 14px",
                boxSizing:"border-box",outline:"none",resize:"vertical",minHeight:90,
                fontFamily:"DM Sans,system-ui,sans-serif",
              }}
              onFocus={e=>e.target.style.borderColor="#c8a84b"}
              onBlur={e=>e.target.style.borderColor="#223629"}
            />
          </div>

          {/* Availability toggle */}
          <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
            <input type="checkbox" checked={form.available}
                   onChange={e => set("available",e.target.checked)}
                   style={{width:18,height:18,accentColor:"#c8a84b"}}/>
            <span style={{fontSize:14,color:"#e4ede6"}}>
              Available for hire right now
            </span>
          </label>

          {uploading && (
            <p style={{color:"#c8a84b",fontSize:13,textAlign:"center"}}>⬆️ Uploading photo…</p>
          )}

          <div style={{display:"flex",gap:12,marginTop:8}}>
            <button onClick={() => navigate(-1)} style={{
              flex:1,padding:"12px 0",borderRadius:50,background:"transparent",
              border:"1.5px solid #223629",color:"#6e9476",fontSize:14,cursor:"pointer",
              fontFamily:"DM Sans,system-ui,sans-serif",
            }}>Cancel</button>
            <button onClick={submit} disabled={submitting} style={{
              flex:2,padding:"12px 0",borderRadius:50,background:"#c8a84b",
              border:"none",color:"#0a1a10",fontSize:15,fontWeight:700,
              cursor:submitting?"not-allowed":"pointer",fontFamily:"DM Sans,system-ui,sans-serif",
            }}>
              {submitting ? "Posting…" : "🚛 Post Listing"}
            </button>
          </div>
        </div>
      </div>

      <Toast/>
    </div>
  );
}

// ── Router (auto-selects page based on URL) ─────────────────────
export default function TransportHire() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Check if we are on the post page
  if (window.location.pathname === "/transport/post") return <TransportPost/>;
  if (id) return <TransportListing/>;
  return <TransportBrowse/>;
}

// Named exports for individual use
export { TransportBrowse, TransportListing, TransportPost };