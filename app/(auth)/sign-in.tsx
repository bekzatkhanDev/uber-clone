// app/(auth)/sign-in.tsx
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import PhoneInput from "@/components/PhoneInput";
import { icons, images } from "@/constants";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { navigateByRole } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const SignIn = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const { mutate: signIn, isPending: loading, isError, error } = useLogin();
  const { setAuthenticated } = useAuthStore();

  const onSignInPress = () => {
    if (!form.phone || !form.password) {
      Alert.alert(t.common.error, t.auth.enterPhoneAndPassword);
      return;
    }

    signIn(
      { phone: form.phone, password: form.password },
      {
        onSuccess: (data) => {
          setAuthenticated(true);
          navigateByRole(data?.user?.roles ?? []);
        },
        onError: (err: any) => {
          console.error("Login error:", err);
          let message = t.auth.loginFailed;
          if (err?.status === 401) {
            message = t.auth.invalidCredentials;
          } else if (err?.message) {
            message = err.message;
          }
          Alert.alert(t.common.error, message);
        },
      }
    );
  };

  const bg = isDark ? '#0f172a' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#000000';
  const textSecondary = isDark ? '#94a3b8' : '#858585';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'relative', width: '100%', height: 250 }}>
          <Image source={images.signUpCar} style={{ width: '100%', height: 250 }} />
          <Text style={{ fontSize: 22, color: '#ffffff', fontFamily: 'Jakarta-SemiBold', position: 'absolute', bottom: 20, left: 20 }}>
            {t.auth.welcome} 👋
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <PhoneInput
            label={t.auth.phoneNumber}
            icon={icons.call}
            value={form.phone}
            onChangeText={(value) => setForm({ ...form, phone: value })}
          />

          <InputField
            label={t.auth.password}
            placeholder={t.auth.enterPassword}
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title={loading ? t.auth.signingIn : t.auth.signIn}
            onPress={onSignInPress}
            className="mt-6"
            disabled={loading}
          />

          {/* Optional: Remove OAuth if not supported */}
          {/* <OAuth /> */}

          <Link href="/(auth)/role-select" style={{ textAlign: 'center', marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, color: textSecondary, textAlign: 'center' }}>
              {t.auth.dontHaveAccount}{" "}
              <Text style={{ color: '#0286FF' }}>{t.auth.signUp}</Text>
            </Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
