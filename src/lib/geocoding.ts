import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocode an address string to latitude/longitude coordinates
 * Uses Expo Location's forward geocoding
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    if (!address || address.trim().length === 0) {
      return null;
    }

    const results = await Location.geocodeAsync(address);

    if (results && results.length > 0) {
      const { latitude, longitude } = results[0];
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error('[geocoding.ts]: Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to an address string
 * Uses Expo Location's reverse geocoding
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (results && results.length > 0) {
      const location = results[0];
      const parts = [
        location.streetNumber,
        location.street,
        location.city,
        location.region,
        location.postalCode,
        location.country,
      ].filter(Boolean);

      return parts.join(', ');
    }

    return null;
  } catch (error) {
    console.error('[geocoding.ts]: Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Request location permissions from the user
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[geocoding.ts]: Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Get the user's current location
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('[geocoding.ts]: Error getting current location:', error);
    return null;
  }
}
