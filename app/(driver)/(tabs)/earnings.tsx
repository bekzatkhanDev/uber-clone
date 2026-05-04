// Driver earnings screen — today, this week, this month
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EarningsSummary from '@/components/EarningsSummary';
import { useDriverEarnings } from '@/hooks/useDriverDashboard';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

type Period = 'today' | 'week' | 'month' | 'all';

const getPeriodDates = (period: Period): { from?: string; to?: string } => {
  const now = new Date();
  const toISO = (d: Date) => d.toISOString();
  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { from: toISO(start), to: toISO(now) };
  }
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { from: toISO(start), to: toISO(now) };
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { from: toISO(start), to: toISO(now) };
  }
  return {};
};

const Earnings = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>('week');
  const { from, to } = getPeriodDates(period);
  const { data, isLoading } = useDriverEarnings(from, to);

  const bg = isDark ? '#0f172a' : '#f5f5f5';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const inactiveLabelColor = isDark ? '#94a3b8' : '#4b5563';

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'today', label: t.driver.today },
    { key: 'week', label: t.driver.sevenDays },
    { key: 'month', label: t.driver.month },
    { key: 'all', label: t.driver.allTime },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
    >
      <Text style={{ fontSize: 24, fontFamily: 'Jakarta-Bold', color: textPrimary, marginBottom: 24 }}>
        {t.driver.earnings}
      </Text>

      {/* Period selector */}
      <View style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 16, padding: 4, marginBottom: 24, shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 4, elevation: 2 }}>
        {PERIODS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setPeriod(key)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
              backgroundColor: period === key ? '#0CC25F' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: 'Jakarta-SemiBold', color: period === key ? '#ffffff' : inactiveLabelColor }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <EarningsSummary
        data={data}
        isLoading={isLoading}
        title={PERIODS.find((p) => p.key === period)?.label ?? t.driver.earnings}
      />

      {/* Tips */}
      <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderRadius: 16, padding: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 13, fontFamily: 'Jakarta-SemiBold', color: isDark ? '#93c5fd' : '#1d4ed8', marginBottom: 4 }}>
          {t.driver.tipsTitle}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? '#60a5fa' : '#2563eb' }}>
          {t.driver.tipsBody}
        </Text>
      </View>
    </ScrollView>
  );
};

export default Earnings;
