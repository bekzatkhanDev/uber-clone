// Главная: карта, поиск назначения, выход
// Disable static rendering for pages using react-leaflet
export const dynamic = 'force-dynamic';

import { router } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useLogout } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useUser";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/hooks/useTheme";

const Home = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { setDestinationLocation, clearDestination } = useLocationStore();
  const { clearAuth } = useAuthStore();
  
  const { location, isLoading: locationLoading } = useUserLocation();

  useEffect(() => {
    clearDestination();
  }, []);

  const handleSignOut = () => {
    if (isLoggingOut) return;
    
    logout(undefined, {
      onSuccess: async () => {
        await clearAuth();
        router.replace("/(auth)/welcome");
      },
      onError: async () => {
        await clearAuth();
        router.replace("/(auth)/welcome");
      },
    });
  };

  const handleDestinationPress = (loc: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(loc);
    router.push("/(root)/find-ride");
  };

  if (userLoading || locationLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0f172a' : '#f5f5f5', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#000'} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f5f5f5' }}>
      {/* Карта на весь экран */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Map />
      </View>

      {/* Шапка: приветствие и кнопка выхода */}
      <View 
        className="absolute top-0 left-0 right-0 px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-JakartaExtraBold text-white drop-shadow-lg">
              {t.home.welcome} {currentUser?.first_name}👋
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher variant="light" />
            <TouchableOpacity
              onPress={handleSignOut}
              className="justify-center items-center w-10 h-10 rounded-full bg-white shadow-md"
            >
              <Image source={icons.out} style={{ width: 16, height: 16 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Поле поиска назначения */}
      <View 
        className="absolute left-5 right-5"
        style={{ top: insets.top + 70 }}
      >
      <GoogleTextInput
          icon={icons.search}
          containerStyle="bg-white shadow-md shadow-neutral-300"
          handlePress={handleDestinationPress}
        />
      </View>
    </View>
  );
};

export default Home;
