// app/(auth)/sign-up.tsx
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import PhoneInput from "@/components/PhoneInput";
import { icons, images } from "@/constants";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { navigateByRole } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const SignUp = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { setAuthenticated } = useAuthStore();

  const loading = isRegistering || isLoggingIn;

  const onSignUpPress = () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.password) {
      Alert.alert(t.common.error, t.auth.fillAllFields);
      return;
    }
    register(
      { phone: form.phone, password: form.password, first_name: form.first_name, last_name: form.last_name },
      {
        onSuccess: () => {
          login(
            { phone: form.phone, password: form.password },
            {
              onSuccess: (data) => { setAuthenticated(true); setShowSuccessModal(true); },
              onError: (err: any) => { Alert.alert(t.common.error, t.auth.loginFailed); },
            }
          );
        },
        onError: (err: any) => {
          let message = t.auth.registrationFailed;
          if (err?.status === 400) message = t.auth.phoneAlreadyRegistered;
          else if (err?.message) message = err.message;
          Alert.alert(t.common.error, message);
        },
      }
    );
  };

  const bg = isDark ? '#0f172a' : '#ffffff';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#000000';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'relative', width: '100%', height: 250 }}>
          <Image source={images.signUpCar} style={{ width: '100%', height: 250 }} />
          <Text style={{ fontSize: 22, color: '#ffffff', fontFamily: 'Jakarta-SemiBold', position: 'absolute', bottom: 20, left: 20 }}>
            {t.auth.createAccount}
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          <InputField
            label={t.auth.firstName}
            placeholder={t.auth.enterFirstName}
            icon={icons.person}
            value={form.first_name}
            onChangeText={(value) => setForm({ ...form, first_name: value })}
          />
          <InputField
            label={t.auth.lastName}
            placeholder={t.auth.enterLastName}
            icon={icons.person}
            value={form.last_name}
            onChangeText={(value) => setForm({ ...form, last_name: value })}
          />
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
            title={loading ? t.auth.registering : t.auth.signUp}
            onPress={onSignUpPress}
            className="mt-6"
            disabled={loading}
          />

          <Link href="/(auth)/sign-in" style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, color: textSecondary, textAlign: 'center' }}>
              {t.auth.alreadyHaveAccount}{" "}
              <Text style={{ color: '#0286FF' }}>{t.auth.logIn}</Text>
            </Text>
          </Link>
        </View>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View style={{ backgroundColor: cardBg, paddingHorizontal: 28, paddingVertical: 36, borderRadius: 16, minHeight: 300, alignItems: 'center' }}>
            <Image source={images.check} style={{ width: 110, height: 110, marginVertical: 20 }} />
            <Text style={{ fontSize: 28, fontFamily: 'Jakarta-Bold', textAlign: 'center', color: textPrimary }}>
              {t.auth.accountCreated}
            </Text>
            <Text style={{ fontSize: 15, color: textSecondary, fontFamily: 'Jakarta', textAlign: 'center', marginTop: 8 }}>
              {t.auth.registrationSuccess}
            </Text>
            <CustomButton title={t.auth.goToHome} onPress={() => navigateByRole(['customer'])} className="mt-5" />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
