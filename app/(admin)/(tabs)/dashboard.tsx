// Admin dashboard: key stats + recent trips
import React from 'react';
import { ActivityIndicator, FlatList, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const TRIP_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data, isLoading, refetch, isRefetching } = useAdminDashboard();

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#1e293b' : '#f1f5f9';

  const StatCard = ({ label, value, color = '#3b82f6' }: { label: string; value: string | number; color?: string }) => (
    <View style={{ flex: 1, minWidth: 140, backgroundColor: cardBg, borderRadius: 16, padding: 16, margin: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.08, shadowRadius: 4, elevation: 2 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color }}>{value}</Text>
      <Text style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>{label}</Text>
    </View>
  );

  const TripRow = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/trips/${item.id}`)}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: textPrimary }}>
          {item.customer_name || t.admin.common.customer}
        </Text>
        <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>
          {item.created_at ? formatDate(item.created_at) : ''}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: TRIP_STATUS_COLORS[item.status] ?? '#94a3b8' }}>
        <Text style={{ color: 'white', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const recentTrips: any[] = data?.recent_trips ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 24, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>
            {t.admin.dashboard.title}
          </Text>
          <Text style={{ fontSize: 13, color: textSecondary, marginBottom: 20 }}>
            {t.admin.dashboard.subtitle}
          </Text>

          {/* Stats grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 8 }}>
            <StatCard label={t.admin.dashboard.totalUsers} value={data?.total_users ?? 0} color="#3b82f6" />
            <StatCard label={t.admin.dashboard.totalDrivers} value={data?.total_drivers ?? 0} color="#8b5cf6" />
            <StatCard label={t.admin.dashboard.onlineDrivers} value={data?.online_drivers ?? 0} color="#10b981" />
            <StatCard label={t.admin.dashboard.tripsToday} value={data?.trips_today ?? 0} color="#f59e0b" />
            <StatCard label={t.admin.dashboard.revenueToday} value={`$${Number(data?.revenue_today ?? 0).toFixed(2)}`} color="#ef4444" />
          </View>

          {/* Recent trips */}
          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 4, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{t.admin.dashboard.recentTrips}</Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/trips')}>
                <Text style={{ fontSize: 13, color: '#3b82f6', fontWeight: '600' }}>{t.admin.dashboard.viewAll}</Text>
              </TouchableOpacity>
            </View>
            {recentTrips.length === 0 ? (
              <Text style={{ textAlign: 'center', color: textSecondary, paddingVertical: 24 }}>
                {t.admin.dashboard.noTrips}
              </Text>
            ) : (
              <FlatList
                data={recentTrips}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <TripRow item={item} />}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
