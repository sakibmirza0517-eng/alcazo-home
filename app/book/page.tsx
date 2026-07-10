"use client";

// ✅ Ye line top par rehne do
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { ArrowLeft, Hammer } from "lucide-react";

// ✅ FIXED: dynamic ko rename karke dynamicImport kar diya
import dynamicImport from "next/dynamic";

// ⭐ Dynamic Import with SSR disabled
const LocationPicker = dynamicImport(
  () => import("@/components/LocationPicker"),
  { 
    ssr: false,
    loading: () => <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>Loading map...</p>
  }
);

export default function BookServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [professional, setProfessional] = useState<any>(null);

  // Form States
  const [serviceType, setServiceType] = useState("Carpenter");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  
  // ⭐ Location States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationSelected, setLocationSelected] = useState(false);

  // ✅ FIXED: URL se professionalId manually parse karo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const professionalId = urlParams.get('professionalId');
      
      if (professionalId) {
        fetchProfessional(professionalId);
      }
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCustomerName(userData.name || "");
          setPhone(userData.phone || "");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch professional function
  const fetchProfessional = async (professionalId: string) => {
    try {
      const profDoc = await getDoc(doc(db, "professionals", professionalId));
      if (profDoc.exists()) {
        const profData = { id: profDoc.id, ...profDoc.data() };
        setProfessional(profData);
        if (profData.category) {
          setServiceType(profData.category);
        }
      }
    } catch (error) {
      console.error("Error fetching professional:", error);
    }
  };

  // ⭐ Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
    setLocationSelected(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    if (!locationSelected || latitude === null || longitude === null) {
      alert("❌ Please select your location on the map!");
      return;
    }
    
    setLoading(true);

    try {
      const bookingData = {
        customerId: user.uid,
        customerName: customerName,
        serviceType: serviceType || "Not specified",
        
        professionalId: professional?.id || null,
        professionalName: professional?.name || null,
        
        description: description,
        date: date,
        timeSlot: timeSlot,
        address: address,
        phone: phone,
        
        location: {
          latitude: latitude,
          longitude: longitude,
          address: address
        },
        
        status: "pending",
        
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
      };

      console.log("📝 Creating booking:", bookingData);

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

      console.log("✅ Booking created:", bookingRef.id);

      alert("✅ Booking Successful! A professional will contact you soon.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Booking error:", error);
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
            {professional ? `Book ${professional.name}` : "Book a Service"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            {professional 
              ? `${professional.category} • ${professional.location || "Service"}`
              : "Fill the details and we'll send a professional to you."}
          </p>
        </div>

        {professional && (
          <div style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d97706, #b45309)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "1.2rem"
            }}>
              {professional.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>
                {professional.name}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: "#6b7280" }}>
                {professional.category} • {professional.phone || "N/A"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
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

          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialAddress={address}
          />

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

const labelStyle: any = {
  display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "0.95rem"
};

const inputStyle: any = {
  width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb",
  borderRadius: "10px", fontSize: "1rem", outline: "none", boxSizing: "border-box",
  background: "#fafafa", transition: "border-color 0.2s"
};