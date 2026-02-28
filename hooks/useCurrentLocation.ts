import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION, LocationCoords } from '@/constants/location';

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Use default location when permission is denied
        setLocation(DEFAULT_LOCATION);
        setError('Location permission denied');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      const formattedAddress = `${address[0].name || ''}, ${address[0].region || ''}`.trim();

      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        address: formattedAddress,
      });
    } catch (err) {
      // Use default location when location fetch fails
      console.log('Location fetch failed, using default location:', err);
      setLocation(DEFAULT_LOCATION);
      setError('Location fetch failed, using default');
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    refreshLocation: fetchLocation,
  };
};
