import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "WhatsApp",
  description: "Real-time messaging",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden" style={{ background: "#0a0f14" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
