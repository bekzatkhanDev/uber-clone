// components/Payment.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { ReactNativeModal } from 'react-native-modal';

import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import { useLocationStore } from '@/store';
import { PaymentProps } from '@/types/type';
import { usePaymentFlow } from '@/hooks/usePayment';
import { useCurrentUser } from '@/hooks/useUser'; // 
const Payment = ({
  fullName,
  email,
  amount, // e.g. "15.50" — не используется напрямую, цена берётся из trip
  driverId, // numeric user.id — не используется на этом этапе
  rideTime, // in minutes — не используется
}: PaymentProps) => {
  const { userAddress, userLongitude, userLatitude, destinationAddress, destinationLatitude, destinationLongitude } =
    useLocationStore();

  const { data: currentUser } = useCurrentUser(); // ← должен возвращать { id: number, ... }
  const userId = currentUser?.id;

  const [success, setSuccess] = useState<boolean>(false);

  const { execute, isPending } = usePaymentFlow(() => {
    setSuccess(true);
  });

  const handleConfirmRide = async () => {
    if (!userId) {
      Alert.alert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    if (
      userLatitude === null ||
      userLongitude === null ||
      destinationLatitude === null ||
      destinationLongitude === null
    ) {
      Alert.alert('Ошибка', 'Не указаны координаты');
      return;
    }

    await execute({
      start_lat: userLatitude,
      start_lng: userLongitude,
      end_lat: destinationLatitude,
      end_lng: destinationLongitude,
      tariff_code: "economy",
    });
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={handleConfirmRide}
        disabled={isPending}
      />

      <ReactNativeModal isVisible={success} onBackdropPress={() => setSuccess(false)}>
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>
          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully placed.
          </Text>
          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push('/(root)/(tabs)/home');
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;