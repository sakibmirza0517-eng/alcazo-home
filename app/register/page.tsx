"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, User, Briefcase, ArrowLeft } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [service, setService] = useState("Carpenter");

  // 🔵 GOOGLE SIGN-UP FUNCTION (Sirf Customer ke liye)
  const handleGoogleSignUp = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore mein user data save karo
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || "User",
        email: user.email,
        phone: "",
        role: "customer", // Google se sign up = Customer by default
        photoURL: user.photoURL || "",
        emailVerified: true, // Google verified hai already
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      alert("✅ Welcome to Alcazo! Your account has been created.");
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Google Sign-Up Error:", error);
      alert("❌ Google Sign-Up Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔵 Step 1: Creating user...");
      
      // 1. Firebase Auth mein User Create karo
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Step 1 Complete: User created -", user.email);
      console.log("🔵 Step 2: Sending verification email...");

      // 📧 EMAIL VERIFICATION
      try {
        await sendEmailVerification(user);
        console.log("✅ Step 2 Complete: Verification email sent to", user.email);
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
      }

      console.log("🔵 Step 3: Saving to Firestore...");
      
      // 2. User ki details Firestore Database mein save karo
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone,
        role: role,
        service: role === "professional" ? service : null,
        createdAt: new Date().toISOString()
      });

      console.log("✅ Step 3 Complete: User data saved to Firestore");

      // ✅ AGAR PROFESSIONAL HAI, TOH professionals COLLECTION MEIN BHI SAVE KARO
      if (role === "professional") {
        console.log("🔵 Step 4: Saving professional data to professionals collection...");
        
        await setDoc(doc(db, "professionals", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          phone: phone,
          category: service,
          skills: "Not specified yet",
          location: "Karnal",
          status: "pending",
          isActive: false,
          registeredAt: serverTimestamp(),
          approvedAt: null,
          approvedBy: null
        });

        console.log("✅ Step 4 Complete: Professional data saved with status: pending");
      }

      alert("✅ Registration Successful! Verification email sent to your inbox. Please check spam folder.");
      router.push("/login");

    } catch (error) {
      console.error("❌ Registration Error:", error.code, error.message);
      alert("❌ Error: " + error.message);
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
        background: "white", padding: "24px", borderRadius: "20px",
        boxShadow: "0 20px 50px rgba(217, 119, 6, 0.15)",
        width: "100%", maxWidth: "500px", textAlign: "center"
      }}>
        <div style={{
          width: "45px", height: "45px", background: "linear-gradient(135deg, #d97706, #b45309)",
          borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px"
        }}>
          <Hammer size={24} color="white" />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Create Account</h1>
        <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "0.85rem" }}>Join Alcazo to get started</p>

        {/* 🔵 GOOGLE SIGN-UP BUTTON (Sirf Customer ke liye) */}
        {role === "customer" && (
          <>
            <button
              onClick={handleGoogleSignUp}
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
                marginBottom: "16px",
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
              Sign up with Google
            </button>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              margin: "16px 0",
              color: "#9ca3af",
              fontSize: "0.85rem"
            }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ padding: "0 12px" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>
          </>
        )}

        {/* Role Toggle */}
        <div style={{
          display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", marginBottom: "16px"
        }}>
          <button type="button" onClick={() => setRole("customer")} style={{
            flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer",
            background: role === "customer" ? "white" : "transparent",
            color: role === "customer" ? "#d97706" : "#6b7280",
            fontWeight: "700", fontSize: "0.85rem", boxShadow: role === "customer" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
          }}>
            <User size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} /> Customer
          </button>
          <button type="button" onClick={() => setRole("professional")} style={{
            flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer",
            background: role === "professional" ? "white" : "transparent",
            color: role === "professional" ? "#d97706" : "#6b7280",
            fontWeight: "700", fontSize: "0.85rem", boxShadow: role === "professional" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
          }}>
            <Briefcase size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} /> Professional
          </button>
        </div>

        {/* Info Message for Professional */}
        {role === "professional" && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "16px",
            fontSize: "0.85rem",
            color: "#92400e"
          }}>
            ℹ️ Professional registration requires admin approval
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left" }}>
          <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password (Min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

          {/* Service Dropdown - Sirf Professional ke liye */}
          {role === "professional" && (
            <select 
              value={service} 
              onChange={(e) => setService(e.target.value)} 
              required
              style={{...inputStyle, gridColumn: "1 / -1", cursor: "pointer"}}
            >
              <option value="Carpenter">Carpenter</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Painter">Painter</option>
              <option value="AC Service">AC Service</option>
              <option value="Interior Design">Interior Design</option>
              <option value="Furniture Repair">Furniture Repair</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Tile & Flooring">Tile & Flooring</option>
            </select>
          )}

          <button type="submit" disabled={loading} style={{
            ...buttonStyle, gridColumn: "1 / -1", opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "0.85rem" }}>
          Already have an account? <Link href="/login" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "2px solid #e5e7eb",
  borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", background: "#fafafa"
};

const buttonStyle = {
  background: "linear-gradient(135deg, #d97706, #b45309)", color: "white",
  padding: "10px", borderRadius: "10px", border: "none", fontWeight: "700",
  fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 20px rgba(217, 119, 6, 0.3)", marginTop: "8px"
};
