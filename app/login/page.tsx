"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, Mail, Lock, ArrowLeft } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // User ki details Firestore se fetch karo
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        alert("✅ Login Successful! Welcome " + userData.name);

        if (role === "professional") {
          router.push("/professional-dashboard");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error(error);
      alert("❌ Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <Link href="/" style={{
        position: "absolute", top: "20px", left: "20px", zIndex: "10",
        display: "flex", alignItems: "center", gap: "8px",
        color: "#d97706", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem"
      }}>
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 20px 50px rgba(217, 119, 6, 0.15)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          background: "linear-gradient(135deg, #d97706, #b45309)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <Hammer size={28} color="white" />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Welcome Back</h1>
        <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "0.9rem" }}>Login to access your bookings</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "#9ca3af" }} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 12px 12px 42px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "#9ca3af" }} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 12px 12px 42px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)",
              color: "white",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(217, 119, 6, 0.3)",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Logging in..." : "Login to Alcazo"}
          </button>
        </form>

        {/* ✅ SPAM FOLDER MESSAGE ADDED */}
        <p style={{ 
          marginTop: "16px", 
          color: "#d97706", 
          fontSize: "0.85rem", 
          fontWeight: "600",
          background: "#fffbeb",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #fcd34d"
        }}>
          ⚠️ Didn't receive verification email? Please check your Spam folder.
        </p>

        <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "0.9rem" }}>
          Don't have an account? <Link href="/register" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
