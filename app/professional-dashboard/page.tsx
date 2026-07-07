"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, getDocs, serverTimestamp, arrayUnion } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Hammer, LogOut, Briefcase, User, Phone, Mail, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Check, DollarSign, MessageSquare, Star, MessageCircle, Navigation, Truck, Wrench, CheckCircle2, Play, PlayCircle } from "lucide-react";
import { createOrGetChat } from "@/lib/chat";
import { statusInfo, TrackingStatus, getActionButton, getStatusProgress } from "@/lib/tracking";

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"available" | "accepted" | "completed" | "reviews">("available");

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
          const data = userDoc.data();
          setUserData(data);

          const proDoc = await getDoc(doc(db, "professionals", user.uid));
          if (proDoc.exists()) {
            setProfessionalData(proDoc.data());
          }

          const serviceType = data.service;

          const availableQuery = query(
            collection(db, "bookings"),
            where("serviceType", "==", serviceType),
            where("status", "==", "pending")
          );
          const unsubscribeAvailable = onSnapshot(availableQuery, (snapshot) => {
            const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableJobs(jobsList);
          });

          const acceptedQuery = query(
            collection(db, "bookings"),
            where("professionalId", "==", user.uid),
            where("status", "==", "accepted")
          );
          const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
            const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAcceptedJobs(jobsList);
          });

          const completedQuery = query(
            collection(db, "bookings"),
            where("professionalId", "==", user.uid),
            where("status", "==", "completed")
          );
          const unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
            const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompletedJobs(jobsList);
            
            const reviews = jobsList
              .filter(job => job.rated && job.review)
              .sort((a, b) => {
                const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 10);
            setRecentReviews(reviews);
            
            setLoading(false);
          });

          return () => {
            unsubscribeAvailable();
            unsubscribeAccepted();
            unsubscribeCompleted();
          };
        }
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

  const handleAcceptJob = async (bookingId: string) => {
    if (!window.confirm("Kya aap ye job accept karna chahte hain?")) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "accepted",
        professionalId: auth.currentUser?.uid,
        professionalName: userData?.name,
        professionalPhone: userData?.phone,
        trackingStatus: "accepted",
        trackingHistory: arrayUnion({
          status: "accepted",
          label: "Professional Assigned",
          timestamp: serverTimestamp(),
          note: `${userData?.name} accepted the job`
        }),
        acceptedAt: new Date().toISOString()
      });
      alert("✅ Job Accepted! Customer ko notify kar diya gaya hai.");
    } catch (error) {
      console.error(error);
      alert("❌ Error accepting job");
    }
  };

  const handleRejectJob = async (bookingId: string) => {
    if (!window.confirm("Kya aap ye job reject karna chahte hain?")) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "rejected",
        rejectedBy: auth.currentUser?.uid,
        rejectedAt: new Date().toISOString()
      });
      alert("Job rejected.");
    } catch (error) {
      console.error(error);
      alert("❌ Error rejecting job");
    }
  };

  const handleCompleteJob = async (bookingId: string) => {
    if (!window.confirm("Kya ye job complete ho gayi hai?")) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        trackingStatus: "completed",
        trackingHistory: arrayUnion({
          status: "completed",
          label: "Service Completed",
          timestamp: serverTimestamp(),
          note: "Service has been completed"
        }),
        completedAt: new Date().toISOString()
      });
      alert("✅ Job marked as completed!");
    } catch (error) {
      console.error(error);
      alert("❌ Error completing job");
    }
  };

  // ⭐ NEW: Update Tracking Status Function
  const handleUpdateTracking = async (bookingId: string, currentStatus: TrackingStatus) => {
    const action = getActionButton(currentStatus);
    if (!action) return;

    const confirmMessages: Record<string, string> = {
      "on_the_way": "Kya aap travel shuru kar rahe hain?",
      "arrived": "Kya aap location par pahunch gaye hain?",
      "working": "Kya aap kaam shuru kar rahe hain?",
      "completed": "Kya aap job complete kar rahe hain?"
    };

    if (!window.confirm(confirmMessages[action.nextStatus] || "Continue?")) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        trackingStatus: action.nextStatus,
        trackingHistory: arrayUnion({
          status: action.nextStatus,
          label: statusInfo[action.nextStatus].label,
          timestamp: serverTimestamp(),
          note: `Status updated to ${statusInfo[action.nextStatus].label}`
        }),
        // Agar completed hai toh status bhi update karo
        ...(action.nextStatus === "completed" ? {
          status: "completed",
          completedAt: new Date().toISOString()
        } : {})
      });
      alert(`✅ Status updated: ${statusInfo[action.nextStatus].label}`);
    } catch (error) {
      console.error(error);
      alert("❌ Error updating status");
    }
  };

  const handleOpenChat = async (booking: any) => {
    try {
      await createOrGetChat(
        booking.id,
        booking.customerId,
        booking.professionalId || auth.currentUser!.uid
      );
      router.push(`/chat/${booking.id}`);
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < rating ? "#fbbf24" : "none"} 
        color={i < rating ? "#fbbf24" : "#d1d5db"} 
      />
    ));
  };

  // ⭐ NEW: Mini Timeline Component for Professional
  const MiniTrackingTimeline = ({ booking }: { booking: any }) => {
    const currentStatus: TrackingStatus = booking.trackingStatus || "accepted";
    const steps: TrackingStatus[] = ["accepted", "on_the_way", "arrived", "working", "completed"];
    const currentIndex = steps.indexOf(currentStatus);

    const getStepIcon = (status: TrackingStatus) => {
      switch (status) {
        case "accepted": return <CheckCircle size={12} />;
        case "on_the_way": return <Truck size={12} />;
        case "arrived": return <MapPin size={12} />;
        case "working": return <Wrench size={12} />;
        case "completed": return <CheckCircle2 size={12} />;
        default: return <Check size={12} />;
      }
    };

    return (
      <div style={{
        background: "#f0f9ff",
        padding: "12px",
        borderRadius: "8px",
        marginTop: "10px",
        border: "1px solid #0ea5e9"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          gap: "4px"
        }}>
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const info = statusInfo[step];
            
            return (
              <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: isCompleted ? info.color : "#e5e7eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  flexShrink: 0
                }}>
                  {getStepIcon(step)}
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: "2px",
                    background: index < currentIndex ? info.color : "#e5e7eb",
                    margin: "0 2px"
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <p style={{
          margin: "8px 0 0 0",
          fontSize: "0.75rem",
          color: "#0369a1",
          fontWeight: "600",
          textAlign: "center"
        }}>
          {statusInfo[currentStatus].icon} {statusInfo[currentStatus].label}
        </p>
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

  const averageRating = professionalData?.averageRating || 0;
  const totalRatings = professionalData?.totalRatings || 0;

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

      {/* Stats Overview Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <AlertCircle size={32} color="#d97706" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0, fontWeight: "600" }}>Available Jobs</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#92400e", margin: 0 }}>{availableJobs.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <CheckCircle size={32} color="#16a34a" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0, fontWeight: "600" }}>Accepted Jobs</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#166534", margin: 0 }}>{acceptedJobs.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <Check size={32} color="#2563eb" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#1e40af", margin: 0, fontWeight: "600" }}>Completed</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e40af", margin: 0 }}>{completedJobs.length}</p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)",
          display: "flex", alignItems: "center", gap: "16px",
          border: "2px solid #fbbf24"
        }}>
          <Star size={32} color="#f59e0b" fill="#fbbf24" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0, fontWeight: "600" }}>Your Rating</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#92400e", margin: 0 }}>
              {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              {averageRating > 0 && <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>/5</span>}
            </p>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(147, 51, 234, 0.1)",
          display: "flex", alignItems: "center", gap: "16px"
        }}>
          <MessageCircle size={32} color="#9333ea" />
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b21a8", margin: 0, fontWeight: "600" }}>Total Reviews</p>
            <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#6b21a8", margin: 0 }}>{totalRatings}</p>
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
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          padding: "24px", borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
          display: "flex", alignItems: "center", gap: "16px",
          border: "2px solid #fbbf24"
        }}>
          <div style={{
            width: "45px", height: "45px",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Star size={24} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0, fontWeight: "600" }}>Your Rating</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              {averageRating > 0 ? (
                <>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#92400e" }}>
                    ({totalRatings} reviews)
                  </span>
                </>
              ) : (
                <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "#92400e", margin: 0 }}>
                  No ratings yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section with Tabs */}
      <div style={{
        background: "white", padding: "30px", borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
          <Briefcase style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
          My Jobs & Reviews
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
            onClick={() => setActiveTab("available")}
            style={{
              padding: "10px 20px",
              background: activeTab === "available" ? "#d97706" : "white",
              color: activeTab === "available" ? "white" : "#374151",
              border: activeTab === "available" ? "2px solid #d97706" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Available ({availableJobs.length})
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
            Accepted ({acceptedJobs.length})
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
            Completed ({completedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              padding: "10px 20px",
              background: activeTab === "reviews" ? "#f59e0b" : "white",
              color: activeTab === "reviews" ? "white" : "#374151",
              border: activeTab === "reviews" ? "2px solid #f59e0b" : "2px solid #e5e7eb",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Star size={16} fill={activeTab === "reviews" ? "white" : "none"} />
            Reviews ({totalRatings})
          </button>
        </div>

        {/* Available Jobs */}
        {activeTab === "available" && (
          <>
            {availableJobs.length === 0 ? (
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
                {availableJobs.map((booking) => (
                  <div key={booking.id} style={{
                    background: "#f9fafb", padding: "24px", borderRadius: "16px",
                    border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                          {booking.serviceType}
                        </h4>
                        <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                          Customer: {booking.customerName || booking.phone}
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

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
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
                        onClick={() => handleRejectJob(booking.id)}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          background: "#dc2626", color: "white", border: "none",
                          padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem"
                        }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ⭐ UPDATED: Accepted Jobs with Tracking */}
        {activeTab === "accepted" && (
          <>
            {acceptedJobs.length === 0 ? (
              <div style={{
                padding: "40px", textAlign: "center", background: "#f9fafb",
                borderRadius: "12px", border: "2px dashed #e5e7eb"
              }}>
                <p style={{ color: "#6b7280", fontSize: "1rem" }}>
                  No accepted jobs yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {acceptedJobs.map((booking) => {
                  const currentStatus: TrackingStatus = booking.trackingStatus || "accepted";
                  const action = getActionButton(currentStatus);
                  const info = statusInfo[currentStatus];
                  
                  return (
                    <div key={booking.id} style={{
                      background: "#f0fdf4", padding: "24px", borderRadius: "16px",
                      border: "2px solid #16a34a", display: "flex", flexDirection: "column", gap: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                            {booking.serviceType}
                          </h4>
                          <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                            Customer: {booking.customerName || booking.phone}
                          </p>
                        </div>
                        {/* ⭐ NEW: Tracking Status Badge */}
                        <div style={{
                          padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                          background: info.color + "20", color: info.color,
                          display: "flex", alignItems: "center", gap: "4px"
                        }}>
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </div>
                      </div>

                      <p style={{ color: "#4b5563", margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>
                        <strong>Problem:</strong> {booking.description}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#6b7280", fontSize: "0.9rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Calendar size={16} color="#16a34a" /> {booking.date}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Clock size={16} color="#16a34a" /> {booking.timeSlot}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <MapPin size={16} color="#16a34a" /> {booking.address}
                        </span>
                      </div>

                      {/* ⭐ NEW: Mini Tracking Timeline */}
                      <MiniTrackingTimeline booking={booking} />

                      {/* ⭐ NEW: Dynamic Action Button */}
                      {action && (
                        <button 
                          onClick={() => handleUpdateTracking(booking.id, currentStatus)}
                          style={{
                            width: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            background: `linear-gradient(135deg, ${info.color}, ${info.color}dd)`,
                            color: "white", border: "none",
                            padding: "12px", borderRadius: "8px", cursor: "pointer", 
                            fontWeight: "700", fontSize: "0.95rem",
                            boxShadow: `0 4px 12px ${info.color}40`,
                            marginTop: "8px"
                          }}
                        >
                          <PlayCircle size={18} />
                          {action.label}
                        </button>
                      )}

                      {/* Other Action Buttons */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                        <button 
                          onClick={() => handleOpenChat(booking)}
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            background: "#d97706", color: "white", border: "none",
                            padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem"
                          }}
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                        {booking.phone && (
                          <a 
                            href={`tel:${booking.phone}`}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                              background: "#16a34a", color: "white", border: "none",
                              padding: "10px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem"
                            }}
                          >
                            <Phone size={16} /> Call
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Completed Jobs */}
        {activeTab === "completed" && (
          <>
            {completedJobs.length === 0 ? (
              <div style={{
                padding: "40px", textAlign: "center", background: "#f9fafb",
                borderRadius: "12px", border: "2px dashed #e5e7eb"
              }}>
                <p style={{ color: "#6b7280", fontSize: "1rem" }}>
                  No completed jobs yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {completedJobs.map((booking) => (
                  <div key={booking.id} style={{
                    background: "#eff6ff", padding: "24px", borderRadius: "16px",
                    border: "2px solid #2563eb", display: "flex", flexDirection: "column", gap: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                          {booking.serviceType}
                        </h4>
                        <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                          Customer: {booking.customerName || booking.phone}
                        </p>
                      </div>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600",
                        background: "#dbeafe", color: "#2563eb"
                      }}>
                        COMPLETED
                      </span>
                    </div>

                    <p style={{ color: "#4b5563", margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>
                      <strong>Problem:</strong> {booking.description}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#6b7280", fontSize: "0.9rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={16} color="#2563eb" /> {booking.date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock size={16} color="#2563eb" /> {booking.timeSlot}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={16} color="#2563eb" /> {booking.address}
                      </span>
                    </div>

                    {/* ⭐ Show rating if customer has rated */}
                    {booking.rated && booking.rating && (
                      <div style={{
                        marginTop: "10px",
                        padding: "12px",
                        background: "#fef3c7",
                        borderRadius: "8px",
                        border: "1px solid #fbbf24"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#92400e" }}>Customer Rating:</span>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {renderStars(booking.rating)}
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#92400e" }}>
                            ({booking.rating}/5)
                          </span>
                        </div>
                        {booking.review && (
                          <p style={{ margin: 0, fontSize: "0.9rem", color: "#78350f", fontStyle: "italic" }}>
                            "{booking.review}"
                          </p>
                        )}
                      </div>
                    )}

                    {!booking.rated && (
                      <p style={{ margin: "10px 0 0 0", fontSize: "0.85rem", color: "#6b7280", fontStyle: "italic" }}>
                        ⏳ Waiting for customer rating...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <>
            {recentReviews.length === 0 ? (
              <div style={{
                padding: "40px", textAlign: "center", background: "#f9fafb",
                borderRadius: "12px", border: "2px dashed #e5e7eb"
              }}>
                <Star size={48} color="#fbbf24" style={{ margin: "0 auto 16px", display: "block" }} />
                <p style={{ color: "#6b7280", fontSize: "1rem", fontWeight: "600" }}>
                  No reviews yet
                </p>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: "8px 0 0 0" }}>
                  Complete more jobs to receive reviews from customers!
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  padding: "24px", borderRadius: "16px",
                  border: "2px solid #fbbf24",
                  display: "flex", alignItems: "center", justifyContent: "space-around",
                  flexWrap: "wrap", gap: "20px"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "3rem", fontWeight: "800", color: "#92400e", margin: 0 }}>
                      {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                    </p>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center", margin: "8px 0" }}>
                      {averageRating > 0 && renderStars(Math.round(averageRating))}
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#92400e", margin: 0, fontWeight: "600" }}>
                      Based on {totalRatings} reviews
                    </p>
                  </div>
                </div>

                {recentReviews.map((review) => (
                  <div key={review.id} style={{
                    background: "white", padding: "20px", borderRadius: "12px",
                    border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                          {review.serviceType}
                        </h4>
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                          Customer: {review.customerName || "Verified Customer"}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {renderStars(review.rating)}
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#92400e" }}>
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {review.review && (
                      <p style={{ 
                        margin: "10px 0", 
                        fontSize: "0.95rem", 
                        color: "#374151", 
                        lineHeight: 1.5,
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                        borderLeft: "4px solid #fbbf24"
                      }}>
                        "{review.review}"
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "16px", color: "#9ca3af", fontSize: "0.8rem", marginTop: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {review.date}
                      </span>
                      {review.completedAt && (
                        <span>
                          Completed: {new Date(review.completedAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}