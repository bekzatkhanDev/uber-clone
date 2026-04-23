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
import ActiveTripPanel from '@/components/ActiveTripPanel';
import { useDriverDashboard, useActivateCar, useGoOffline } from '@/hooks/useDriverDashboard';
import { useDriverLocationTracking } from '@/hooks/useUpdateLocation';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const DriverHome = () => {
  const insets = useSafeAreaInsets();
  const { data: dashboard, isLoading } = useDriverDashboard();
  const { mutate: activateCar, isPending: isActivating } = useActivateCar();
  const { mutate: goOffline, isPending: isGoingOffline } = useGoOffline();
  const { mutate: logout } = useLogout();
  const { clearAuth } = useAuthStore();
  const [showCarPicker, setShowCarPicker] = useState(false);

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
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
              onTripCompleted={() => {
                Alert.alert('Ride Complete', 'Trip has been completed successfully!');
              }}
            />
          )}

          {/* No active trip info */}
          {isOnline && !activeTrip && (
            <View className="bg-white rounded-2xl p-5 mx-5 shadow-sm">
              <Text className="text-center text-gray-500 font-JakartaMedium">
                Waiting for ride requests...
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Car picker modal */}
      <Modal
        visible={showCarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCarPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-xl font-JakartaSemiBold mb-4">Select Car to Go Online</Text>
            <FlatList
              data={availableCars}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-4 border-b border-gray-100"
                  onPress={() => {
                    setShowCarPicker(false);
                    activateCar(item.id, {
                      onError: (error: any) => {
                        Alert.alert('Error', error?.message || 'Failed to go online. Please try again.');
                      },
                    });
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-JakartaSemiBold">
                      {item.brand?.name ?? 'Car'} · {item.plate_number}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.car_type?.code ?? ''} · {item.year}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-400 py-8">No cars available</Text>
              }
            />
            <TouchableOpacity
              className="mt-4 py-3 bg-gray-100 rounded-xl items-center"
              onPress={() => setShowCarPicker(false)}
            >
              <Text className="font-JakartaSemiBold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DriverHome;
