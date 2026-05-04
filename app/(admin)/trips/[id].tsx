// Admin trip detail: full info + force cancel
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTripDetail, useAdminCancelTrip } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export default function AdminTripDetailScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: trip, isLoading, refetch } = useAdminTripDetail(id);
  const { mutate: cancelTrip, isPending: isCancelling } = useAdminCancelTrip();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#f1f5f9';
  const modalBg = isDark ? '#1e293b' : '#ffffff';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const inputBorder = isDark ? '#334155' : '#e2e8f0';

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: isDark ? '#422006' : '#fef3c7', text: isDark ? '#f59e0b' : '#92400e' },
    accepted: { bg: isDark ? '#1e3a5f' : '#dbeafe', text: isDark ? '#60a5fa' : '#1e40af' },
    in_progress: { bg: isDark ? '#2e1065' : '#ede9fe', text: isDark ? '#a78bfa' : '#5b21b6' },
    completed: { bg: isDark ? '#052e16' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' },
    cancelled: { bg: isDark ? '#450a0a' : '#fee2e2', text: isDark ? '#f87171' : '#991b1b' },
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
      <Text style={{ fontSize: 13, color: textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: textPrimary, maxWidth: '60%', textAlign: 'right' }}>
        {value != null && value !== '' ? String(value) : '—'}
      </Text>
    </View>
  );

  const handleCancel = () => {
    cancelTrip(
      { id, reason: cancelReason.trim() || 'Cancelled by admin' },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          setCancelReason('');
          refetch();
        },
        onError: (err: any) => {
          const msg = err?.message || 'Failed to cancel trip';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <Text style={{ color: textSecondary }}>Trip not found</Text>
      </View>
    );
  }

  const colors = STATUS_COLORS[trip.status] ?? { bg: isDark ? '#1e293b' : '#f1f5f9', text: textSecondary };
  const isTerminal = trip.status === 'completed' || trip.status === 'cancelled';
  const customer = trip.customer ?? {};
  const driver = trip.driver ?? {};
  const tariff = trip.tariff ?? {};
  const payment = trip.payment ?? {};

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Trip Details</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.bg }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
              {trip.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>Trip Info</Text>
            <InfoRow label="Trip ID" value={trip.id} />
            <InfoRow label="Created" value={trip.created_at ? formatDate(trip.created_at) : undefined} />
            <InfoRow label="Price" value={trip.price != null ? `$${Number(trip.price).toFixed(2)}` : null} />
            <InfoRow label="Tariff" value={tariff.name ?? tariff.code} />
            <InfoRow label="Distance" value={trip.distance_km != null ? `${Number(trip.distance_km).toFixed(1)} km` : null} />
          </View>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>Participants</Text>
            <InfoRow label="Customer" value={`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.phone} />
            <InfoRow label="Customer Phone" value={customer.phone} />
            <InfoRow label="Driver" value={driver.id ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || driver.phone : null} />
            <InfoRow label="Driver Phone" value={driver.phone} />
          </View>

          {payment && Object.keys(payment).length > 0 && (
            <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.06, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>Payment</Text>
              <InfoRow label="Method" value={payment.payment_method} />
              <InfoRow label="Amount" value={payment.amount != null ? `$${Number(payment.amount).toFixed(2)}` : null} />
              <InfoRow label="Status" value={payment.status} />
            </View>
          )}

          {trip.status === 'cancelled' && (
            <View style={{ backgroundColor: isDark ? '#450a0a' : '#fff1f2', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: isDark ? '#7f1d1d' : '#fecdd3' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f87171' : '#9f1239', marginBottom: 4 }}>Cancellation</Text>
              <InfoRow label="Reason" value={trip.cancel_reason} />
              <InfoRow label="Cancelled At" value={trip.cancelled_at ? formatDate(trip.cancelled_at) : undefined} />
            </View>
          )}

          {!isTerminal && (
            <TouchableOpacity
              onPress={() => setShowCancelModal(true)}
              style={{ backgroundColor: '#ef4444', borderRadius: 14, padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Force Cancel Trip</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <Modal visible={showCancelModal} transparent animationType="slide" onRequestClose={() => setShowCancelModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: modalBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 8 }}>Cancel Trip</Text>
              <Text style={{ fontSize: 14, color: textSecondary, marginBottom: 16 }}>
                Optionally provide a reason for cancellation.
              </Text>
              <TextInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Reason (optional)"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  color: textPrimary,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  minHeight: 80,
                  ...(Platform.OS !== 'web' && { textAlignVertical: 'top' as const }),
                  marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: isDark ? '#334155' : '#f1f5f9', alignItems: 'center' }}
                >
                  <Text style={{ fontWeight: '600', color: textSecondary }}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isCancelling}
                  style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' }}
                >
                  <Text style={{ fontWeight: '700', color: 'white' }}>
                    {isCancelling ? 'Cancelling…' : 'Confirm Cancel'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
