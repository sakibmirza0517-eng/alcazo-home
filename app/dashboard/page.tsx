"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Hammer, LogOut, Calendar, User, Phone, Mail, Clock, MapPin, Bell, MessageCircle, Check, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "completed">("all");

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

  // Mark as Read Function - Firebase mein save karega
  const handleMarkAsRead = async (bookingId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "bookings", bookingId), {
        readByCustomer: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");
  
  // Unread accepted bookings
  const unreadAcceptedBookings = acceptedBookings.filter(b => !b.readByCustomer);

  // Filter based on active tab
  const filteredBookings = () => {
    switch (activeTab) {
      case "pending": return pendingBookings;
      case "accepted": return acceptedBookings;
      case "completed": return [...completedBookings, ...cancelledBookings];
      default: return bookings;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#fffbeb", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <Hammer size={48} color="#d97706" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "16px", color: "#d97706", fontSize: "1.2rem", fontWeight: "600" }}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fffbeb", padding: "20px", paddingTop: "100px" }}>
      {/* Navbar */}
      <div style={{
        background: "white", padding: "20px", borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "30px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px"
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

      {/* Stats Overview Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        <div style={{
          background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <TrendingUp size={32} color="#2563eb" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#1e40af", margin: 0, fontWeight: "600" }}>Total Bookings</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e40af", margin: 0 }}>{bookings.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <AlertCircle size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0, fontWeight: "600" }}>Pending</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#92400e", margin: 0 }}>{pendingBookings.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <CheckCircle2 size={32} color="#16a34a" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0, fontWeight: "600" }}>Accepted</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#166534", margin: 0 }}>{acceptedBookings.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(147, 51, 234, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Check size={32} color="#9333ea" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b21a8", margin: 0, fontWeight: "600" }}>Completed</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#6b21a8", margin: 0 }}>{completedBookings.length}</p>
          </div>
        </div>
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
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.name || "N/A"}</p>
          </div>
        </div>

        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Mail size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Email</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.email || "N/A"}</p>
          </div>
        </div>

        <div style={{
          background: "white", padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Phone size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>Phone</p>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{userData?.phone || "N/A"}</p>
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
            New Booking Accepted! ({unreadAcceptedBookings.length})
          </h3>
          <div style={{ display: "grid", gap: "16px" }}>
            {unreadAcceptedBookings.map((booking) => (
              <div key={booking.id} style={{
                background: "white", padding: "20px", borderRadius: "12px",
                border: "2px solid #16a34a"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
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
                        fontSize: "0.9rem"
                      }}
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                  )}
                  
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
                      cursor: "pointer"
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

      {/* Bookings Tabs */}
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
          <Calendar style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
          My Bookings
        </h3>

        {/* Tab Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "10px"
        }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "10px 20px",
              background: activeTab === "all" ? "#d97706" : "white",
              color: activeTab === "all" ? "white" : "#374151",
              border: activeTab === "all" ? "2px solid #d97706" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "10px 20px",
              background: activeTab === "pending" ? "#d97706" : "white",
              color: activeTab === "pending" ? "white" : "#374151",
              border: activeTab === "pending" ? "2px solid #d97706" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            style={{
              padding: "10px 20px",
              background: activeTab === "accepted" ? "#d97706" : "white",
              color: activeTab === "accepted" ? "white" : "#374151",
              border: activeTab === "accepted" ? "2px solid #d97706" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Accepted ({acceptedBookings.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              padding: "10px 20px",
              background: activeTab === "completed" ? "#d97706" : "white",
              color: activeTab === "completed" ? "white" : "#374151",
              border: activeTab === "completed" ? "2px solid #d97706" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Completed ({completedBookings.length + cancelledBookings.length})
          </button>
        </div>

        {filteredBookings().length === 0 ? (
          <div style={{
            padding: "40px", textAlign: "center", background: "#f9fafb",
            borderRadius: "12px", border: "2px dashed #e5e7eb"
          }}>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>
              No bookings found. <Link href="/book-service" style={{ color: "#d97706", fontWeight: "700" }}>Book a service</Link> now!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredBookings().map((booking) => {
              const statusColors = {
                pending: { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
                accepted: { bg: "#dcfce7", text: "#16a34a", label: "ACCEPTED" },
                completed: { bg: "#dbeafe", text: "#2563eb", label: "COMPLETED" },
                cancelled: { bg: "#fee2e2", text: "#dc2626", label: "CANCELLED" }
              };
              const status = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;

              return (
                <div key={booking.id} style={{
                  background: "#f9fafb", padding: "20px", borderRadius: "12px",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#d97706", margin: 0 }}>
                      {booking.serviceType}
                    </h4>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600",
                      background: status.bg, color: status.text
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 10px 0", color: "#4b5563" }}>
                    <strong>Problem:</strong> {booking.description}
                  </p>
                  {booking.professionalName && (
                    <p style={{ margin: "0 0 10px 0", color: "#4b5563" }}>
                      <strong>Professional:</strong> {booking.professionalName}
                    </p>
                  )}
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

                  {/* Action buttons for accepted bookings */}
                  {booking.status === "accepted" && booking.professionalPhone && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                          padding: "8px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                      <a 
                        href={`tel:${booking.professionalPhone}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#d97706",
                          color: "white",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}
                      >
                        <Phone size={16} />
                        Call
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
