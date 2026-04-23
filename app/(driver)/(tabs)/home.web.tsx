// Web driver home — Leaflet map + status panel + active trip card
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import DriverMap, { ActiveTrip } from '@/components/DriverMap.web';
import { useDriverDashboard, useActivateCar, useGoOffline } from '@/hooks/useDriverDashboard';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/constants/location';
import { useTranslation } from '@/i18n/I18nProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const POLL_INTERVAL_MS = 5000;
const LOCATION_INTERVAL_MS = 10000;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ online }: { online: boolean }) => (
  <View style={{
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: online ? '#0CC25F' : '#9ca3af',
    marginRight: 6,
  }} />
);

interface StatusPanelProps {
  isOnline: boolean;
  activeCar: { plate_number: string; brand?: { name: string }; car_type?: { code: string } } | null;
  onGoOnline: () => void;
  onGoOffline: () => void;
  isLoading: boolean;
  labels: { online: string; offline: string; activeAcceptingRides: string; notAcceptingRides: string; goOffline: string; goOnline: string };
}

const StatusPanel = ({ isOnline, activeCar, onGoOnline, onGoOffline, isLoading, labels }: StatusPanelProps) => (
  <View style={{
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  }}>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <StatusDot online={isOnline} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }}>
          {isOnline ? labels.online : labels.offline}
        </Text>
      </View>
      <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
        {isOnline && activeCar
          ? `${activeCar.brand?.name ?? ''} · ${activeCar.plate_number} · ${activeCar.car_type?.code ?? ''}`
          : isOnline
          ? labels.activeAcceptingRides
          : labels.notAcceptingRides}
      </Text>
    </View>

    <TouchableOpacity
      onPress={isOnline ? onGoOffline : onGoOnline}
      disabled={isLoading}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: isLoading ? '#d1fae5' : isOnline ? '#ef4444' : '#0CC25F',
        opacity: isLoading ? 0.7 : 1,
        minWidth: 110,
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
          {isOnline ? labels.goOffline : labels.goOnline}
        </Text>
      )}
    </TouchableOpacity>
  </View>
);

