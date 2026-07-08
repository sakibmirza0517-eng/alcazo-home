"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialAddress?: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationSelect, initialAddress }: LocationPickerProps) {
  // Default center: Karnal, Haryana
  const [position, setPosition] = useState<[number, number]>([29.6857, 76.9905]); 
  const [address, setAddress] = useState(initialAddress || "");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  // Function to get address from coordinates (Reverse Geocoding - Free Nominatim API)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || "Address not found";
      setAddress(formattedAddress);
      onLocationSelect(lat, lng, formattedAddress);
    } catch (err) {
      console.error("Error fetching address:", err);
      setAddress("Could not fetch address");
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    fetchAddress(lat, lng);
  };

  // Handle "Use My Current Location" button
  const handleCurrentLocation = () => {
    setLoadingLocation(true);
    setError("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          fetchAddress(newPos[0], newPos[1]);
          setLoadingLocation(false);
        },
        (err) => {
          setError("Location access denied. Please enable GPS or enter address manually.");
          setLoadingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "0.95rem" }}>
        Select Location
      </label>

      {/* Map Container */}
      <div style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #e5e7eb" }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>

      {/* Current Location Button */}
      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
        style={{
          background: "linear-gradient(135deg, #d97706, #b45309)",
          color: "white",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "700",
          fontSize: "1rem",
          cursor: loadingLocation ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
          opacity: loadingLocation ? 0.7 : 1
        }}
      >
        {loadingLocation ? "Detecting Location..." : "📍 Use My Current Location"}
      </button>

      {/* Address Display / Manual Edit */}
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "0.95rem" }}>
          Detected Address (You can edit this)
        </label>
        <textarea
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            // Note: If user edits manually, we don't have new lat/lng unless we geocode again.
            // For now, we just update the text.
          }}
          rows={3}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
            background: "#fafafa"
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.9rem", margin: 0 }}>{error}</p>
      )}
    </div>
  );
}