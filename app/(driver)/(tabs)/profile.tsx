// Driver profile screen — user info, driver profile, cars
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/i18n/I18nProvider';
import ThemeToggle from '@/components/ThemeToggle';

const DriverProfile = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: dashboard, isLoading } = useDriverDashboard();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { clearAuth } = useAuthStore();

  const user = dashboard?.user;
  const driverProfile = dashboard?.driver_profile;
  const cars: any[] = dashboard?.cars ?? [];

  const handleSignOut = () => {
    if (isLoggingOut) return;
    logout(undefined, {
      onSuccess: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
      onError: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 20,
      }}
    >
      <Text className="text-2xl font-JakartaBold mb-6">{t.driver.profileTitle}</Text>

      {/* User info */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <View className="w-16 h-16 rounded-full bg-[#1a1a2e] items-center justify-center mb-3">
          <Text className="text-white text-xl font-JakartaBold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Text>
        </View>
        <Text className="text-xl font-JakartaSemiBold">
          {user?.first_name} {user?.last_name}
        </Text>
        <Text className="text-gray-500 mt-1">{user?.phone}</Text>
      </View>

      {/* Driver profile */}
      {driverProfile && (
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-JakartaSemiBold">{t.driver.driverDetails}</Text>
            <TouchableOpacity
              onPress={() => router.push('/profile/edit')}
              className="bg-blue-50 px-3 py-1 rounded-lg"
            >
              <Text className="text-blue-600 text-sm font-JakartaMedium">{t.common.edit}</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">{t.driver.license}</Text>
            <Text className="font-JakartaMedium">{driverProfile.license_number ?? '—'}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">{t.driver.experience}</Text>
            <Text className="font-JakartaMedium">
              {driverProfile.experience_years ?? 0} {t.driver.yearsOfExperience}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">{t.driver.rating}</Text>
            <Text className="font-JakartaBold text-[#0CC25F]">
              ★ {driverProfile.rating_avg ?? '—'}
            </Text>
          </View>
        </View>
      )}

      {/* Cars */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-base font-JakartaSemiBold mb-3">{t.driver.myCars}</Text>
        {cars.length === 0 ? (
          <Text className="text-gray-400">{t.driver.noCars}</Text>
        ) : (
          cars.map((car: any) => (
            <View key={car.id} className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <View>
                <Text className="font-JakartaMedium">
                  {car.brand?.name ?? 'Car'} · {car.plate_number}
                </Text>
                <Text className="text-sm text-gray-400">
                  {car.car_type?.code ?? ''} · {car.year}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${car.is_active ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <Text
                  className={`text-xs font-JakartaMedium ${car.is_active ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {car.is_active ? t.driver.carActive : t.driver.carInactive}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Theme Toggle */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-base font-JakartaSemiBold mb-3">Appearance</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500">Toggle dark/light mode</Text>
          <ThemeToggle variant="button" size="medium" />
        </View>
      </View>

      {/* Switch to passenger mode */}
      <TouchableOpacity
        onPress={() => router.replace('/(root)/(tabs)/home')}
        className="bg-gray-800 rounded-2xl p-4 items-center mb-3"
      >
        <Text className="text-white font-JakartaSemiBold">{t.driver.switchToPassenger}</Text>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        disabled={isLoggingOut}
        className="bg-red-500 rounded-2xl p-4 items-center"
      >
        <Text className="text-white font-JakartaSemiBold">
          {isLoggingOut ? t.driver.signingOut : t.auth.signOut}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DriverProfile;
