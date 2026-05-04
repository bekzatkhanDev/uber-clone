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
import { useTheme } from '@/hooks/useTheme';

const DriverProfile = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data: dashboard, isLoading } = useDriverDashboard();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { clearAuth } = useAuthStore();

  const user = dashboard?.user;
  const driverProfile = dashboard?.driver_profile;
  const cars: any[] = dashboard?.cars ?? [];

  const bg = isDark ? '#0f172a' : '#f5f5f5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#f3f4f6';

  const handleSignOut = () => {
    if (isLoggingOut) return;
    logout(undefined, {
      onSuccess: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
      onError: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
    >
      <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 24 }}>
        {t.driver.profileTitle}
      </Text>

      {/* User info */}
      <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontSize: 22, fontFamily: 'Jakarta-Bold' }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontFamily: 'Jakarta-SemiBold', color: textPrimary }}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={{ color: textSecondary, marginTop: 4 }}>{user?.phone}</Text>
      </View>

      {/* Driver profile */}
      {driverProfile && (
        <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontFamily: 'Jakarta-SemiBold', color: textPrimary }}>{t.driver.driverDetails}</Text>
            <TouchableOpacity onPress={() => router.push('/profile/edit')} style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: 13, fontFamily: 'Jakarta-Medium' }}>{t.common.edit}</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: t.driver.license, value: driverProfile.license_number ?? '—' },
            { label: t.driver.experience, value: `${driverProfile.experience_years ?? 0} ${t.driver.yearsOfExperience}` },
          ].map(({ label, value }, idx) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: textSecondary }}>{label}</Text>
              <Text style={{ fontFamily: 'Jakarta-Medium', color: textPrimary }}>{value}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: textSecondary }}>{t.driver.rating}</Text>
            <Text style={{ fontFamily: 'Jakarta-Bold', color: '#0CC25F' }}>★ {driverProfile.rating_avg ?? '—'}</Text>
          </View>
        </View>
      )}

      {/* Cars */}
      <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>{t.driver.myCars}</Text>
        {cars.length === 0 ? (
          <Text style={{ color: textSecondary }}>{t.driver.noCars}</Text>
        ) : (
          cars.map((car: any, idx: number) => (
            <View key={car.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: idx < cars.length - 1 ? 1 : 0, borderBottomColor: borderColor }}>
              <View>
                <Text style={{ fontFamily: 'Jakarta-Medium', color: textPrimary }}>
                  {car.brand?.name ?? 'Car'} · {car.plate_number}
                </Text>
                <Text style={{ fontSize: 13, color: textSecondary }}>
                  {car.car_type?.code ?? ''} · {car.year}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, backgroundColor: car.is_active ? (isDark ? '#052e16' : '#dcfce7') : (isDark ? '#1e293b' : '#f3f4f6') }}>
                <Text style={{ fontSize: 12, fontFamily: 'Jakarta-Medium', color: car.is_active ? '#0CC25F' : textSecondary }}>
                  {car.is_active ? t.driver.carActive : t.driver.carInactive}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Appearance */}
      <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 4, elevation: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>Appearance</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={{ color: textSecondary }}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
          </View>
          <ThemeToggle variant="button" size="medium" />
        </View>
      </View>

      {/* Switch to passenger */}
      <TouchableOpacity
        onPress={() => router.replace('/(root)/(tabs)/home')}
        style={{ backgroundColor: isDark ? '#1e293b' : '#1f2937', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 }}
      >
        <Text style={{ color: 'white', fontFamily: 'Jakarta-SemiBold' }}>{t.driver.switchToPassenger}</Text>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        disabled={isLoggingOut}
        style={{ backgroundColor: '#ef4444', borderRadius: 16, padding: 16, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontFamily: 'Jakarta-SemiBold' }}>
          {isLoggingOut ? t.driver.signingOut : t.auth.signOut}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DriverProfile;
