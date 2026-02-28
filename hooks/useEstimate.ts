// hooks/useEstimate.ts
import { useMutation } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';
import { validateCoordinates } from '@/lib/validation';

// Estimate request/response types
interface EstimateRequest {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  tariff_id: number;
}

interface EstimateResponse {
  distance_km: number;
  duration_min: number;
  price: number;
}

export const useEstimateTrip = () => {
  return useMutation<EstimateResponse, Error, EstimateRequest>({
    mutationFn: async (data: EstimateRequest) => {
      // Validate coordinates before making API call
      validateCoordinates(data);
      
      return fetchAPI('/trips/estimate/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
};
