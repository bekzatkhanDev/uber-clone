import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';

export interface BulkTariffEstimate {
  tariff_id: number;
  tariff_code: string;
  base_price: number;
  price_per_km: number;
  price_per_min: number;
  min_price: number;
  distance_km: number;
  duration_min: number;
  estimated_price: number;
}

export interface BulkTariffEstimateResponse {
  distance_km: number;
  duration_min: number;
  estimates: BulkTariffEstimate[];
  is_estimate: boolean;
}

export const useBulkTariffEstimate = (
  startLat: number | null,
  startLng: number | null,
  endLat: number | null,
  endLng: number | null
) => {
  const hasAllCoordinates = startLat !== null && startLng !== null && 
                            endLat !== null && endLng !== null;

  return useQuery<BulkTariffEstimateResponse>({
    queryKey: ['bulk-tariff-estimate', startLat, startLng, endLat, endLng],
    queryFn: () => 
      fetchAPI('/tariffs/estimates/', {
        method: 'POST',
        body: JSON.stringify({
          start_lat: startLat,
          start_lng: startLng,
          end_lat: endLat,
          end_lng: endLng,
        }),
      }),
    enabled: hasAllCoordinates,
    staleTime: 30000, // 30 seconds
  });
};
