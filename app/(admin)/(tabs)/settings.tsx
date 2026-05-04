// Admin settings / profile + logout
import React from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/i18n/I18nProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

export default function AdminSettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { mutate: logout, isPending } = useLogout();
  const { clearAuth } = useAuthStore();

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#94a3b8';
  const sectionLabel = isDark ? '#64748b' : '#94a3b8';
  const iconBg = isDark ? '#1e293b' : '#f1f5f9';
  const chevronColor = isDark ? '#475569' : '#cbd5e1';

  const doLogout = () => {
    logout(undefined, {
      onSuccess: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
      onError: async () => { await clearAuth(); router.replace('/(auth)/welcome'); },
    });
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t.admin.settings.confirmSignOut)) doLogout();
    } else {
      Alert.alert(t.admin.settings.signOut, t.admin.settings.confirmSignOut, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.admin.settings.signOut, style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const SettingRow = ({ emoji, label, description, onPress, danger = false }: { emoji: string; label: string; description?: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 3, elevation: 1 }}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: danger ? (isDark ? '#450a0a' : '#fee2e2') : iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 15, color: danger ? '#ef4444' : textPrimary }}>{label}</Text>
        {description && <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{description}</Text>}
      </View>
      <Text style={{ color: chevronColor, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary, marginBottom: 24 }}>
            {t.admin.settings.title}
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '700', color: sectionLabel, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
            {t.admin.settings.quickAccess}
          </Text>
          <SettingRow emoji="📊" label={t.admin.settings.dashboard} description={t.admin.settings.dashboardDesc} onPress={() => router.push('/(admin)/(tabs)/dashboard')} />
          <SettingRow emoji="👤" label={t.admin.settings.manageUsers} description={t.admin.settings.manageUsersDesc} onPress={() => router.push('/(admin)/(tabs)/users')} />
          <SettingRow emoji="🚗" label={t.admin.settings.manageDrivers} description={t.admin.settings.manageDriversDesc} onPress={() => router.push('/(admin)/(tabs)/drivers')} />
          <SettingRow emoji="🗺️" label={t.admin.settings.manageTrips} description={t.admin.settings.manageTripsDesc} onPress={() => router.push('/(admin)/(tabs)/trips')} />

          <Text style={{ fontSize: 12, fontWeight: '700', color: sectionLabel, letterSpacing: 0.8, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}>
            Appearance
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 3, elevation: 1 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Text style={{ fontSize: 20 }}>🌓</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 15, color: textPrimary }}>Theme Mode</Text>
              <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>
                {isDark ? 'Dark mode active' : 'Light mode active'}
              </Text>
            </View>
            <ThemeToggle variant="button" size="small" />
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: sectionLabel, letterSpacing: 0.8, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}>
            {t.admin.settings.session}
          </Text>
          <SettingRow emoji="🚪" label={isPending ? t.admin.settings.signingOut : t.admin.settings.signOut} description={t.admin.settings.signOutDesc} onPress={handleLogout} danger />
        </ScrollView>
      </View>
    </View>
  );
}
