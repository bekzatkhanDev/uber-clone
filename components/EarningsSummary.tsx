// Earnings summary card for driver earnings screen
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface EarningsSummaryProps {
  data?: {
    trips_completed: number;
    gross: number;
    paid: number;
    unpaid: number;
    currency: string;
  };
  isLoading?: boolean;
  title?: string;
}

const EarningsSummary = ({ data, isLoading, title = 'Earnings' }: EarningsSummaryProps) => {
  if (isLoading) {
    return (
      <View className="bg-white rounded-2xl p-5 shadow-sm items-center">
        <ActivityIndicator size="small" color="#0CC25F" />
      </View>
    );
  }

  if (!data) return null;

  const fmt = (n: number) => `${n.toFixed(0)} ${data.currency}`;

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-base font-JakartaSemiBold text-gray-600 mb-4">{title}</Text>

      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Text className="text-2xl font-JakartaBold text-[#0CC25F]">{fmt(data.gross)}</Text>
          <Text className="text-xs text-gray-500 mt-1">Total Earned</Text>
        </View>
        <View className="w-px bg-gray-200 mx-4" />
        <View className="items-center flex-1">
          <Text className="text-2xl font-JakartaBold">{data.trips_completed}</Text>
          <Text className="text-xs text-gray-500 mt-1">Trips</Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-4 flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-base font-JakartaMedium text-green-600">{fmt(data.paid)}</Text>
          <Text className="text-xs text-gray-500 mt-1">Paid</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-base font-JakartaMedium text-orange-500">{fmt(data.unpaid)}</Text>
          <Text className="text-xs text-gray-500 mt-1">Unpaid</Text>
        </View>
      </View>
    </View>
  );
};

export default EarningsSummary;
