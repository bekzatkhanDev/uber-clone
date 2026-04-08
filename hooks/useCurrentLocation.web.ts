// Web location: browser Geolocation API + Nominatim for reverse geocoding
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION, LocationCoords } from '@/constants/location';

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      { headers: { 'User-Agent': 'taxi-app/1.0' } }
    );
    if (!resp.ok) throw new Error('Geocoding failed');
    const data = await resp.json();
    const addr = data.address;
    const parts = [
      addr?.road || addr?.pedestrian || addr?.path,
      addr?.house_number,
      addr?.city || addr?.town || addr?.village || addr?.county,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : data.display_name?.split(',')[0] ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!navigator?.geolocation) {
      setLocation(DEFAULT_LOCATION);
      setError('Geolocation not supported in this browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setLocation({ latitude, longitude, address });
        setIsLoading(false);
      },
      () => {
        // Permission denied or unavailable — use default
        setLocation(DEFAULT_LOCATION);
        setError('Location access denied, using default');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, isLoading, error, refreshLocation: fetchLocation };
};
