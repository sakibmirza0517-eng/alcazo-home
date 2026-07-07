"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Hammer, LogOut, Calendar, User, Phone, Mail, Clock, MapPin, Bell, Check, TrendingUp, AlertCircle, CheckCircle2, MessageSquare, Star, Navigation, Truck, Wrench, CheckCircle } from "lucide-react";
import { createOrGetChat } from "@/lib/chat";
import { submitRating } from "@/lib/rating";
import { statusInfo, TrackingStatus, getStatusProgress } from "@/lib/tracking";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "completed">("all");
  
  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const handleOpenChat = async (booking: any) => {
    try {
      const chatId = await createOrGetChat(
        booking.id,
        booking.customerId,
        booking.professionalId
      );
      router.push(`/chat/${booking.id}`);
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat");
    }
  };

  // Rating functions
  const handleOpenRating = (booking: any) => {
    setCurrentBooking(booking);
    setShowRatingModal(true);
    setRating(0);
    setReview("");
  };

  const handleCloseRating = () => {
    setShowRatingModal(false);
    setCurrentBooking(null);
    setRating(0);
    setReview("");
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!currentBooking || !auth.currentUser) return;

    setSubmittingRating(true);
    try {
      const result = await submitRating(
        currentBooking.id,
        auth.currentUser.uid,
        currentBooking.professionalId,
        rating,
        review
      );

      if (result.success) {
        alert("✅ Thank you for your rating!");
        handleCloseRating();
      } else {
        alert("❌ Failed to submit rating");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error submitting rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // ⭐ NEW: Helper function to format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString("en-IN", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "short"
      });
    } catch {
      return "";
    }
  };

  // ⭐ NEW: Get timestamp for a specific status from trackingHistory
  const getStatusTimestamp = (booking: any, status: TrackingStatus) => {
    if (!booking.trackingHistory || !Array.isArray(booking.trackingHistory)) return null;
    const entry = booking.trackingHistory.find((h: any) => h.status === status);
    return entry?.timestamp || null;
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");
  
  const unreadAcceptedBookings = acceptedBookings.filter(b => !b.readByCustomer);

  const filteredBookings = () => {
    switch (activeTab) {
      case "pending": return pendingBookings;
      case "accepted": return acceptedBookings;
      case "completed": return [...completedBookings, ...cancelledBookings];
      default: return bookings;
    }
  };

  // ⭐ NEW: Tracking Timeline Component
  const TrackingTimeline = ({ booking }: { booking: any }) => {
    const currentStatus: TrackingStatus = booking.trackingStatus || "accepted";
    const steps: TrackingStatus[] = ["accepted", "on_the_way", "arrived", "working", "completed"];
    const currentIndex = steps.indexOf(currentStatus);
    const progress = getStatusProgress(currentStatus);

    const getStepIcon = (status: TrackingStatus) => {
      switch (status) {
        case "accepted": return <CheckCircle size={18} />;
        case "on_the_way": return <Truck size={18} />;
        case "arrived": return <MapPin size={18} />;
        case "working": return <Wrench size={18} />;
        case "completed": return <CheckCircle2 size={18} />;
        default: return <Check size={18} />;
      }
    };

    return (
      <div style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        padding: "20px",
        borderRadius: "12px",
        border: "2px solid #0ea5e9",
        marginTop: "15px"
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <h5 style={{ 
            margin: 0, 
            fontSize: "1rem", 
            fontWeight: "700", 
            color: "#0369a1",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Navigation size={18} />
            Live Tracking
          </h5>
          <div style={{
            background: statusInfo[currentStatus].color,
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <span>{statusInfo[currentStatus].icon}</span>
            <span>{statusInfo[currentStatus].label}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: "6px",
          background: "#e5e7eb",
          borderRadius: "10px",
          marginBottom: "20px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #0ea5e9, #0284c7)",
            borderRadius: "10px",
            transition: "width 0.5s ease"
          }} />
        </div>

        {/* Timeline Steps */}
        <div style={{ position: "relative", paddingLeft: "30px" }}>
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const timestamp = getStatusTimestamp(booking, step);
            const info = statusInfo[step];

            return (
              <div key={step} style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                marginBottom: index < steps.length - 1 ? "20px" : "0",
                position: "relative"
              }}>
                {/* Vertical Line */}
                {index < steps.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: "-21px",
                    top: "24px",
                    width: "2px",
                    height: "calc(100% + 8px)",
                    background: index < currentIndex ? "#0ea5e9" : "#e5e7eb"
                  }} />
                )}

                {/* Step Icon */}
                <div style={{
                  position: "absolute",
                  left: "-30px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: isCompleted ? info.color : "#e5e7eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isCurrent ? `0 0 0 4px ${info.color}30` : "none",
                  animation: isCurrent ? "pulse 2s infinite" : "none"
                }}>
                  <div style={{ transform: "scale(0.7)" }}>
                    {getStepIcon(step)}
                  </div>
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "0.95rem", 
                      fontWeight: isCurrent ? "700" : "600",
                      color: isCompleted ? "#111827" : "#9ca3af"
                    }}>
                      {info.label}
                    </p>
                    {timestamp && (
                      <span style={{ 
                        fontSize: "0.75rem", 
                        color: "#6b7280",
                        fontWeight: "500"
                      }}>
                        {formatTimestamp(timestamp)}
                      </span>
                    )}
                  </div>
                  {isCurrent && currentStatus === "on_the_way" && (
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "0.8rem", 
                      color: "#0369a1",
                      fontStyle: "italic"
                    }}>
                      🚗 Professional is on the way to your location
                    </p>
                  )}
                  {isCurrent && currentStatus === "arrived" && (
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "0.8rem", 
                      color: "#7c3aed",
                      fontStyle: "italic"
                    }}>
                      📍 Professional has arrived at your location
                    </p>
                  )}
                  {isCurrent && currentStatus === "working" && (
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "0.8rem", 
                      color: "#c2410c",
                      fontStyle: "italic"
                    }}>
                      🔧 Service is in progress
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pulse Animation CSS */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
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

      {/* ⭐ NEW: Active Tracking Section (Top Priority) */}
      {acceptedBookings.filter(b => b.trackingStatus && b.trackingStatus !== "accepted").length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
          padding: "30px", borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)", 
          marginBottom: "30px",
          border: "2px solid #0ea5e9"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0369a1", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Navigation size={24} />
            Live Tracking Active
          </h3>
          <div style={{ display: "grid", gap: "16px" }}>
            {acceptedBookings
              .filter(b => b.trackingStatus && b.trackingStatus !== "accepted")
              .map((booking) => (
                <div key={booking.id} style={{
                  background: "white", padding: "20px", borderRadius: "12px",
                  border: "2px solid #0ea5e9"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0369a1", margin: 0 }}>
                      🚗 {booking.serviceType} - {statusInfo[booking.trackingStatus as TrackingStatus]?.label}
                    </h4>
                  </div>
                  <p style={{ margin: "0 0 10px 0", color: "#4b5563", fontSize: "1rem" }}>
                    <strong>Professional:</strong> {booking.professionalName || "N/A"}
                  </p>
                  <p style={{ margin: "0 0 10px 0", color: "#4b5563" }}>
                    <strong>Problem:</strong> {booking.description}
                  </p>
                  
                  {/* ⭐ NEW: Full Tracking Timeline */}
                  <TrackingTimeline booking={booking} />

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px" }}>
                    <button
                      onClick={() => handleOpenChat(booking)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#d97706",
                        color: "white",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      <MessageSquare size={18} />
                      Chat
                    </button>
                    
                    {booking.professionalPhone && (
                      <a 
                        href={`tel:${booking.professionalPhone}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#16a34a",
                          color: "white",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "0.9rem"
                        }}
                      >
                        <Phone size={18} />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
                  <button
                    onClick={() => handleOpenChat(booking)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#d97706",
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    <MessageSquare size={18} />
                    Chat
                  </button>
                  
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

                  {/* ⭐ NEW: Show tracking timeline for accepted bookings in list */}
                  {booking.status === "accepted" && booking.trackingStatus && booking.trackingStatus !== "pending" && (
                    <TrackingTimeline booking={booking} />
                  )}

                  {/* Action buttons for accepted bookings */}
                  {booking.status === "accepted" && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                      <button
                        onClick={() => handleOpenChat(booking)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#d97706",
                          color: "white",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        <MessageSquare size={16} />
                        Chat
                      </button>

                      {booking.professionalPhone && (
                        <a 
                          href={`tel:${booking.professionalPhone}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#16a34a",
                            color: "white",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "0.85rem"
                          }}
                        >
                          <Phone size={16} />
                          Emergency Call
                        </a>
                      )}
                    </div>
                  )}

                  {/* ⭐ Rate button for completed bookings */}
                  {booking.status === "completed" && !booking.rated && booking.professionalId && (
                    <button
                      onClick={() => handleOpenRating(booking)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                        color: "#111827",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        marginTop: "10px"
                      }}
                    >
                      <Star size={16} fill="#111827" />
                      Rate Professional
                    </button>
                  )}

                  {/* Show rating if already rated */}
                  {booking.status === "completed" && booking.rated && (
                    <div style={{
                      marginTop: "10px",
                      padding: "10px",
                      background: "#fef3c7",
                      borderRadius: "8px",
                      border: "1px solid #fbbf24"
                    }}>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "#92400e" }}>
                        <strong>Your Rating:</strong> {"⭐".repeat(booking.rating)} ({booking.rating}/5)
                      </p>
                      {booking.review && (
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", color: "#78350f" }}>
                          <strong>Review:</strong> {booking.review}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⭐ RATING MODAL */}
      {showRatingModal && currentBooking && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem", fontWeight: "700", color: "#111827", textAlign: "center" }}>
              Rate Your Experience
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#6b7280", textAlign: "center", fontSize: "0.9rem" }}>
              How was your experience with {currentBooking.professionalName}?
            </p>

            {/* Stars */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "2.5rem",
                    transition: "transform 0.2s",
                    transform: (hoverRating || rating) >= star ? "scale(1.1)" : "scale(1)"
                  }}
                >
                  {(hoverRating || rating) >= star ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            {/* Rating text */}
            {rating > 0 && (
              <p style={{ textAlign: "center", color: "#d97706", fontWeight: "600", marginBottom: "20px" }}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent!"}
              </p>
            )}

            {/* Review textarea */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #e5e7eb",
                marginBottom: "20px",
                minHeight: "100px",
                fontSize: "0.95rem",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#d97706"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating || rating === 0}
                style={{
                  flex: 1,
                  background: submittingRating || rating === 0 ? "#e5e7eb" : "linear-gradient(135deg, #d97706, #b45309)",
                  color: submittingRating || rating === 0 ? "#9ca3af" : "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: submittingRating || rating === 0 ? "not-allowed" : "pointer"
                }}
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
              <button
                onClick={handleCloseRating}
                disabled={submittingRating}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}