interface TripCardProps {
  trip: ActiveTrip & {
    price?: number;
    distance_km?: number;
    customer?: { first_name?: string; last_name?: string; phone?: string };
    tariff?: { code?: string };
  };
  onStatusUpdate: (status: string) => void;
  onCancel: () => void;
  isUpdating: boolean;
  labels: {
    headToPickup: string;
    enRouteToDestination: string;
    passenger: string;
    distanceLabel: string;
    fareLabel: string;
    tariffLabel: string;
    pickedUp: string;
    completeRide: string;
    cancel: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  accepted: '#F97316',
  on_route: '#3B82F6',
};

const TripCard = ({ trip, onStatusUpdate, onCancel, isUpdating, labels }: TripCardProps) => {
  const statusLabel: Record<string, string> = {
    accepted: labels.headToPickup,
    on_route: labels.enRouteToDestination,
  };
  const barColor = STATUS_COLORS[trip.status] ?? '#0CC25F';

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 }}>
      <View style={{ backgroundColor: barColor, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
          {statusLabel[trip.status] ?? trip.status}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {trip.customer && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#9ca3af' }}>{labels.passenger}</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
              {trip.customer.first_name} {trip.customer.last_name}
            </Text>
            {trip.customer.phone && (
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{trip.customer.phone}</Text>
            )}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          {trip.distance_km != null && (
            <View>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>{labels.distanceLabel}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>{parseFloat(trip.distance_km).toFixed(1)} km</Text>
            </View>
          )}
          {trip.price != null && (
            <View>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>{labels.fareLabel}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0CC25F' }}>{parseFloat(trip.price).toFixed(2)} KZT</Text>
            </View>
          )}
          {trip.tariff?.code && (
            <View>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>{labels.tariffLabel}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{trip.tariff.code}</Text>
            </View>
          )}
        </View>

        {isUpdating ? (
          <ActivityIndicator size="small" color="#0CC25F" />
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {trip.status === 'accepted' && (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => onStatusUpdate('on_route')}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>{labels.pickedUp}</Text>
              </TouchableOpacity>
            )}
            {trip.status === 'on_route' && (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#0CC25F', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                onPress={() => onStatusUpdate('completed')}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>{labels.completeRide}</Text>
              </TouchableOpacity>
            )}
            {(trip.status === 'accepted' || trip.status === 'on_route') && (
              <TouchableOpacity
                style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5', alignItems: 'center' }}
                onPress={onCancel}
              >
                <Text style={{ color: '#ef4444', fontWeight: '700' }}>{labels.cancel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const DriverHomeWeb = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading, refetch } = useDriverDashboard();
  const { mutate: activateCar, isPending: isActivating } = useActivateCar();
  const { mutate: goOffline, isPending: isGoingOffline } = useGoOffline();
  const { mutate: logout } = useLogout();
  const { clearAuth } = useAuthStore();

  const [showCarPicker, setShowCarPicker] = useState(false);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LATITUDE ?? 51.1694,
    lng: DEFAULT_LONGITUDE ?? 71.4491,
  });

  const watchIdRef = useRef<number | null>(null);
  const locationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOnline: boolean = dashboard?.online_status?.online ?? false;
  const activeCar = dashboard?.online_status?.active_car_id
    ? dashboard?.cars?.find((c: any) => c.id === dashboard.online_status.active_car_id)
    : null;
  const activeTrip = dashboard?.active_trip ?? null;
  const cars: any[] = dashboard?.cars ?? [];
  const availableCars = cars.filter((c: any) => !c.is_active);

  const { mutate: updateTripStatus, isPending: isUpdatingTrip } = useMutation({
    mutationFn: (newStatus: string) =>
      fetchWithAuth(`/trips/${activeTrip?.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
    },
    onError: () => {
      alert('Failed to update trip status. Please try again.');
    },
  });

  const { mutate: cancelTrip, isPending: isCancelling } = useMutation({
    mutationFn: () =>
      fetchWithAuth(`/trips/${activeTrip?.id}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Driver cancelled' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
    },
    onError: () => {
      alert('Failed to cancel trip.');
    },
  });

  const sendLocation = useCallback(
    async (lat: number, lng: number, carId: number) => {
      try {
        await fetchWithAuth('/locations/', {
          method: 'POST',
          body: JSON.stringify({ car_id: carId, lat, lng }),
        });
      } catch {}
    },
    []
  );

  useEffect(() => {
    if (!isOnline || !activeCar?.id) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (locationTimerRef.current) {
        clearInterval(locationTimerRef.current);
        locationTimerRef.current = null;
      }
      return;
    }

    const carId = activeCar.id;

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    const doSend = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude, carId),
        () => {}
      );
    };
    doSend();
    locationTimerRef.current = setInterval(doSend, LOCATION_INTERVAL_MS);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (locationTimerRef.current) {
        clearInterval(locationTimerRef.current);
        locationTimerRef.current = null;
      }
    };
  }, [isOnline, activeCar?.id, sendLocation]);

  useEffect(() => {
    if (!isOnline) {
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
      return;
    }
    pollTimerRef.current = setInterval(() => refetch(), POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    };
  }, [isOnline, refetch]);

  const handleGoOnline = () => {
    if (cars.length === 0) {
      alert(t.driver.noCarsAvailable);
      return;
    }
    if (availableCars.length === 0) {
      alert(t.driver.noCarsAvailable);
      return;
    }
    if (availableCars.length === 1) {
      activateCar(availableCars[0].id);
    } else {
      setShowCarPicker(true);
    }
  };

  const handleGoOffline = () => {
    if (window.confirm(t.driver.waitingForRequests)) {
      goOffline();
    }
  };

  const handleCancel = () => {
    if (window.confirm(t.common.confirm)) {
      cancelTrip();
    }
  };

  const handleSignOut = () => {
    logout(undefined, {
      onSuccess: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
      onError: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
    });
  };

  if (isLoading && !dashboard) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  const statusPanelLabels = {
    online: t.driver.online,
    offline: t.driver.offline,
    activeAcceptingRides: t.driver.activeAcceptingRides,
    notAcceptingRides: t.driver.notAcceptingRides,
    goOffline: t.driver.goOffline,
    goOnline: t.driver.goOnline,
  };

  const tripCardLabels = {
    headToPickup: t.driver.headToPickup,
    enRouteToDestination: t.driver.enRouteToDestination,
    passenger: t.driver.passenger,
    distanceLabel: t.driver.distanceLabel,
    fareLabel: t.driver.fareLabel,
    tariffLabel: t.driver.tariffLabel,
    pickedUp: t.driver.pickedUp,
    completeRide: t.driver.completeRide,
    cancel: t.common.cancel,
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen map */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <DriverMap
          driverLat={driverPos.lat}
          driverLng={driverPos.lng}
          trip={activeTrip}
        />
      </View>

      {/* Header */}
      <View style={{
        position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View style={{ backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{t.driver.driverMode}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher variant="light" />
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              width: 40, height: 40, backgroundColor: 'white', borderRadius: 20,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#374151' }}>OUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={{
        position: 'absolute', bottom: 24, left: 16, right: 16,
      }}>
        {activeTrip && (
          <View style={{ marginBottom: 12 }}>
            <TripCard
              trip={activeTrip}
              onStatusUpdate={(s) => updateTripStatus(s)}
              onCancel={handleCancel}
              isUpdating={isUpdatingTrip || isCancelling}
              labels={tripCardLabels}
            />
          </View>
        )}

        {isOnline && !activeTrip && (
          <View style={{
            backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 12,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0CC25F" style={{ marginRight: 8 }} />
              <Text style={{ color: '#6b7280', fontWeight: '500', fontSize: 14 }}>
                {t.driver.waitingForRequests}
              </Text>
            </View>
          </View>
        )}

        <StatusPanel
          isOnline={isOnline}
          activeCar={activeCar}
          onGoOnline={handleGoOnline}
          onGoOffline={handleGoOffline}
          isLoading={isActivating || isGoingOffline}
          labels={statusPanelLabels}
        />
      </View>

      {/* Car picker modal */}
      <Modal
        visible={showCarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCarPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
              {t.driver.selectCarTitle}
            </Text>
            <FlatList
              data={availableCars}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
                  onPress={() => {
                    setShowCarPicker(false);
                    activateCar(item.id);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                      {item.brand?.name ?? 'Car'} · {item.plate_number}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>
                      {item.car_type?.code ?? ''} · {item.year}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20 }}>🚗</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#9ca3af', paddingVertical: 32 }}>
                  {t.driver.noCarsAvailable}
                </Text>
              }
            />
            <TouchableOpacity
              style={{ marginTop: 12, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' }}
              onPress={() => setShowCarPicker(false)}
            >
              <Text style={{ fontWeight: '700', color: '#374151' }}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DriverHomeWeb;
