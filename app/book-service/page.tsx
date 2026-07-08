"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Calendar, Clock, MapPin, Phone, FileText, ArrowLeft, Hammer } from "lucide-react";
import dynamic from "next/dynamic";

// ⭐ Dynamic Import with SSR disabled
const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { 
    ssr: false,
    loading: () => <p>Loading map...</p>
  }
);

export default function BookServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [customerName, setCustomerName] = useState("");

  // Form States
  const [serviceType, setServiceType] = useState("Carpenter");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  
  // ⭐ NEW: Location States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationSelected, setLocationSelected] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        // Fetch customer name
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setCustomerName(userDoc.data().name || "");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ⭐ NEW: Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
    setLocationSelected(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    // ⭐ NEW: Validate location
    if (!locationSelected || latitude === null || longitude === null) {
      alert("❌ Please select your location on the map!");
      return;
    }
    
    setLoading(true);

    try {
      // Save booking to Firebase Firestore with tracking initialized
      await addDoc(collection(db, "bookings"), {
        customerId: user.uid,
        customerName: customerName,
        serviceType: serviceType,
        description: description,
        date: date,
        timeSlot: timeSlot,
        address: address,
        phone: phone,
        
        // ⭐ NEW: Location Data
        location: {
          latitude: latitude,
          longitude: longitude,
          address: address
        },
        
        status: "pending",
        
        // Tracking System
        trackingStatus: "pending",
        trackingHistory: [
          {
            status: "pending",
            label: "Booking Created",
            timestamp: new Date().toISOString(),
            note: "Your booking has been received"
          }
        ],
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert("✅ Booking Successful! A professional will contact you soon.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    "Carpenter", "Plumber", "Electrician", "Painter", 
    "AC Service", "Interior Design", "Furniture Repair", 
    "Pest Control", "Tile & Flooring"
  ];

  const timeSlots = [
    "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
    "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM"
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      padding: "20px",
      paddingTop: "100px"
    }}>
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        style={{
          position: "absolute", top: "30px", left: "30px",
          display: "flex", alignItems: "center", gap: "8px",
          background: "transparent", border: "none",
          color: "#d97706", fontWeight: "600", fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div style={{
        maxWidth: "600px", margin: "0 auto",
        background: "white", padding: "40px",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(217, 119, 6, 0.15)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "60px", height: "60px", 
            background: "linear-gradient(135deg, #d97706, #b45309)",
            borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Hammer size={32} color="white" />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>
            Book a Service
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Fill the details and we'll send a professional to you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Service Type */}
          <div>
            <label style={labelStyle}>Service Type</label>
            <select 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              style={inputStyle}
            >
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Problem Description */}
          <div>
            <label style={labelStyle}>Problem Description</label>
            <textarea 
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              style={inputStyle}
            />
          </div>

          {/* Date and Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Preferred Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Time Slot</label>
              <select 
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                style={inputStyle}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ⭐ NEW: Location Picker (Replaces old address input) */}
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialAddress={address}
          />

          {/* Phone Number */}
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="Enter contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !locationSelected}
            style={{
              background: "linear-gradient(135deg, #d97706, #b45309)",
              color: "white", padding: "16px", borderRadius: "12px",
              border: "none", fontWeight: "700", fontSize: "1.1rem",
              cursor: loading || !locationSelected ? "not-allowed" : "pointer", 
              boxShadow: "0 8px 20px rgba(217, 119, 6, 0.3)",
              opacity: loading || !locationSelected ? 0.7 : 1, marginTop: "10px"
            }}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const labelStyle: any = {
  display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "0.95rem"
};

const inputStyle: any = {
  width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb",
  borderRadius: "10px", fontSize: "1rem", outline: "none", boxSizing: "border-box",
  background: "#fafafa", transition: "border-color 0.2s"
};