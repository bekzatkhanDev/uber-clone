// Admin settings / profile + logout
import React from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const SettingRow = ({
  emoji,
  label,
  description,
  onPress,
  danger = false,
}: {
  emoji: string;
  label: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    }}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: danger ? '#fee2e2' : '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '600', fontSize: 15, color: danger ? '#dc2626' : '#0f172a' }}>
        {label}
      </Text>
      {description && (
        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{description}</Text>
      )}
    </View>
    <Text style={{ color: '#cbd5e1', fontSize: 18 }}>›</Text>
  </TouchableOpacity>
);

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { mutate: logout, isPending } = useLogout();
  const { clearAuth } = useAuthStore();

  const doLogout = () => {
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

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) doLogout();
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 24 }}>
            Settings
          </Text>

          {/* Navigation shortcuts */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
            Quick Access
          </Text>
          <SettingRow
            emoji="📊"
            label="Dashboard"
            description="Platform overview and stats"
            onPress={() => router.push('/(admin)/(tabs)/dashboard')}
          />
          <SettingRow
            emoji="👤"
            label="Manage Users"
            description="View and manage all users"
            onPress={() => router.push('/(admin)/(tabs)/users')}
          />
          <SettingRow
            emoji="🚗"
            label="Manage Drivers"
            description="Approve or suspend drivers"
            onPress={() => router.push('/(admin)/(tabs)/drivers')}
          />
          <SettingRow
            emoji="🗺️"
            label="Manage Trips"
            description="Monitor all trips"
            onPress={() => router.push('/(admin)/(tabs)/trips')}
          />

          {/* Session */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginTop: 16, marginBottom: 8, textTransform: 'uppercase' }}>
            Session
          </Text>
          <SettingRow
            emoji="🚪"
            label={isPending ? 'Signing out…' : 'Sign Out'}
            description="End your admin session"
            onPress={handleLogout}
            danger
          />
        </ScrollView>
      </View>
    </View>
  );
}
