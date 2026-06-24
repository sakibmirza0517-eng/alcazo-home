"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, User, Briefcase, ArrowLeft } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [service, setService] = useState("Carpenter");

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
        // Email fail hone par bhi aage badhenge
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
