import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";

const CATEGORIES = [
  { id: "farming",    label: "🌱 Farming",   query: "Zimbabwe farming agriculture crops" },
  { id: "weather",    label: "🌧️ Weather",   query: "Zimbabwe weather climate rainfall" },
  { id: "prices",     label: "💰 Prices",    query: "Zimbabwe crop commodity prices" },
  { id: "livestock",  label: "🐄 Livestock", query: "Zimbabwe livestock cattle farmers" },
  { id: "technology", label: "🔬 AgriTech",  query: "Africa agricultural technology innovation" },
];

// Different fallback images per article index so they don't all look the same
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
  "https://images.unsplash.com/photo-1592982537447-6f2a6a0a7b8e?w=600&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
];

const CATEGORY_IMAGES = {
  farming:    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80",
  weather:    "https://images.unsplash.com/photo-1504608524841-42584120d693?w=600&q=80",
  prices:     "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80",
  livestock:  "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80",
  technology: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
};

export default function News({ user }) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [category, setCategory] = useState("farming");
  const [source,   setSource]   = useState("");

  useEffect(() => {
    loadNews(category);
  }, [category]);

  const timeAgo = (dateStr) => {
    try {
      const diff = (new Date() - new Date(dateStr)) / 1000;
      if (diff < 3600)  return Math.floor(diff / 60)   + " min ago";
      if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
      return Math.floor(diff / 86400) + " days ago";
    } catch { return ""; }
  };

  const loadNews = async (cat) => {
    setLoading(true);
    setError("");
    setArticles([]);

    try {
      const res = await axios.get(config.API_URL + "/api/news", {
        params:  { category: cat },
        timeout: 20000,
      });

      const arts = res.data.articles || [];

      if (arts.length > 0) {
        // Give each article a UNIQUE fallback image based on its index
        const enriched = arts.map((a, i) => ({
          ...a,
          image: a.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
        }));
        setArticles(enriched);
        setSource(res.data.source || "live");
      } else {
        setError("No articles found. Try another category.");
      }
    } catch (e) {
      console.error("News error:", e.message);
      setError("Could not load news. Please check your connection and try again.");
    }

    setLoading(false);
  };

  const openArticle = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <h2 style={{ color: "#2e7d32", marginBottom: 2 }}>📰 Zimbabwe Farming News</h2>
          <p style={{ fontSize: 12, color: "#aaa" }}>
            {source === "live" ? "📡 Live news with photos" :
             source === "ai"   ? "🤖 AI-generated bulletin" : ""}
          </p>
        </div>
        <button className="btn btn-green" onClick={() => loadNews(category)} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            style={{
              padding: "7px 14px", borderRadius: 20, border: "none",
              cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: category === c.id ? "#2e7d32" : "#e8f5e9",
              color:      category === c.id ? "white"   : "#2e7d32",
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
          <p style={{ color: "#888" }}>Loading latest farming news...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          background: "#ffebee", color: "#c62828",
          padding: 16, borderRadius: 10, fontSize: 14, marginBottom: 12,
        }}>
          ❌ {error}
          <br />
          <button className="btn btn-green" style={{ marginTop: 12 }}
            onClick={() => loadNews(category)}>
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Articles */}
      {!loading && articles.length > 0 && (
        <div>
          <div style={{
            background: source === "live" ? "#e8f5e9" : "#f5f5f5",
            padding: "6px 14px", borderRadius: 8, fontSize: 12,
            color: source === "live" ? "#2e7d32" : "#888",
            marginBottom: 14, display: "inline-block",
          }}>
            {source === "live"
              ? `📡 ${articles.length} live articles`
              : "🤖 AI-generated bulletin"}
          </div>

          {articles.map((article, i) => (
            <div
              key={i}
              className="card"
              onClick={() => openArticle(article.url)}
              style={{
                overflow: "hidden",
                padding: 0,
                marginBottom: 16,
                cursor: article.url ? "pointer" : "default",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                if (article.url) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* Image — unique per article */}
              <div style={{ position: "relative" }}>
                <img
                  src={article.image}
                  alt={article.title}
                  style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                  onError={e => {
                    // On error use a unique fallback based on index
                    e.target.src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
                    // If that also fails use category image
                    e.target.onerror = () => {
                      e.target.src = CATEGORY_IMAGES[category] || FALLBACK_IMAGES[0];
                    };
                  }}
                />
                {/* Tap to read overlay — always visible */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  background: article.url ? "rgba(46,125,50,0.85)" : "rgba(100,100,100,0.7)",
                  color: "white", fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderTopLeftRadius: 8,
                }}>
                  {article.url ? "TAP TO READ ↗" : "AI SUMMARY"}
                </div>
              </div>

              <div style={{ padding: 16 }}>
                {/* Source + Time */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 8, flexWrap: "wrap", gap: 4,
                }}>
                  <span style={{
                    background: "#e8f5e9", color: "#2e7d32",
                    padding: "2px 10px", borderRadius: 20,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {article.source?.name || "News"}
                  </span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>
                    {timeAgo(article.publishedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 16, fontWeight: 700, color: "#212121",
                  marginBottom: 8, lineHeight: 1.4,
                }}>
                  {article.title}
                </h3>

                {/* Description */}
                {article.description && (
                  <p style={{
                    fontSize: 14, color: "#555",
                    lineHeight: 1.6, marginBottom: 12,
                  }}>
                    {article.description.length > 200
                      ? article.description.slice(0, 200) + "..."
                      : article.description}
                  </p>
                )}

                {/* Read More button — always visible */}
                <a
                  href={article.url || "#"}
                  target={article.url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  onClick={e => {
                    if (!article.url) e.preventDefault();
                  }}
                  style={{
                    background:     article.url ? "#2e7d32" : "#9e9e9e",
                    color:          "white",
                    padding:        "8px 16px",
                    borderRadius:   8,
                    fontSize:       13,
                    fontWeight:     700,
                    display:        "inline-block",
                    marginTop:      4,
                    textDecoration: "none",
                    cursor:         article.url ? "pointer" : "not-allowed",
                  }}
                >
                  {article.url ? "Read Full Story ↗" : "🤖 AI Summary"}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#888" }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <p style={{ marginTop: 12 }}>No news found. Try another category or refresh.</p>
          <button className="btn btn-green" style={{ marginTop: 12 }}
            onClick={() => loadNews(category)}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}