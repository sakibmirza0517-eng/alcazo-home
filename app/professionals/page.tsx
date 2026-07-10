"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, MapPin, Phone, Mail, Briefcase, Calendar, AlertCircle } from "lucide-react";
import { Suspense } from "react";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;  // ✅ Changed from serviceType
  rating: number;
  totalReviews: number;
  experience: number;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  } | string;
  isActive?: boolean;  // ✅ Added
  status?: string;  // ✅ Added
  isAvailable: boolean;
  profileImage?: string;
}

export default function ProfessionalsPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", 
      padding: "20px" 
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "800", 
          color: "#111827", 
          marginBottom: "8px",
          textAlign: "center"
        }}>
          Our Professionals
        </h1>
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "32px",
          textAlign: "center"
        }}>
          Expert service providers ready to help you
        </p>
        
        <Suspense fallback={
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "400px" 
          }}>
            <p style={{ fontSize: "1.5rem", color: "#d97706" }}>Loading professionals...</p>
          </div>
        }>
          <ProfessionalsContent />
        </Suspense>
      </div>
    </div>
  );
}

function ProfessionalsContent() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedService = searchParams.get('service');

  useEffect(() => {
    setLoading(true);
    
    let unsubscribe: (() => void) | undefined;
    let professionalsRef = collection(db, "professionals");
    
    const processSnapshot = (snapshot: any) => {
      const profs = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Professional[];
      
      console.log(`Loaded ${profs.length} professionals`);
      profs.forEach((prof, idx) => {
        console.log(`${idx + 1}. ${prof.name} - Category: "${prof.category}" - Active: ${prof.isActive}`);
      });
      
      setProfessionals(profs);
      setLoading(false);
    };

    if (selectedService) {
      console.log("🔍 Filtering by category:", selectedService);
      const q = query(
        professionalsRef, 
        where("category", "==", selectedService)  // ✅ category use karo
      );
      unsubscribe = onSnapshot(q, processSnapshot, (error) => {
        console.error("Error:", error);
        setLoading(false);
      });
    } else {
      console.log("📋 Loading all professionals");
      unsubscribe = onSnapshot(professionalsRef, processSnapshot, (error) => {
        console.error("Error:", error);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedService]);

  const handleBookNow = (professionalId: string) => {
    router.push(`/book?professionalId=${professionalId}`);
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {selectedService && (
        <div style={{
          background: "linear-gradient(135deg, #d97706, #b45309)",
          color: "white",
          padding: "16px 24px",
          borderRadius: "12px",
          marginBottom: "24px",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
            {selectedService} Professionals
          </h2>
          <p style={{ margin: "4px 0 0", opacity: 0.9 }}>
            {professionals.length} {professionals.length === 1 ? 'professional' : 'professionals'} available
          </p>
        </div>
      )}

      {professionals.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          margin: "40px auto",
          maxWidth: "600px"
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <AlertCircle size={60} color="#d97706" />
          </div>
          <h2 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "12px"
          }}>
            No Professionals Available
          </h2>
          <p style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            marginBottom: "8px"
          }}>
            {selectedService 
              ? `We don't have any professionals for "${selectedService}" yet.`
              : "We don't have any professionals registered yet."}
          </p>
          <p style={{
            fontSize: "1rem",
            color: "#9ca3af",
            marginBottom: "24px"
          }}>
            Please check back later or try another service.
          </p>
          <button
            onClick={() => router.push('/services')}
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #d97706, #b45309)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.05rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
            }}
          >
            Browse Other Services
          </button>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "24px" 
        }}>
          {professionals.map((prof) => (
            <div
              key={prof.id}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                opacity: prof.isActive === false ? 0.7 : 1,  // ✅ Inactive ko dim karo
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: prof.profileImage
                      ? `url(${prof.profileImage}) center/cover`
                      : "linear-gradient(135deg, #d97706, #b45309)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {!prof.profileImage && prof.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: "1.25rem", 
                    fontWeight: "700", 
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {prof.name}
                  </h3>
                  <p style={{ 
                    margin: "4px 0 0", 
                    color: "#6b7280", 
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {prof.category}  {/* ✅ category use karo */}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.9rem" }}>
                      {prof.rating || 0}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                      ({prof.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ 
                borderTop: "1px solid #f3f4f6", 
                paddingTop: "16px",
                flex: 1
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: "#4b5563" }}>
                  <Briefcase size={16} />
                  <span style={{ fontSize: "0.9rem" }}>
                    {prof.experience || 0} years experience
                  </span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: "#4b5563" }}>
                  <MapPin size={16} />
                  <span style={{ 
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                    {typeof prof.location === 'string' ? prof.location : (prof.address || "Address not available")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: "#4b5563" }}>
                  <Phone size={16} />
                  <span style={{ fontSize: "0.9rem" }}>
                    {prof.phone || "N/A"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4b5563" }}>
                  <Mail size={16} />
                  <span style={{ 
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                    {prof.email || "N/A"}
                  </span>
                </div>
              </div>

              {/* ✅ Status Badge */}
              {prof.status === "pending" && (
                <div style={{
                  marginTop: "12px",
                  padding: "8px",
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  fontWeight: "600"
                }}>
                  ⏳ Pending Approval
                </div>
              )}

              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: prof.isActive !== false ? "#d1fae5" : "#fee2e2",
                  color: prof.isActive !== false ? "#065f46" : "#991b1b",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {prof.isActive !== false ? "✓ Available for work" : "✗ Currently unavailable"}
              </div>

              <button
                onClick={() => handleBookNow(prof.id)}
                disabled={prof.isActive === false}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "14px",
                  background: prof.isActive !== false ? "linear-gradient(135deg, #d97706, #b45309)" : "#e5e7eb",
                  color: prof.isActive !== false ? "white" : "#9ca3af",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  cursor: prof.isActive !== false ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: prof.isActive !== false ? "0 4px 12px rgba(217, 119, 6, 0.3)" : "none",
                }}
              >
                <Calendar size={18} />
                {prof.isActive !== false ? "Book Now" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}