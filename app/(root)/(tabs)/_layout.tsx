import { Tabs } from "expo-router";
import React from "react";
import { ImageSourcePropType, Platform, View } from "react-native";

import TintedImage from "@/components/TintedImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { icons } from "@/constants";
import { useTranslation } from "@/i18n/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className={`flex flex-col items-center justify-center rounded-full ${focused ? "bg-general-300" : ""}`}>
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-general-400" : ""}`}
    >
      <TintedImage source={source} tintColor="white" size={24} resizeMode="contain" />
    </View>
  </View>
);

const webTabBarStyle = {
  backgroundColor: "#333333",
  height: 70,
  borderTopWidth: 0,
  paddingBottom: 0,
  paddingTop: 0,
};

const nativeTabBarStyle = {
  backgroundColor: "#333333",
  borderRadius: 50,
  paddingBottom: 0,
  overflow: "hidden" as const,
  marginHorizontal: 20,
  marginBottom: 20,
  height: 78,
  display: "flex" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  flexDirection: "row" as const,
  position: "absolute" as const,
};

export default function TabLayout() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: isWeb,
        tabBarLabelStyle: isWeb
          ? { fontSize: 11, marginTop: 2, color: "white" }
          : undefined,
        tabBarStyle: isWeb ? webTabBarStyle : nativeTabBarStyle,
        headerShown: true,
        headerTransparent: false,
        headerTitle: '',
        headerStyle: { backgroundColor: isDark ? '#0f172a' : '#ffffff', shadowOpacity: 0, elevation: 0 },
        headerRight: () => <LanguageSwitcher variant={isDark ? 'light' : 'dark'} />,
        headerLeft: () => null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabs.home,
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: t.tabs.rides,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.list} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t.tabs.chat,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.chat} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ focused }) => <TabIcon source={icons.profile} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
