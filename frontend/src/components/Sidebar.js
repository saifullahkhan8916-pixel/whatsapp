"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Avatar from "./Avatar";
import WhatsAppLogo from "./WhatsAppLogo";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000 && date.getDate() === now.getDate())
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/* ── Status Viewer Overlay ── */
function StatusViewer({ statuses, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [progress, setProgress] = useState(0);
  const current = statuses[idx];

  useEffect(() => {
    setProgress(0);
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [idx, onClose]);

  const next = () => idx < statuses.length - 1 ? setIdx(i => i + 1) : onClose();
  const prev = () => idx > 0 ? setIdx(i => i - 1) : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#000", display: "flex", flexDirection: "column",
    }}>
      {/* Progress bars */}
      <div style={{ display: "flex", gap: 3, padding: "12px 12px 0" }}>
        {statuses.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
            <div className={i === idx ? "status-bar-anim" : ""} style={{
              height: "100%", borderRadius: 99,
              background: "#fff",
              width: i < idx ? "100%" : i > idx ? "0%" : undefined,
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <Avatar name={current.name} size="sm" />
        <div>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{current.name}</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{current.time}</p>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, lineHeight: 1 }}>×</button>
      </div>

      {/* Status content */}
      <div onClick={next} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: current.bg || "linear-gradient(135deg, #1a3a2a, #0d2137)",
        cursor: "pointer", position: "relative",
      }}>
        <p style={{ color: "#fff", fontSize: 22, fontWeight: 600, textAlign: "center", padding: "0 32px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {current.text}
        </p>
        {/* Tap zones */}
        <div onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%" }} />
      </div>
    </div>
  );
}

/* ── Demo statuses ── */
const DEMO_STATUSES = [
  { name: "Saif", text: "🌄 Good morning!", time: "Just now", bg: "linear-gradient(135deg, #1a3a2a, #0d2137)" },
  { name: "Zaid", text: "💻 Coding all day", time: "2 min ago", bg: "linear-gradient(135deg, #1a1a3a, #0d1a37)" },
  { name: "Ali",  text: "☕ Coffee time ☕", time: "15 min ago", bg: "linear-gradient(135deg, #3a1a0d, #2a0d0d)" },
  { name: "Sara", text: "🎵 Listening to music", time: "1 hr ago", bg: "linear-gradient(135deg, #2a0d3a, #1a0d2a)" },
];

