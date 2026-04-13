import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';

// ─── Car reference data (public, no auth needed) ─────────────────────────────

export type CarBrand = { id: number; name: string; manufacturer: string };
export type CarType = { id: number; code: string; description: string };

export const useCarBrands = () =>
  useQuery<CarBrand[]>({
    queryKey: ['car-brands'],
    queryFn: () => fetchAPI('/car-brands/'),
    staleTime: 1000 * 60 * 60, // 1 hour — reference data rarely changes
  });

export const useCarTypes = () =>
  useQuery<CarType[]>({
    queryKey: ['car-types'],
    queryFn: () => fetchAPI('/car-types/'),
    staleTime: 1000 * 60 * 60,
  });

// ─── Driver profile ───────────────────────────────────────────────────────────

export const useCreateDriverProfile = () =>
  useMutation({
    mutationFn: ({
      license_number,
      experience_years,
    }: {
      license_number: string;
      experience_years: number;
    }) =>
      fetchAPI('/drivers/profile/', {
        method: 'POST',
        body: JSON.stringify({ license_number, experience_years }),
      }),
  });

// ─── Car management ───────────────────────────────────────────────────────────

export const useAddCar = () =>
  useMutation({
    mutationFn: ({
      brand_id,
      car_type_id,
      year,
      plate_number,
    }: {
      brand_id: number;
      car_type_id: number;
      year: number;
      plate_number: string;
    }) =>
      fetchAPI('/drivers/cars/', {
        method: 'POST',
        body: JSON.stringify({ brand_id, car_type_id, year, plate_number }),
      }),
  });
