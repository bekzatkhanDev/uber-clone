import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants";
import { useTranslation } from "@/i18n/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

const RoleSelect = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const bg = isDark ? '#0f172a' : '#ffffff';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#000000';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#e5e7eb';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'relative', width: '100%', height: 250 }}>
          <Image source={images.signUpCar} style={{ width: '100%', height: 250 }} />
          <Text style={{ fontSize: 22, color: '#ffffff', fontFamily: 'Jakarta-SemiBold', position: 'absolute', bottom: 20, left: 20 }}>
            {t.auth.chooseRole}
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 15, color: textSecondary, fontFamily: 'Jakarta', textAlign: 'center', marginBottom: 32 }}>
            {t.auth.chooseRoleSubtitle}
          </Text>

          {/* Rider card */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            activeOpacity={0.85}
            style={{
              backgroundColor: cardBg, borderWidth: 1, borderColor,
              borderRadius: 16, padding: 20, marginBottom: 16,
              flexDirection: 'row', alignItems: 'center',
              shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? '#1e3a5f' : '#F5F8FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ fontSize: 28 }}>🧑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 19, fontFamily: 'Jakarta-Bold', color: textPrimary }}>{t.auth.iAmRider}</Text>
              <Text style={{ fontSize: 13, color: textSecondary, fontFamily: 'Jakarta', marginTop: 2 }}>{t.auth.riderDescription}</Text>
            </View>
            <Text style={{ color: '#0286FF', fontSize: 24, marginLeft: 8 }}>›</Text>
          </TouchableOpacity>

          {/* Driver card */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/driver-register")}
            activeOpacity={0.85}
            style={{
              backgroundColor: cardBg, borderWidth: 1, borderColor,
              borderRadius: 16, padding: 20,
              flexDirection: 'row', alignItems: 'center',
              shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? '#431407' : '#fff7ed', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ fontSize: 28 }}>🚗</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 19, fontFamily: 'Jakarta-Bold', color: textPrimary }}>{t.auth.iAmDriver}</Text>
              <Text style={{ fontSize: 13, color: textSecondary, fontFamily: 'Jakarta', marginTop: 2 }}>{t.auth.driverDescription}</Text>
            </View>
            <Text style={{ color: '#0286FF', fontSize: 24, marginLeft: 8 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")} style={{ marginTop: 40 }}>
            <Text style={{ fontSize: 17, color: textSecondary, textAlign: 'center' }}>
              {t.auth.alreadyHaveAccount}{" "}
              <Text style={{ color: '#0286FF' }}>{t.auth.logIn}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RoleSelect;
