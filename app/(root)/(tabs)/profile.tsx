// Профиль: данные пользователя, язык, выход
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useLocationStore } from "@/store";
import { useTranslation } from "@/i18n/I18nProvider";
import { Language } from "@/i18n";
import BankSelector, { BankId, getBankById } from "@/components/BankSelector";
import ThemeToggle from "@/components/ThemeToggle";

const Profile = () => {
  const { t, language, setLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { location } = useUserLocation();
  const { clearAuth } = useAuthStore();
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useLocationStore();
  const [paymentExpanded, setPaymentExpanded] = useState(false);

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
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
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
          <Image source={icons.point} style={{ width: 20, height: 20 }} resizeMode="contain" />
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
            <Image source={icons.checkmark} style={{ width: 20, height: 20 }} resizeMode="contain" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex flex-row items-center py-3 border-b border-gray-100 ${language === 'kk' ? 'bg-gray-50' : ''}`}
          onPress={() => handleLanguageChange('kk')}
        >
          <Text className="ml-3 flex-1">Қазақша</Text>
          {language === 'kk' && (
            <Image source={icons.checkmark} style={{ width: 20, height: 20 }} resizeMode="contain" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex flex-row items-center py-3 ${language === 'en' ? 'bg-gray-50' : ''}`}
          onPress={() => handleLanguageChange('en')}
        >
          <Text className="ml-3 flex-1">English</Text>
          {language === 'en' && (
            <Image source={icons.checkmark} style={{ width: 20, height: 20 }} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </View>

      {/* Theme Toggle */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">Appearance</Text>
        <View className="flex flex-row items-center justify-between">
          <Text className="text-gray-600">Toggle dark/light mode</Text>
          <ThemeToggle variant="button" size="medium" />
        </View>
      </View>

      {/* Настройки аккаунта */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.account}</Text>
        
        <TouchableOpacity 
          className="flex flex-row items-center py-3 border-b border-gray-100"
          onPress={() => router.push('/profile/edit')}
        >
          <Image source={icons.person} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <Text className="ml-3 flex-1">{t.profile.editProfile}</Text>
          <Image source={icons.arrowUp} style={{ width: 16, height: 16, transform: [{ rotate: '90deg' }] }} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center py-3 border-b border-gray-100">
          <Image source={icons.phone} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <Text className="ml-3 flex-1">{t.profile.phoneNumbers}</Text>
          <Image source={icons.arrowUp} style={{ width: 16, height: 16, transform: [{ rotate: '90deg' }] }} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity className="flex flex-row items-center py-3">
          <Image source={icons.list} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <Text className="ml-3 flex-1">{t.profile.rideHistory}</Text>
          <Image source={icons.arrowUp} style={{ width: 16, height: 16, transform: [{ rotate: '90deg' }] }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Оплаты */}
      <View className="bg-white rounded-xl p-5 mb-5">
        <Text className="text-lg font-JakartaSemiBold mb-3">{t.profile.payments}</Text>

        {/* Payment Methods — expandable bank selector */}
        <TouchableOpacity
          className="flex flex-row items-center py-3 border-b border-gray-100"
          onPress={() => setPaymentExpanded((v) => !v)}
        >
          <Image source={icons.dollar} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, color: '#111827' }}>{t.profile.paymentMethods}</Text>
            {selectedPaymentMethod && !paymentExpanded && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <View style={{
                  width: 14, height: 14, borderRadius: 3,
                  backgroundColor: getBankById(selectedPaymentMethod as BankId)?.bgColor ?? '#e5e7eb',
                  alignItems: 'center', justifyContent: 'center', marginRight: 5,
                }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>
                    {getBankById(selectedPaymentMethod as BankId)?.initials}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {getBankById(selectedPaymentMethod as BankId)?.name}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 16, color: '#9ca3af', transform: [{ rotate: paymentExpanded ? '-90deg' : '90deg' }] }}>›</Text>
        </TouchableOpacity>

        {paymentExpanded && (
          <View style={{ paddingTop: 14, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: '600' }}>
              {t.profile.defaultPaymentBank}
            </Text>
            <BankSelector
              selectedBank={selectedPaymentMethod as BankId | null}
              onSelect={(id) => {
                setSelectedPaymentMethod(id);
                setPaymentExpanded(false);
              }}
              compact
            />
          </View>
        )}

        <TouchableOpacity className="flex flex-row items-center py-3">
          <Image source={icons.pin} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <Text className="ml-3 flex-1">{t.profile.savedPlaces}</Text>
          <Image source={icons.arrowUp} style={{ width: 16, height: 16, transform: [{ rotate: '90deg' }] }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Driver mode switch */}
      {currentUser?.roles?.includes('driver') && (
        <TouchableOpacity
          onPress={() => router.replace('/(driver)/(tabs)/home')}
          className="bg-[#1a1a2e] rounded-xl p-5 items-center mb-3"
        >
          <Text className="text-white font-JakartaSemiBold">{t.profile.switchToDriverMode}</Text>
        </TouchableOpacity>
      )}

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
