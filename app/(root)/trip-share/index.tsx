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
import { useTranslation } from '@/i18n/I18nProvider';

const TripShare = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
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
      Alert.alert(t.common.error, err.message || t.tripShare.error);
    }
  };
  
  // Build the frontend URL from the token so it always points to the Expo app,
  // regardless of what the backend returns in share_url.
  const getFrontendShareUrl = () => {
    if (!shareToken) return null;
    const base = process.env.EXPO_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:8081';
    return `${base}/tracks/${shareToken.token}`;
  };

  const handleCopyLink = async () => {
    const url = getFrontendShareUrl();
    if (!url) return;
    const success = await copyToClipboard(url);
    if (success) {
      Alert.alert(t.common.success, url);
    } else {
      Alert.alert(t.common.error, t.common.error);
    }
  };

  const handleShareNative = async () => {
    const url = getFrontendShareUrl();
    if (!url) return;
    const success = await shareViaNative(url, t.tripShare.title);
    if (!success) {
      Alert.alert('Info', 'Native sharing not available on this device');
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
        <Text className="text-xl font-JakartaBold">{t.tripShare.title}</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t.tripShare.subtitle}
        </Text>
      </View>
      
      <View className="p-5">
        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text className="text-blue-800 font-JakartaSemiBold mb-2">
            {t.tripShare.secureSharing}
          </Text>
          <Text className="text-blue-700 text-sm">
            {t.tripShare.secureSharingDesc}
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
                {t.tripShare.generateLink}
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Success State */}
        {shareToken && (
          <View className="mb-6">
            <View className="bg-green-50 rounded-xl p-4 mb-4">
              <Text className="text-green-800 font-JakartaBold text-lg mb-2">
                {t.tripShare.linkGenerated}
              </Text>
              <Text className="text-green-700 text-sm mb-3">
                {t.tripShare.expires}: {formatExpiresAt(shareToken.expires_at)}
              </Text>
              <Text className="text-green-600 text-xs mb-3">
                {t.tripShare.accessCount}: {shareToken.accessed_count}
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                className="w-full bg-[#0CC25F] py-3 rounded-xl items-center flex-row justify-center gap-2"
                onPress={handleCopyLink}
              >
                <Text className="text-white font-JakartaSemiBold">{t.tripShare.copyLink}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-full bg-blue-500 py-3 rounded-xl items-center flex-row justify-center gap-2"
                onPress={handleShareNative}
              >
                <Text className="text-white font-JakartaSemiBold">{t.tripShare.shareVia}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="w-full bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => {
                  setShowSuccess(false);
                  createToken();
                }}
              >
                <Text className="text-gray-700 font-JakartaMedium">
                  {t.tripShare.generateNewLink}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Previous Tokens */}
        {tokens.length > 0 && (
          <View className="mt-8">
            <Text className="text-lg font-JakartaBold mb-3">{t.tripShare.previousLinks}</Text>
            {tokens.map((token: ShareToken) => (
              <View
                key={token.token}
                className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200"
              >
                <Text className="text-sm text-gray-600 font-JakartaMedium">
                  {t.tripShare.created}: {formatExpiresAt(token.expires_at)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {t.tripShare.accessedTimes.replace('{{count}}', String(token.accessed_count))}
                </Text>
                <Text className="text-xs text-red-500 mt-1">
                  {t.tripShare.expired}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Loading State */}
        {loadingTokens && !tokens.length && (
          <View className="items-center py-10">
            <ActivityIndicator size="small" color="#0CC25F" />
            <Text className="text-gray-500 mt-2">{t.tripShare.loadingLinks}</Text>
          </View>
        )}
        
        {/* Error State */}
        {createError && (
          <View className="bg-red-50 rounded-xl p-4 mt-4">
            <Text className="text-red-700 font-JakartaMedium">
              {t.common.error}: {createError}
            </Text>
          </View>
        )}
        
        {/* Help Text */}
        <View className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-sm text-gray-500 text-center">
            {t.tripShare.helpText}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TripShare;
