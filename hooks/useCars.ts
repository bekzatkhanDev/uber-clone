// hooks/useCars.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';

// Car data types
interface CarData {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  vin?: string;
  seats?: number;
}

export const useMyCars = () => {
  return useQuery({
    queryKey: ['cars', 'my'],
    queryFn: () => fetchAPI('/drivers/cars/'),
  });
};

export const useAddCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (carData: CarData) =>
      fetchAPI('/drivers/cars/', {
        method: 'POST',
        body: JSON.stringify(carData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'my'] });
    },
  });
};

export const useUpdateCar = (carId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (carData: CarData) =>
      fetchAPI(`/drivers/cars/${carId}/`, {
        method: 'PATCH',
        body: JSON.stringify(carData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'my'] });
    },
  });
};