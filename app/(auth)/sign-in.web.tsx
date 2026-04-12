// Web sign-in: same logic, but uses inline error instead of Alert and centers on desktop
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import PhoneInput from "@/components/PhoneInput";
import { icons, images } from "@/constants";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { navigateByRole } from "@/lib/utils";

const SignInWeb = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: signIn, isPending: loading } = useLogin();
  const { setAuthenticated } = useAuthStore();

  const onSignInPress = () => {
    if (!form.phone || !form.password) {
      setErrorMessage(t.auth.enterPhoneAndPassword);
      return;
    }
    setErrorMessage(null);

    signIn(
      { phone: form.phone, password: form.password },
      {
        onSuccess: (data) => {
          setAuthenticated(true);
          navigateByRole(data?.user?.roles ?? []);
        },
        onError: (err: any) => {
          let message = t.auth.loginFailed;
          if (err?.status === 401) message = t.auth.invalidCredentials;
          else if (err?.message) message = err.message;
          setErrorMessage(message);
        },
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
          <View style={{ position: 'relative', width: '100%', height: 180 }}>
            <Image source={images.signUpCar} style={{ width: '100%', height: 180 }} resizeMode="cover" />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              {t.auth.welcome} 👋
            </Text>
          </View>

          <View className="p-5">
            <PhoneInput
              label={t.auth.phoneNumber}
              icon={icons.call}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
            />
            <InputField
              label={t.auth.password}
              placeholder={t.auth.enterPassword}
              icon={icons.lock}
              secureTextEntry={true}
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />

            {errorMessage && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                <Text className="text-red-600 text-sm">{errorMessage}</Text>
              </View>
            )}

            <CustomButton
              title={loading ? t.auth.signingIn : t.auth.signIn}
              onPress={onSignInPress}
              className="mt-6"
              disabled={loading}
            />

            <Link href="/(auth)/role-select" className="text-lg text-center text-general-200 mt-10">
              {t.auth.dontHaveAccount}{" "}
              <Text className="text-primary-500">{t.auth.signUp}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignInWeb;
