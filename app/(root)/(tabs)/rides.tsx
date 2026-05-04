import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { useTripHistory } from "@/hooks/useTrips";
import { useTranslation } from "@/i18n/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

const Rides = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { data: recentRides = [], isLoading, isError } = useTripHistory();

  const bg = isDark ? '#0f172a' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item) => item.id}
        style={{ paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            {!isLoading ? (
              <>
                <Image source={images.noResult} style={{ width: 140, height: 140 }} resizeMode="contain" />
                <Text style={{ fontSize: 14, color: textSecondary, marginTop: 12 }}>
                  {t.rides.noRecentRides}
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color={isDark ? '#818cf8' : '#000'} />
            )}
          </View>
        )}
        ListHeaderComponent={
          <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary, marginVertical: 20 }}>
            {t.rides.allRides}
          </Text>
        }
      />
    </View>
  );
};

export default Rides;