const S = {
  sidebar: { display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "#111b21" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#202c33", flexShrink: 0 },
  iconBtn: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: "#aebac1", transition: "background 0.15s, color 0.15s" },
  searchWrap: { padding: "8px 12px", background: "#111b21", flexShrink: 0 },
  searchBox: { display: "flex", alignItems: "center", gap: 10, background: "#202c33", borderRadius: 10, padding: "8px 14px" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#e9edef", fontSize: 14 },
  list: { flex: 1, overflowY: "auto" },
  sectionLabel: { padding: "10px 16px 4px", fontSize: 11, fontWeight: 600, color: "#8696a0", letterSpacing: "0.08em", textTransform: "uppercase" },
};

export default function Sidebar({ onSelectConversation, activeConversationId, onlineUsers }) {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null); // { idx }
  const closeStatus = useCallback(() => setViewingStatus(null), []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${query}`);
        setResults(res.data);
      } catch (e) { console.error(e); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const startChat = async (recipientId) => {
    try {
      const res = await api.post("/conversations", { recipientId });
      setQuery(""); setResults([]);
      await loadConversations();
      onSelectConversation(res.data);
    } catch (e) { console.error(e); }
  };

  const getOther = (conv) => conv.participants.find((p) => p._id !== user._id);

  return (
    <div style={S.sidebar}>
      {viewingStatus !== null && (
        <StatusViewer statuses={DEMO_STATUSES} startIdx={viewingStatus} onClose={closeStatus} />
      )}

      {/* ── Header ── */}
      <div style={S.header}>
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div>
            <p style={{ color: "#e9edef", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{user?.name}</p>
            <p style={{ color: "#25d366", fontSize: 11, fontWeight: 500 }}>● Active</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            style={S.iconBtn}
            title="New chat"
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e9edef"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aebac1"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM13 11h-2V9h2v2zm0 4h-2v-2h2v2z" />
            </svg>
          </button>
          <button
            style={S.iconBtn}
            title="Logout"
            onClick={logout}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aebac1"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={S.searchWrap}>
        <div style={S.searchBox}>
          <svg viewBox="0 0 24 24" fill="#8696a0" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            style={S.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or start new chat"
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "#8696a0", cursor: "pointer", lineHeight: 0, border: "none", background: "transparent" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Strip ── */}
      {!query && (
        <div style={{ flexShrink: 0, padding: "8px 12px 4px", background: "#111b21" }}>
          <p style={{ color: "#8696a0", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Status</p>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {/* My status */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px dashed #25d366", padding: 2 }}>
                  <Avatar name={user?.name} size="md" />
                </div>
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#25d366", border: "2px solid #111b21",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", fontWeight: 700,
                }}>+</div>
              </div>
              <span style={{ color: "#8696a0", fontSize: 10, whiteSpace: "nowrap" }}>My Status</span>
            </div>

            {/* Others' statuses */}
            {DEMO_STATUSES.map((s, i) => (
              <button key={i} onClick={() => setViewingStatus(i)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <div className="status-ring" style={{ width: 54, height: 54 }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#202c33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Avatar name={s.name} size="md" />
                  </div>
                </div>
                <span style={{ color: "#e9edef", fontSize: 10, whiteSpace: "nowrap" }}>{s.name}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginTop: 4 }} />
        </div>
      )}

      {/* ── List ── */}
      <div style={S.list}>
        {query ? (
          <>
            <p style={S.sectionLabel}>
              {searching ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
            </p>
            {results.map((u) => (
              <SearchItem key={u._id} u={u} online={onlineUsers.includes(u._id)} onClick={() => startChat(u._id)} />
            ))}
            {!searching && results.length === 0 && <EmptySearch />}
          </>
        ) : (
          <>
            {conversations.length > 0 && <p style={S.sectionLabel}>Messages</p>}
            {conversations.map((conv) => {
              const other = getOther(conv);
              if (!other) return null;
              return (
                <ConvItem
                  key={conv._id}
                  conv={conv}
                  other={other}
                  isActive={conv._id === activeConversationId}
                  isOnline={onlineUsers.includes(other._id)}
                  onClick={() => onSelectConversation(conv)}
                />
              );
            })}
            {conversations.length === 0 && <EmptyConvs />}
          </>
        )}
      </div>
    </div>
  );
}

function ConvItem({ conv, other, isActive, isOnline, onClick }) {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`chat-item ${isActive ? "is-active" : ""}`}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", border: "none", cursor: "pointer", textAlign: "left",
        background: isActive ? "rgba(255,255,255,0.06)" : hovered ? "rgba(255,255,255,0.03)" : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        transition: "background 0.15s",
      }}
    >
      <Avatar name={other.name} size="md" online={isOnline} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 3 }}>
          <span style={{ color: "#e9edef", fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
            {other.name}
          </span>
          <span style={{ color: "#8696a0", fontSize: 11, flexShrink: 0 }}>{timeAgo(conv.updatedAt)}</span>
        </div>
        <p style={{ color: "#8696a0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {conv.lastMessage?.text || <em style={{ opacity: 0.5 }}>No messages yet</em>}
        </p>
      </div>
    </button>
  );
}

function SearchItem({ u, online, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", border: "none", cursor: "pointer", textAlign: "left",
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      <Avatar name={u.name} size="md" online={online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#e9edef", fontWeight: 600, fontSize: 15 }}>{u.name}</p>
        <p style={{ color: "#8696a0", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.status}</p>
      </div>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(37,211,102,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="#25d366" style={{ width: 14, height: 14 }}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    </button>
  );
}

function EmptySearch() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", color: "#8696a0" }}>
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 40, height: 40, opacity: 0.25, marginBottom: 10 }}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p style={{ fontSize: 14 }}>No users found</p>
    </div>
  );
}

function EmptyConvs() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", color: "#8696a0", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(37,211,102,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg viewBox="0 0 24 24" fill="#25d366" style={{ width: 30, height: 30, opacity: 0.6 }}>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      </div>
      <p style={{ color: "#e9edef", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No conversations yet</p>
      <p style={{ fontSize: 13 }}>Search for someone above to start chatting</p>
    </div>
  );
}
