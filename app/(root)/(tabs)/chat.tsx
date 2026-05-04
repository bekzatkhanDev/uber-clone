import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useActiveTrip, useTripHistory } from '@/hooks/useTrips';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

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
  isDark,
}: {
  trip: TripItem;
  isActive?: boolean;
  onPress: () => void;
  labels: { rideWith: string; trip: string; tapToOpenChat: string; inProgress: string; completed: string; cancelled: string };
  isDark: boolean;
}) => {
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#e5e7eb';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted': return { label: labels.inProgress, color: '#0CC25F', bg: isDark ? '#052e16' : '#dcfce7' };
      case 'completed': return { label: labels.completed, color: isDark ? '#94a3b8' : '#6b7280', bg: isDark ? '#1e293b' : '#f3f4f6' };
      case 'cancelled': return { label: labels.cancelled, color: '#ef4444', bg: isDark ? '#450a0a' : '#fee2e2' };
      default: return { label: status, color: isDark ? '#94a3b8' : '#6b7280', bg: isDark ? '#1e293b' : '#f3f4f6' };
    }
  };

  const { label, color, bg } = getStatusStyle(trip.status);
  const driverName = trip.driver?.first_name || trip.driver?.phone || 'Driver';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg,
        borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16,
        borderWidth: isActive ? 1.5 : 1,
        borderColor: isActive ? '#0CC25F' : borderColor,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 4, elevation: 2,
      }}
    >
      <View style={{
        width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12,
        backgroundColor: isActive ? (isDark ? '#052e16' : '#dcfce7') : (isDark ? '#1e2d3d' : '#f3f4f6'),
      }}>
        <Text style={{ fontSize: 22 }}>{isActive ? '🚗' : '💬'}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text style={{ fontFamily: 'Jakarta-Bold', color: textPrimary, fontSize: 15, flex: 1, marginRight: 8 }} numberOfLines={1}>
            {isActive ? `${labels.rideWith} ${driverName}` : `${labels.trip} — ${driverName}`}
          </Text>
          <Text style={{ fontSize: 12, color: textSecondary, flexShrink: 0 }}>
            {formatDate(trip.created_at)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: textSecondary, flex: 1, marginRight: 8 }} numberOfLines={1}>
            {trip.car
              ? `${trip.car.brand ?? ''} • ${trip.car.plate_number ?? ''}`.trim().replace(/^•\s|•\s$/, '')
              : labels.tapToOpenChat}
          </Text>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, backgroundColor: bg, flexShrink: 0 }}>
            <Text style={{ fontSize: 11, fontFamily: 'Jakarta-SemiBold', color }}>{label}</Text>
          </View>
        </View>
      </View>
      <Text style={{ color: isDark ? '#475569' : '#d1d5db', marginLeft: 8, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
};

const ChatList = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();

  const bg = isDark ? '#0f172a' : '#f9fafb';
  const headerBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#9ca3af';
  const sectionLabelColor = isDark ? '#64748b' : '#9ca3af';
  const borderColor = isDark ? '#1e293b' : '#f3f4f6';

  const { data: activeTrip, isLoading: loadingActive } = useActiveTrip();
  const { data: history, isLoading: loadingHistory } = useTripHistory({ limit: 20 });

  const isLoading = loadingActive || loadingHistory;
  const hasActiveDriver = activeTrip?.id && activeTrip?.status === 'accepted';
  const pastTrips: TripItem[] = Array.isArray(history)
    ? history.filter((t: TripItem) => t.id !== activeTrip?.id)
    : [];

  const openChat = (tripId: string) => router.push(`/(root)/chat/${tripId}` as any);

  const chatLabels = {
    rideWith: t.chat.rideWith, trip: t.chat.trip, tapToOpenChat: t.chat.tapToOpenChat,
    inProgress: t.chat.inProgress, completed: t.chat.completed, cancelled: t.chat.cancelled,
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: borderColor }}>
        <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary }}>{t.chat.messages}</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text style={{ marginTop: 12, color: textSecondary, fontFamily: 'Jakarta' }}>{t.chat.loadingChats}</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 100,
            flexGrow: !hasActiveDriver && pastTrips.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
        >
          {hasActiveDriver && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ paddingHorizontal: 20, marginBottom: 8, fontSize: 11, fontFamily: 'Jakarta-SemiBold', color: sectionLabelColor, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t.chat.activeRide}
              </Text>
              <ChatListItem
                trip={activeTrip as TripItem}
                isActive
                onPress={() => openChat(activeTrip.id)}
                labels={chatLabels}
                isDark={isDark}
              />
            </View>
          )}

          {pastTrips.length > 0 && (
            <View>
              <Text style={{ paddingHorizontal: 20, marginBottom: 8, fontSize: 11, fontFamily: 'Jakarta-SemiBold', color: sectionLabelColor, textTransform: 'uppercase', letterSpacing: 1 }}>
                {t.chat.recentTrips}
              </Text>
              {pastTrips.map((trip) => (
                <ChatListItem key={trip.id} trip={trip} onPress={() => openChat(trip.id)} labels={chatLabels} isDark={isDark} />
              ))}
            </View>
          )}

          {!hasActiveDriver && pastTrips.length === 0 && (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 80 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
              <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 8, textAlign: 'center' }}>
                {t.chat.noConversations}
              </Text>
              <Text style={{ textAlign: 'center', color: textSecondary, fontFamily: 'Jakarta', lineHeight: 24 }}>
                {t.chat.chatHistoryEmpty}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 24, backgroundColor: '#0CC25F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                onPress={() => router.push('/(root)/(tabs)/home')}
              >
                <Text style={{ color: 'white', fontFamily: 'Jakarta-SemiBold' }}>{t.chat.bookARide}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ChatList;
