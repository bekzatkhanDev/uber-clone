import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useActiveTrip, useTripHistory } from '@/hooks/useTrips';
import { useTranslation } from '@/i18n/I18nProvider';

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

const ChatListItem = ({
  trip,
  isActive,
  onPress,
  labels,
}: {
  trip: TripItem;
  isActive?: boolean;
  onPress: () => void;
  labels: { rideWith: string; trip: string; tapToOpenChat: string; inProgress: string; completed: string; cancelled: string };
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted': return { label: labels.inProgress, color: '#0CC25F', bg: '#dcfce7' };
      case 'completed': return { label: labels.completed, color: '#6b7280', bg: '#f3f4f6' };
      case 'cancelled': return { label: labels.cancelled, color: '#ef4444', bg: '#fee2e2' };
      default: return { label: status, color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const { label, color, bg } = getStatusStyle(trip.status);
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
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: isActive ? '#dcfce7' : '#f3f4f6' }}
      >
        <Text style={{ fontSize: 22 }}>{isActive ? '🚗' : '💬'}</Text>
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="font-JakartaBold text-gray-900 text-base flex-1 mr-2" numberOfLines={1}>
            {isActive ? `${labels.rideWith} ${driverName}` : `${labels.trip} — ${driverName}`}
          </Text>
          <Text className="text-xs text-gray-400 font-Jakarta flex-shrink-0">
            {formatDate(trip.created_at)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-400 font-Jakarta flex-1 mr-2" numberOfLines={1}>
            {trip.car
              ? `${trip.car.brand ?? ''} • ${trip.car.plate_number ?? ''}`.trim().replace(/^•\s|•\s$/, '')
              : labels.tapToOpenChat}
          </Text>
          <View className="px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: bg }}>
            <Text className="text-xs font-JakartaSemiBold" style={{ color }}>
              {label}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-gray-300 ml-2 text-lg">›</Text>
    </TouchableOpacity>
  );
};

const ChatList = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: activeTrip, isLoading: loadingActive } = useActiveTrip();
  const { data: history, isLoading: loadingHistory } = useTripHistory({ limit: 20 });

  const isLoading = loadingActive || loadingHistory;

  const hasActiveDriver = activeTrip?.id && activeTrip?.status === 'accepted';

  const pastTrips: TripItem[] = Array.isArray(history)
    ? history.filter((t: TripItem) => t.id !== activeTrip?.id)
    : [];

  const openChat = (tripId: string) => {
    router.push(`/(root)/chat/${tripId}` as any);
  };

  const chatLabels = {
    rideWith: t.chat.rideWith,
    trip: t.chat.trip,
    tapToOpenChat: t.chat.tapToOpenChat,
    inProgress: t.chat.inProgress,
    completed: t.chat.completed,
    cancelled: t.chat.cancelled,
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-JakartaBold text-gray-900">{t.chat.messages}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text className="mt-3 text-gray-400 font-Jakarta">{t.chat.loadingChats}</Text>
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
          {hasActiveDriver && (
            <View className="mb-4">
              <Text className="px-5 mb-2 text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-wide">
                {t.chat.activeRide}
              </Text>
              <ChatListItem
                trip={activeTrip as TripItem}
                isActive
                onPress={() => openChat(activeTrip.id)}
                labels={chatLabels}
              />
            </View>
          )}

          {pastTrips.length > 0 && (
            <View>
              <Text className="px-5 mb-2 text-xs font-JakartaSemiBold text-gray-400 uppercase tracking-wide">
                {t.chat.recentTrips}
              </Text>
              {pastTrips.map((trip) => (
                <ChatListItem
                  key={trip.id}
                  trip={trip}
                  onPress={() => openChat(trip.id)}
                  labels={chatLabels}
                />
              ))}
            </View>
          )}

          {!hasActiveDriver && pastTrips.length === 0 && (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text className="text-5xl mb-4">💬</Text>
              <Text className="text-xl font-JakartaBold text-gray-700 mb-2 text-center">
                {t.chat.noConversations}
              </Text>
              <Text className="text-center text-gray-400 font-Jakarta leading-6">
                {t.chat.chatHistoryEmpty}
              </Text>
              <TouchableOpacity
                className="mt-6 bg-[#0CC25F] px-6 py-3 rounded-xl"
                onPress={() => router.push('/(root)/(tabs)/home')}
              >
                <Text className="text-white font-JakartaSemiBold">{t.chat.bookARide}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ChatList;
