import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants";
import { useTranslation } from "@/i18n/I18nProvider";

const RoleSelectWeb = () => {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
          <View style={{ position: 'relative', width: '100%', height: 180 }}>
            <Image source={images.signUpCar} style={{ width: '100%', height: 180 }} resizeMode="cover" />
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
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } as any}
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
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } as any}
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
    </View>
  );
};

export default RoleSelectWeb;
