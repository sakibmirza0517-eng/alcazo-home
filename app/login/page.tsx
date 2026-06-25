"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, Mail, Lock, ArrowLeft } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
    } catch (error: any) {
      console.error(error);
      alert("❌ Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 GOOGLE SIGN-IN FUNCTION
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // New user - create document
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || "User",
          email: user.email,
          phone: user.phoneNumber || "",
          role: "customer", // Default role
          photoURL: user.photoURL || "",
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        alert("✅ Welcome to Alcazo! Your account has been created.");
      } else {
        // Existing user - update last login
        await setDoc(doc(db, "users", user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
        alert("✅ Login Successful! Welcome back!");
      }

      // Redirect based on role
      const userData = (await getDoc(doc(db, "users", user.uid))).data();
      const role = userData?.role || "customer";

      if (role === "professional") {
        router.push("/professional-dashboard");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      alert("❌ Google Sign-In Failed: " + error.message);
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

        {/* 🔵 GOOGLE SIGN-IN BUTTON */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "white",
            color: "#111827",
            border: "2px solid #e5e7eb",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d97706";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "20px 0",
          color: "#9ca3af",
          fontSize: "0.85rem"
        }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ padding: "0 12px" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Email/Password Form */}
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
            {loading ? "Logging in..." : "Login with Email"}
          </button>
        </form>

        {/* Spam Folder Warning */}
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
          ⚠️ Didn't receive email? Please check your Spam folder.
        </p>

        <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "0.9rem" }}>
          Don't have an account? <Link href="/register" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
