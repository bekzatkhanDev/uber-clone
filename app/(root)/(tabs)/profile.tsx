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
import { useTheme } from "@/hooks/useTheme";

const Profile = () => {
  const { t, language, setLanguage } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { location } = useUserLocation();
  const { clearAuth } = useAuthStore();
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useLocationStore();
  const [paymentExpanded, setPaymentExpanded] = useState(false);

  const bg = isDark ? '#0f172a' : '#f5f5f5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#f3f4f6';
  const rowHoverBg = isDark ? '#0f172a' : '#f9fafb';

  const handleSignOut = () => {
    if (isLoggingOut) return;
    logout(undefined, {
      onSuccess: async () => { await clearAuth(); router.replace("/(auth)/welcome"); },
      onError: async () => { await clearAuth(); router.replace("/(auth)/welcome"); },
    });
  };

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color={isDark ? '#818cf8' : '#000'} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 20 }}>
        {t.profile.title}
      </Text>

      {/* User card */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#334155' : '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
            {currentUser?.profile_image_url ? (
              <Image source={{ uri: currentUser.profile_image_url }} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary }}>
                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
              </Text>
            )}
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Jakarta-SemiBold', color: textPrimary }}>
              {currentUser?.first_name} {currentUser?.last_name}
            </Text>
            <Text style={{ color: textSecondary, marginTop: 4 }}>{currentUser?.email}</Text>
            {currentUser?.phone_number && (
              <Text style={{ color: textSecondary, marginTop: 2 }}>{currentUser.phone_number}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Current location */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>
          {t.profile.currentLocation}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={icons.point} style={{ width: 20, height: 20, tintColor: isDark ? '#818cf8' : undefined }} resizeMode="contain" />
          <Text style={{ marginLeft: 8, color: textSecondary }}>
            {location?.address || t.common.loading}
          </Text>
        </View>
        {location && (
          <Text style={{ fontSize: 12, color: isDark ? '#475569' : '#9ca3af', marginTop: 8 }}>
            Lat: {location.latitude}, Lng: {location.longitude}
          </Text>
        )}
      </View>

      {/* Appearance */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>
          Appearance
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={{ color: textSecondary }}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </Text>
          </View>
          <ThemeToggle variant="button" size="medium" />
        </View>
      </View>

      {/* Language */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>
          {t.profile.language}
        </Text>
        {(['ru', 'kk', 'en'] as Language[]).map((lang, idx, arr) => (
          <TouchableOpacity
            key={lang}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
              borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
              borderBottomColor: borderColor,
              backgroundColor: language === lang ? rowHoverBg : 'transparent',
              borderRadius: 8, paddingHorizontal: 4,
            }}
            onPress={() => setLanguage(lang)}
          >
            <Text style={{ flex: 1, color: textPrimary }}>
              {lang === 'ru' ? 'Русский' : lang === 'kk' ? 'Қазақша' : 'English'}
            </Text>
            {language === lang && (
              <Text style={{ color: '#0CC25F', fontSize: 18 }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Account */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>
          {t.profile.account}
        </Text>
        {[
          { icon: icons.person, label: t.profile.editProfile, onPress: () => router.push('/profile/edit') },
          { icon: icons.phone, label: t.profile.phoneNumbers, onPress: () => {} },
          { icon: icons.list, label: t.profile.rideHistory, onPress: () => {} },
        ].map(({ icon, label, onPress }, idx, arr) => (
          <TouchableOpacity
            key={label}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
              borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
              borderBottomColor: borderColor,
            }}
            onPress={onPress}
          >
            <Image source={icon} style={{ width: 20, height: 20, tintColor: isDark ? '#94a3b8' : undefined }} resizeMode="contain" />
            <Text style={{ marginLeft: 12, flex: 1, color: textPrimary }}>{label}</Text>
            <Text style={{ color: isDark ? '#475569' : '#9ca3af', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payments */}
      <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 17, fontFamily: 'Jakarta-SemiBold', color: textPrimary, marginBottom: 12 }}>
          {t.profile.payments}
        </Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}
          onPress={() => setPaymentExpanded((v) => !v)}
        >
          <Image source={icons.dollar} style={{ width: 20, height: 20, tintColor: isDark ? '#94a3b8' : undefined }} resizeMode="contain" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, color: textPrimary }}>{t.profile.paymentMethods}</Text>
            {selectedPaymentMethod && !paymentExpanded && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: getBankById(selectedPaymentMethod as BankId)?.bgColor ?? '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>
                    {getBankById(selectedPaymentMethod as BankId)?.initials}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: textSecondary }}>
                  {getBankById(selectedPaymentMethod as BankId)?.name}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 16, color: textSecondary, transform: [{ rotate: paymentExpanded ? '-90deg' : '90deg' }] }}>›</Text>
        </TouchableOpacity>
        {paymentExpanded && (
          <View style={{ paddingTop: 14, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, color: textSecondary, marginBottom: 10, fontWeight: '600' }}>
              {t.profile.defaultPaymentBank}
            </Text>
            <BankSelector
              selectedBank={selectedPaymentMethod as BankId | null}
              onSelect={(id) => { setSelectedPaymentMethod(id); setPaymentExpanded(false); }}
              compact
            />
          </View>
        )}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
          <Image source={icons.pin} style={{ width: 20, height: 20, tintColor: isDark ? '#94a3b8' : undefined }} resizeMode="contain" />
          <Text style={{ marginLeft: 12, flex: 1, color: textPrimary }}>{t.profile.savedPlaces}</Text>
          <Text style={{ color: isDark ? '#475569' : '#9ca3af', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Driver mode switch */}
      {currentUser?.roles?.includes('driver') && (
        <TouchableOpacity
          onPress={() => router.replace('/(driver)/(tabs)/home')}
          style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: 'white', fontFamily: 'Jakarta-SemiBold' }}>{t.profile.switchToDriverMode}</Text>
        </TouchableOpacity>
      )}

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{ backgroundColor: '#ef4444', borderRadius: 12, padding: 20, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontFamily: 'Jakarta-SemiBold' }}>{t.profile.signOut}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;
