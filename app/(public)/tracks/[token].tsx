// Public trip tracking page - no authentication required
// Recipients view this page when clicking a share link
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePublicTripData } from '@/hooks/useTripSharing';

const PublicTrackPage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  
  const { tripData, isLoading, error, isExpired, refreshData } = usePublicTripData(
    token || null,
    !!token
  );
  
  // Auto-refresh every 10 seconds when trip is in progress
  useEffect(() => {
    if (!tripData || tripData.trip_status === 'completed') {
      return;
    }
    
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [tripData, refreshData]);
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Looking for driver...';
      case 'accepted':
        return 'Driver assigned - Heading to pickup';
      case 'on_route':
        return 'On route to destination';
      case 'completed':
        return 'Trip completed';
      case 'cancelled':
        return 'Trip cancelled';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_route':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-[#0CC25F]';
    }
  };
  
  const handleCallDriver = () => {
    if (tripData?.driver?.phone) {
      const phoneNumber = tripData.driver.phone.replace(/[^0-9+]/g, '');
      if (Platform.OS === 'web') {
        window.open(`tel:${phoneNumber}`, '_blank');
      } else {
        Linking.openURL(`tel:${phoneNumber}`);
      }
    }
  };
  
  // Loading state
  if (isLoading && !tripData) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#0CC25F" />
        <Text className="mt-4 text-gray-500">Loading trip details...</Text>
      </View>
    );
  }
  
  // Error states
  if (error || isExpired || !tripData) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center p-5"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Text className="text-2xl font-JakartaBold text-red-500 mb-2">
          {isExpired ? 'Link Expired' : 'Trip Not Found'}
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          {isExpired
            ? 'This tracking link has expired. Please ask the sender to generate a new one.'
            : error || 'Unable to load trip information.'}
        </Text>
        <View className="bg-gray-100 rounded-xl p-4 w-full max-w-sm">
          <Text className="text-sm text-gray-600 text-center">
            Share links are valid for 24 hours and expire automatically for security.
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Status Banner */}
      <View className={`${getStatusColor(tripData.trip_status)} px-5 py-4`}>
        <Text className="text-white text-lg font-JakartaBold">
          {getStatusLabel(tripData.trip_status)}
        </Text>
        {tripData.eta_minutes != null && tripData.trip_status !== 'completed' && (
          <Text className="text-white text-sm mt-1">
            ETA: {tripData.eta_minutes} minutes
          </Text>
        )}
      </View>
      
      {/* Map Placeholder */}
      <View className="bg-gray-200 h-64 w-full items-center justify-center">
        <Text className="text-gray-500 font-JakartaMedium">
          🗺️ Live Map View
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          Driver location updates every 10s
        </Text>
        {tripData.current_location && (
          <Text className="text-gray-400 text-xs mt-2">
            Last update: {new Date().toLocaleTimeString()}
          </Text>
        )}
      </View>
      
      {/* Driver Info Card */}
      <View className="bg-white mx-5 mt-[-30px] rounded-2xl shadow-lg p-5 relative z-10">
        <Text className="text-sm text-gray-500 mb-3">Your Driver</Text>
        
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xl font-JakartaBold">
              {tripData.driver.first_name}
            </Text>
            {tripData.driver.vehicle_model && (
              <Text className="text-gray-600 mt-1">
                {tripData.driver.vehicle_model}
              </Text>
            )}
            {tripData.driver.vehicle_plate && (
              <Text className="text-gray-800 font-JakartaSemiBold bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {tripData.driver.vehicle_plate}
              </Text>
            )}
          </View>
          
          {tripData.driver.phone && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-[#0CC25F] w-12 h-12 rounded-full items-center justify-center"
                onPress={handleCallDriver}
              >
                <Text className="text-white text-xl">📞</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Trip Locations */}
        <View className="border-t border-gray-200 pt-4 mt-2">
          <View className="flex-row items-start mb-4">
            <View className="w-3 h-3 rounded-full bg-green-500 mt-1.5 mr-3" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Pickup</Text>
              <Text className="text-sm font-JakartaMedium">
                {tripData.pickup_location.address}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-start">
            <View className="w-3 h-3 rounded-full bg-red-500 mt-1.5 mr-3" />
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Dropoff</Text>
              <Text className="text-sm font-JakartaMedium">
                {tripData.dropoff_location.address}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Safety Notice */}
      <View className="mx-5 mt-5 mb-10 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <Text className="text-yellow-800 font-JakartaSemiBold mb-1">
          ℹ️ About This Page
        </Text>
        <Text className="text-yellow-700 text-sm">
          You're viewing a shared trip location. The driver's position updates automatically. 
          This link will expire in 24 hours.
        </Text>
      </View>
    </ScrollView>
  );
};

// Simple TouchableOpacity wrapper for web compatibility
const TouchableOpacity = ({ 
  onPress, 
  children, 
  className, 
  disabled 
}: { 
  onPress: () => void; 
  children: React.ReactNode; 
  className?: string;
  disabled?: boolean;
}) => {
  const handleClick = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };
  
  return (
    <View
      className={className}
      onStartShouldSetResponder={() => true}
      onPressIn={Platform.OS !== 'web' ? undefined : handleClick}
      onPress={Platform.OS !== 'web' ? handleClick : undefined}
    >
      {children}
    </View>
  );
};

export default PublicTrackPage;
