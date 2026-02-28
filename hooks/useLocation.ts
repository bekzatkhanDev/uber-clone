// Геолокация: обновление позиции водителя, моя позиция, ближайшие машины
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';
import { validateCoordinates } from '@/lib/validation';

interface LocationData {
  car_id: number;
  lat: number;
  lng: number;
  speed_kmh?: number;
  heading?: number;
}

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: (data: LocationData) => {
      validateCoordinates({ lat: data.lat, lng: data.lng });
      
      return fetchAPI('/locations/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
};

export const useMyLocation = () => {
  return useQuery({
    queryKey: ['location', 'me'],
    queryFn: () => fetchAPI('/locations/me/'),
    refetchInterval: 30_000, // каждые 30 сек
  });
};

export interface NearbyDriver {
  id: number;
  driver_id: number;
  car_id: number;
  lat: number;
  lng: number;
  distance_km: number;
}

export const useNearbyDrivers = (
  lat: number | null,
  lng: number | null,
  tariffCode?: string
) => {
  const hasValidLocation = lat !== null && lng !== null && lat !== 0 && lng !== 0;

  const buildQueryString = () => {
    let query = `lat=${lat}&lng=${lng}`;
    if (tariffCode) {
      query += `&tariff_code=${tariffCode}`;
    }
    return query;
  };
  
  return useQuery<NearbyDriver[]>({
    queryKey: ["drivers", "nearby", lat, lng, tariffCode],
    queryFn: () => fetchAPI(`/locations/nearby/?${buildQueryString()}`),
    enabled: hasValidLocation,
    staleTime: 30000,
    refetchInterval: 15000, // Автообновление каждые 15 секунд
  });
};
