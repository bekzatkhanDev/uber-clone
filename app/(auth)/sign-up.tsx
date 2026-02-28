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

const SignUp = () => {
  const { t } = useTranslation();
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
      { 
        phone: form.phone, 
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name
      },
      {
        onSuccess: () => {
          login(
            { phone: form.phone, password: form.password },
            {
              onSuccess: () => {
                setAuthenticated(true);
                setShowSuccessModal(true);
              },
              onError: (err: any) => {
                console.error("Auto-login error:", err);
                Alert.alert(t.common.error, t.auth.loginFailed);
              },
            }
          );
        },
        onError: (err: any) => {
          console.error("Registration error:", err);
          let message = t.auth.registrationFailed;
          if (err?.status === 400) {
            message = t.auth.phoneAlreadyRegistered;
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
            {t.auth.createAccount}
          </Text>
        </View>

        <View className="p-5">
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

          {/* Optional: Remove OAuth if not supported */}
          {/* <OAuth /> */}

          <Link
            href="/(auth)/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            {t.auth.alreadyHaveAccount}{" "}
            <Text className="text-primary-500">{t.auth.logIn}</Text>
          </Link>
        </View>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] items-center">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              {t.auth.accountCreated}
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              {t.auth.registrationSuccess}
            </Text>
            <CustomButton
              title={t.auth.goToHome}
              onPress={() => router.push("/(root)/(tabs)/home")}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
