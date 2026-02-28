// Обёртка экрана с картой и полями откуда/куда
import BottomSheet, {
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

interface RideLayoutProps {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
  showLocationInputs?: boolean;
  locationInputs?: React.ReactNode;
}

const RideLayout = ({ title, snapPoints, children, showLocationInputs, locationInputs }: RideLayoutProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { clearDestination } = useLocationStore();

  const handleBack = () => {
    // При возврате сбрасываем точку назначения, чтобы убрать маршрут с карты
    clearDestination();
    router.back();
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        {/* Шапка и карта */}
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="absolute z-10 top-16 left-5 flex flex-row items-center">
            <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold text-white ml-4">
              {title || "Go Back"}
            </Text>
          </View>

          {/* Поля адресов над нижней панелью */}
          {showLocationInputs && locationInputs && (
            <View className="absolute z-20 top-28 left-5 right-5">
              {locationInputs}
            </View>
          )}

          <Map />
        </View>

        {/* Нижняя панель */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["40%", "85%"]}
          index={0}
          handleComponent={null} // optional: cleaner look
        >
          <BottomSheetView style={{ flex: 1, padding: 20 }}>
            {children}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
