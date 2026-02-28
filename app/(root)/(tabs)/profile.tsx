// Профиль: данные пользователя, язык, выход
import { router } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { icons, images } from "@/constants";
import { useLogout } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useUser";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { Language } from "@/i18n";

const Profile = () => {
  const { t, language, setLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { location } = useUserLocation();
  const { clearAuth } = useAuthStore();

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

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: insets.top, paddingBottom: insets.bottom }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text className="text-2xl font-JakartaBold mb-5">{t.profile.title}</Text>

      {/* Карточка пользователя */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <View className="flex flex-row items-center">
          <View className="w-20 h-20 rounded-full bg-gray-200 justify-center items-center">
            {currentUser?.profile_image_url ? (
              <Image 
                source={{ uri: currentUser.profile_image_url }} 
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <Text className="text-2xl font-JakartaBold">
                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
              </Text>
            )}
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-JakartaSemiBold">
              {currentUser?.first_name} {currentUser?.last_name}
            </Text>
            <Text className="text-gray-500 mt-1">
              {currentUser?.email}
            </Text>
            {currentUser?.phone_number && (
              <Text className="text-gray-500 mt-1">
                {currentUser.phone_number}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Текущее местоположение */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.currentLocation}</Text>
        <View className="flex flex-row items-center">
          <Image source={icons.point} className="w-5 h-5" />
          <Text className="ml-2 text-gray-600">
            {location?.address || t.common.loading}
          </Text>
        </View>
        {location && (
          <Text className="text-sm text-gray-400 mt-2">
            Lat: {location.latitude}, Lng: {location.longitude}
          </Text>
        )}
      </View>

      {/* Язык */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.language}</Text>
        
        <TouchableOpacity 
          className={`flex flex-row items-center py-3 border-b border-gray-100 ${language === 'ru' ? 'bg-gray-50' : ''}`}
          onPress={() => handleLanguageChange('ru')}
        >
          <Text className="ml-3 flex-1">Русский</Text>
          {language === 'ru' && (
            <Image source={icons.checkmark} className="w-5 h-5" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex flex-row items-center py-3 border-b border-gray-100 ${language === 'kk' ? 'bg-gray-50' : ''}`}
          onPress={() => handleLanguageChange('kk')}
        >
          <Text className="ml-3 flex-1">Қазақша</Text>
          {language === 'kk' && (
            <Image source={icons.checkmark} className="w-5 h-5" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex flex-row items-center py-3 ${language === 'en' ? 'bg-gray-50' : ''}`}
          onPress={() => handleLanguageChange('en')}
        >
          <Text className="ml-3 flex-1">English</Text>
          {language === 'en' && (
            <Image source={icons.checkmark} className="w-5 h-5" />
          )}
        </TouchableOpacity>
      </View>

      {/* Настройки аккаунта */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.account}</Text>
        
        <TouchableOpacity className="flex flex-row items-center py-3 border-b border-gray-100">
          <Image source={icons.person} className="w-5 h-5" />
          <Text className="ml-3 flex-1">{t.profile.editProfile}</Text>
          <Image source={icons.arrowUp} className="w-4 h-4 transform rotate-90" />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center py-3 border-b border-gray-100">
          <Image source={icons.phone} className="w-5 h-5" />
          <Text className="ml-3 flex-1">{t.profile.phoneNumbers}</Text>
          <Image source={icons.arrowUp} className="w-4 h-4 transform rotate-90" />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center py-3">
          <Image source={icons.list} className="w-5 h-5" />
          <Text className="ml-3 flex-1">{t.profile.rideHistory}</Text>
          <Image source={icons.arrowUp} className="w-4 h-4 transform rotate-90" />
        </TouchableOpacity>
      </View>

      {/* Оплаты */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.payments}</Text>
        
        <TouchableOpacity className="flex flex-row items-center py-3 border-b border-gray-100">
          <Image source={icons.dollar} className="w-5 h-5" />
          <Text className="ml-3 flex-1">{t.profile.paymentMethods}</Text>
          <Image source={icons.arrowUp} className="w-4 h-4 transform rotate-90" />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center py-3">
          <Image source={icons.pin} className="w-5 h-5" />
          <Text className="ml-3 flex-1">{t.profile.savedPlaces}</Text>
          <Image source={icons.arrowUp} className="w-4 h-4 transform rotate-90" />
        </TouchableOpacity>
      </View>

      {/* Выход */}
      <TouchableOpacity 
        onPress={handleSignOut}
        className="bg-red-500 rounded-xl p-5 items-center"
      >
        <Text className="text-white font-JakartaSemiBold">{t.profile.signOut}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;
