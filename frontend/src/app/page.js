"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import WelcomeScreen from "@/components/WelcomeScreen";
import WhatsAppLogo from "@/components/WhatsAppLogo";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeConv, setActiveConv] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.on("users:online", setOnlineUsers);
    return () => socket.off("users:online");
  }, [user]);

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0f14", gap: 20,
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -12,
            background: "radial-gradient(circle, rgba(37,211,102,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          <WhatsAppLogo size={72} className="relative" />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`dot${i + 1}`} style={{
              width: 8, height: 8, borderRadius: "50%", background: "#25d366",
            }} />
          ))}
        </div>
        <p style={{ color: "#8696a0", fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#111b21" }}>
      {/* Sidebar */}
      <div style={{
        display: activeConv && !showSidebar ? "none" : "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 380,
        flexShrink: 0,
        height: "100%",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
        className="md-sidebar"
      >
        <Sidebar
          onSelectConversation={(conv) => { setActiveConv(conv); setShowSidebar(false); }}
          activeConversationId={activeConv?._id}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Chat panel */}
      <div style={{
        display: !activeConv || showSidebar ? "none" : "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
        className="md-chat"
      >
        {/* Mobile back */}
        {activeConv && (
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              display: "none",
              position: "absolute", top: 14, left: 60, zIndex: 20,
              background: "transparent", border: "none", cursor: "pointer",
              color: "#aebac1",
            }}
            className="mobile-back"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22 }}>
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        )}

        {activeConv
          ? <ChatWindow key={activeConv._id} conversation={activeConv} onlineUsers={onlineUsers} />
          : <WelcomeScreen />
        }
      </div>

      {/* Desktop: always show both */}
      <style>{`
        @media (min-width: 768px) {
          .md-sidebar { display: flex !important; }
          .md-chat { display: flex !important; }
          .mobile-back { display: none !important; }
        }
      `}</style>
    </div>
  );
}
