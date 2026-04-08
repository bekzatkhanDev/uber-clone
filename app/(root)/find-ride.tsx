import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View, FlatList } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useTariffs } from "@/hooks/useTariffs";
import { useBulkTariffEstimate, BulkTariffEstimate } from "@/hooks/useBulkTariffEstimate";
import { Tariff } from "@/types/type";
import { useTranslation, useCurrency } from "@/i18n/I18nProvider";

interface TariffWithEstimate extends Tariff {
  estimated_price?: number;
}

const FindRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const [showTariffModal, setShowTariffModal] = useState(false);
  
  const {
    userAddress,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    selectedTariff,
    estimate,
    setDestinationLocation,
    setUserLocation,
    setSelectedTariff,
    setEstimate,
  } = useLocationStore();

  const { data: tariffs, isLoading: isLoadingTariffs } = useTariffs();
  
  const { data: bulkEstimates, isLoading: isLoadingBulkEstimates } = useBulkTariffEstimate(
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude
  );

  useEffect(() => {
    if (bulkEstimates && selectedTariff && bulkEstimates.estimates.length > 0) {
      const selectedEstimate = bulkEstimates.estimates.find(
        e => e.tariff_id === selectedTariff.id
      );
      if (selectedEstimate) {
        setEstimate({
          distance_km: bulkEstimates.distance_km,
          duration_min: bulkEstimates.duration_min,
          price: selectedEstimate.estimated_price,
          is_estimate: bulkEstimates.is_estimate,
        });
      }
    }
  }, [bulkEstimates, selectedTariff]);

  const handleSelectTariff = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    
    if (bulkEstimates) {
      const selectedEstimate = bulkEstimates.estimates.find(
        e => e.tariff_id === tariff.id
      );
      if (selectedEstimate) {
        setEstimate({
          distance_km: bulkEstimates.distance_km,
          duration_min: bulkEstimates.duration_min,
          price: selectedEstimate.estimated_price,
          is_estimate: bulkEstimates.is_estimate,
        });
      }
    }
    
    setShowTariffModal(false);
  };

  const hasLocationForEstimates = userLatitude && userLongitude && 
                                   destinationLatitude && destinationLongitude;

  const canFindRide = userAddress && destinationAddress && selectedTariff && estimate;
  const isCalculatingPrice = isLoadingBulkEstimates;

  const handleFindRide = () => {
    if (canFindRide) {
      router.push(`/(root)/confirm-ride`);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${symbol}${numPrice.toFixed(2)}`;
  };

  const tariffsWithEstimates: TariffWithEstimate[] = tariffs?.map(tariff => {
    if (bulkEstimates) {
      const estimateData = bulkEstimates.estimates.find(e => e.tariff_id === tariff.id);
      return {
        ...tariff,
        estimated_price: estimateData?.estimated_price,
      };
    }
    return tariff;
  }) || [];

  const renderTariffItem = ({ item }: { item: TariffWithEstimate }) => {
    const hasEstimate = item.estimated_price !== undefined;
    const isSelected = selectedTariff?.id === item.id;
    
    return (
      <TouchableOpacity
        className={`p-4 mb-3 rounded-xl border-2 ${
          isSelected 
            ? "border-[#0CC25F] bg-[#0CC25F]/10" 
            : "border-gray-200 bg-white"
        }`}
        onPress={() => handleSelectTariff(item)}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-JakartaSemiBold capitalize">{item.code}</Text>
            {hasLocationForEstimates && hasEstimate ? (
              <Text className="text-sm text-gray-500">
                {t.findRide.distance}: {item.estimated_price ? 
                  `${(bulkEstimates?.distance_km || 0).toFixed(1)} km` : '-'}
              </Text>
            ) : (
              <Text className="text-sm text-gray-500">
                {t.findRide.starting}: {formatPrice(item.base_price)}
              </Text>
            )}
          </View>
          <View className="flex items-end">
            {hasLocationForEstimates && hasEstimate ? (
              <Text className="text-xl font-JakartaBold text-[#0CC25F]">
                {formatPrice(item.estimated_price!)}
              </Text>
            ) : (
              <>
                <Text className="text-lg font-JakartaBold text-[#0CC25F]">
                  {formatPrice(item.base_price)}
                </Text>
                <Text className="text-xs text-gray-400">{t.findRide.starting}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const locationInputs = (
    <>
      <View className="my-2">
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-white shadow-lg"
          textInputBackgroundColor="white"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="my-2">
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-white shadow-lg"
          textInputBackgroundColor="white"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>
    </>
  );

  return (
    <RideLayout 
      title={t.findRide.selectTariff}
      showLocationInputs={true}
      locationInputs={locationInputs}
    >
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.findRide.from}</Text>
        <Text className="text-gray-500">{userAddress || "Not set"}</Text>
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.findRide.to}</Text>
        <Text className="text-gray-500">{destinationAddress || "Not set"}</Text>
      </View>

      {/* Кнопка выбора тарифа */}
      <TouchableOpacity
        className={`mt-5 p-4 rounded-xl border-2 ${
          selectedTariff ? "border-[#0CC25F] bg-[#0CC25F]/10" : "border-gray-200 bg-white"
        }`}
        onPress={() => setShowTariffModal(true)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image source={icons.dollar} className="w-5 h-5 mr-2" />
            <Text className="text-lg font-JakartaMedium">
              {selectedTariff ? (
                <Text className="capitalize">{selectedTariff.code}</Text>
              ) : (
                t.findRide.selectTariff
              )}
            </Text>
          </View>
          <Image source={icons.arrowDown} style={{ width: 20, height: 20 }} resizeMode="contain" />
        </View>
        {selectedTariff && bulkEstimates && (
          <Text className="text-sm text-gray-500 mt-1">
            {hasLocationForEstimates 
              ? formatPrice(bulkEstimates.estimates.find(e => e.tariff_id === selectedTariff.id)?.estimated_price || selectedTariff.base_price)
              : `${t.findRide.starting} ${formatPrice(selectedTariff.base_price)}`
            }
          </Text>
        )}
      </TouchableOpacity>

      <CustomButton
        title={t.findRide.findNow}
        onPress={handleFindRide}
        className="mt-5"
        disabled={!canFindRide}
      />

      {/* Модалка выбора тарифа */}
      <Modal
        visible={showTariffModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTariffModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-JakartaSemiBold">{t.findRide.selectTariff}</Text>
              <TouchableOpacity onPress={() => setShowTariffModal(false)}>
                <Image source={icons.close} style={{ width: 24, height: 24 }} resizeMode="contain" />
              </TouchableOpacity>
            </View>

            {isLoadingTariffs ? (
              <Text className="text-center text-gray-500">{t.findRide.loadingTariffs}</Text>
            ) : (
              <FlatList
                data={tariffsWithEstimates}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTariffItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </RideLayout>
  );
};

export default FindRide;
