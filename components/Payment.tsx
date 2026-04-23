import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ActivityIndicator, Image, Linking, Modal, Platform, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import BankSelector, { PaymentMethodId, getBankById, CASH_PAYMENT } from '@/components/BankSelector';
import { images } from '@/constants';
import { PaymentProps } from '@/types/type';
import { useCreatePayment } from '@/hooks/usePayment';
import { useLocationStore } from '@/store';
import { useI18n } from '@/i18n';

const Payment = ({ fullName, amount, tripId }: PaymentProps) => {
  const { t } = useI18n();
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useLocationStore();
  const [selectedBank, setSelectedBank] = useState<PaymentMethodId | null>(
    (selectedPaymentMethod as PaymentMethodId | null) ?? null,
  );
  const [success, setSuccess] = useState(false);
  const createPayment = useCreatePayment();

  const handleSelectBank = (id: PaymentMethodId) => {
    setSelectedBank(id);
    setSelectedPaymentMethod(id);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handlePay = async () => {
    if (!selectedBank) return;
    
    // Open bank URL if it's a bank payment
    if (selectedBank !== 'cash') {
      const bank = getBankById(selectedBank);
      if (bank) {
        try {
          await Linking.openURL(bank.url);
        } catch {
          // ignore if URL can't open
        }
      }
    }

    try {
      await createPayment.mutateAsync({ tripId, method: selectedBank });
      setSuccess(true);
    } catch (err: any) {
      showAlert(t.payment.failed, err.message || 'Could not process payment');
    }
  };

  const selectedBankData = selectedBank && selectedBank !== 'cash' ? getBankById(selectedBank) : null;
  const isCashSelected = selectedBank === 'cash';

  return (
    <>
      <View style={{ marginTop: 16, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' }}>
        {/* Header */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          {t.payment.title}
        </Text>

        {/* Passenger & amount */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>{t.payment.passenger}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{fullName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>{t.payment.amount}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0CC25F' }}>{amount}</Text>
        </View>

        {/* Bank selector */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 }}>
          {t.payment.selectMethod}
        </Text>
        <BankSelector selectedBank={selectedBank} onSelect={handleSelectBank} />

        {/* Pay button */}
        <View style={{ marginTop: 4 }}>
          {createPayment.isPending ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 }}>
              <ActivityIndicator size="small" color="#0CC25F" />
              <Text style={{ marginLeft: 10, fontSize: 15, color: '#6b7280', fontWeight: '600' }}>
                {t.payment.processing}
              </Text>
            </View>
          ) : (
            <CustomButton
              title={isCashSelected ? t.payment.payWithCash : (selectedBankData ? `${t.payment.payWith} ${selectedBankData.shortName}` : t.payment.selectMethod)}
              onPress={handlePay}
              disabled={!selectedBank}
            />
          )}
        </View>
      </View>

      {/* Success modal */}
      <Modal visible={success} transparent animationType="fade" onRequestClose={() => setSuccess(false)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: 'white', borderRadius: 20, padding: 28, alignItems: 'center' }}>
            <Image source={images.check} style={{ width: 96, height: 96, marginBottom: 20 }} resizeMode="contain" />
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
              {t.payment.rideBooked}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>
              {t.payment.tripConfirmed}
            </Text>
            {isCashSelected ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: `${CASH_PAYMENT.bgColor}15`, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
                <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: CASH_PAYMENT.bgColor, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{CASH_PAYMENT.initials}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: CASH_PAYMENT.bgColor }}>
                  {t.payment.paidWithCash}
                </Text>
              </View>
            ) : selectedBankData && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: `${selectedBankData.bgColor}15`, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
                <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: selectedBankData.bgColor, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{selectedBankData.initials}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: selectedBankData.bgColor }}>
                  {t.payment.paidVia} {selectedBankData.name}
                </Text>
              </View>
            )}
            <CustomButton
              title={t.payment.backHome}
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
