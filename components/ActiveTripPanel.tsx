// Active trip panel for driver — shows trip details and action buttons
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useTheme } from '@/hooks/useTheme';

interface TripInfo {
  id: string;
  status: 'accepted' | 'on_route' | 'completed' | 'cancelled' | 'requested';
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  price?: number;
  distance_km?: number;
  customer?: { id?: number; first_name?: string; last_name?: string; phone?: string };
  tariff?: { code?: string };
}

export interface TripCompletedPayload {
  tripId: string;
  customerId: number;
  customerName: string;
}

interface ActiveTripPanelProps {
  trip: TripInfo;
  onTripCompleted?: (payload: TripCompletedPayload) => void;
}

const ActiveTripPanel = ({ trip, onTripCompleted }: ActiveTripPanelProps) => {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (newStatus: string) =>
      fetchWithAuth(`/trips/${trip.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      if (newStatus === 'completed' && onTripCompleted) {
        onTripCompleted({
          tripId: trip.id,
          customerId: trip.customer?.id ?? 0,
          customerName: `${trip.customer?.first_name ?? ''} ${trip.customer?.last_name ?? ''}`.trim() || 'Passenger',
        });
      }
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update trip status. Please try again.');
    },
  });

  const { mutate: cancelTrip, isPending: isCancelling } = useMutation({
    mutationFn: () =>
      fetchWithAuth(`/trips/${trip.id}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Driver cancelled' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel trip.');
    },
  });

  const handleCancel = () => {
    Alert.alert('Cancel Trip', 'Are you sure you want to cancel this trip?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelTrip() },
    ]);
  };

  const isLoading = isPending || isCancelling;
  const statusBg = trip.status === 'on_route' ? '#3b82f6' : '#0CC25F';

  return (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginHorizontal: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.25 : 0.08, shadowRadius: 8, elevation: 4 }}>
      {/* Status bar */}
      <View style={{ backgroundColor: statusBg, paddingHorizontal: 20, paddingVertical: 10 }}>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
          {trip.status === 'accepted' ? '🚗 Head to pickup' : trip.status === 'on_route' ? '📍 En route to destination' : trip.status}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Customer */}
        {trip.customer && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: textSecondary, marginBottom: 2 }}>Passenger</Text>
            <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>
              {trip.customer.first_name} {trip.customer.last_name}
            </Text>
            {trip.customer.phone && (
              <Text style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>{trip.customer.phone}</Text>
            )}
          </View>
        )}

        {/* Trip details */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          {trip.distance_km != null && (
            <View>
              <Text style={{ fontSize: 12, color: textSecondary }}>Distance</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: textPrimary }}>
                {parseFloat(String(trip.distance_km)).toFixed(1)} km
              </Text>
            </View>
          )}
          {trip.price != null && (
            <View>
              <Text style={{ fontSize: 12, color: textSecondary }}>Fare</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0CC25F' }}>
                {parseFloat(String(trip.price)).toFixed(2)} ₸
              </Text>
            </View>
          )}
          {trip.tariff?.code && (
            <View>
              <Text style={{ fontSize: 12, color: textSecondary }}>Tariff</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: textPrimary, textTransform: 'capitalize' }}>
                {trip.tariff.code}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#0CC25F" style={{ marginVertical: 8 }} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {trip.status === 'accepted' && (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => updateStatus('on_route')}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Picked Up</Text>
              </TouchableOpacity>
            )}

            {trip.status === 'on_route' && (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#0CC25F', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => updateStatus('completed')}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Complete Ride</Text>
              </TouchableOpacity>
            )}

            {(trip.status === 'accepted' || trip.status === 'on_route') && (
              <TouchableOpacity
                style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5', alignItems: 'center' }}
                onPress={handleCancel}
              >
                <Text style={{ color: '#ef4444', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ActiveTripPanel;
