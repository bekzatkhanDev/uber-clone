// Trip sharing screen - generate and share live trip location
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useCreateShareToken,
  useShareTokens,
  copyToClipboard,
  shareViaNative,
  ShareToken,
} from '@/hooks/useTripSharing';
import { useActiveTrip } from '@/hooks/useTrips';

const TripShare = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  
  // Get active trip if no tripId provided
  const { data: activeTrip } = useActiveTrip();
  const currentTripId = tripId || (activeTrip?.id as string);
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Create share token
  const {
    shareToken,
    isLoading: creatingToken,
    error: createError,
    createToken,
  } = useCreateShareToken(currentTripId);
  
  // List existing tokens
  const { tokens, isLoading: loadingTokens } = useShareTokens(currentTripId);
  
  const handleCreateToken = async () => {
    try {
      await createToken();
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create share link');
    }
  };
  
  const handleCopyLink = async () => {
    if (shareToken?.share_url) {
      const success = await copyToClipboard(shareToken.share_url);
      if (success) {
        Alert.alert('Success', 'Link copied to clipboard!');
      } else {
        Alert.alert('Error', 'Failed to copy link');
      }
    }
  };
  
  const handleShareNative = async () => {
    if (shareToken?.share_url) {
      const success = await shareViaNative(shareToken.share_url, 'Track my trip');
      if (!success) {
        Alert.alert('Info', 'Native sharing not available on this device');
      }
    }
  };
  
  const formatExpiresAt = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleString();
  };
  
  return (
    <ScrollView
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="px-5 py-3 border-b border-gray-200">
        <Text className="text-xl font-JakartaBold">Share Trip</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Share your live location with friends and family
        </Text>
      </View>
      
      <View className="p-5">
        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text className="text-blue-800 font-JakartaSemiBold mb-2">
            🔒 Secure Sharing
          </Text>
          <Text className="text-blue-700 text-sm">
            Generate a time-limited link that expires in 24 hours. Anyone with the link can track your trip in real-time.
          </Text>
        </View>
        
        {/* Generate Button */}
        {!shareToken && (
          <TouchableOpacity
            className={`w-full py-4 rounded-xl items-center ${
              creatingToken ? 'bg-gray-300' : 'bg-[#0CC25F]'
            }`}
            onPress={handleCreateToken}
            disabled={creatingToken}
          >
            {creatingToken ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Text className="text-white text-lg font-JakartaSemiBold">
                Generate Share Link
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Success State */}
        {shareToken && (
          <View className="mb-6">
            <View className="bg-green-50 rounded-xl p-4 mb-4">
              <Text className="text-green-800 font-JakartaBold text-lg mb-2">
                ✓ Link Generated!
              </Text>
              <Text className="text-green-700 text-sm mb-3">
                Expires: {formatExpiresAt(shareToken.expires_at)}
              </Text>
              <Text className="text-green-600 text-xs mb-3">
                Access count: {shareToken.access_count}
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                className="w-full bg-[#0CC25F] py-3 rounded-xl items-center flex-row justify-center gap-2"
                onPress={handleCopyLink}
              >
                <Text className="text-white font-JakartaSemiBold">📋 Copy Link</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-full bg-blue-500 py-3 rounded-xl items-center flex-row justify-center gap-2"
                onPress={handleShareNative}
              >
                <Text className="text-white font-JakartaSemiBold">📤 Share via...</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-full bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => {
                  setShowSuccess(false);
                  createToken();
                }}
              >
                <Text className="text-gray-700 font-JakartaMedium">
                  Generate New Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Previous Tokens */}
        {tokens.length > 0 && (
          <View className="mt-8">
            <Text className="text-lg font-JakartaBold mb-3">Previous Links</Text>
            {tokens.map((token: ShareToken) => (
              <View
                key={token.token}
                className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200"
              >
                <Text className="text-sm text-gray-600 font-JakartaMedium">
                  Created: {formatExpiresAt(token.expires_at)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Accessed {token.access_count} times
                </Text>
                <Text className="text-xs text-red-500 mt-1">
                  ⚠️ Expired
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Loading State */}
        {loadingTokens && !tokens.length && (
          <View className="items-center py-10">
            <ActivityIndicator size="small" color="#0CC25F" />
            <Text className="text-gray-500 mt-2">Loading previous links...</Text>
          </View>
        )}
        
        {/* Error State */}
        {createError && (
          <View className="bg-red-50 rounded-xl p-4 mt-4">
            <Text className="text-red-700 font-JakartaMedium">
              Error: {createError}
            </Text>
          </View>
        )}
        
        {/* Help Text */}
        <View className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-sm text-gray-500 text-center">
            The recipient will see your driver's location, ETA, and trip status.
            No login required for them to view.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TripShare;
