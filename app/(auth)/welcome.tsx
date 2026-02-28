import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/i18n/I18nProvider";

const Home = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === 2;

  const onboardingSlides = [
    { id: 1, title: t.onboarding.title1, description: t.onboarding.description1, image: require("@/assets/images/onboarding1.png") },
    { id: 2, title: t.onboarding.title2, description: t.onboarding.description2, image: require("@/assets/images/onboarding2.png") },
    { id: 3, title: t.onboarding.title3, description: t.onboarding.description3, image: require("@/assets/images/onboarding3.png") },
  ];

  const renderSlide = ({ item }: { item: typeof onboardingSlides[0] }) => (
    <View className="flex items-center justify-center p-5">
      <Image
        source={item.image}
        className="w-full h-[300px]"
        resizeMode="contain"
      />
      <View className="flex flex-row items-center justify-center w-full mt-10">
        <Text className="text-black text-3xl font-bold mx-10 text-center">
          {item.title}
        </Text>
      </View>
      <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        style={{ width: '100%', alignItems: 'flex-end', padding: 20 }}
      >
        <Text className="text-black text-md font-JakartaBold">{t.common.skip}</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
        }
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboardingSlides.map((item) => (
          <View key={item.id}>
            {renderSlide({ item })}
          </View>
        ))}
      </Swiper>

      <CustomButton
        title={isLastSlide ? t.onboarding.getStarted : t.common.next}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-up")
            : swiperRef.current?.scrollBy(1)
        }
        className="w-11/12 mt-10 mb-5"
      />
    </View>
  );
};

export default Home;
