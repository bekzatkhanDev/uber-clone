import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, Text, View, ActivityIndicator } from 'react-native';

import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { PaymentProps } from '@/types/type';
import { useCreatePayment } from '@/hooks/usePayment';

const Payment = ({ fullName, amount, tripId }: PaymentProps) => {
  const [success, setSuccess] = useState(false);
  const createPayment = useCreatePayment();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handlePay = async () => {
    try {
      await createPayment.mutateAsync({ tripId, method: 'cash' });
      setSuccess(true);
    } catch (err: any) {
      showAlert('Payment failed', err.message || 'Could not process payment');
    }
  };

  return (
    <>
      <View style={{ marginTop: 16, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Payment
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Passenger</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{fullName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Amount</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0CC25F' }}>{amount}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Method</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Cash</Text>
        </View>

        <CustomButton
          title={createPayment.isPending ? 'Processing…' : 'Pay with Cash'}
          onPress={handlePay}
          disabled={createPayment.isPending}
        />
      </View>

      <Modal
        visible={success}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccess(false)}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: 'white', borderRadius: 20, padding: 28, alignItems: 'center' }}>
            <Image source={images.check} style={{ width: 96, height: 96, marginBottom: 20 }} resizeMode="contain" />
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
              Ride booked!
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
              Your trip has been confirmed and payment recorded.
            </Text>
            <CustomButton
              title="Back Home"
              onPress={() => {
                setSuccess(false);
                router.push('/(root)/(tabs)/home');
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Payment;
