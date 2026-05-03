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
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const PublicTrackPage = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { isDark } = useTheme();

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

  // Build status label mapping using translations
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return t.publicTrack.lookingForDriver;
      case 'accepted':
        return t.publicTrack.driverAssigned;
      case 'on_route':
        return t.publicTrack.onRoute;
      case 'completed':
        return t.publicTrack.tripCompleted;
      case 'cancelled':
        return t.publicTrack.tripCancelled;
      default:
        return status;
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    on_route: '#3b82f6',
    completed: '#22c55e',
    cancelled: '#ef4444',
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading && !tripData) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.publicTrack.loadingTrip}</Text>
      </View>
    );
  }

  // ── Error / expired ───────────────────────────────────────────────────────────
  if (error || isExpired || !tripData) {
    return (
      <View
        className={`flex-1 items-center justify-center p-6 ${isDark ? 'bg-black' : 'bg-white'}`}
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className={`text-2xl font-JakartaBold mb-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          {isExpired ? t.publicTrack.linkExpired : t.publicTrack.tripNotFound}
        </Text>
        <Text className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isExpired
            ? t.publicTrack.linkExpiredDesc
            : error || t.publicTrack.unableToLoad}
        </Text>
        <View className={`rounded-xl p-4 w-full max-w-sm ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          <Text className={`text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.publicTrack.shareLinkInfo}
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = STATUS_COLOR[tripData.status] ?? '#0CC25F';
  const statusLabel = getStatusLabel(tripData.status);
  const driverName =
    [tripData.driver?.first_name, tripData.driver?.last_name].filter(Boolean).join(' ') ||
    tripData.driver?.phone ||
    '—';
  const vehicleLabel = tripData.car
    ? `${tripData.car.brand.name} · ${tripData.car.car_type.code}`
    : null;

  return (
    <ScrollView
      className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}`}
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
      <View className={`${isDark ? 'bg-zinc-800' : 'bg-gray-200'} h-52 w-full items-center justify-center`}>
        <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'} font-JakartaMedium text-base`}>{t.publicTrack.liveMapView}</Text>
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-400'} text-sm mt-1`}>{t.publicTrack.updatesEvery10s}</Text>
      </View>

      {/* Driver / vehicle card */}
      <View
        className={`${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'} mx-4 rounded-2xl p-5 shadow-sm`}
        style={{ marginTop: -24, zIndex: 10, position: 'relative' }}
      >
        {tripData.driver ? (
          <>
            <Text className={`text-xs mb-1 font-JakartaMedium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
              {t.publicTrack.yourDriver}
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-xl font-JakartaBold ${isDark ? 'text-white' : 'text-black'}`}>{driverName}</Text>
                {vehicleLabel && (
                  <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mt-0.5`}>{vehicleLabel}</Text>
                )}
                {tripData.car?.plate_number && (
                  <View className={`${isDark ? 'bg-zinc-700' : 'bg-gray-100'} rounded-lg px-3 py-1 mt-2 self-start`}>
                    <Text className={`${isDark ? 'text-gray-100' : 'text-gray-800'} font-JakartaSemiBold text-sm`}>
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
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mt-2`}>{t.publicTrack.waitingForDriver}</Text>
          </View>
        )}
      </View>

      {/* Trip Locations */}
      <View className={`${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'} mx-4 mt-3 rounded-2xl p-5`}>
        <Text className={`text-xs mb-3 font-JakartaMedium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          {t.publicTrack.route}
        </Text>
        <View className="flex-row items-start mb-4">
          <View className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-3 flex-shrink-0" />
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{t.publicTrack.pickup}</Text>
            <Text className={`text-sm font-JakartaMedium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formatCoords(tripData.start_lat, tripData.start_lng)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 rounded-full bg-red-500 mt-1 mr-3 flex-shrink-0" />
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{t.publicTrack.dropOff}</Text>
            <Text className={`text-sm font-JakartaMedium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formatCoords(tripData.end_lat, tripData.end_lng)}
            </Text>
          </View>
        </View>
        {tripData.tariff && (
          <View className={`border-t mt-4 pt-3 ${isDark ? 'border-zinc-700' : 'border-gray-100'}`}>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{t.publicTrack.tariff}</Text>
            <Text className={`text-sm font-JakartaMedium ${isDark ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
              {tripData.tariff.code}
            </Text>
          </View>
        )}
      </View>

      {/* Safety notice */}
      <View className={`mx-4 mt-3 rounded-xl p-4 ${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
        <Text className={`${isDark ? 'text-yellow-300' : 'text-yellow-800'} font-JakartaSemiBold mb-1`}>{t.publicTrack.aboutPage}</Text>
        <Text className={`${isDark ? 'text-yellow-200' : 'text-yellow-700'} text-sm`}>
          {t.publicTrack.aboutPageDesc}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PublicTrackPage;
