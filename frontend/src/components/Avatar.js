// Vibrant avatar with consistent color per name
const COLORS = [
  { bg: "#7c3aed", shadow: "rgba(124,58,237,0.4)" },
  { bg: "#2563eb", shadow: "rgba(37,99,235,0.4)" },
  { bg: "#059669", shadow: "rgba(5,150,105,0.4)" },
  { bg: "#d97706", shadow: "rgba(217,119,6,0.4)" },
  { bg: "#dc2626", shadow: "rgba(220,38,38,0.4)" },
  { bg: "#db2777", shadow: "rgba(219,39,119,0.4)" },
  { bg: "#0891b2", shadow: "rgba(8,145,178,0.4)" },
  { bg: "#65a30d", shadow: "rgba(101,163,13,0.4)" },
];

const SIZES = {
  xs: { box: 28, font: 10, dot: 8, border: 1.5 },
  sm: { box: 36, font: 12, dot: 10, border: 2 },
  md: { box: 44, font: 14, dot: 12, border: 2 },
  lg: { box: 52, font: 16, dot: 13, border: 2 },
  xl: { box: 72, font: 22, dot: 16, border: 2.5 },
};

export default function Avatar({ name = "", size = "md", online = false }) {
  const s = SIZES[size] || SIZES.md;
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length;
  const { bg, shadow } = COLORS[colorIdx];

  return (
    <div className="relative shrink-0" style={{ width: s.box, height: s.box }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-bold text-white select-none"
        style={{
          background: bg,
          boxShadow: `0 2px 12px ${shadow}`,
          fontSize: s.font,
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: s.dot,
            height: s.dot,
            background: "#25d366",
            border: `${s.border}px solid #111b21`,
            boxShadow: "0 0 6px rgba(37,211,102,0.6)",
          }}
        />
      )}
    </div>
  );
}
