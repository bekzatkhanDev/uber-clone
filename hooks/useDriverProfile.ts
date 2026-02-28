// hooks/useDriverProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';

// Driver profile data types
interface DriverProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  car_make?: string;
  car_model?: string;
  car_year?: number;
  car_plate?: string;
  car_color?: string;
  license_number?: string;
  license_expiry?: string;
}

export const useDriverProfile = () => {
  return useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: () => fetchAPI('/drivers/profile/me/'),
  });
};

export const useCreateDriverProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverProfileData) =>
      fetchAPI('/drivers/profile/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUpdateDriverProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverProfileData) =>
      fetchAPI('/drivers/profile/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
    },
  });
};