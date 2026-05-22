"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import Avatar from "./Avatar";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

/* ── helpers ── */
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const fmtDate = (d) => {
  const date = new Date(d), now = new Date(), diff = now - date;
  if (diff < 86400000 && date.getDate() === now.getDate()) return "Today";
  if (diff < 172800000) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const WALLPAPERS = [
  { id: "mountain",  label: "Mountain",  cls: "wallpaper-mountain" },
  { id: "default",   label: "Default",   cls: "wallpaper-default" },
  { id: "floral",    label: "Floral",    cls: "wallpaper-floral" },
  { id: "geometric", label: "Geometric", cls: "wallpaper-geometric" },
  { id: "waves",     label: "Waves",     cls: "wallpaper-waves" },
  { id: "stars",     label: "Stars",     cls: "wallpaper-stars" },
  { id: "bubbles",   label: "Bubbles",   cls: "wallpaper-bubbles" },
];

function fileIcon(mime = "") {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("pdf"))      return "📄";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  if (mime.includes("word") || mime.includes("doc")) return "📝";
  return "📎";
}

function fmtBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

/* ── Ticks ── */
function Ticks({ status }) {
  const c = status === "read" ? "#53bdeb" : "#aebac1";
  if (status === "sent") return (
    <svg viewBox="0 0 12 9" fill="none" style={{ width: 14, height: 10, display: "inline-block", marginLeft: 3 }}>
      <path d="M1 4.5L4.5 8L11 1" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 16 9" fill="none" style={{ width: 16, height: 10, display: "inline-block", marginLeft: 3 }}>
      <path d="M1 4.5L4.5 8L11 1" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4.5L8.5 8L15 1" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Header icon button ── */
function HBtn({ icon, title, onClick, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 36, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
        background: active ? "rgba(37,211,102,0.12)" : hov ? "rgba(255,255,255,0.07)" : "transparent",
        color: active ? "#25d366" : hov ? "#e9edef" : "#aebac1",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s, color 0.15s", flexShrink: 0,
      }}>
      {icon}
    </button>
  );
}

