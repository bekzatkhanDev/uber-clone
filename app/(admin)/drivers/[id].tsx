// Admin driver detail: profile, cars, approve + suspend actions
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminDriverDetail, useAdminApproveDriver, useAdminSuspendDriver, useAdminReactivateDriver } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    }}
  >
    <Text style={{ fontSize: 13, color: '#64748b' }}>{label}</Text>
    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}>
      {value != null && value !== '' ? String(value) : '—'}
    </Text>
  </View>
);

const CarCard = ({ car }: { car: any }) => (
  <View
    style={{
      backgroundColor: '#f8fafc',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    }}
  >
    <Text style={{ fontWeight: '600', color: '#0f172a', fontSize: 14 }}>
      {car.brand?.name ?? 'Car'} · {car.plate_number}
    </Text>
    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
      {car.car_type?.code ?? ''} · {car.year}
    </Text>
    {car.is_active && (
      <View
        style={{
          marginTop: 6,
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
          backgroundColor: '#d1fae5',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#065f46' }}>Active</Text>
      </View>
    )}
  </View>
);

export default function AdminDriverDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const driverId = Number(id);

  const { data: driver, isLoading, refetch } = useAdminDriverDetail(driverId);
  const { mutate: approveDriver, isPending: isApproving } = useAdminApproveDriver();
  const { mutate: suspendDriver, isPending: isSuspending } = useAdminSuspendDriver();
  const { mutate: reactivateDriver, isPending: isReactivating } = useAdminReactivateDriver();

  const handleApprove = () => {
    const doApprove = () =>
      approveDriver(driverId, {
        onSuccess: () => refetch(),
        onError: (err: any) => {
          const msg = err?.message || 'Failed to approve';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        },
      });
    if (Platform.OS === 'web') {
      if (window.confirm('Approve Driver\nApprove this driver and allow them to accept rides?')) doApprove();
    } else {
      Alert.alert('Approve Driver', 'Approve this driver and allow them to accept rides?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: doApprove },
      ]);
    }
  };

  const handleSuspend = () => {
    const doSuspend = () =>
      suspendDriver(driverId, {
        onSuccess: () => refetch(),
        onError: (err: any) => {
          const msg = err?.message || 'Failed to suspend';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        },
      });
    if (Platform.OS === 'web') {
      if (window.confirm('Suspend Driver\nThis will deactivate the driver and their active car.')) doSuspend();
    } else {
      Alert.alert('Suspend Driver', 'This will deactivate the driver and their active car.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Suspend', style: 'destructive', onPress: doSuspend },
      ]);
    }
  };

  const handleReactivate = () => {
    const doReactivate = () =>
      reactivateDriver(driverId, {
        onSuccess: () => refetch(),
        onError: (err: any) => {
          const msg = err?.message || 'Failed to reactivate';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        },
      });
    if (Platform.OS === 'web') {
      if (window.confirm('Reactivate Driver\nThis will restore the driver account.')) doReactivate();
    } else {
      Alert.alert('Reactivate Driver', 'This will restore the driver account.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reactivate', onPress: doReactivate },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Text style={{ color: '#94a3b8' }}>Driver not found</Text>
      </View>
    );
  }

  const isVerified = driver.is_verified;
  const isActive = driver.is_active;
  const profile = driver.driver_profile ?? {};
  const cars: any[] = driver.cars ?? [];

  let statusLabel = 'Active';
  let statusColor = '#10b981';

  if (!isActive) {
    statusLabel = 'Suspended';
    statusColor = '#ef4444';
  } else if (!isVerified) {
    statusLabel = 'Pending';
    statusColor = '#f59e0b';
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: '#1e293b',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>
            Driver Details
          </Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: statusColor }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{statusLabel}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + name */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#ede9fe',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 36 }}>🚗</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
              {`${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'No name'}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{driver.phone}</Text>
            {driver.is_online && (
              <View style={{ marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#d1fae5' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#065f46' }}>Currently Online</Text>
              </View>
            )}
          </View>

          {/* Driver profile card */}
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
              Account Info
            </Text>
            <InfoRow label="Phone" value={driver.phone} />
            <InfoRow label="User ID" value={driver.id} />
            <InfoRow label="Joined" value={driver.created_at ? formatDate(driver.created_at) : undefined} />
            <InfoRow label="Total Trips" value={driver.trip_count} />
          </View>

          {/* Driver profile details */}
          {Object.keys(profile).length > 0 && (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                Driver Profile
              </Text>
              <InfoRow label="License No." value={profile.license_number} />
              <InfoRow label="Experience" value={profile.experience_years != null ? `${profile.experience_years} years` : null} />
              <InfoRow label="Avg Rating" value={profile.rating_avg ? `★ ${Number(profile.rating_avg).toFixed(1)}` : null} />
              <InfoRow label="Bio" value={profile.bio} />
            </View>
          )}

          {/* Cars */}
          {cars.length > 0 && (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
                Cars ({cars.length})
              </Text>
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={{ gap: 10 }}>
            {!isVerified && isActive && (
              <TouchableOpacity
                onPress={handleApprove}
                disabled={isApproving}
                style={{ backgroundColor: '#10b981', borderRadius: 14, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                  {isApproving ? 'Approving…' : 'Approve Driver'}
                </Text>
              </TouchableOpacity>
            )}

            {isActive && (
              <TouchableOpacity
                onPress={handleSuspend}
                disabled={isSuspending}
                style={{ backgroundColor: '#ef4444', borderRadius: 14, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                  {isSuspending ? 'Suspending…' : 'Suspend Driver'}
                </Text>
              </TouchableOpacity>
            )}

            {!isActive && (
              <TouchableOpacity
                onPress={handleReactivate}
                disabled={isReactivating}
                style={{ backgroundColor: '#10b981', borderRadius: 14, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                  {isReactivating ? 'Reactivating…' : 'Reactivate Driver'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
