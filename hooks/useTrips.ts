// Поездки: создание, активная, детали, история, отмена, отзыв
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { validateCoordinates } from '@/lib/validation';

interface TripData {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  tariff_code: string;
}

// Создать поездку
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripData: TripData) => {
      validateCoordinates(tripData);
      
      return fetchWithAuth('/trips/', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

// Активная поездка
export const useActiveTrip = () => {
  return useQuery({
    queryKey: ['trips', 'active'],
    queryFn: () => fetchWithAuth('/trips/active/'),
    retry: false,
  });
};

// Детали поездки (по UUID)
export const useTripDetails = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchWithAuth(`/trips/${tripId}/`),
    enabled: !!tripId,
  });
};

// Обновить статус поездки
export const useUpdateTripStatus = (tripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      fetchWithAuth(`/trips/${tripId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

// История поездок
export const useTripHistory = ({ limit = 10 } = {}) =>
  useQuery({
    queryKey: ['trips', 'history', limit],
    queryFn: () => fetchWithAuth(`/trips/history/?limit=${limit}`),
  });

// Отмена поездки
export const useCancelTrip = (tripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchWithAuth(`/trips/${tripId}/cancel/`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
    },
  });
};

// Оставить отзыв
export const useCreateReview = (tripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewData: { reviewed: number; rating: number; comment?: string }) =>
      fetchWithAuth(`/trips/${tripId}/review/`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'history'] });
    },
  });
};

// Получить отзывы пользователя
export const useUserReviews = (userId: number | undefined) =>
  useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: () => fetchWithAuth(`/reviews/user/${userId}/`),
    enabled: !!userId,
  });