/* ── Attach menu button ── */
function AttachBtn({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "10px 14px", border: "none", borderRadius: 10, cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "background 0.15s",
      }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <span style={{ color: "#e9edef", fontSize: 14, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

/* ── Voice Call Modal ── */
function VoiceCallModal({ other, onEnd }) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("Calling…");

  useEffect(() => {
    const t1 = setTimeout(() => setStatus("Ringing…"), 1200);
    const t2 = setTimeout(() => setStatus("Connected"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (status !== "Connected") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "linear-gradient(160deg, #0a1628 0%, #0d2137 40%, #0f2a1e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {/* Pulse rings */}
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          border: `1px solid rgba(37,211,102,${0.2 - i * 0.05})`,
          width: 140 + i * 70, height: 140 + i * 70,
          animation: `pulse ${1.6 + i * 0.5}s ease-in-out infinite`,
        }} />
      ))}

      {/* Avatar */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", border: "3px solid #25d366", padding: 3 }}>
          <Avatar name={other?.name} size="xl" />
        </div>
      </div>

      <p style={{ color: "#e9edef", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{other?.name}</p>
      <p style={{ color: status === "Connected" ? "#25d366" : "#8696a0", fontSize: 14, marginBottom: 32 }}>
        {status === "Connected" ? fmt(elapsed) : status}
      </p>

      {/* Voice wave animation */}
      {status === "Connected" && (
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 40, marginBottom: 32 }}>
          {[18,28,36,44,36,28,18].map((h, i) => (
            <div key={i} className="wave-bar" style={{
              width: 4, height: h, borderRadius: 99,
              background: "linear-gradient(180deg, #25d366, #128c7e)",
            }} />
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {[
          { emoji: muted ? "🔇" : "🎤", label: muted ? "Unmute" : "Mute", action: () => setMuted(v => !v), active: muted },
          { emoji: "📵", label: "End", action: onEnd, red: true, size: 68 },
          { emoji: speaker ? "🔊" : "🔈", label: speaker ? "Speaker" : "Earpiece", action: () => setSpeaker(v => !v), active: !speaker },
        ].map(({ emoji, label, action, red, active, size = 54 }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <button onClick={action} style={{
              width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
              fontSize: size > 60 ? 26 : 22,
              background: red ? "#ef4444" : active ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: red ? "0 6px 24px rgba(239,68,68,0.45)" : "none",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}>{emoji}</button>
            <span style={{ color: "#8696a0", fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Video Call Modal ── */
function VideoCallModal({ other, onEnd }) {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("Connecting…");

  useEffect(() => {
    const t = setTimeout(() => setStatus("Connected"), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "Connected") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          border: "1px solid rgba(37,211,102,0.15)",
          width: 120 + i * 80, height: 120 + i * 80,
          animation: `pulse ${1.5 + i * 0.4}s ease-in-out infinite`,
          opacity: 0.6 - i * 0.15,
        }} />
      ))}

      {/* Remote video area */}
      <div style={{
        width: "100%", maxWidth: 640, height: 360, borderRadius: 20,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        marginBottom: 32, position: "relative", overflow: "hidden",
      }}>
        <Avatar name={other?.name} size="xl" />
        <p style={{ color: "#e9edef", fontSize: 18, fontWeight: 600, marginTop: 16 }}>{other?.name}</p>
        <p style={{ color: status === "Connected" ? "#25d366" : "#8696a0", fontSize: 13, marginTop: 4 }}>
          {status === "Connected" ? `Video call • ${fmt(elapsed)}` : status}
        </p>
        {/* Self preview pip */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          width: 100, height: 72, borderRadius: 10,
          background: camOff ? "#1a2530" : "rgba(37,211,102,0.1)",
          border: "2px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {camOff
            ? <svg viewBox="0 0 24 24" fill="#8696a0" style={{ width: 24, height: 24 }}><path d="M21 6.5l-4-4-9.5 9.5-2 4.5 4.5-2L21 6.5zm-14 9l-2.5 1 1-2.5 1.5 1.5zm12-9l-1.5-1.5 1-1 1.5 1.5-1 1z"/></svg>
            : <Avatar name="You" size="sm" />
          }
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {[
          { emoji: muted ? "🔇" : "🎤", label: muted ? "Unmute" : "Mute", action: () => setMuted(v => !v), active: muted },
          { emoji: "📵", label: "End", action: onEnd, red: true, size: 64 },
          { emoji: camOff ? "📷" : "🎥", label: camOff ? "Cam On" : "Cam Off", action: () => setCamOff(v => !v), active: camOff },
        ].map(({ emoji, label, action, red, active, size = 52 }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button onClick={action} style={{
              width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
              fontSize: size === 64 ? 24 : 20,
              background: red ? "#ef4444" : active ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: red ? "0 4px 20px rgba(239,68,68,0.4)" : "none",
              transition: "transform 0.15s",
            }}>{emoji}</button>
            <span style={{ color: "#8696a0", fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Message bubble renderer ── */
function MsgBubble({ msg, mine, isFirst, other }) {
  // Location message
  if (msg.type === "location") {
    const { lat, lng, address } = msg.location || {};
    return (
      <div style={{
        maxWidth: 260, borderRadius: mine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
        background: mine ? "#005c4b" : "#1f2c34",
      }}>
        {/* Map preview */}
        <div style={{
          height: 140, background: "linear-gradient(135deg, #1a3a2a, #0d2137)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontSize: 36 }}>📍</div>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.15,
            backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(37,211,102,0.3) 20px,rgba(37,211,102,0.3) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(37,211,102,0.3) 20px,rgba(37,211,102,0.3) 21px)",
          }} />
        </div>
        <div style={{ padding: "8px 12px 6px" }}>
          <p style={{ color: "#e9edef", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>📍 Location</p>
          <p style={{ color: "#8696a0", fontSize: 12 }}>{address || `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <span style={{ color: "#8696a0", fontSize: 11 }}>{fmtTime(msg.createdAt)}</span>
            {mine && <Ticks status={msg.status} />}
          </div>
        </div>
      </div>
    );
  }

  // File message
  if (msg.type === "file") {
    const { name, size, mime, url } = msg.file || {};
    const isImage = mime?.startsWith("image/");
    return (
      <div style={{
        maxWidth: 280, borderRadius: mine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
        background: mine ? "#005c4b" : "#1f2c34",
      }}>
        {isImage && url && (
          <img src={url} alt={name} style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
        )}
        <div style={{ padding: "8px 12px 6px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "rgba(37,211,102,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>{fileIcon(mime)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#e9edef", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
            <p style={{ color: "#8696a0", fontSize: 11 }}>{fmtBytes(size)}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px 6px", gap: 2 }}>
          <span style={{ color: "#8696a0", fontSize: 11 }}>{fmtTime(msg.createdAt)}</span>
          {mine && <Ticks status={msg.status} />}
        </div>
      </div>
    );
  }

  // Text message (default)
  return (
    <div style={{
      maxWidth: "62%", minWidth: 80, padding: "9px 13px 7px",
      borderRadius: mine ? (isFirst ? "18px 4px 18px 18px" : "18px") : (isFirst ? "4px 18px 18px 18px" : "18px"),
      background: mine ? "#005c4b" : "#1f2c34",
      boxShadow: "0 2px 8px rgba(0,0,0,0.55)",
    }}>
      <p style={{ color: "#e9edef", fontSize: 14.5, lineHeight: 1.55, wordBreak: "break-word", margin: 0 }}>
        {msg.text}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, marginTop: 3 }}>
        <span style={{ color: mine ? "rgba(255,255,255,0.55)" : "#8696a0", fontSize: 11 }}>{fmtTime(msg.createdAt)}</span>
        {mine && <Ticks status={msg.status} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ChatWindow({ conversation, onlineUsers }) {
  const { user } = useAuth();
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [typingUser, setTypingUser]   = useState(null);
  const [showEmoji, setShowEmoji]     = useState(false);
  const [showAttach, setShowAttach]   = useState(false);
  const [showWall, setShowWall]       = useState(false);
  const [wallpaper, setWallpaper]     = useState("mountain");
  const [inCall, setInCall]           = useState(false);
  const [inVoiceCall, setInVoiceCall] = useState(false);

  const endRef      = useRef(null);
  const typingTimer = useRef(null);
  const taRef       = useRef(null);
  const emojiRef    = useRef(null);
  const attachRef   = useRef(null);
  const wallRef     = useRef(null);
  const fileInputRef = useRef(null);

  const other    = conversation.participants.find((p) => p._id !== user._id);
  const isOnline = onlineUsers.includes(other?._id);
  const wallCls  = WALLPAPERS.find((w) => w.id === wallpaper)?.cls || "wallpaper-default";

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get(`/conversations/${conversation._id}/messages`);
      setMessages(res.data);
    } catch (e) { console.error(e); }
  }, [conversation._id]);

  useEffect(() => {
    loadMessages();
    const socket = getSocket();
    socket.emit("conversation:join", conversation._id);
    socket.on("message:receive", (msg) => setMessages((p) => [...p, msg]));
    socket.on("typing:start", (d) => { if (d.conversationId === conversation._id) setTypingUser(d.senderName); });
    socket.on("typing:stop",  (d) => { if (d.conversationId === conversation._id) setTypingUser(null); });
    return () => {
      socket.emit("conversation:leave", conversation._id);
      socket.off("message:receive");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [conversation._id, loadMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUser]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 128) + "px";
    }
  }, [text]);

  // Close panels on outside click
  useEffect(() => {
    const h = (e) => {
      if (emojiRef.current  && !emojiRef.current.contains(e.target))  setShowEmoji(false);
      if (attachRef.current && !attachRef.current.contains(e.target)) setShowAttach(false);
      if (wallRef.current   && !wallRef.current.contains(e.target))   setShowWall(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing:start", { conversationId: conversation._id, senderName: user.name });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing:stop", { conversationId: conversation._id });
    }, 1500);
  };

  const onEmojiClick = (data) => { setText((p) => p + data.emoji); taRef.current?.focus(); };

  const send = async (msgData) => {
    const payload = msgData || (text.trim() ? { text: text.trim() } : null);
    if (!payload) return;
    const socket = getSocket();
    clearTimeout(typingTimer.current);
    setIsTyping(false);
    socket.emit("typing:stop", { conversationId: conversation._id });
    try {
      const res = await api.post(`/conversations/${conversation._id}/messages`, payload);
      setMessages((p) => [...p, res.data]);
      if (!msgData) setText("");
      socket.emit("message:send", { ...res.data, conversationId: conversation._id });
    } catch (e) { console.error(e); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  // Share location
  const shareLocation = () => {
    setShowAttach(false);
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        send({ type: "location", text: "📍 Location shared", location: { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` } });
      },
      () => {
        // Demo fallback
        send({ type: "location", text: "📍 Location shared", location: { lat: 33.6844, lng: 73.0479, address: "Islamabad, Pakistan" } });
      }
    );
  };

  // File attach
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttach(false);
    const url = URL.createObjectURL(file);
    send({ type: "file", text: `📎 ${file.name}`, file: { name: file.name, size: file.size, mime: file.type, url } });
    e.target.value = "";
  };

  return (
    <>
      {inCall && <VideoCallModal other={other} onEnd={() => setInCall(false)} />}
      {inVoiceCall && <VoiceCallModal other={other} onEnd={() => setInVoiceCall(false)} />}

      <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
        {/* Wallpaper */}
        <div className={wallCls} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

        {/* ── HEADER ── */}
        <div style={{
          position: "relative", zIndex: 10, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", background: "#202c33",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <Avatar name={other?.name} size="md" online={isOnline} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#e9edef", fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {other?.name}
            </p>
            <p style={{ fontSize: 12, height: 16, display: "flex", alignItems: "center", gap: 4 }}>
              {typingUser
                ? <span style={{ color: "#25d366", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "flex", gap: 3 }}>
                      {[1,2,3].map(i => <span key={i} className={`dot${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: "#25d366", display: "inline-block" }} />)}
                    </span>typing…
                  </span>
                : isOnline
                  ? <span style={{ color: "#25d366" }}>online</span>
                  : <span style={{ color: "#8696a0" }}>{other?.status || "offline"}</span>
              }
            </p>
          </div>

          {/* Voice call */}
          <HBtn title="Voice call" onClick={() => setInVoiceCall(true)}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>}
          />

          {/* Video call */}
          <HBtn title="Video call" onClick={() => setInCall(true)}
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>}
          />

          {/* Wallpaper */}
          <div ref={wallRef} style={{ position: "relative" }}>
            <HBtn title="Wallpaper" active={showWall}
              onClick={() => { setShowWall(v => !v); setShowEmoji(false); setShowAttach(false); }}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}><path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14zm-9-7l-3 3.72L7 13l-4 5h18l-5-6z"/></svg>}
            />
            {showWall && (
              <div className="wallpaper-panel">
                <p style={{ color: "#8696a0", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Chat Wallpaper</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {WALLPAPERS.map((w) => (
                    <button key={w.id} onClick={() => { setWallpaper(w.id); setShowWall(false); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
                      <div className={w.cls} style={{
                        width: 48, height: 48, borderRadius: 10,
                        border: wallpaper === w.id ? "2px solid #25d366" : "2px solid rgba(255,255,255,0.1)",
                        boxShadow: wallpaper === w.id ? "0 0 10px rgba(37,211,102,0.4)" : "none",
                        transition: "all 0.15s",
                      }} />
                      <span style={{ color: wallpaper === w.id ? "#25d366" : "#8696a0", fontSize: 10, fontWeight: 500 }}>{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <HBtn title="More"
            icon={<svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>}
          />
        </div>

        {/* ── MESSAGES ── */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, overflowY: "auto", padding: "16px 6% 8px" }}>
          {messages.map((msg, idx) => {
            const mine = msg.sender._id === user._id || msg.sender === user._id;
            const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString();
            const prevSame = idx > 0 && (messages[idx-1].sender._id === msg.sender._id || messages[idx-1].sender === msg.sender._id || messages[idx-1].sender === msg.sender);
            const isFirst = !prevSame || showDate;
            const nextSame = idx < messages.length - 1 && (messages[idx+1].sender._id === msg.sender._id || messages[idx+1].sender === msg.sender._id || messages[idx+1].sender === msg.sender);

            return (
              <div key={msg._id} className="msg-enter">
                {showDate && (
                  <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 12px" }}>
                    <span style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#e9edef", fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 99 }}>
                      {fmtDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: nextSame && !showDate ? 2 : 8 }}>
                  {!mine && (
                    <div style={{ width: 32, marginRight: 6, alignSelf: "flex-end", flexShrink: 0 }}>
                      {isFirst ? <Avatar name={other?.name} size="xs" /> : null}
                    </div>
                  )}
                  <MsgBubble msg={msg} mine={mine} isFirst={isFirst} other={other} />
                </div>
              </div>
            );
          })}

          {typingUser && (
            <div className="msg-enter" style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
              <Avatar name={other?.name} size="xs" />
              <div style={{ background: "#1f2c34", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.55)" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[1,2,3].map(i => <span key={i} className={`dot${i}`} style={{ width: 7, height: 7, borderRadius: "50%", background: "#8696a0", display: "inline-block" }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* ── EMOJI PICKER ── */}
        {showEmoji && (
          <div ref={emojiRef} className="emoji-panel" style={{ position: "absolute", bottom: 76, left: 16, zIndex: 50 }}>
            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" skinTonesDisabled searchPlaceholder="Search emoji…" height={380} width={320} previewConfig={{ showPreview: false }} />
          </div>
        )}

        {/* ── ATTACH MENU ── */}
        {showAttach && (
          <div ref={attachRef} className="emoji-panel" style={{
            position: "absolute", bottom: 76, left: 60, zIndex: 50,
            background: "#1f2c34", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "8px 4px", minWidth: 200,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}>
            <p style={{ color: "#8696a0", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 14px 8px" }}>Attach</p>
            <AttachBtn label="Document / File" color="rgba(99,102,241,0.2)"
              onClick={() => { fileInputRef.current?.click(); }}
              icon={<svg viewBox="0 0 24 24" fill="#818cf8" style={{ width: 20, height: 20 }}><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>}
            />
            <AttachBtn label="Photo / Video" color="rgba(236,72,153,0.2)"
              onClick={() => { fileInputRef.current?.setAttribute("accept","image/*,video/*"); fileInputRef.current?.click(); }}
              icon={<svg viewBox="0 0 24 24" fill="#ec4899" style={{ width: 20, height: 20 }}><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>}
            />
            <AttachBtn label="Share Location" color="rgba(37,211,102,0.2)"
              onClick={shareLocation}
              icon={<svg viewBox="0 0 24 24" fill="#25d366" style={{ width: 20, height: 20 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
            />
          </div>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />

        {/* ── INPUT BAR ── */}
        <div style={{
          position: "relative", zIndex: 10, flexShrink: 0,
          display: "flex", alignItems: "flex-end", gap: 8,
          padding: "10px 16px 12px", background: "#202c33",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}>
          {/* Emoji */}
          <button onClick={() => { setShowEmoji(v => !v); setShowAttach(false); }} title="Emoji"
            style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: showEmoji ? "rgba(37,211,102,0.15)" : "transparent", cursor: "pointer", color: showEmoji ? "#25d366" : "#aebac1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 1, transition: "all 0.15s" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>

          {/* Attach */}
          <button onClick={() => { setShowAttach(v => !v); setShowEmoji(false); }} title="Attach"
            style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: showAttach ? "rgba(37,211,102,0.15)" : "transparent", cursor: "pointer", color: showAttach ? "#25d366" : "#aebac1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 1, transition: "all 0.15s" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>

          {/* Textarea */}
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", background: "#2a3942", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <textarea ref={taRef} rows={1} value={text} onChange={handleTyping} onKeyDown={onKey}
              placeholder="Type a message"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e9edef", fontSize: 15, resize: "none", lineHeight: 1.5, maxHeight: 128, minHeight: 24, fontFamily: "inherit" }}
            />
          </div>

          {/* Send / Mic */}
          <button onClick={() => send()} className={text.trim() ? "send-active" : ""}
            style={{ width: 44, height: 44, borderRadius: 12, border: "none", cursor: text.trim() ? "pointer" : "default", background: text.trim() ? "linear-gradient(135deg, #25d366, #128c7e)" : "#2a3942", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", marginBottom: 1 }}>
            {text.trim()
              ? <svg viewBox="0 0 24 24" fill="white" style={{ width: 20, height: 20, transform: "translateX(1px)" }}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              : <svg viewBox="0 0 24 24" fill="#8696a0" style={{ width: 20, height: 20 }}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            }
          </button>
        </div>
      </div>
    </>
  );
}
