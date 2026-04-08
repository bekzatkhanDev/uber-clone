// app/(root)/(tabs)/rides.tsx
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { useTripHistory } from "@/hooks/useTrips"; // ← custom hook

const Rides = () => {
  const insets = useSafeAreaInsets();
  const { data: recentRides = [], isLoading, isError } = useTripHistory();

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item) => item.id} // trip.id is UUID
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center py-20">
            {!isLoading ? (
              <>
                <Image
                  source={images.noResult}
                  style={{ width: 140, height: 140 }}
                  resizeMode="contain"
                />
                <Text className="text-sm text-gray-500 mt-3">
                  No recent rides found
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <Text className="text-2xl font-JakartaBold my-5">All Rides</Text>
        }
      />
    </View>
  );
};

export default Rides;
