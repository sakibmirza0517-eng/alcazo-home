"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Hammer, LogOut, Calendar, User, Phone, Mail, Clock, MapPin, Bell, MessageCircle, Check } from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readBookings, setReadBookings] = useState<string[]>([]); // <-- Naya State

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const q = query(collection(db, "bookings"), where("customerId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const bookingsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBookings(bookingsList);
          setLoading(false);
        });

        return () => unsubscribe();

      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Mark as Read Function - Naya Add Kiya
  const handleMarkAsRead = (bookingId: string) => {
    setReadBookings(prev => [...prev, bookingId]);
  };

  // Separate bookings by status
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  
  // Sirf wo accepted bookings dikhao jo read nahi hui hain
  const unreadAcceptedBookings = acceptedBookings.filter(b => !readBookings.includes(b.id));

  if (loading) {
    return <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>;
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
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Customer Dashboard</p>
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
          Welcome back, {userData?.name}! 👋
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Manage your bookings and find expert professionals for your home.
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
          <Mail size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Email</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.email}</p>
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
      </div>

      {/* Accepted Jobs Section - Notification Style */}
      {unreadAcceptedBookings.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", 
          padding: "30px", borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(22, 163, 74, 0.15)", 
          marginBottom: "30px",
          border: "2px solid #16a34a"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#16a34a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={24} />
            Booking Accepted! ({unreadAcceptedBookings.length})
          </h3>
          <div style={{ display: "grid", gap: "16px" }}>
            {unreadAcceptedBookings.map((booking) => (
              <div key={booking.id} style={{
                background: "white", padding: "20px", borderRadius: "12px",
                border: "2px solid #16a34a"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#16a34a", margin: 0 }}>
                    ✅ {booking.serviceType} - Accepted
                  </h4>
                </div>
                <p style={{ margin: "0 0 10px 0", color: "#4b5563", fontSize: "1rem" }}>
                  <strong>Professional:</strong> {booking.professionalName || "N/A"}
                </p>
                <p style={{ margin: "0 0 10px 0", color: "#4b5563" }}>
                  <strong>Problem:</strong> {booking.description}
                </p>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "#6b7280", fontSize: "0.9rem", marginBottom: "15px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={16} /> {booking.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={16} /> {booking.timeSlot}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={16} /> {booking.address}
                  </span>
                </div>
                
                {/* Action Buttons Row - Naya Add Kiya */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {booking.professionalPhone && (
                    <a 
                      href={`https://wa.me/91${booking.professionalPhone}?text=${encodeURIComponent(`Namaste ${booking.professionalName}, main Alcazo se booking kar raha hu.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#25D366",
                        color: "white",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(37, 211, 102, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                  )}
                  
                  {/* Mark as Read Button - Naya Add Kiya */}
                  <button
                    onClick={() => handleMarkAsRead(booking.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#16a34a",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(22, 163, 74, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Check size={18} />
                    Mark as Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bookings Section */}
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
          <Calendar style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
          Pending Bookings ({pendingBookings.length})
        </h3>

        {pendingBookings.length === 0 && unreadAcceptedBookings.length === 0 ? (
          <div style={{
            padding: "40px", textAlign: "center", background: "#f9fafb",
            borderRadius: "12px", border: "2px dashed #e5e7eb"
          }}>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>
              No bookings yet. <Link href="/book-service" style={{ color: "#d97706", fontWeight: "700" }}>Book a service</Link> now!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {pendingBookings.map((booking) => (
              <div key={booking.id} style={{
                background: "#f9fafb", padding: "20px", borderRadius: "12px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#d97706", margin: 0 }}>
                    {booking.serviceType}
                  </h4>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600",
                    background: "#fef3c7", color: "#d97706"
                  }}>
                    PENDING
                  </span>
                </div>
                <p style={{ margin: "0 0 10px 0", color: "#4b5563" }}>
                  <strong>Problem:</strong> {booking.description}
                </p>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "#6b7280", fontSize: "0.9rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={16} /> {booking.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={16} /> {booking.timeSlot}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={16} /> {booking.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}