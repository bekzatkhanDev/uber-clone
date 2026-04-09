// Web-safe RideLayout (no gorhom bottom-sheet / gesture-handler)
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import Map from "@/components/Map";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

interface RideLayoutProps {
  title: string;
  children: React.ReactNode;
  showLocationInputs?: boolean;
  locationInputs?: React.ReactNode;
}

const RideLayout = ({ title, children, showLocationInputs, locationInputs }: RideLayoutProps) => {
  const { clearDestination } = useLocationStore();

  const handleBack = () => {
    clearDestination();
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Map area */}
      <View className="relative flex-1 min-h-[45vh]">
        <View className="absolute z-10 top-6 left-5 flex flex-row items-center">
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow">
              <Image source={icons.backArrow} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-JakartaSemiBold text-white ml-4">
            {title || "Go Back"}
          </Text>
        </View>

        {showLocationInputs && locationInputs && (
          <View className="absolute z-30 top-20 left-5 right-5 pointer-events-none">{locationInputs}</View>
        )}

        <Map />
      </View>

      {/* Content (mobile-first, centered on wide screens) */}
      <View className="bg-white border-t border-gray-100">
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-2xl self-center pointer-events-auto">{children}</View>
        </ScrollView>
      </View>
    </View>
  );
};

export default RideLayout;

