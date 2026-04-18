import React, { useState, useEffect, useRef } from "react";
import config from "../config";

const CHANNELS = [
  { id:"general",     name:"🌍 General" },
  { id:"maize",       name:"🌽 Maize" },
  { id:"tobacco",     name:"🍂 Tobacco" },
  { id:"livestock",   name:"🐄 Livestock" },
  { id:"horticulture",name:"🥬 Horticulture" },
  { id:"weather",     name:"🌧️ Weather" },
  { id:"prices",      name:"💰 Prices" },
];

export default function Community({ user }) {
  const [channel, setChannel]   = useState("general");
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [online, setOnline]     = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef   = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    connect(channel);
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [channel]);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const connect = (ch) => {
    if (wsRef.current) wsRef.current.close();
    setMessages([]);
    setConnected(false);

    const ws = new WebSocket(
      `${config.WS_URL}/ws/community/${ch}/${user.phone}`
    );
    wsRef.current = ws;

    ws.onopen  = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(() => connect(ch), 3000);
    };
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "welcome") {
        setMessages(data.recent_messages || []);
        setOnline(data.online_count || 1);
      } else if (["message","bot_message"].includes(data.type)) {
        setMessages(prev => [...prev, data]);
        if (data.online_count) setOnline(data.online_count);
      } else if (["user_joined","user_left"].includes(data.type)) {
        if (data.online_count) setOnline(data.online_count);
      }
    };
  };

  const send = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ message: input }));
    setInput("");
  };

  return (
    <div>
      <h2 style={{ color:"#2e7d32", marginBottom:14 }}>👥 Farmer Community</h2>

      <div style={{ display:"flex", gap:14 }}>
        {/* Channel Sidebar */}
        <div style={{ width:150, flexShrink:0 }}>
          {CHANNELS.map(ch => (
            <div
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              style={{
                padding:"9px 12px", borderRadius:8, cursor:"pointer",
                marginBottom:6, fontWeight:600, fontSize:13,
                background: channel === ch.id ? "#2e7d32" : "white",
                color: channel === ch.id ? "white" : "#333",
                boxShadow:"0 1px 4px rgba(0,0,0,0.08)"
              }}
            >
              {ch.name}
            </div>
          ))}
        </div>

        {/* Chat */}
        <div style={{ flex:1 }}>
          <div style={{
            display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:10
          }}>
            <div style={{ fontWeight:700, fontSize:15 }}>
              {CHANNELS.find(c=>c.id===channel)?.name}
              <span style={{ marginLeft:10, fontWeight:400, fontSize:13, color:"#4caf50" }}>
                <span className="online-dot" />{online} online
              </span>
            </div>
            <span style={{ fontSize:12, color: connected ? "#4caf50" : "#f44336" }}>
              {connected ? "● Connected" : "○ Reconnecting..."}
            </span>
          </div>

          <div className="chat-box" ref={chatRef}>
            {messages.length === 0 && (
              <p style={{ textAlign:"center", color:"#aaa", marginTop:40, fontSize:14 }}>
                No messages yet. Be the first!<br/>
                <small>Tip: type @agrobot [question] for AI help</small>
              </p>
            )}
            {messages.map((msg, i) => {
              const isMe  = msg.phone === user.phone;
              const isBot = msg.name?.includes("AgroBot");
              return (
                <div key={i} className={`msg ${isMe ? "me" : "bot"}`}>
                  <div className="msg-meta">
                    {isBot ? "🤖 AgroBot" : isMe ? "👤 You" : `👨‍🌾 ${msg.name}`}
                    {(!isMe && !isBot && msg.location) ? ` — ${msg.location}` : ""}
                    {" • "}{msg.timestamp?.slice(11,16)}
                  </div>
                  <div className="bubble" style={isBot ? { background:"#e8f5e9", border:"1px solid #4caf50" } : {}}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <input
              className="input"
              style={{ marginBottom:0, flex:1 }}
              placeholder="Type message... (@agrobot [question] for AI)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()}
            />
            <button className="btn btn-green" onClick={send}>Send</button>
          </div>
          <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}