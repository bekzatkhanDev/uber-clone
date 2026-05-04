import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/i18n/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

const Home = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Image source={item.image} style={{ width: '100%', height: 300 }} resizeMode="contain" />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 40 }}>
        <Text style={{ color: isDark ? '#f1f5f9' : '#000000', fontSize: 28, fontWeight: 'bold', marginHorizontal: 40, textAlign: 'center' }}>
          {item.title}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Jakarta-SemiBold', textAlign: 'center', color: isDark ? '#94a3b8' : '#858585', marginHorizontal: 40, marginTop: 12 }}>
        {item.description}
      </Text>
    </View>
  );

  const bg = isDark ? '#0f172a' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#000000';
  const textSecondary = isDark ? '#94a3b8' : '#858585';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, width: '100%' }}>
        <LanguageSwitcher variant={isDark ? 'light' : 'dark'} />
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={{ color: textPrimary, fontSize: 16, fontFamily: 'Jakarta-Bold' }}>{t.common.skip}</Text>
        </TouchableOpacity>
      </View>

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
            ? router.replace("/(auth)/role-select")
            : swiperRef.current?.scrollBy(1)
        }
        className="w-11/12 mt-10 mb-5"
      />
    </View>
  );
};

export default Home;
