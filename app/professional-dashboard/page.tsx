"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Hammer, LogOut, Briefcase, User, Phone, Mail, MapPin, Calendar, Clock, MessageCircle, CheckCircle } from "lucide-react";

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // 1. User ki details fetch karo
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          // 2. Is Professional ki service type ki pending bookings fetch karo
          if (data.service) {
            const q = query(
              collection(db, "bookings"), 
              where("serviceType", "==", data.service),
              where("status", "==", "pending")
            );
            const querySnapshot = await getDocs(q);
            const bookingsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bookingsList);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Job Accept karne ka function
  const handleAcceptJob = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "accepted",
        professionalId: auth.currentUser?.uid,
        professionalName: userData?.name,
        professionalPhone: userData?.phone  // <-- YE LINE ADD KI HAI
      });
      alert("✅ Job Accepted! Customer ko notify kar diya gaya hai.");
      // List se hata do
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error(error);
      alert("Error accepting job");
    }
  };

  // Customer se WhatsApp pe contact karne ka function
  const handleContactCustomer = (phone: string, name: string) => {
    const message = `Namaste ${name}, main Alcazo se hu. Aapki booking mili hai.`;
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div style={{ padding: "100px", textAlign: "center" }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fffbeb", padding: "20px", paddingTop: "100px" }}>
      {/* Navbar */}
      <div style={{
        background: "white", padding: "20px", borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "30px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "45px", height: "45px", background: "linear-gradient(135deg, #d97706, #b45309)",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Hammer size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0 }}>Alcazo</h1>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Professional Dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#fee2e2", color: "#dc2626", border: "none",
          padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
          fontWeight: "600"
        }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Welcome Card */}
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "30px"
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
          Welcome, {userData?.name}! 🔨
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Manage your services and connect with customers.
        </p>
      </div>

      {/* User Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <User size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Full Name</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.name}</p>
          </div>
        </div>

        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Briefcase size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Service Type</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.service || "Professional"}</p>
          </div>
        </div>

        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Phone size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Phone</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.phone}</p>
          </div>
        </div>

        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <MapPin size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Location</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>Karnal, Haryana</p>
          </div>
        </div>
      </div>

      {/* Available Jobs Section */}
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
          <Briefcase style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
          Available Jobs ({bookings.length})
        </h3>
        
        {bookings.length === 0 ? (
          <div style={{
            padding: "40px", textAlign: "center", background: "#f9fafb",
            borderRadius: "12px", border: "2px dashed #e5e7eb"
          }}>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>
              No new job requests yet. Check back later!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{
                background: "#f9fafb", padding: "24px", borderRadius: "16px",
                border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                      {booking.serviceType}
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                      Customer: {booking.phone}
                    </p>
                  </div>
                  <span style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                    background: "#fef3c7", color: "#d97706"
                  }}>
                    PENDING
                  </span>
                </div>

                <p style={{ color: "#4b5563", margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>
                  <strong>Problem:</strong> {booking.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#6b7280", fontSize: "0.9rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} color="#d97706" /> {booking.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} color="#d97706" /> {booking.timeSlot}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={16} color="#d97706" /> {booking.address}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button 
                    onClick={() => handleAcceptJob(booking.id)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      background: "#16a34a", color: "white", border: "none",
                      padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem"
                    }}
                  >
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => handleContactCustomer(booking.phone, "Customer")}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      background: "#25D366", color: "white", border: "none",
                      padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem"
                    }}
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}