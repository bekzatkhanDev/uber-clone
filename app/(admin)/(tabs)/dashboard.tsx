// Admin dashboard: key stats + recent trips
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

const StatCard = ({
  label,
  value,
  color = '#3b82f6',
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <View
    style={{
      flex: 1,
      minWidth: 140,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      margin: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }}
  >
    <Text style={{ fontSize: 28, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</Text>
  </View>
);

const TRIP_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const TripRow = ({ item }: { item: any }) => (
  <TouchableOpacity
    onPress={() => router.push(`/(admin)/trips/${item.id}`)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }}>
        {item.customer_name || 'Customer'}
      </Text>
      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
        {item.created_at ? formatDate(item.created_at) : ''}
      </Text>
    </View>
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: TRIP_STATUS_COLORS[item.status] ?? '#94a3b8',
      }}
    >
      <Text style={{ color: 'white', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>
        {item.status}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useAdminDashboard();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const recentTrips: any[] = data?.recent_trips ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Admin Dashboard
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Platform overview
        </Text>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 8 }}>
          <StatCard label="Total Users" value={data?.total_users ?? 0} color="#3b82f6" />
          <StatCard label="Total Drivers" value={data?.total_drivers ?? 0} color="#8b5cf6" />
          <StatCard label="Online Drivers" value={data?.online_drivers ?? 0} color="#10b981" />
          <StatCard label="Trips Today" value={data?.trips_today ?? 0} color="#f59e0b" />
          <StatCard
            label="Revenue Today"
            value={`$${Number(data?.revenue_today ?? 0).toFixed(2)}`}
            color="#ef4444"
          />
        </View>

        {/* Recent trips */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            marginTop: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>Recent Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/trips')}>
              <Text style={{ fontSize: 13, color: '#3b82f6', fontWeight: '600' }}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentTrips.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 24 }}>
              No trips yet
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
