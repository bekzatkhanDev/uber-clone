// Trip sharing screen - generate and share live trip location
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCreateShareToken, useShareTokens, copyToClipboard, shareViaNative, ShareToken } from '@/hooks/useTripSharing';
import { useActiveTrip } from '@/hooks/useTrips';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const TripShare = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();

  const { data: activeTrip } = useActiveTrip();
  const currentTripId = tripId || (activeTrip?.id as string);

  const [showSuccess, setShowSuccess] = useState(false);

  const { shareToken, isLoading: creatingToken, error: createError, createToken } = useCreateShareToken(currentTripId);
  const { tokens, isLoading: loadingTokens } = useShareTokens(currentTripId);

  const bg = isDark ? '#0f172a' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#e5e7eb';
  const tokenItemBg = isDark ? '#1e293b' : '#f9fafb';

  const handleCreateToken = async () => {
    try {
      await createToken();
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.tripShare.error);
    }
  };

  const getFrontendShareUrl = () => {
    if (!shareToken) return null;
    const base = process.env.EXPO_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:8081';
    return `${base}/tracks/${shareToken.token}`;
  };

  const handleCopyLink = async () => {
    const url = getFrontendShareUrl();
    if (!url) return;
    const success = await copyToClipboard(url);
    if (success) Alert.alert(t.common.success, url);
    else Alert.alert(t.common.error, t.common.error);
  };

  const handleShareNative = async () => {
    const url = getFrontendShareUrl();
    if (!url) return;
    const success = await shareViaNative(url, t.tripShare.title);
    if (!success) Alert.alert('Info', 'Native sharing not available on this device');
  };

  const formatExpiresAt = (expiresAt: string) => new Date(expiresAt).toLocaleString();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary }}>{t.tripShare.title}</Text>
        <Text style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>{t.tripShare.subtitle}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: isDark ? '#93c5fd' : '#1e40af', fontWeight: '600', marginBottom: 8 }}>
            {t.tripShare.secureSharing}
          </Text>
          <Text style={{ color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: 13 }}>
            {t.tripShare.secureSharingDesc}
          </Text>
        </View>

        {!shareToken && (
          <TouchableOpacity
            onPress={handleCreateToken}
            disabled={creatingToken}
            style={{ width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: creatingToken ? (isDark ? '#334155' : '#d1d5db') : '#0CC25F' }}
          >
            {creatingToken ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{t.tripShare.generateLink}</Text>
            )}
          </TouchableOpacity>
        )}

        {shareToken && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: isDark ? '#052e16' : '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: isDark ? '#4ade80' : '#166534', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
                {t.tripShare.linkGenerated}
              </Text>
              <Text style={{ color: isDark ? '#34d399' : '#16a34a', fontSize: 13, marginBottom: 6 }}>
                {t.tripShare.expires}: {formatExpiresAt(shareToken.expires_at)}
              </Text>
              <Text style={{ color: isDark ? '#22c55e' : '#15803d', fontSize: 12 }}>
                {t.tripShare.accessCount}: {shareToken.accessed_count}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={handleCopyLink}
                style={{ backgroundColor: '#0CC25F', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t.tripShare.copyLink}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareNative}
                style={{ backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>{t.tripShare.shareVia}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setShowSuccess(false); createToken(); }}
                style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#374151', fontWeight: '500' }}>
                  {t.tripShare.generateNewLink}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {tokens.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary, marginBottom: 12 }}>
              {t.tripShare.previousLinks}
            </Text>
            {tokens.map((token: ShareToken) => (
              <View key={token.token} style={{ backgroundColor: tokenItemBg, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: borderColor }}>
                <Text style={{ fontSize: 13, color: textSecondary, fontWeight: '500' }}>
                  {t.tripShare.created}: {formatExpiresAt(token.expires_at)}
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? '#475569' : '#9ca3af', marginTop: 4 }}>
                  {t.tripShare.accessedTimes.replace('{{count}}', String(token.accessed_count))}
                </Text>
                <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{t.tripShare.expired}</Text>
              </View>
            ))}
          </View>
        )}

        {loadingTokens && !tokens.length && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="small" color="#0CC25F" />
            <Text style={{ color: textSecondary, marginTop: 8 }}>{t.tripShare.loadingLinks}</Text>
          </View>
        )}

        {createError && (
          <View style={{ backgroundColor: isDark ? '#450a0a' : '#fef2f2', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <Text style={{ color: isDark ? '#f87171' : '#b91c1c', fontWeight: '500' }}>
              {t.common.error}: {createError}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: borderColor }}>
          <Text style={{ fontSize: 13, color: textSecondary, textAlign: 'center' }}>
            {t.tripShare.helpText}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TripShare;
