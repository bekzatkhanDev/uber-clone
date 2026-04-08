// Web sign-up: same as native but replaces ReactNativeModal with a View overlay
import { Link } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import PhoneInput from "@/components/PhoneInput";
import { icons, images } from "@/constants";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { navigateByRole } from "@/lib/utils";

const SignUpWeb = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { setAuthenticated } = useAuthStore();

  const loading = isRegistering || isLoggingIn;

  const onSignUpPress = () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.password) {
      setErrorMessage(t.auth.fillAllFields);
      return;
    }
    setErrorMessage(null);

    register(
      {
        phone: form.phone,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
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
              onError: () => setErrorMessage(t.auth.loginFailed),
            }
          );
        },
        onError: (err: any) => {
          let message = t.auth.registrationFailed;
          if (err?.status === 400) message = t.auth.phoneAlreadyRegistered;
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
              {t.auth.createAccount}
            </Text>
          </View>

          <View className="p-5">
            <InputField
              label={t.auth.firstName}
              placeholder={t.auth.enterFirstName}
              icon={icons.person}
              value={form.first_name}
              onChangeText={(v) => setForm({ ...form, first_name: v })}
            />
            <InputField
              label={t.auth.lastName}
              placeholder={t.auth.enterLastName}
              icon={icons.person}
              value={form.last_name}
              onChangeText={(v) => setForm({ ...form, last_name: v })}
            />
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
              title={loading ? t.auth.registering : t.auth.signUp}
              onPress={onSignUpPress}
              className="mt-6"
              disabled={loading}
            />

            <Link href="/(auth)/sign-in" className="text-lg text-center text-general-200 mt-10">
              {t.auth.alreadyHaveAccount}{" "}
              <Text className="text-primary-500">{t.auth.logIn}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Web modal overlay — replaces ReactNativeModal */}
      {showSuccessModal && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View className="bg-white rounded-2xl p-8 w-full items-center" style={{ maxWidth: 360 }}>
            <Image source={images.check} style={{ width: 110, height: 110, marginBottom: 16 }} resizeMode="contain" />
            <Text className="text-3xl font-JakartaBold text-center">{t.auth.accountCreated}</Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              {t.auth.registrationSuccess}
            </Text>
            <CustomButton
              title={t.auth.goToHome}
              onPress={() => navigateByRole(['customer'])}
              className="mt-5 w-full"
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default SignUpWeb;
