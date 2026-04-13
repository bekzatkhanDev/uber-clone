import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants";
import { useTranslation } from "@/i18n/I18nProvider";

const RoleSelect = () => {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            {t.auth.chooseRole}
          </Text>
        </View>

        <View className="p-5">
          <Text className="text-base text-gray-500 font-Jakarta text-center mb-8">
            {t.auth.chooseRoleSubtitle}
          </Text>

          {/* Rider card */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            activeOpacity={0.85}
            className="border border-gray-200 rounded-2xl p-5 mb-4 flex-row items-center"
            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <View className="w-14 h-14 rounded-full bg-primary-100 items-center justify-center mr-4">
              <Text style={{ fontSize: 28 }}>🧑</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-JakartaBold text-black">{t.auth.iAmRider}</Text>
              <Text className="text-sm text-gray-500 font-Jakarta mt-0.5">{t.auth.riderDescription}</Text>
            </View>
            <Text className="text-primary-500 text-2xl ml-2">›</Text>
          </TouchableOpacity>

          {/* Driver card */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/driver-register")}
            activeOpacity={0.85}
            className="border border-gray-200 rounded-2xl p-5 flex-row items-center"
            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center mr-4">
              <Text style={{ fontSize: 28 }}>🚗</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-JakartaBold text-black">{t.auth.iAmDriver}</Text>
              <Text className="text-sm text-gray-500 font-Jakarta mt-0.5">{t.auth.driverDescription}</Text>
            </View>
            <Text className="text-primary-500 text-2xl ml-2">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            className="mt-10"
          >
            <Text className="text-lg text-center text-general-200">
              {t.auth.alreadyHaveAccount}{" "}
              <Text className="text-primary-500">{t.auth.logIn}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RoleSelect;
