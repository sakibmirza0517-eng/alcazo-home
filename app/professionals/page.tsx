"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Phone, MessageCircle, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Main Content Component
function ProfessionalsContent() {
  const searchParams = useSearchParams();
  const serviceFilter = searchParams.get('service');
  
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Firebase se data fetch karna
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        // Sirf approved aur active professionals fetch karo
        const q = query(
          collection(db, "professionals"),
          where("status", "==", "approved"),
          where("isActive", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        const prosList: any[] = [];
        
        querySnapshot.forEach((doc) => {
          prosList.push({ 
            id: doc.id, 
            ...doc.data(),
            // Fallback values agar fields missing ho
            name: doc.data().name || "Professional",
            role: doc.data().category || "Service Provider",
            skills: doc.data().skills || "Quality service guaranteed",
            location: doc.data().location || "Karnal, Haryana",
            phone: doc.data().phone || "9050951046"
          });
        });
        
        setProfessionals(prosList);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfessionals();
  }, []);

  // Filter Logic
  const filteredProfessionals = serviceFilter
    ? professionals.filter(p => p.role.toLowerCase() === serviceFilter.toLowerCase())
    : professionals;

  const pageTitle = serviceFilter 
    ? `Available ${serviceFilter} Services in Karnal` 
    : "All Professional Services in Karnal";

  // Loading State
  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#fffbeb", 
        paddingTop: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px"
      }}>
        <Loader2 size={48} color="#d97706" className="animate-spin" />
        <p style={{ fontSize: "1.2rem", color: "#d97706", fontWeight: "600" }}>
          Loading professionals...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fffbeb", paddingTop: "120px", paddingBottom: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Back Button */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#d97706", textDecoration: "none", marginBottom: "20px", fontWeight: "600", fontSize: "1rem" }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        {/* Header */}
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", marginBottom: "10px" }}>
          {pageTitle}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#6b7280", marginBottom: "40px" }}>
          Directly connect with verified experts. No middleman.
        </p>

        {/* Empty State */}
        {filteredProfessionals.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}>
            <p style={{ fontSize: "1.5rem", color: "#6b7280", fontWeight: "600", marginBottom: "10px" }}>
              {serviceFilter ? `No ${serviceFilter} professionals available yet` : "No professionals available yet"}
            </p>
            <p style={{ fontSize: "1rem", color: "#9ca3af" }}>
              Please check back later or try a different category.
            </p>
          </div>
        ) : (
          /* Workers Grid */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "30px"
          }}>
            {filteredProfessionals.map((pro) => (
              <div key={pro.id} style={{
                background: "white",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                border: "1px solid #f3f4f6",
                display: "flex",
                flexDirection: "column"
              }}>
                
                {/* Name & Role */}
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", marginBottom: "5px" }}>{pro.name}</h3>
                <p style={{ color: "#d97706", fontWeight: "700", marginBottom: "20px", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{pro.role}</p>
                
                {/* Skills */}
                <div style={{ marginBottom: "20px", flex: 1 }}>
                  <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: "1.6" }}>
                    <strong style={{ color: "#111827" }}>Skills:</strong> {pro.skills}
                  </p>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "25px", color: "#6b7280", fontSize: "0.95rem" }}>
                  <MapPin size={18} /> {pro.location}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <a 
                    href={`https://wa.me/91${pro.phone}?text=Hello ${pro.name}, I need your ${pro.role} services.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                      background: "#25D366", color: "white",
                      padding: "12px", borderRadius: "10px",
                      textDecoration: "none", fontWeight: "700", fontSize: "0.95rem",
                      transition: "transform 0.2s"
                    }}
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                  <a 
                    href={`tel:${pro.phone}`}
                    style={{
                      flex: 1,
                      display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                      background: "#d97706", color: "white",
                      padding: "12px", borderRadius: "10px",
                      textDecoration: "none", fontWeight: "700", fontSize: "0.95rem",
                      transition: "transform 0.2s"
                    }}
                  >
                    <Phone size={18} /> Call
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// Wrapper Component with Suspense
export default function ProfessionalsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fffbeb", paddingTop: "120px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ fontSize: "1.5rem", color: "#d97706" }}>Loading professionals...</p>
    </div>}>
      <ProfessionalsContent />
    </Suspense>
  );
}
