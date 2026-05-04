// Disable static rendering for pages using react-leaflet
export const dynamic = 'force-dynamic';

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
import { useTheme } from "@/hooks/useTheme";

interface TariffWithEstimate extends Tariff {
  estimated_price?: number;
}

const FindRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { isDark } = useTheme();
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e5e7eb';
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
        style={{
          padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 2,
          borderColor: isSelected ? '#0CC25F' : cardBorder,
          backgroundColor: isSelected ? 'rgba(12,194,95,0.1)' : cardBg,
        }}
        onPress={() => handleSelectTariff(item)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', textTransform: 'capitalize', color: textPrimary }}>{item.code}</Text>
            {hasLocationForEstimates && hasEstimate ? (
              <Text style={{ fontSize: 13, color: textSecondary }}>
                {t.findRide.distance}: {item.estimated_price ? `${(bulkEstimates?.distance_km || 0).toFixed(1)} km` : '-'}
              </Text>
            ) : (
              <Text style={{ fontSize: 13, color: textSecondary }}>
                {t.findRide.starting}: {formatPrice(item.base_price)}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {hasLocationForEstimates && hasEstimate ? (
              <Text style={{ fontSize: 20, fontFamily: 'Jakarta-Bold', color: '#0CC25F' }}>
                {formatPrice(item.estimated_price!)}
              </Text>
            ) : (
              <>
                <Text style={{ fontSize: 17, fontFamily: 'Jakarta-Bold', color: '#0CC25F' }}>
                  {formatPrice(item.base_price)}
                </Text>
                <Text style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>{t.findRide.starting}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const inputBg = isDark ? '#1e293b' : 'white';

  const locationInputs = (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 8 }}>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle={isDark ? "bg-[#1e293b] shadow-lg" : "bg-white shadow-lg"}
          textInputBackgroundColor={inputBg}
          handlePress={(location) => setUserLocation(location)}
        />
      </View>
      <View style={{ marginBottom: 8 }}>
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle={isDark ? "bg-[#1e293b] shadow-lg" : "bg-white shadow-lg"}
          textInputBackgroundColor={inputBg}
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>
    </View>
  );

  return (
    <RideLayout title={t.findRide.selectTariff} showLocationInputs={true} locationInputs={locationInputs}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 6 }}>{t.findRide.from}</Text>
        <Text style={{ color: textSecondary }}>{userAddress || "Not set"}</Text>
      </View>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 6 }}>{t.findRide.to}</Text>
        <Text style={{ color: textSecondary }}>{destinationAddress || "Not set"}</Text>
      </View>

      {/* Tariff selector button */}
      <TouchableOpacity
        style={{
          marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 2,
          borderColor: selectedTariff ? '#0CC25F' : cardBorder,
          backgroundColor: selectedTariff ? 'rgba(12,194,95,0.1)' : cardBg,
        }}
        onPress={() => setShowTariffModal(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={icons.dollar} style={{ width: 20, height: 20, tintColor: isDark ? '#94a3b8' : undefined, marginRight: 8 }} resizeMode="contain" />
            <Text style={{ fontSize: 17, fontFamily: 'Jakarta-Medium', color: textPrimary, textTransform: selectedTariff ? 'capitalize' : 'none' }}>
              {selectedTariff ? selectedTariff.code : t.findRide.selectTariff}
            </Text>
          </View>
          <Image source={icons.arrowDown} style={{ width: 20, height: 20, tintColor: isDark ? '#94a3b8' : undefined }} resizeMode="contain" />
        </View>
        {selectedTariff && bulkEstimates && (
          <Text style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>
            {hasLocationForEstimates
              ? formatPrice(bulkEstimates.estimates.find(e => e.tariff_id === selectedTariff.id)?.estimated_price || selectedTariff.base_price)
              : `${t.findRide.starting} ${formatPrice(selectedTariff.base_price)}`}
          </Text>
        )}
      </TouchableOpacity>

      <CustomButton title={t.findRide.findNow} onPress={handleFindRide} className="mt-5" disabled={!canFindRide} />

      {/* Tariff picker modal */}
      <Modal visible={showTariffModal} animationType="slide" transparent onRequestClose={() => setShowTariffModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: isDark ? '#1e293b' : 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Jakarta-SemiBold', color: textPrimary }}>{t.findRide.selectTariff}</Text>
              <TouchableOpacity onPress={() => setShowTariffModal(false)}>
                <Image source={icons.close} style={{ width: 24, height: 24, tintColor: isDark ? '#94a3b8' : undefined }} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            {isLoadingTariffs ? (
              <Text style={{ textAlign: 'center', color: textSecondary }}>{t.findRide.loadingTariffs}</Text>
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
