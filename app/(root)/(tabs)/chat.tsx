import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useActiveTrip, useTripHistory } from '@/hooks/useTrips';

interface TripItem {
  id: string;
  status: string;
  driver?: { id: number; first_name?: string; phone?: string } | null;
  car?: { brand?: string; plate_number?: string } | null;
  created_at?: string;
  start_address?: string;
  end_address?: string;
}

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'accepted': return { label: 'In Progress', color: '#0CC25F', bg: '#dcfce7' };
    case 'completed': return { label: 'Completed', color: '#6b7280', bg: '#f3f4f6' };
    case 'cancelled': return { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' };
    default: return { label: status, color: '#6b7280', bg: '#f3f4f6' };
  }
};

const ChatListItem = ({
  trip,
  isActive,
  onPress,
}: {
  trip: TripItem;
  isActive?: boolean;
  onPress: () => void;
}) => {
  const { label, color, bg } = statusLabel(trip.status);
  const driverName = trip.driver?.first_name || trip.driver?.phone || 'Driver';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl mx-4 mb-3 p-4"
      style={{
        borderWidth: isActive ? 1.5 : 1,
        borderColor: isActive ? '#0CC25F' : '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Avatar / Icon */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: isActive ? '#dcfce7' : '#f3f4f6' }}
      >
        <Text style={{ fontSize: 22 }}>{isActive ? '🚗' : '💬'}</Text>
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="font-JakartaBold text-gray-900 text-base flex-1 mr-2" numberOfLines={1}>
            {isActive ? `Ride with ${driverName}` : `Trip — ${driverName}`}
          </Text>
          <Text className="text-xs text-gray-400 font-Jakarta flex-shrink-0">
            {formatDate(trip.created_at)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-400 font-Jakarta flex-1 mr-2" numberOfLines={1}>
            {trip.car
              ? `${trip.car.brand ?? ''} • ${trip.car.plate_number ?? ''}`.trim().replace(/^•\s|•\s$/, '')
              : 'Tap to open chat'}
          </Text>
          <View className="px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: bg }}>
            <Text className="text-xs font-JakartaSemiBold" style={{ color }}>
              {label}
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Text className="text-gray-300 ml-2 text-lg">›</Text>
    </TouchableOpacity>
  );
};

const ChatList = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: activeTrip, isLoading: loadingActive } = useActiveTrip();
  const { data: history, isLoading: loadingHistory } = useTripHistory({ limit: 20 });

  const isLoading = loadingActive || loadingHistory;

  // Active trip shown separately only when driver is assigned
  const hasActiveDriver = activeTrip?.id && activeTrip?.status === 'accepted';

  // History: all trips except the current active one
  const pastTrips: TripItem[] = Array.isArray(history)
    ? history.filter((t: TripItem) => t.id !== activeTrip?.id)
    : [];

  const openChat = (tripId: string) => {
    router.push(`/(root)/chat/${tripId}` as any);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-JakartaBold text-gray-900">Messages</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text className="mt-3 text-gray-400 font-Jakarta">Loading chats...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 100,
            flexGrow: !hasActiveDriver && pastTrips.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Active trip section */}
          {hasActiveDriver && (
            <View className="mb-4">
              <Text className="px-5 mb-2 text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-wide">
                Active Ride
              </Text>
              <ChatListItem
                trip={activeTrip as TripItem}
                isActive
                onPress={() => openChat(activeTrip.id)}
              />
            </View>
          )}

          {/* History section */}
          {pastTrips.length > 0 && (
            <View>
              <Text className="px-5 mb-2 text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-wide">
                Recent Trips
              </Text>
              {pastTrips.map((trip) => (
                <ChatListItem
                  key={trip.id}
                  trip={trip}
                  onPress={() => openChat(trip.id)}
                />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!hasActiveDriver && pastTrips.length === 0 && (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-5xl mb-4">💬</Text>
              <Text className="text-xl font-JakartaBold text-gray-700 mb-2 text-center">
                No conversations yet
              </Text>
              <Text className="text-center text-gray-400 font-Jakarta leading-6">
                Your chat history will appear here after you complete a trip.
              </Text>
              <TouchableOpacity
                className="mt-6 bg-[#0CC25F] px-6 py-3 rounded-xl"
                onPress={() => router.push('/(root)/(tabs)/home')}
              >
                <Text className="text-white font-JakartaSemiBold">Book a Ride</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ChatList;
