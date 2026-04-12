// Public trip tracking page — no authentication required
// Recipients open this page by following a share link
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { usePublicTripData } from '@/hooks/useTripSharing';

const LABEL: Record<string, string> = {
  requested: 'Looking for driver…',
  accepted: 'Driver assigned — Heading to pickup',
  on_route: 'On route to destination',
  completed: 'Trip completed',
  cancelled: 'Trip cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  on_route: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const PublicTrackPage = () => {
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const { tripData, isLoading, error, isExpired, refreshData } = usePublicTripData(
    token || null,
    !!token,
  );

  // Auto-refresh every 10 s while trip is active
  useEffect(() => {
    if (!tripData || tripData.status === 'completed' || tripData.status === 'cancelled') return;
    const id = setInterval(refreshData, 10_000);
    return () => clearInterval(id);
  }, [tripData, refreshData]);

  const handleCallDriver = () => {
    const phone = tripData?.driver?.phone?.replace(/[^0-9+]/g, '');
    if (!phone) return;
    if (Platform.OS === 'web') {
      window.open(`tel:${phone}`, '_blank');
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const formatCoords = (lat: number, lng: number) =>
    `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading && !tripData) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text className="mt-4 text-gray-500">Loading trip details…</Text>
      </View>
    );
  }

  // ── Error / expired ───────────────────────────────────────────────────────────
  if (error || isExpired || !tripData) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center p-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-2xl font-JakartaBold text-red-500 mb-2">
          {isExpired ? 'Link Expired' : 'Trip Not Found'}
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          {isExpired
            ? 'This tracking link has expired. Ask the sender to generate a new one.'
            : error || 'Unable to load trip information.'}
        </Text>
        <View className="bg-gray-100 rounded-xl p-4 w-full max-w-sm">
          <Text className="text-sm text-gray-600 text-center">
            Share links are valid for 24 hours and expire automatically for security.
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = STATUS_COLOR[tripData.status] ?? '#0CC25F';
  const statusLabel = LABEL[tripData.status] ?? tripData.status;
  const driverName =
    [tripData.driver?.first_name, tripData.driver?.last_name].filter(Boolean).join(' ') ||
    tripData.driver?.phone ||
    '—';
  const vehicleLabel = tripData.car
    ? `${tripData.car.brand.name} · ${tripData.car.car_type.code}`
    : null;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Status Banner */}
      <View style={{ backgroundColor: statusColor, paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text className="text-white text-lg font-JakartaBold">{statusLabel}</Text>
        {tripData.distance_km != null && (
          <Text className="text-white text-sm mt-1 opacity-90">
            {tripData.distance_km.toFixed(1)} km
            {tripData.price ? ` · ${tripData.price} ₸` : ''}
          </Text>
        )}
      </View>

      {/* Map placeholder */}
      <View className="bg-gray-200 h-52 w-full items-center justify-center">
        <Text className="text-gray-500 font-JakartaMedium text-base">🗺️ Live Map View</Text>
        <Text className="text-gray-400 text-sm mt-1">Updates every 10 s</Text>
      </View>

      {/* Driver / vehicle card */}
      <View
        className="bg-white mx-4 rounded-2xl p-5 shadow-sm border border-gray-100"
        style={{ marginTop: -24, zIndex: 10, position: 'relative' }}
      >
        {tripData.driver ? (
          <>
            <Text className="text-xs text-gray-400 mb-1 font-JakartaMedium uppercase tracking-wide">
              Your Driver
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-JakartaBold">{driverName}</Text>
                {vehicleLabel && (
                  <Text className="text-gray-500 mt-0.5">{vehicleLabel}</Text>
                )}
                {tripData.car?.plate_number && (
                  <View className="bg-gray-100 rounded-lg px-3 py-1 mt-2 self-start">
                    <Text className="text-gray-800 font-JakartaSemiBold text-sm">
                      {tripData.car.plate_number}
                    </Text>
                  </View>
                )}
              </View>
              {tripData.driver.phone && (
                <TouchableOpacity
                  className="bg-[#0CC25F] w-12 h-12 rounded-full items-center justify-center ml-3"
                  onPress={handleCallDriver}
                >
                  <Text className="text-xl">📞</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#0CC25F" />
            <Text className="text-gray-500 mt-2">Waiting for driver…</Text>
          </View>
        )}
      </View>

      {/* Trip Locations */}
      <View className="bg-white mx-4 mt-3 rounded-2xl p-5 border border-gray-100">
        <Text className="text-xs text-gray-400 mb-3 font-JakartaMedium uppercase tracking-wide">
          Route
        </Text>
        <View className="flex-row items-start mb-4">
          <View className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-3 flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-xs text-gray-400">Pickup</Text>
            <Text className="text-sm font-JakartaMedium text-gray-800">
              {formatCoords(tripData.start_lat, tripData.start_lng)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 rounded-full bg-red-500 mt-1 mr-3 flex-shrink-0" />
          <View className="flex-1">
            <Text className="text-xs text-gray-400">Drop-off</Text>
            <Text className="text-sm font-JakartaMedium text-gray-800">
              {formatCoords(tripData.end_lat, tripData.end_lng)}
            </Text>
          </View>
        </View>
        {tripData.tariff && (
          <View className="border-t border-gray-100 mt-4 pt-3">
            <Text className="text-xs text-gray-400">Tariff</Text>
            <Text className="text-sm font-JakartaMedium text-gray-700 capitalize">
              {tripData.tariff.code}
            </Text>
          </View>
        )}
      </View>

      {/* Safety notice */}
      <View className="mx-4 mt-3 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <Text className="text-yellow-800 font-JakartaSemiBold mb-1">ℹ️ About This Page</Text>
        <Text className="text-yellow-700 text-sm">
          You're viewing a shared trip. The page refreshes automatically every 10 s. This link
          expires in 24 hours.
        </Text>
      </View>
    </ScrollView>
  );
};

export default PublicTrackPage;
