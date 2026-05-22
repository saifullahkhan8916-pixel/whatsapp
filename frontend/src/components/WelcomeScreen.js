import WhatsAppLogo from "./WhatsAppLogo";

export default function WelcomeScreen() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", background: "#222e35", position: "relative", overflow: "hidden", userSelect: "none",
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(37,211,102,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, maxWidth: 380, textAlign: "center", padding: "0 32px" }}>
        {/* Logo ring */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -16,
            background: "radial-gradient(circle, rgba(37,211,102,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(37,211,102,0.06)",
            border: "1.5px solid rgba(37,211,102,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <WhatsAppLogo size={76} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 style={{ color: "#e9edef", fontSize: 28, fontWeight: 300, letterSpacing: "-0.5px", marginBottom: 8 }}>
            WhatsApp Web
          </h2>
          <p style={{ color: "#8696a0", fontSize: 14, lineHeight: 1.6 }}>
            Send and receive messages without keeping your phone online.
            Use WhatsApp on up to 4 linked devices.
          </p>
        </div>

        {/* Divider with text */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: "#8696a0", fontSize: 12, whiteSpace: "nowrap" }}>
            Select a chat to start messaging
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {[
            { label: "End-to-end encrypted", icon: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" },
            { label: "Real-time messages", icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" },
            { label: "Instant delivery", icon: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" },
          ].map((f) => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#8696a0", fontSize: 12,
            }}>
              <svg viewBox="0 0 24 24" fill="#25d366" style={{ width: 13, height: 13, flexShrink: 0 }}>
                <path d={f.icon} />
              </svg>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
