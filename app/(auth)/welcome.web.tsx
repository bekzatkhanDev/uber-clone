import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/i18n/I18nProvider";

const WelcomeWeb = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const onboardingSlides = [
    {
      id: 1,
      title: t.onboarding.title1,
      description: t.onboarding.description1,
      image: require("@/assets/images/onboarding1.png"),
    },
    {
      id: 2,
      title: t.onboarding.title2,
      description: t.onboarding.description2,
      image: require("@/assets/images/onboarding2.png"),
    },
    {
      id: 3,
      title: t.onboarding.title3,
      description: t.onboarding.description3,
      image: require("@/assets/images/onboarding3.png"),
    },
  ];

  const isLastSlide = activeIndex === onboardingSlides.length - 1;
  const slide = onboardingSlides[activeIndex];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-in")}
        style={{ width: "100%", alignItems: "flex-end", padding: 20 }}
      >
        <Text className="text-black text-md font-JakartaBold">{t.common.skip}</Text>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center px-5">
        <View className="w-full max-w-xl self-center">
          <Image source={slide.image} style={{ width: '100%', height: 220 }} resizeMode="contain" />
          <Text className="text-black text-3xl font-bold mt-10 text-center">{slide.title}</Text>
          <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mt-3">
            {slide.description}
          </Text>

          <View className="flex-row justify-center mt-6">
            {onboardingSlides.map((_, i) => (
              <View
                key={i}
                className={`w-[32px] h-[4px] mx-1 rounded-full ${
                  i === activeIndex ? "bg-[#0286FF]" : "bg-[#E2E8F0]"
                }`}
              />
            ))}
          </View>
        </View>
      </View>

      <View className="w-full items-center">
        <CustomButton
          title={isLastSlide ? t.onboarding.getStarted : t.common.next}
          onPress={() => {
            if (isLastSlide) router.replace("/(auth)/role-select");
            else setActiveIndex((v) => Math.min(v + 1, onboardingSlides.length - 1));
          }}
          className="w-11/12 mt-3 mb-5 max-w-xl"
        />

        {!isLastSlide && activeIndex > 0 ? (
          <TouchableOpacity onPress={() => setActiveIndex((v) => Math.max(v - 1, 0))}>
            <Text className="text-general-200 mb-6">Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default WelcomeWeb;

