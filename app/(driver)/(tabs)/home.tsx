// Driver home: online/offline toggle, map, active trip panel, car selector
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import Map from '@/components/Map';
import DriverStatusToggle from '@/components/DriverStatusToggle';
import ActiveTripPanel, { TripCompletedPayload } from '@/components/ActiveTripPanel';
import ReviewModal from '@/components/ReviewModal';
import { useDriverDashboard, useActivateCar, useGoOffline } from '@/hooks/useDriverDashboard';
import { useDriverLocationTracking } from '@/hooks/useUpdateLocation';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTheme } from '@/hooks/useTheme';

const DriverHome = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data: dashboard, isLoading } = useDriverDashboard();
  const { mutate: activateCar, isPending: isActivating } = useActivateCar();
  const { mutate: goOffline, isPending: isGoingOffline } = useGoOffline();
  const { mutate: logout } = useLogout();
  const { clearAuth } = useAuthStore();
  const [showCarPicker, setShowCarPicker] = useState(false);
  const [completedTrip, setCompletedTrip] = useState<TripCompletedPayload | null>(null);

  const isOnline: boolean = dashboard?.online_status?.online ?? false;
  const activeCar = dashboard?.online_status?.active_car_id
    ? dashboard?.cars?.find((c: any) => c.id === dashboard.online_status.active_car_id)
    : null;

  // Track location while online
  useDriverLocationTracking(activeCar?.id ?? null, isOnline);

  const activeTrip = dashboard?.active_trip ?? null;
  const cars: any[] = dashboard?.cars ?? [];
  const availableCars = cars.filter((c: any) => !c.is_active);

  const isInitialLoading = isLoading && !dashboard;

  const handleGoOnline = () => {
    if (cars.length === 0) {
      Alert.alert('No Cars', 'Please add a car to your account before going online.', [
        { text: 'OK' },
      ]);
      return;
    }
    if (availableCars.length === 0 && !isOnline) {
      Alert.alert('No Available Cars', 'All your cars are already active or unavailable.');
      return;
    }
    if (availableCars.length === 1) {
      activateCar(availableCars[0].id, {
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to go online. Please try again.');
        },
      });
    } else {
      setShowCarPicker(true);
    }
  };

  const handleGoOffline = () => {
    Alert.alert('Go Offline', 'You will stop receiving ride requests.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Go Offline', 
        onPress: () => goOffline(undefined, {
          onError: (error: any) => {
            Alert.alert('Error', error?.message || 'Failed to go offline. Please try again.');
          },
        }) 
      },
    ]);
  };

  const handleSignOut = () => {
    logout(undefined, {
      onSuccess: async () => {
        await clearAuth();
        router.replace('/(auth)/welcome');
      },
      onError: async () => {
        await clearAuth();
        router.replace('/(auth)/welcome');
      },
    });
  };

  if (isInitialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0f172a' : '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f5f5f5' }}>
      {/* Full-screen map */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Map showDrivers={false} />
      </View>

      {/* Header */}
      <View
        className="absolute top-0 left-0 right-0 px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="bg-[#1a1a2e] px-4 py-2 rounded-full">
            <Text className="text-white font-JakartaSemiBold text-sm">Driver Mode</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher variant="light" />
            <TouchableOpacity
              onPress={handleSignOut}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
            >
              <Text className="text-xs font-JakartaBold">OUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom panel */}
      <View
        className="absolute left-0 right-0"
        style={{ bottom: insets.bottom + 90 }}
      >
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {/* Online/offline toggle */}
          <DriverStatusToggle
            isOnline={isOnline}
            activeCar={
              activeCar
                ? {
                    plate_number: activeCar.plate_number,
                    brand: activeCar.brand?.name ?? '',
                    car_type: activeCar.car_type?.code ?? '',
                  }
                : null
            }
            onGoOnline={handleGoOnline}
            onGoOffline={handleGoOffline}
            isLoading={isActivating || isGoingOffline}
          />

          {/* Active trip */}
          {activeTrip && (
            <ActiveTripPanel
              trip={activeTrip}
              onTripCompleted={(payload) => setCompletedTrip(payload)}
            />
          )}

          {/* No active trip info */}
          {isOnline && !activeTrip && (
            <View style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: 16, padding: 20, marginHorizontal: 20, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#6b7280', fontFamily: 'Jakarta-Medium' }}>
                Waiting for ride requests...
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Post-trip review modal — driver rates the customer */}
      {completedTrip && (
        <ReviewModal
          visible={!!completedTrip}
          tripId={completedTrip.tripId}
          driverName={completedTrip.customerName}
          reviewedId={completedTrip.customerId}
          onClose={() => setCompletedTrip(null)}
        />
      )}

      {/* Car picker modal */}
      <Modal visible={showCarPicker} transparent animationType="slide" onRequestClose={() => setShowCarPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Jakarta-SemiBold', color: isDark ? '#f1f5f9' : '#111827', marginBottom: 16 }}>
              Select Car to Go Online
            </Text>
            <FlatList
              data={availableCars}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#f3f4f6' }}
                  onPress={() => {
                    setShowCarPicker(false);
                    activateCar(item.id, {
                      onError: (error: any) => {
                        Alert.alert('Error', error?.message || 'Failed to go online. Please try again.');
                      },
                    });
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: 'Jakarta-SemiBold', color: isDark ? '#f1f5f9' : '#111827' }}>
                      {item.brand?.name ?? 'Car'} · {item.plate_number}
                    </Text>
                    <Text style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>
                      {item.car_type?.code ?? ''} · {item.year}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#9ca3af', paddingVertical: 32 }}>No cars available</Text>
              }
            />
            <TouchableOpacity
              style={{ marginTop: 16, paddingVertical: 12, backgroundColor: isDark ? '#334155' : '#f3f4f6', borderRadius: 12, alignItems: 'center' }}
              onPress={() => setShowCarPicker(false)}
            >
              <Text style={{ fontFamily: 'Jakarta-SemiBold', color: isDark ? '#f1f5f9' : '#111827' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DriverHome;
