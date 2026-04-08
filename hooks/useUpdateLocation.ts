// Periodic location updates for driver (sends car position to backend)
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import * as Location from 'expo-location';

interface LocationPayload {
  car_id: number;
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
}

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (payload: LocationPayload) =>
      fetchWithAuth('/locations/', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
};

// Auto-sends location every `intervalMs` ms while `isOnline` and carId is set
export const useDriverLocationTracking = (carId: number | null, isOnline: boolean, intervalMs = 10000) => {
  const { mutate: updateLocation } = useUpdateLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOnline || !carId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        updateLocation({
          car_id: carId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          speed_kmh: loc.coords.speed != null ? loc.coords.speed * 3.6 : undefined,
          heading: loc.coords.heading ?? undefined,
        });
      } catch {
        // Silent — location updates are best-effort
      }
    };

    sendLocation();
    intervalRef.current = setInterval(sendLocation, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [carId, isOnline, intervalMs]);
};
