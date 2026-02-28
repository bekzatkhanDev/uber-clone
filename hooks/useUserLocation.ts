import { useEffect } from 'react';
import { useCurrentLocation } from './useCurrentLocation';
import { useLocationStore } from '@/store';
import { LocationCoords } from '@/constants/location';

/**
 * Custom hook that combines location fetching with store updates.
 * This hook handles:
 * - Fetching the user's current location
 * - Automatically updating the location store when location changes
 * 
 * This eliminates duplicate useEffect code across components.
 */
export const useUserLocation = () => {
  const { location, isLoading, error, refreshLocation } = useCurrentLocation();
  const { setUserLocation } = useLocationStore();

  // Set user location in store when location is fetched
  useEffect(() => {
    if (location) {
      setUserLocation(location);
    }
  }, [location, setUserLocation]);

  return {
    location,
    isLoading,
    error,
    refreshLocation,
  };
};
