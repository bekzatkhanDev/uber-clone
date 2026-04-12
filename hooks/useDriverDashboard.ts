// Driver dashboard: bootstrap data (profile, cars, online status, active trip)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export const useDriverDashboard = () => {
  return useQuery({
    queryKey: ['driver', 'dashboard'],
    queryFn: () => fetchWithAuth('/drivers/me/dashboard/'),
    staleTime: 30 * 1000,
  });
};

export const useDriverProfile = () => {
  return useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: () => fetchWithAuth('/drivers/profile/me/'),
    staleTime: 60 * 1000,
    retry: false,
  });
};

export const useDriverOnlineStatus = () => {
  return useQuery({
    queryKey: ['driver', 'online-status'],
    queryFn: () => fetchWithAuth('/drivers/me/online-status/'),
    refetchInterval: 15 * 1000,
  });
};

export const useActivateCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (carId: number) =>
      fetchWithAuth(`/drivers/cars/${carId}/activate/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'online-status'] });
      queryClient.invalidateQueries({ queryKey: ['cars', 'my'] });
    },
    onError: (error: any) => {
      console.error('Failed to activate car:', error);
    },
  });
};

export const useGoOffline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchWithAuth('/drivers/offline/', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'online-status'] });
      queryClient.invalidateQueries({ queryKey: ['cars', 'my'] });
    },
    onError: (error: any) => {
      console.error('Failed to go offline:', error);
    },
  });
};

export const useDriverEarnings = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: ['driver', 'earnings', from, to],
    queryFn: () => fetchWithAuth(`/drivers/me/earnings/${qs}`),
    staleTime: 60 * 1000,
  });
};
