// Web: location updates via browser Geolocation API (no background service worker)
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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

// Polls browser geolocation and sends to backend while online
export const useDriverLocationTracking = (
  carId: number | null,
  isOnline: boolean,
  intervalMs = 15000
) => {
  const { mutate: updateLocation } = useUpdateLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOnline || !carId || !navigator?.geolocation) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation({
            car_id: carId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed_kmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : undefined,
            heading: pos.coords.heading ?? undefined,
          });
        },
        () => {} // silent on denied
      );
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
