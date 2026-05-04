// Driver trip history screen
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from '@/constants';
import { useTripHistory } from '@/hooks/useTrips';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const STATUS_COLOR: Record<string, string> = {
  completed: '#0CC25F',
  cancelled: '#ef4444',
  on_route: '#3b82f6',
  accepted: '#f59e0b',
  requested: '#6b7280',
};

interface TripItem {
  id: string;
  status: string;
  price?: number;
  distance_km?: number;
  created_at: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  customer?: { first_name?: string; last_name?: string };
  tariff?: { code?: string };
}

const TripRow = ({ item, isDark }: { item: TripItem; isDark: boolean }) => {
  const statusColor = STATUS_COLOR[item.status] ?? '#6b7280';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';

  return (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          {item.customer && (
            <Text style={{ fontSize: 14, fontFamily: 'Jakarta-SemiBold', color: textPrimary }}>
              {item.customer.first_name} {item.customer.last_name}
            </Text>
          )}
          <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={{ backgroundColor: statusColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: statusColor, fontSize: 12, fontFamily: 'Jakarta-Medium', textTransform: 'capitalize' }}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {item.distance_km != null && (
          <Text style={{ fontSize: 13, color: textSecondary }}>{parseFloat(String(item.distance_km)).toFixed(1)} km</Text>
        )}
        {item.tariff?.code && (
          <Text style={{ fontSize: 13, color: textSecondary, textTransform: 'capitalize' }}>{item.tariff.code}</Text>
        )}
        {item.price != null && (
          <Text style={{ fontSize: 13, fontFamily: 'Jakarta-Bold', color: '#0CC25F' }}>
            {parseFloat(String(item.price)).toFixed(0)} KZT
          </Text>
        )}
      </View>
    </View>
  );
};

const DriverTrips = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data: trips = [], isLoading } = useTripHistory({ limit: 50 });

  const bg = isDark ? '#0f172a' : '#f5f5f5';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <FlatList
        data={trips}
        keyExtractor={(item: TripItem) => item.id}
        renderItem={({ item }) => <TripRow item={item} isDark={isDark} />}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
        ListHeaderComponent={
          <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 20 }}>
            {t.driver.myTrips}
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 64 }}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#0CC25F" />
            ) : (
              <>
                <Image source={images.noResult} style={{ width: 140, height: 140 }} resizeMode="contain" />
                <Text style={{ color: isDark ? '#94a3b8' : '#6b7280', marginTop: 12 }}>{t.driver.noTrips}</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

export default DriverTrips;
