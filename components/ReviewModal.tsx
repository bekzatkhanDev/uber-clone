import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';
import { useCreateReview } from '@/hooks/useTrips';

const STAR_LABELS = ['', 'terrible', 'bad', 'okay', 'good', 'excellent'] as const;

interface Props {
  visible: boolean;
  tripId: string;
  driverName: string;
  reviewedId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const Star = ({ filled, onPress }: { filled: boolean; onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={{ padding: 6 }}>
      <Animated.Text style={{ fontSize: 38, transform: [{ scale }], opacity: filled ? 1 : 0.25 }}>
        ⭐
      </Animated.Text>
    </TouchableOpacity>
  );
};

export const ReviewModal = ({ visible, tripId, driverName, reviewedId, onClose, onSuccess }: Props) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { mutate: createReview, isPending } = useCreateReview(tripId);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 70, friction: 10 }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const reset = () => { setRating(0); setComment(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (rating === 0) return;
    createReview(
      { reviewed: reviewedId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          if (Platform.OS !== 'web') {
            Alert.alert('', t.review.reviewSubmitted);
          }
          reset();
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          const msg = err?.message || t.common.error;
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert(t.common.error, msg);
        },
      }
    );
  };

  const overlayBg = 'rgba(0,0,0,0.65)';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const inputBorder = isDark ? '#334155' : '#e2e8f0';
  const cancelBg = isDark ? '#334155' : '#f1f5f9';

  const ratingLabel = rating > 0 ? t.review[STAR_LABELS[rating]] : '';

  const cardScale = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const cardOpacity = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: overlayBg, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Animated.View
          style={{
            backgroundColor: cardBg,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 22, fontWeight: '800', color: textPrimary, textAlign: 'center', marginBottom: 4 }}>
            {t.review.rateYourRide}
          </Text>
          <Text style={{ fontSize: 14, color: textSecondary, textAlign: 'center', marginBottom: 20 }}>
            {t.review.howWasRideWith} {driverName}
          </Text>

          {/* Stars */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} filled={star <= rating} onPress={() => setRating(star)} />
            ))}
          </View>

          {/* Rating label */}
          <View style={{ height: 24, alignItems: 'center', marginBottom: 16 }}>
            {rating > 0 && (
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#f59e0b' }}>
                {ratingLabel}
              </Text>
            )}
          </View>

          {/* Comment */}
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={t.review.commentPlaceholder}
            placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
            multiline
            numberOfLines={3}
            maxLength={300}
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: inputBorder,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              color: textPrimary,
              minHeight: 80,
              marginBottom: 20,
              ...(Platform.OS !== 'web' && { textAlignVertical: 'top' as const }),
            }}
          />

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: cancelBg, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '600', color: textSecondary }}>{t.common.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === 0 || isPending}
              style={{
                flex: 2,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: rating === 0 ? (isDark ? '#0f172a' : '#e2e8f0') : '#0CC25F',
              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ fontWeight: '700', fontSize: 15, color: rating === 0 ? textSecondary : 'white' }}>
                  {t.review.submit}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ReviewModal;
