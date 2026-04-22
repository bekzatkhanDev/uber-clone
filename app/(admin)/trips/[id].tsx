// Admin trip detail: full info + force cancel
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTripDetail, useAdminCancelTrip } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#dbeafe', text: '#1e40af' },
  in_progress: { bg: '#ede9fe', text: '#5b21b6' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

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
    <Text
      style={{ fontSize: 14, fontWeight: '500', color: '#0f172a', maxWidth: '60%', textAlign: 'right' }}
    >
      {value != null && value !== '' ? String(value) : '—'}
    </Text>
  </View>
);

export default function AdminTripDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: trip, isLoading, refetch } = useAdminTripDetail(id);
  const { mutate: cancelTrip, isPending: isCancelling } = useAdminCancelTrip();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Text style={{ color: '#94a3b8' }}>Trip not found</Text>
      </View>
    );
  }

  const colors = STATUS_COLORS[trip.status] ?? { bg: '#f1f5f9', text: '#475569' };
  const isTerminal = trip.status === 'completed' || trip.status === 'cancelled';
  const customer = trip.customer ?? {};
  const driver = trip.driver ?? {};
  const tariff = trip.tariff ?? {};
  const payment = trip.payment ?? {};

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
            Trip Details
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: colors.bg,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
              {trip.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip info card */}
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
              Trip Info
            </Text>
            <InfoRow label="Trip ID" value={trip.id} />
            <InfoRow label="Created" value={trip.created_at ? formatDate(trip.created_at) : undefined} />
            <InfoRow label="Price" value={trip.price != null ? `$${Number(trip.price).toFixed(2)}` : null} />
            <InfoRow label="Tariff" value={tariff.name ?? tariff.code} />
            <InfoRow label="Distance" value={trip.distance_km != null ? `${Number(trip.distance_km).toFixed(1)} km` : null} />
          </View>

          {/* Participants */}
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
              Participants
            </Text>
            <InfoRow
              label="Customer"
              value={`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.phone}
            />
            <InfoRow label="Customer Phone" value={customer.phone} />
            <InfoRow
              label="Driver"
              value={driver.id
                ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || driver.phone
                : null}
            />
            <InfoRow label="Driver Phone" value={driver.phone} />
          </View>

          {/* Payment */}
          {payment && Object.keys(payment).length > 0 && (
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
                Payment
              </Text>
              <InfoRow label="Method" value={payment.payment_method} />
              <InfoRow label="Amount" value={payment.amount != null ? `$${Number(payment.amount).toFixed(2)}` : null} />
              <InfoRow label="Status" value={payment.status} />
            </View>
          )}

          {/* Cancellation info */}
          {trip.status === 'cancelled' && (
            <View
              style={{
                backgroundColor: '#fff1f2',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#fecdd3',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#9f1239', marginBottom: 4 }}>
                Cancellation
              </Text>
              <InfoRow label="Reason" value={trip.cancel_reason} />
              <InfoRow label="Cancelled At" value={trip.cancelled_at ? formatDate(trip.cancelled_at) : undefined} />
            </View>
          )}

          {/* Cancel action */}
          {!isTerminal && (
            <TouchableOpacity
              onPress={() => setShowCancelModal(true)}
              style={{ backgroundColor: '#ef4444', borderRadius: 14, padding: 16, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                Force Cancel Trip
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Cancel reason modal */}
        <Modal
          visible={showCancelModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>
                Cancel Trip
              </Text>
              <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                Optionally provide a reason for cancellation.
              </Text>
              <TextInput
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Reason (optional)"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  color: '#0f172a',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  minHeight: 80,
                  ...(Platform.OS !== 'web' && { textAlignVertical: 'top' as const }),
                  marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: '#f1f5f9',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '600', color: '#475569' }}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isCancelling}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: '#ef4444',
                    alignItems: 'center',
                  }}
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
