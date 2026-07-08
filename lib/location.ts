// Haversine Formula - Distance calculation between 2 GPS coordinates
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Helper: Convert degrees to radians
const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Generate Google Maps navigation URL
export const getNavigationUrl = (
  destinationLat: number, 
  destinationLng: number,
  destinationAddress?: string
): string => {
  // Google Maps Deep Link - 100% FREE
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const destination = `&destination=${destinationLat},${destinationLng}`;
  const travelMode = "&travelmode=driving";
  
  return `${baseUrl}${destination}${travelMode}`;
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm} km`;
};

// Calculate estimated travel time (average speed 30 km/h in city)
export const calculateETA = (distanceKm: number, speedKmph: number = 30): string => {
  const timeMinutes = Math.round((distanceKm / speedKmph) * 60);
  
  if (timeMinutes < 1) return "Less than 1 min";
  if (timeMinutes < 60) return `${timeMinutes} min`;
  
  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return `${hours} hr ${mins} min`;
};