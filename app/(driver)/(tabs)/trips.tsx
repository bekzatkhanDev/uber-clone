// Driver trip history screen
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from '@/constants';
import { useTripHistory } from '@/hooks/useTrips';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';

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

const TripRow = ({ item }: { item: TripItem }) => {
  const statusColor = STATUS_COLOR[item.status] ?? '#6b7280';

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          {item.customer && (
            <Text className="text-sm font-JakartaSemiBold">
              {item.customer.first_name} {item.customer.last_name}
            </Text>
          )}
          <Text className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</Text>
        </View>
        <View style={{ backgroundColor: statusColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: statusColor, fontSize: 12 }} className="font-JakartaMedium capitalize">
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {item.distance_km != null && (
          <Text className="text-sm text-gray-500">{parseFloat(item.distance_km).toFixed(1)} km</Text>
        )}
        {item.tariff?.code && (
          <Text className="text-sm text-gray-500 capitalize">{item.tariff.code}</Text>
        )}
        {item.price != null && (
          <Text className="text-sm font-JakartaBold text-[#0CC25F]">
            {parseFloat(item.price).toFixed(0)} KZT
          </Text>
        )}
      </View>
    </View>
  );
};

const DriverTrips = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: trips = [], isLoading } = useTripHistory({ limit: 50 });

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={trips}
        keyExtractor={(item: TripItem) => item.id}
        renderItem={({ item }) => <TripRow item={item} />}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        ListHeaderComponent={
          <Text className="text-2xl font-JakartaBold mb-5">{t.driver.myTrips}</Text>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            {isLoading ? (
              <ActivityIndicator size="large" color="#0CC25F" />
            ) : (
              <>
                <Image source={images.noResult} style={{ width: 140, height: 140 }} resizeMode="contain" />
                <Text className="text-gray-500 mt-3">{t.driver.noTrips}</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

export default DriverTrips;
