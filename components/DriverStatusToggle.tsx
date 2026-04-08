// Online/offline toggle for driver home screen
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface DriverStatusToggleProps {
  isOnline: boolean;
  activeCar?: { plate_number: string; brand: string; car_type: string } | null;
  onGoOnline: () => void;
  onGoOffline: () => void;
  isLoading?: boolean;
}

const DriverStatusToggle = ({
  isOnline,
  activeCar,
  onGoOnline,
  onGoOffline,
  isLoading,
}: DriverStatusToggleProps) => {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-md mx-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <Text className="text-lg font-JakartaSemiBold">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          {isOnline && activeCar && (
            <Text className="text-sm text-gray-500 mt-1">
              {activeCar.brand} · {activeCar.plate_number} · {activeCar.car_type}
            </Text>
          )}
          {!isOnline && (
            <Text className="text-sm text-gray-500 mt-1">You are not accepting rides</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={isOnline ? onGoOffline : onGoOnline}
          disabled={isLoading}
          className={`px-5 py-3 rounded-full ${
            isOnline ? 'bg-red-500' : 'bg-[#0CC25F]'
          } ${isLoading ? 'opacity-60' : ''}`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-JakartaSemiBold">
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverStatusToggle;
