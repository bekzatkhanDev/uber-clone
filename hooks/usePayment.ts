// Оплата: данные по поездке, создание платежа, сценарий заказ→оплата
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useCreateTrip } from './useTrips';

export const useTripPayment = (tripId: string) => {
  return useQuery({
    queryKey: ['payment', 'trip', tripId],
    queryFn: () => fetchWithAuth(`/payments/trip/${tripId}/`),
    enabled: !!tripId,
    retry: false,
  });
};

// Создать платёж по завершённой поездке
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, method = 'cash' }: { tripId: string; method?: PaymentMethod }) => {
      const response = await fetchWithAuth('/payments/', {
        method: 'POST',
        body: JSON.stringify({
          trip: tripId,
          method: method,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export type PaymentMethod = 'cash' | 'card' | 'kaspi' | 'halyk' | 'freedom';

// Заказ поездки и оплата после завершения
export const usePaymentFlow = () => {
  const queryClient = useQueryClient();
  const createTrip = useCreateTrip();
  const createPayment = useCreatePayment();

  const bookTrip = async (tripData: {
    start_lat: number;
    start_lng: number;
    end_lat: number;
    end_lng: number;
    tariff_code: string;
  }) => {
    try {
      const trip = await createTrip.mutateAsync(tripData);
      if (!trip?.id) throw new Error('Trip creation failed');
      
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      return trip;
    } catch (error: any) {
      console.error('Trip booking error:', error);
      Alert.alert('Error', error.message || 'Failed to book trip');
      throw error;
    }
  };

  const payForTrip = async (tripId: string, method: PaymentMethod = 'cash') => {
    try {
      const payment = await createPayment.mutateAsync({ tripId, method });
      if (!payment) throw new Error('Payment creation failed');
      
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      return payment;
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
      throw error;
    }
  };

  return {
    bookTrip,
    isBooking: createTrip.isPending,
    bookingError: createTrip.error,
    payForTrip,
    isPaying: createPayment.isPending,
    paymentError: createPayment.error,
  };
};
