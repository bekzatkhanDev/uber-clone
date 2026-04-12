// Пользователь: текущий, обновление профиля, админка
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export interface UserProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_photo?: File | Blob | string;
}

export interface DriverProfileData {
  license_number?: string;
  license_expiry?: string;
  years_of_experience?: number;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_color?: string;
  is_available?: boolean;
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchWithAuth('/users/me/'),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserProfileData) => {
      // Check if we need to send as FormData (for file uploads)
      const hasFile = data.profile_photo instanceof File || data.profile_photo instanceof Blob;
      
      if (hasFile) {
        const formData = new FormData();
        if (data.first_name) formData.append('first_name', data.first_name);
        if (data.last_name) formData.append('last_name', data.last_name);
        if (data.phone) formData.append('phone', data.phone);
        if (data.profile_photo) formData.append('profile_photo', data.profile_photo);
        
        return fetchWithAuth('/users/me/', {
          method: 'PATCH',
          body: formData,
          // Don't set Content-Type header - browser will set it with boundary
          headers: {},
        });
      } else {
        return fetchWithAuth('/users/me/', {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUpdateDriverProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverProfileData) =>
      fetchWithAuth('/drivers/profile/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      if (error.status === 403) {
        throw new Error('Access denied: Only drivers can update this information.');
      }
      throw error;
    },
  });
};

export const useUserById = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchAPI(`/users/${id}/`),
    enabled: !!id,
  });
};

export const useAssignRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      fetchAPI(`/users/${userId}/roles/`, {
        method: 'PATCH',
        body: JSON.stringify({ roles }),
      }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
};