"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import WhatsAppLogo from "@/components/WhatsAppLogo";

function StrengthBar({ password }) {
  const len = password.length;
  const score = len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : len < 14 ? 3 : 4;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#25d366"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div style={{ marginTop: 8 }}>
      <div className="flex gap-1" style={{ marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? colors[score] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      {score > 0 && (
        <p style={{ fontSize: 11, color: colors[score] }}>{labels[score]} password</p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "13px 16px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "#8696a0",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 8,
  };

  return (
    <div className="auth-page min-h-screen flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{ position:"absolute", top:"-10%", right:"-5%", width:500, height:500, background:"radial-gradient(circle, rgba(37,211,102,0.06) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%", width:400, height:400, background:"radial-gradient(circle, rgba(18,140,126,0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="page-enter w-full" style={{ maxWidth: 400 }}>
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #161d26 0%, #111820 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #25d366, #128c7e, #25d366)" }} />

          <div style={{ padding: "36px 36px 32px" }}>
            {/* Logo */}
            <div className="flex flex-col items-center" style={{ marginBottom: 28 }}>
              <div className="relative" style={{ marginBottom: 14 }}>
                <div style={{
                  position: "absolute", inset: -8,
                  background: "radial-gradient(circle, rgba(37,211,102,0.2) 0%, transparent 70%)",
                  borderRadius: "50%",
                }} />
                <WhatsAppLogo size={60} className="relative" />
              </div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>
                Create account
              </h1>
              <p style={{ color: "#8696a0", fontSize: 13 }}>Join WhatsApp Web today</p>
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12,
                  padding: "11px 14px",
                  marginBottom: 18,
                  color: "#f87171",
                  fontSize: 13,
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Name</label>
                <div className="field flex items-center gap-3" style={inputStyle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e9edef", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email address</label>
                <div className="field flex items-center gap-3" style={inputStyle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e9edef", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Password</label>
                <div className="field flex items-center gap-3" style={inputStyle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e9edef", fontSize: 14 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ color: "#8696a0", cursor: "pointer", flexShrink: 0, lineHeight: 0 }}>
                    {showPw ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {form.password && <StrengthBar password={form.password} />}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  background: loading ? "rgba(37,211,102,0.5)" : "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  borderRadius: 14,
                  padding: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(37,211,102,0.3)",
                  transition: "all 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3" style={{ margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: "#8696a0", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            <p style={{ textAlign: "center", color: "#8696a0", fontSize: 14 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#25d366", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 20, color: "#4a5568", fontSize: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
}
