// src/utils/location.ts
import * as Location from 'expo-location';

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const reverseGeocode = async (
  latitude: number, 
  longitude: number
): Promise<Location.LocationGeocodedAddress | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    return results[0] || null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

export const formatAddress = (address: Location.LocationGeocodedAddress): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.city) parts.push(address.city);
  if (address.region && address.region !== address.city) parts.push(address.region);
  
  return parts.join(', ');
};

export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

export const getApproximateDistance = (
  location1: { latitude: number; longitude: number },
  location2: { latitude: number; longitude: number }
): string => {
  const distance = calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );
  
  return formatDistance(distance);
};

export const getDistanceText = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `À ${Math.round(distanceInKm * 1000)}m`;
  }
  
  if (distanceInKm < 10) {
    return `À ${distanceInKm.toFixed(1)}km`;
  }
  
  return `À ${Math.round(distanceInKm)}km`;
};
