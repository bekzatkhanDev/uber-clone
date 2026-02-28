import { router } from "expo-router";
import { ActivityIndicator, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore, useDriverStore } from "@/store";
import { useTranslation, useCurrency } from "@/i18n/I18nProvider";

const ConfirmRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { userAddress, destinationAddress, selectedTariff, estimate } = useLocationStore();
  const { drivers } = useDriverStore();

  const estimatedTime = estimate?.duration_min || 0;
  const estimatedDistance = estimate?.distance_km || 0;
  const estimatedPrice = estimate?.price || 0;

  const formatPrice = (price: number) => {
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (min: number) => {
    return `${Math.round(min)} min`;
  };

  const isCalculating = !estimate;

  return (
    <RideLayout title={t.confirmRide.confirmRide} snapPoints={["60%"]}>
      <View className="flex flex-col w-full px-5">
        <Text className="text-xl font-JakartaSemiBold mb-4">{t.confirmRide.rideSummary}</Text>

        {/* Откуда */}
        <View className="flex flex-row items-center border-b border-gray-200 py-3">
          <Image source={icons.point} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.pickup}</Text>
            <Text className="text-lg font-JakartaMedium">{userAddress || t.confirmRide.notSet}</Text>
          </View>
        </View>

        {/* Куда */}
        <View className="flex flex-row items-center border-b border-gray-200 py-3">
          <Image source={icons.to} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.destination}</Text>
            <Text className="text-lg font-JakartaMedium">{destinationAddress || t.confirmRide.notSet}</Text>
          </View>
        </View>

        {/* Тариф */}
        <View className="flex flex-row items-center border-b border-gray-200 py-3">
          <Image source={icons.dollar} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.tariff}</Text>
            <Text className="text-lg font-JakartaMedium capitalize">
              {selectedTariff?.code || t.confirmRide.notSelected}
            </Text>
          </View>
          <Text className="text-lg font-JakartaBold text-[#0CC25F]">
            {formatPrice(selectedTariff?.base_price ? parseFloat(selectedTariff.base_price) : 0)}
          </Text>
        </View>

        {/* Расстояние и время */}
        <View className="flex flex-row items-center border-b border-gray-200 py-3">
          <Image source={icons.point} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.distance}</Text>
            {isCalculating ? (
              <ActivityIndicator size="small" color="#0CC25F" />
            ) : (
              <Text className="text-lg font-JakartaMedium">
                {formatDistance(estimatedDistance)}
              </Text>
            )}
          </View>
          <View className="flex items-end">
            <Text className="text-sm text-gray-500">{t.confirmRide.duration}</Text>
            {isCalculating ? (
              <ActivityIndicator size="small" color="#0CC25F" />
            ) : (
              <Text className="text-lg font-JakartaMedium">
                {formatTime(estimatedTime)}
              </Text>
            )}
          </View>
        </View>

        {/* Цена */}
        <View className="flex flex-row items-center py-3 mt-2">
          <Image source={icons.dollar} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.estimatedPrice}</Text>
            {isCalculating ? (
              <ActivityIndicator size="small" color="#0CC25F" />
            ) : (
              <Text className="text-2xl font-JakartaBold text-[#0CC25F]">
                {formatPrice(estimatedPrice)}
              </Text>
            )}
          </View>
        </View>

        {/* Предупреждение про примерную цену */}
        {estimate?.is_estimate && (
          <View className="bg-yellow-50 p-3 rounded-lg mt-2">
            <Text className="text-sm text-yellow-600">
              ⚠️ {t.confirmRide.priceEstimate}
            </Text>
          </View>
        )}

        {/* Водитель (назначится после подтверждения) */}
        <View className="flex flex-row items-center py-3 mt-2">
          <Image source={icons.person} className="w-5 h-5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{t.confirmRide.driver}</Text>
            <Text className="text-lg font-JakartaMedium">
              {t.confirmRide.willBeAssigned}
            </Text>
          </View>
        </View>

        {/* Подсказка */}
        <View className="bg-blue-50 p-3 rounded-lg mt-4">
          <Text className="text-sm text-blue-600">
            ℹ️ {t.confirmRide.driverAssigned}
          </Text>
        </View>

        {/* Кнопка подтверждения */}
        <View className="mt-6">
          <CustomButton
            title={t.confirmRide.confirmRide}
            onPress={() => router.push("/(root)/book-ride")}
            disabled={isCalculating}
          />
        </View>
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
