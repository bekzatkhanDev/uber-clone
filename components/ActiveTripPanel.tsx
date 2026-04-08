// Active trip panel for driver — shows trip details and action buttons
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface TripInfo {
  id: string;
  status: 'accepted' | 'on_route' | 'completed' | 'cancelled' | 'requested';
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  price?: number;
  distance_km?: number;
  customer?: { first_name?: string; last_name?: string; phone?: string };
  tariff?: { code?: string };
}

interface ActiveTripPanelProps {
  trip: TripInfo;
  onTripCompleted?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  accepted: 'Accepted — Head to pickup',
  on_route: 'On route — Heading to destination',
  requested: 'Requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ActiveTripPanel = ({ trip, onTripCompleted }: ActiveTripPanelProps) => {
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (newStatus: string) =>
      fetchWithAuth(`/trips/${trip.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      if (newStatus === 'completed') onTripCompleted?.();
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

  return (
    <View className="bg-white rounded-2xl shadow-md mx-5 overflow-hidden">
      {/* Status bar */}
      <View className={`px-5 py-3 ${trip.status === 'on_route' ? 'bg-blue-500' : 'bg-[#0CC25F]'}`}>
        <Text className="text-white font-JakartaSemiBold">
          {STATUS_LABEL[trip.status] ?? trip.status}
        </Text>
      </View>

      <View className="p-5">
        {/* Customer */}
        {trip.customer && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500">Passenger</Text>
            <Text className="text-lg font-JakartaSemiBold">
              {trip.customer.first_name} {trip.customer.last_name}
            </Text>
            {trip.customer.phone && (
              <Text className="text-sm text-gray-500">{trip.customer.phone}</Text>
            )}
          </View>
        )}

        {/* Trip details */}
        <View className="flex-row justify-between mb-4">
          {trip.distance_km != null && (
            <View>
              <Text className="text-sm text-gray-500">Distance</Text>
              <Text className="text-base font-JakartaMedium">
                {trip.distance_km.toFixed(1)} km
              </Text>
            </View>
          )}
          {trip.price != null && (
            <View>
              <Text className="text-sm text-gray-500">Fare</Text>
              <Text className="text-base font-JakartaBold text-[#0CC25F]">
                {trip.price.toFixed(2)} KZT
              </Text>
            </View>
          )}
          {trip.tariff?.code && (
            <View>
              <Text className="text-sm text-gray-500">Tariff</Text>
              <Text className="text-base font-JakartaMedium capitalize">
                {trip.tariff.code}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#0CC25F" className="my-2" />
        ) : (
          <View className="flex-row gap-3">
            {trip.status === 'accepted' && (
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-3 rounded-xl items-center"
                onPress={() => updateStatus('on_route')}
              >
                <Text className="text-white font-JakartaSemiBold">Picked Up</Text>
              </TouchableOpacity>
            )}

            {trip.status === 'on_route' && (
              <TouchableOpacity
                className="flex-1 bg-[#0CC25F] py-3 rounded-xl items-center"
                onPress={() => updateStatus('completed')}
              >
                <Text className="text-white font-JakartaSemiBold">Complete Ride</Text>
              </TouchableOpacity>
            )}

            {(trip.status === 'accepted' || trip.status === 'on_route') && (
              <TouchableOpacity
                className="px-5 py-3 rounded-xl border border-red-300 items-center"
                onPress={handleCancel}
              >
                <Text className="text-red-500 font-JakartaSemiBold">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ActiveTripPanel;
