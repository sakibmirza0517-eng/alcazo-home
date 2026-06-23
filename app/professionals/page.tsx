"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Phone, MessageCircle, MapPin, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

// ══════════════════════════════════════
// REAL WORKERS DATA
// ═══════════════════════════════════════
const professionals = [
  // CARPENTER
  { id: 1, name: "Sakib", role: "Carpenter", skills: "Furniture Repair, Door Fitting, Cabinet Installation", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 2, name: "Sahib", role: "Carpenter", skills: "Wardrobe Making, Kitchen Cabinets, Window Frames", location: "Karnal, Haryana", phone: "7082557392" },
  
  // PLUMBER
  { id: 3, name: "Sakib", role: "Plumber", skills: "Pipe Fitting, Tap Repair, Water Tank Installation", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 4, name: "Sahib", role: "Plumber", skills: "Drain Cleaning, Water Heater Installation, Leak Repair", location: "Karnal, Haryana", phone: "7082557392" },

  // ELECTRICIAN
  { id: 5, name: "Sakib", role: "Electrician", skills: "Wiring, Fan Repair, Switch Installation", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 6, name: "Sahib", role: "Electrician", skills: "Light Installation, Motor Repair, Distribution Board", location: "Karnal, Haryana", phone: "7082557392" },

  // PAINTER
  { id: 7, name: "Sakib", role: "Painter", skills: "Interior Painting, Exterior Painting, Texture Work", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 8, name: "Sahib", role: "Painter", skills: "Wall Putty, Distemper, Enamel Painting", location: "Karnal, Haryana", phone: "7082557392" },

  // AC SERVICE
  { id: 9, name: "Sakib", role: "AC Service", skills: "AC Installation, Gas Filling, AC Repair", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 10, name: "Sahib", role: "AC Service", skills: "Split AC Installation, Window AC Repair, Compressor Replacement", location: "Karnal, Haryana", phone: "7082557392" },

  // INTERIOR DESIGN
  { id: 11, name: "Sakib", role: "Interior Design", skills: "Modular Kitchen, Wardrobe Design, False Ceiling", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 12, name: "Sahib", role: "Interior Design", skills: "Living Room Design, Bedroom Interiors, Office Setup", location: "Karnal, Haryana", phone: "7082557392" },

  // FURNITURE REPAIR
  { id: 13, name: "Sakib", role: "Furniture Repair", skills: "Sofa Repair, Bed Fixing, Table Polishing", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 14, name: "Sahib", role: "Furniture Repair", skills: "Upholstery Work, Spring Replacement, Veneer Work", location: "Karnal, Haryana", phone: "7082557392" },

  // PEST CONTROL
  { id: 15, name: "Sakib", role: "Pest Control", skills: "Termite Control, Cockroach Removal, Bed Bug Treatment", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 16, name: "Sahib", role: "Pest Control", skills: "Mosquito Control, General Pest Treatment, Fumigation", location: "Karnal, Haryana", phone: "7082557392" },

  // TILE & FLOORING
  { id: 17, name: "Sakib", role: "Tile & Flooring", skills: "Floor Tiles, Marble Work, Granite Installation", location: "Karnal, Haryana", phone: "9050951046" },
  { id: 18, name: "Sahib", role: "Tile & Flooring", skills: "Bathroom Tiles, Kitchen Flooring, Vitrified Tiles", location: "Karnal, Haryana", phone: "7082557392" },
];

// Main Content Component
function ProfessionalsContent() {
  const searchParams = useSearchParams();
  const serviceFilter = searchParams.get('service');

  // Filter Logic
  const filteredProfessionals = serviceFilter
    ? professionals.filter(p => p.role.toLowerCase() === serviceFilter.toLowerCase())
    : professionals;

  const pageTitle = serviceFilter 
    ? `Available ${serviceFilter} Services in Karnal` 
    : "All Professional Services in Karnal";

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

        {/* Workers Grid */}
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