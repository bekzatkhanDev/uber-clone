// Карточка поездки в истории
import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride }: { ride: Ride }) => {
  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  const driverName = ride.driver
    ? `${ride.driver.first_name} ${ride.driver.last_name}`
    : "—";
  const carSeats = ride.driver?.car_seats ?? "—";

  const mapUrl = googleApiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${ride.destination_latitude},${ride.destination_longitude}&zoom=14&size=600x400&markers=color:red%7C${ride.destination_latitude},${ride.destination_longitude}&key=${googleApiKey}`
    : null;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3 w-full">
        <View className="flex flex-row items-start justify-between w-full">
          {mapUrl ? (
            <Image
              source={{ uri: mapUrl }}
              className="w-[80px] h-[90px] rounded-lg"
              onError={() => console.warn("Map image failed")}
            />
          ) : (
            <View className="w-[80px] h-[90px] bg-gray-200 rounded-lg justify-center items-center">
              <Text className="text-xs text-gray-500">No map</Text>
            </View>
          )}

          <View className="flex flex-col mx-5 gap-y-3 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} style={{ width: 20, height: 20 }} resizeMode="contain" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.origin_address || "—"}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} style={{ width: 20, height: 20 }} resizeMode="contain" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.destination_address || "—"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-4 bg-general-500 rounded-lg p-3">
          <View className="flex flex-row items-center w-full justify-between mb-3">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold">
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-3">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Driver
            </Text>
            <Text className="text-md font-JakartaBold">{driverName}</Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-3">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold">{carSeats}</Text>
          </View>

          {ride.payment_status && (
            <View className="flex flex-row items-center w-full justify-between">
              <Text className="text-md font-JakartaMedium text-gray-500">
                Payment Status
              </Text>
              <Text
                className={`text-md capitalize font-JakartaBold ${getPaymentStatusColor(ride.payment_status)}`}
              >
                {ride.payment_status}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RideCard;
