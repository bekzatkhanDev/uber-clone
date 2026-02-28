// Оформление поездки: создаём заказ, показываем водителя и цену
import { useEffect, useState } from "react";
import { Image, Text, View, ActivityIndicator } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useCurrentUser } from "@/hooks/useUser";
import { useCreateTrip } from "@/hooks/useTrips";
import { useTranslation, useCurrency } from "@/i18n/I18nProvider";

interface TripResponse {
  id: string;
  status: string;
  distance_km?: number;
  price?: number;
  driver?: {
    id: number;
    phone: string;
    first_name: string;
  };
  car?: {
    id: number;
    brand: string;
    plate_number: string;
  };
}

const BookRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { data: currentUser } = useCurrentUser();
  const { userAddress, destinationAddress, selectedTariff, userLatitude, userLongitude, destinationLatitude, destinationLongitude } = useLocationStore();
  
  const [tripData, setTripData] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createTripMutation = useCreateTrip();

  useEffect(() => {
    const createTrip = async () => {
      if (!selectedTariff || !userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
        setError(t.bookRide.missingData);
        setIsLoading(false);
        return;
      }

      try {
        const response = await createTripMutation.mutateAsync({
          tariff_code: selectedTariff.code,
          start_lat: userLatitude,
          start_lng: userLongitude,
          end_lat: destinationLatitude,
          end_lng: destinationLongitude,
        });
        
        setTripData(response);
      } catch (err: any) {
        console.error("Failed to create trip:", err);
        setError(err.message || t.bookRide.failedToCreate);
      } finally {
        setIsLoading(false);
      }
    };

    createTrip();
  }, []);

  if (isLoading) {
    return (
      <RideLayout title={t.bookRide.title}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0CC25F" />
          <Text className="mt-4 text-lg font-JakartaMedium">
            {t.bookRide.findingDriver}
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            {t.bookRide.driverAssigned}
          </Text>
        </View>
      </RideLayout>
    );
  }

  if (error || !tripData) {
    return (
      <RideLayout title={t.bookRide.title}>
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-lg text-center">
            {error || t.bookRide.failedToCreate}
          </Text>
        </View>
      </RideLayout>
    );
  }

  const hasAssignedDriver = tripData.driver && tripData.status === "accepted";
  const price = tripData.price?.toString() || selectedTariff?.base_price || "0";

  return (
    <RideLayout title={t.bookRide.title}>
      <Text className="text-xl font-JakartaSemiBold mb-3">
        {t.bookRide.rideInformation}
      </Text>

      {hasAssignedDriver ? (
        <View className="flex flex-col w-full items-center justify-center mt-5">
          <View className="w-28 h-28 rounded-full bg-gray-200 justify-center items-center">
            <Image source={icons.person} className="w-16 h-16" />
          </View>

          <View className="flex flex-row items-center justify-center mt-5 space-x-2">
            <Text className="text-lg font-JakartaSemiBold">
              {tripData.driver?.first_name || t.confirmRide.driver}
            </Text>
          </View>

          {tripData.car && (
            <Text className="text-sm text-gray-500 mt-1">
              {tripData.car.brand} • {tripData.car.plate_number}
            </Text>
          )}
        </View>
      ) : (
        <View className="flex flex-col w-full items-center justify-center mt-5">
          <ActivityIndicator size="small" color="#0CC25F" />
          <Text className="text-lg font-JakartaSemiBold mt-3">
            {t.bookRide.waitingForDriver}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-5">
            {tripData.status === "requested" 
              ? t.bookRide.lookingForDrivers
              : t.bookRide.processing}
          </Text>
        </View>
      )}

      {/* Цена и статус */}
      <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
        <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
          <Text className="text-lg font-JakartaRegular">{t.bookRide.ridePrice}</Text>
          <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
            {symbol}{price}
          </Text>
        </View>

        <View className="flex flex-row items-center justify-between w-full py-3">
          <Text className="text-lg font-JakartaRegular">{t.bookRide.status}</Text>
          <Text className="text-lg font-JakartaMedium capitalize">
            {tripData.status === "accepted" ? t.bookRide.driverAssigned : t.bookRide.pending}
          </Text>
        </View>
      </View>

      {/* Адреса */}
      <View className="flex flex-col w-full items-start justify-center mt-5">
        <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
          <Image source={icons.to} className="w-6 h-6" />
          <Text className="text-lg font-JakartaRegular ml-2">
            {userAddress}
          </Text>
        </View>

        <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
          <Image source={icons.point} className="w-6 h-6" />
          <Text className="text-lg font-JakartaRegular ml-2">
            {destinationAddress}
          </Text>
        </View>
      </View>

      {/* Оплата — только когда водитель назначен */}
      {hasAssignedDriver && currentUser && (
        <Payment
          fullName={`${currentUser.first_name} ${currentUser.last_name}`}
          email="" 
          amount={price}
          driverId={tripData.driver!.id}
          rideTime={Date.now()}
        />
      )}
    </RideLayout>
  );
};

export default BookRide;
