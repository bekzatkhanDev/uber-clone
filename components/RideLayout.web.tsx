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
  snapPoints?: string[]; // ignored on web, kept for native API compat
}

const RideLayout = ({ title, children, showLocationInputs, locationInputs }: RideLayoutProps) => {
  const { clearDestination } = useLocationStore();

  const handleBack = () => {
    clearDestination();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Map — fixed height, never shrinks */}
      <View style={{ height: "40vh" as any, position: "relative", flexShrink: 0 }}>
        <View style={{ position: "absolute", zIndex: 10, top: 24, left: 20, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={{ width: 40, height: 40, backgroundColor: "white", borderRadius: 20, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 }}>
              <Image source={icons.backArrow} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontFamily: "Jakarta-SemiBold", color: "white", marginLeft: 12, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
            {title || "Go Back"}
          </Text>
        </View>

        {showLocationInputs && locationInputs && (
          <View style={{ position: "absolute", zIndex: 30, top: 80, left: 20, right: 20 }}>
            {locationInputs}
          </View>
        )}

        <Map />
      </View>

      {/* Content panel — fills remaining space, scrollable */}
      <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -16, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 8, overflow: "hidden" }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          style={{ flex: 1 }}
        >
          <View style={{ width: "100%", maxWidth: 680, alignSelf: "center" }}>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default RideLayout;
