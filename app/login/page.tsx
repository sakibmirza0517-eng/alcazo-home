"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, Mail, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Link click karne ke baad user kahan jayega
      const actionCodeSettings = {
        url: process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` 
          : `http://localhost:3000/auth/callback`,
        handleCodeInApp: true,
      };

      // Firebase se link bhejo
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Email ko browser mein save karo (Firebase ko chahiye hota hai)
      window.localStorage.setItem("emailForSignIn", email);
      
      setSent(true);
    } catch (error) {
      console.error("Error sending link:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
      }}>
        <div style={{
          background: "white", padding: "40px", borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(217, 119, 6, 0.15)", maxWidth: "400px", textAlign: "center"
        }}>
          <div style={{
            width: "60px", height: "60px", background: "#dcfce7", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
          }}>
            <Mail size={30} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", marginBottom: "10px" }}>Check Your Email!</h1>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Humne <strong>{email}</strong> par ek login link bheja hai. Link par click karke login karein.
          </p>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            (Spam folder bhi check karein)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <Link href="/" style={{
        position: "absolute", top: "20px", left: "20px", zIndex: "10",
        display: "flex", alignItems: "center", gap: "8px",
        color: "#d97706", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem"
      }}>
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div style={{
        background: "white", padding: "40px", borderRadius: "20px",
        boxShadow: "0 20px 50px rgba(217, 119, 6, 0.15)", width: "100%", maxWidth: "400px", textAlign: "center"
      }}>
        <div style={{
          width: "60px", height: "60px", background: "linear-gradient(135deg, #d97706, #b45309)",
          borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
        }}>
          <Hammer size={30} color="white" />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", marginBottom: "10px" }}>Welcome Back</h1>
        <p style={{ color: "#6b7280", marginBottom: "30px", fontSize: "0.95rem" }}>Enter your email to receive a magic login link</p>

        <form onSubmit={handleSendLink} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <Mail size={20} style={{ position: "absolute", left: "16px", top: "14px", color: "#9ca3af" }} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "14px 14px 14px 48px", border: "2px solid #e5e7eb",
                borderRadius: "12px", fontSize: "1rem", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)", color: "white",
              padding: "14px", borderRadius: "12px", border: "none", fontWeight: "700",
              fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 8px 20px rgba(217, 119, 6, 0.3)",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Sending Link..." : "Send Magic Link "}
          </button>
        </form>

        <p style={{ marginTop: "24px", color: "#6b7280", fontSize: "0.9rem" }}>
          Don't have an account? <Link href="/register" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
