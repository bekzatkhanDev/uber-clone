// Driver earnings screen — today, this week, this month
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import EarningsSummary from '@/components/EarningsSummary';
import { useDriverEarnings } from '@/hooks/useDriverDashboard';

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

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: '7 Days' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All Time' },
];

const Earnings = () => {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const { from, to } = getPeriodDates(period);
  const { data, isLoading } = useDriverEarnings(from, to);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 20,
      }}
    >
      <Text className="text-2xl font-JakartaBold mb-6">Earnings</Text>

      {/* Period selector */}
      <View className="flex-row bg-white rounded-2xl p-1 shadow-sm mb-6">
        {PERIODS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setPeriod(key)}
            className={`flex-1 py-2 rounded-xl items-center ${
              period === key ? 'bg-[#0CC25F]' : ''
            }`}
          >
            <Text
              className={`text-sm font-JakartaSemiBold ${
                period === key ? 'text-white' : 'text-gray-600'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary card */}
      <EarningsSummary
        data={data}
        isLoading={isLoading}
        title={PERIODS.find((p) => p.key === period)?.label ?? 'Earnings'}
      />

      {/* Tips */}
      <View className="bg-blue-50 rounded-2xl p-4 mt-6">
        <Text className="text-sm font-JakartaSemiBold text-blue-700 mb-1">Tips to earn more</Text>
        <Text className="text-sm text-blue-600">
          • Stay online during peak hours (7-9 AM, 5-8 PM){'\n'}
          • Maintain a high rating for priority dispatch{'\n'}
          • Accept rides promptly to improve your score
        </Text>
      </View>
    </ScrollView>
  );
};

export default Earnings;
