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

const SignIn = () => {
  const { t } = useTranslation();
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

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            {t.auth.welcome} 👋
          </Text>
        </View>

        <View className="p-5">
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

          <Link
            href="/(auth)/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            {t.auth.dontHaveAccount}{" "}
            <Text className="text-primary-500">{t.auth.signUp}</Text>
          </Link>

          <Link
            href="/(auth)/driver-register"
            className="text-lg text-center text-general-200 mt-4"
          >
            {t.auth.wantToDrive || "Want to drive?"}{" "}
            <Text className="text-primary-500">{t.auth.registerAsDriver || "Register as Driver"}</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
