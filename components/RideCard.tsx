import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants';
import { formatDate } from '@/lib/utils';
import { Ride } from '@/types/type';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/I18nProvider';
import { ReviewModal } from '@/components/ReviewModal';

const STATUS_COLORS: Record<string, { bg: string; darkBg: string; text: string }> = {
  requested: { bg: '#fef3c7', darkBg: '#422006', text: '#d97706' },
  accepted:   { bg: '#dbeafe', darkBg: '#1e3a5f', text: '#2563eb' },
  on_route:   { bg: '#ede9fe', darkBg: '#2e1065', text: '#7c3aed' },
  completed:  { bg: '#d1fae5', darkBg: '#052e16', text: '#059669' },
  cancelled:  { bg: '#fee2e2', darkBg: '#450a0a', text: '#dc2626' },
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: 14, opacity: s <= rating ? 1 : 0.2 }}>⭐</Text>
      ))}
    </View>
  );
}

const RideCard = ({ ride }: { ride: Ride }) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [reviewVisible, setReviewVisible] = useState(false);

  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const detailBg = isDark ? '#0f172a' : '#f8fafc';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const borderColor = isDark ? '#334155' : '#e5e7eb';
  const accentBlue = isDark ? '#60a5fa' : '#2563eb';
  const blueBg = isDark ? '#1e3a5f' : '#eff6ff';

  const driverName = ride.driver
    ? `${ride.driver.first_name} ${ride.driver.last_name}`.trim()
    : '—';

  const hasCoords = ride.end_lat != null && ride.end_lng != null;
  const mapUrl = hasCoords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${ride.end_lat},${ride.end_lng}&zoom=14&size=600x400&markers=${ride.end_lat},${ride.end_lng},red-pushpin`
    : null;

  const statusColors = STATUS_COLORS[ride.status] ?? { bg: '#f1f5f9', darkBg: '#1e293b', text: '#6b7280' };
  const isCompleted = ride.status === 'completed';
  const hasReview = !!ride.review;
  const canReview = isCompleted && !hasReview && !!ride.driver;

  const price = ride.price != null ? `${parseFloat(ride.price).toFixed(2)} ₸` : '—';
  const distance = ride.distance_km != null ? `${Number(ride.distance_km).toFixed(1)} km` : '—';

  return (
    <>
      <View
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          marginBottom: 12,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.07,
          shadowRadius: 6,
          elevation: 3,
          borderWidth: 1,
          borderColor,
        }}
      >
        {/* Map + Route Row */}
        <View style={{ flexDirection: 'row', padding: 14, gap: 12 }}>
          {mapUrl ? (
            <Image
              source={{ uri: mapUrl }}
              style={{ width: 82, height: 96, borderRadius: 10 }}
              onError={() => {}}
            />
          ) : (
            <View style={{ width: 82, height: 96, borderRadius: 10, backgroundColor: detailBg, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>🗺️</Text>
            </View>
          )}

          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {/* Status badge */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: isDark ? statusColors.darkBg : statusColors.bg }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: statusColors.text, textTransform: 'capitalize' }}>
                  {ride.status?.replace('_', ' ')}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: textSecondary }}>
                {ride.created_at ? formatDate(ride.created_at) : '—'}
              </Text>
            </View>

            {/* Start */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Image source={icons.to} style={{ width: 16, height: 16, opacity: 0.6 }} resizeMode="contain" />
              <Text style={{ fontSize: 13, color: textSecondary, flex: 1 }} numberOfLines={1}>
                {`${ride.start_lat?.toFixed(4)}, ${ride.start_lng?.toFixed(4)}`}
              </Text>
            </View>

            {/* End */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={icons.point} style={{ width: 16, height: 16 }} resizeMode="contain" />
              <Text style={{ fontSize: 13, color: textPrimary, fontWeight: '500', flex: 1 }} numberOfLines={1}>
                {`${ride.end_lat?.toFixed(4)}, ${ride.end_lng?.toFixed(4)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Details grid */}
        <View style={{ backgroundColor: detailBg, borderTopWidth: 1, borderTopColor: borderColor, paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 2 }}>{t.review.driverLabel}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: textPrimary }}>{driverName}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 2 }}>{t.review.priceLabel}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0CC25F' }}>{price}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 2 }}>{t.review.distanceLabel}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: textPrimary }}>{distance}</Text>
            </View>
            {ride.car && (
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 2 }}>
                  {ride.car.brand?.name ?? 'Car'}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: textPrimary }}>{ride.car.plate_number}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Review section */}
        {isCompleted && (
          <View style={{ borderTopWidth: 1, borderTopColor: borderColor, padding: 14 }}>
            {hasReview ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: textSecondary, marginBottom: 4 }}>
                    {t.review.yourRating}
                  </Text>
                  <StarDisplay rating={ride.review!.rating} />
                  {ride.review!.comment ? (
                    <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4, fontStyle: 'italic' }} numberOfLines={2}>
                      "{ride.review!.comment}"
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontSize: 24, marginLeft: 12 }}>✅</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: textSecondary }}>{t.review.noReview}</Text>
                {canReview && (
                  <TouchableOpacity
                    onPress={() => setReviewVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0CC25F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
                  >
                    <Text style={{ fontSize: 14 }}>⭐</Text>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>{t.review.rateRide}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Footer actions */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.push(`/(root)/trip-share?tripId=${ride.id}`)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: blueBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 14 }}>🔗</Text>
            <Text style={{ color: accentBlue, fontWeight: '600', fontSize: 13 }}>{t.review.shareTrip}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {canReview && (
        <ReviewModal
          visible={reviewVisible}
          tripId={ride.id}
          driverName={driverName}
          reviewedId={ride.driver!.id}
          onClose={() => setReviewVisible(false)}
        />
      )}
    </>
  );
};

export default RideCard;
