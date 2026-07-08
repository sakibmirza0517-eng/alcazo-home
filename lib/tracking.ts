import { db } from "./firebase";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";

// Tracking status types
export type TrackingStatus =
  | "pending"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "working"
  | "completed"
  | "cancelled";

// Status display info
export const statusInfo: Record<TrackingStatus, { label: string; icon: string; color: string }> = {
  pending: { label: "Pending", icon: "⏳", color: "#d97706" },
  accepted: { label: "Professional Assigned", icon: "✅", color: "#16a34a" },
  on_the_way: { label: "On The Way", icon: "🚗", color: "#2563eb" },
  arrived: { label: "Arrived at Location", icon: "📍", color: "#9333ea" },
  working: { label: "Service In Progress", icon: "🔧", color: "#ea580c" },
  completed: { label: "Service Completed", icon: "✅", color: "#16a34a" },
  cancelled: { label: "Cancelled", icon: "❌", color: "#dc2626" }
};

// Update tracking status
export const updateTrackingStatus = async (
  bookingId: string,
  newStatus: TrackingStatus,
  note?: string
) => {
  try {
    const statusEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),  // ✅ YE SAHI HAI
      note: note || "",
      label: statusInfo[newStatus].label
    };

    await updateDoc(doc(db, "bookings", bookingId), {
      trackingStatus: newStatus,
      trackingHistory: arrayUnion(statusEntry),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating tracking status:", error);
    return { success: false, error };
  }
};

// Get next status in flow
export const getNextStatus = (currentStatus: TrackingStatus): TrackingStatus | null => {
  const flow: TrackingStatus[] = [
    "pending",
    "accepted",
    "on_the_way",
    "arrived",
    "working",
    "completed"
  ];

  const currentIndex = flow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === flow.length - 1) {
    return null; // No next status or already at end
  }

  return flow[currentIndex + 1];
};

// Get action button info for professional
export const getActionButton = (currentStatus: TrackingStatus) => {
  const actions: Record<TrackingStatus, { label: string; nextStatus: TrackingStatus; icon: string; color: string } | null> = {
    pending: null,
    accepted: {
      label: "Start Travel",
      nextStatus: "on_the_way",
      icon: "🚗",
      color: "#2563eb"
    },
    on_the_way: {
      label: "Mark Arrived",
      nextStatus: "arrived",
      icon: "📍",
      color: "#9333ea"
    },
    arrived: {
      label: "Start Work",
      nextStatus: "working",
      icon: "🔧",
      color: "#ea580c"
    },
    working: {
      label: "Complete Job",
      nextStatus: "completed",
      icon: "✅",
      color: "#16a34a"
    },
    completed: null,
    cancelled: null
  };

  return actions[currentStatus];
};

// Calculate ETA (Estimated Time of Arrival)
export const calculateETA = (distanceKm: number, speedKmph: number = 30): string => {
  const timeMinutes = Math.round((distanceKm / speedKmph) * 60);

  if (timeMinutes < 1) return "Less than 1 min";
  if (timeMinutes < 60) return `${timeMinutes} min`;

  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return `${hours} hr ${mins} min`;
};

// Get status progress percentage (for progress bar)
export const getStatusProgress = (status: TrackingStatus): number => {
  const progress: Record<TrackingStatus, number> = {
    pending: 10,
    accepted: 25,
    on_the_way: 50,
    arrived: 75,
    working: 90,
    completed: 100,
    cancelled: 0
  };

  return progress[status];
};