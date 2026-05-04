// Admin user detail: info + roles + suspend toggle
import React from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminUserDetail, useAdminSuspendUser } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function AdminUserDetailScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading, refetch } = useAdminUserDetail(userId);
  const { mutate: suspendUser, isPending: isSuspending } = useAdminSuspendUser();

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#f1f5f9';

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
      <Text style={{ fontSize: 13, color: textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: textPrimary, maxWidth: '60%', textAlign: 'right' }}>
        {value != null && value !== '' ? String(value) : '—'}
      </Text>
    </View>
  );

  const doSuspendToggle = () => {
    suspendUser(userId, {
      onSuccess: () => refetch(),
      onError: (err: any) => {
        const msg = err?.message || 'Action failed';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      },
    });
  };

  const handleSuspendToggle = () => {
    const action = user?.is_active ? 'suspend' : 'reactivate';
    const title = action.charAt(0).toUpperCase() + action.slice(1) + ' User';
    const message = `Are you sure you want to ${action} this user?`;
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) doSuspendToggle();
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: title, style: user?.is_active ? 'destructive' : 'default', onPress: doSuspendToggle },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <Text style={{ color: textSecondary }}>User not found</Text>
      </View>
    );
  }

  const roles: string[] = user.roles ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: isDark ? '#1e293b' : '#1e293b', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>User Details</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: user.is_active ? '#10b981' : '#ef4444' }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              {user.is_active ? 'Active' : 'Suspended'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#1e3a5f' : '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary }}>
              {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {roles.map((role) => (
                <View
                  key={role}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: role === 'admin' ? (isDark ? '#422006' : '#fef3c7') : role === 'driver' ? (isDark ? '#2e1065' : '#ede9fe') : (isDark ? '#1e3a5f' : '#dbeafe'),
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: role === 'admin' ? '#f59e0b' : role === 'driver' ? '#a78bfa' : '#60a5fa' }}>
                    {role}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>Account Info</Text>
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="User ID" value={user.id} />
            <InfoRow label="Joined" value={user.created_at ? formatDate(user.created_at) : undefined} />
            <InfoRow label="Verified" value={user.is_verified ? 'Yes' : 'No'} />
            <InfoRow label="Total Trips" value={user.trip_count} />
          </View>

          <TouchableOpacity
            onPress={handleSuspendToggle}
            disabled={isSuspending}
            style={{ backgroundColor: user.is_active ? '#ef4444' : '#10b981', borderRadius: 14, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
              {isSuspending ? 'Processing…' : user.is_active ? 'Suspend User' : 'Reactivate User'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
