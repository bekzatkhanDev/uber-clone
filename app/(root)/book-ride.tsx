// Оформление поездки: создаём заказ, показываем водителя и цену
import { useEffect, useRef, useState } from "react";
import { Image, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useCurrentUser } from "@/hooks/useUser";
import { useCreateTrip } from "@/hooks/useTrips";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useTranslation, useCurrency } from "@/i18n/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

interface TripResponse {
  id: string;
  status: string;
  distance_km?: number;
  price?: number;
  driver?: { id: number; phone: string; first_name: string };
  car?: { id: number; brand: string; plate_number: string };
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 45000;

const BookRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { isDark } = useTheme();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { userAddress, destinationAddress, selectedTariff, userLatitude, userLongitude, destinationLatitude, destinationLongitude } = useLocationStore();

  const [tripData, setTripData] = useState<TripResponse | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [noDriverFound, setNoDriverFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTripMutation = useCreateTrip();
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const textMuted = isDark ? '#374151' : '#374151';

  const stopPolling = () => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    pollTimer.current = null;
    timeoutTimer.current = null;
  };

  const startPolling = (tripId: string) => {
    pollTimer.current = setInterval(async () => {
      try {
        const active = await fetchWithAuth('/trips/active/');
        if (active?.id === tripId && active?.status === 'accepted') {
          stopPolling();
          setTripData(active);
        }
      } catch {
        // ignore transient errors during polling
      }
    }, POLL_INTERVAL_MS);

    timeoutTimer.current = setTimeout(() => {
      stopPolling();
      setNoDriverFound(true);
    }, POLL_TIMEOUT_MS);
  };

  useEffect(() => {
    const createTrip = async () => {
      if (!selectedTariff || !userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
        setError(t.bookRide.missingData);
        setIsCreating(false);
        return;
      }

      try {
        const activeTrip = await fetchWithAuth('/trips/active/');
        if (activeTrip?.id && activeTrip?.status === 'requested') {
          await fetchWithAuth(`/trips/${activeTrip.id}/cancel/`, { method: 'POST' });
        }

        const response = await createTripMutation.mutateAsync({
          tariff_code: selectedTariff.code,
          start_lat: userLatitude,
          start_lng: userLongitude,
          end_lat: destinationLatitude,
          end_lng: destinationLongitude,
        });

        setTripData(response);
        if (response.status !== 'accepted') startPolling(response.id);
      } catch (err: any) {
        console.error('Failed to create trip:', err);
        const details = err?.responseData?.details;
        const detailMessage = details ? Object.values(details).flat().join(' ') : err.message;
        setError(detailMessage || t.bookRide.failedToCreate);
      } finally {
        setIsCreating(false);
      }
    };

    createTrip();
    return () => stopPolling();
  }, []);

  if (isCreating) {
    return (
      <RideLayout title={t.bookRide.title}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text style={{ marginTop: 16, fontSize: 17, fontWeight: '600', color: textPrimary }}>
            {t.bookRide.findingDriver}
          </Text>
        </View>
      </RideLayout>
    );
  }

  if (error || !tripData) {
    return (
      <RideLayout title={t.bookRide.title}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#ef4444', fontSize: 16, textAlign: 'center' }}>
            {error || t.bookRide.failedToCreate}
          </Text>
        </View>
      </RideLayout>
    );
  }

  const hasDriver = true; // TODO: restore: tripData.status === 'accepted' && !!tripData.driver;
  const price = tripData.price?.toString() || selectedTariff?.base_price || '0';
  const displayPrice = isNaN(parseFloat(price)) ? price : `${symbol}${parseFloat(price).toFixed(2)}`;

  return (
    <RideLayout title={t.bookRide.title}>
      {hasDriver ? (
        <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: isDark ? '#052e16' : '#f0fdf4', borderRadius: 16, marginBottom: 16 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: isDark ? '#14532d' : '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Image source={icons.person} style={{ width: 40, height: 40 }} resizeMode="contain" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>
            {tripData.driver?.first_name ?? t.admin.common.driver}
          </Text>
          {tripData.car && (
            <Text style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>
              {tripData.car.brand} • {tripData.car.plate_number}
            </Text>
          )}
          <View style={{ backgroundColor: '#0CC25F', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 }}>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>{t.bookRide.driverAssigned}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/(root)/chat/${tripData.id}` as any)}
            style={{
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#0f172a' : '#fff',
              borderWidth: 1.5,
              borderColor: '#0CC25F',
              borderRadius: 999,
              paddingHorizontal: 18,
              paddingVertical: 8,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>💬</Text>
            <Text style={{ color: '#0CC25F', fontSize: 14, fontWeight: '700' }}>{t.chat.chatWith} {t.admin.common.driver}</Text>
          </TouchableOpacity>
        </View>
      ) : noDriverFound ? (
        <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: isDark ? '#422006' : '#fef9c3', borderRadius: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#f59e0b' : '#92400e', marginBottom: 8 }}>
            {t.bookRide.failedToCreate}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? '#d97706' : '#78350f', textAlign: 'center', paddingHorizontal: 16 }}>
            {t.bookRide.lookingForDrivers}
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: isDark ? '#1e293b' : '#f9fafb', borderRadius: 16, marginBottom: 16 }}>
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600', color: textPrimary }}>
            {t.bookRide.waitingForDriver}
          </Text>
          <Text style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>
            {t.bookRide.lookingForDrivers}
          </Text>
        </View>
      )}

      <View style={{ backgroundColor: isDark ? '#1e293b' : '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: isDark ? '#334155' : '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#e5e7eb' }}>
          <Text style={{ fontSize: 14, color: textSecondary }}>{t.bookRide.ridePrice}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0CC25F' }}>{displayPrice}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
          <Text style={{ fontSize: 14, color: textSecondary }}>{t.bookRide.status}</Text>
          <View style={{ backgroundColor: hasDriver ? (isDark ? '#052e16' : '#dcfce7') : (isDark ? '#422006' : '#fef9c3'), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: hasDriver ? '#10b981' : (isDark ? '#f59e0b' : '#92400e'), textTransform: 'capitalize' }}>
              {hasDriver ? t.bookRide.driverAssigned : t.bookRide.pending}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#f3f4f6' }}>
          <Image source={icons.to} style={{ width: 20, height: 20, marginRight: 10 }} resizeMode="contain" />
          <Text style={{ flex: 1, fontSize: 14, color: textMuted }} numberOfLines={2}>{userAddress}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
          <Image source={icons.point} style={{ width: 20, height: 20, marginRight: 10 }} resizeMode="contain" />
          <Text style={{ flex: 1, fontSize: 14, color: textMuted }} numberOfLines={2}>{destinationAddress}</Text>
        </View>
      </View>

      <Payment
        fullName={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Passenger'}
        email=""
        amount={displayPrice}
        driverId={tripData.driver?.id ?? 0}
        rideTime={Date.now()}
        tripId={tripData.id}
      />
    </RideLayout>
  );
};

export default BookRide;
