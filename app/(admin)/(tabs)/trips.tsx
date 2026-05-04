// Admin trips list with status filter and search
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTrips } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

export default function TripsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#e2e8f0';

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: isDark ? '#422006' : '#fef3c7', text: isDark ? '#f59e0b' : '#92400e' },
    accepted: { bg: isDark ? '#1e3a5f' : '#dbeafe', text: isDark ? '#60a5fa' : '#1e40af' },
    in_progress: { bg: isDark ? '#2e1065' : '#ede9fe', text: isDark ? '#a78bfa' : '#5b21b6' },
    completed: { bg: isDark ? '#052e16' : '#d1fae5', text: isDark ? '#34d399' : '#065f46' },
    cancelled: { bg: isDark ? '#450a0a' : '#fee2e2', text: isDark ? '#f87171' : '#991b1b' },
  };

  const STATUS_TABS = [
    { key: '', label: t.admin.trips.all },
    { key: 'pending', label: t.admin.trips.pending },
    { key: 'accepted', label: t.admin.trips.accepted },
    { key: 'in_progress', label: t.admin.trips.inProgress },
    { key: 'completed', label: t.admin.trips.completed },
    { key: 'cancelled', label: t.admin.trips.cancelled },
  ];

  const { data, isLoading, refetch, isRefetching } = useAdminTrips({ status: activeTab, search: query });
  const trips: any[] = data?.results ?? data ?? [];

  const TripRow = ({ item }: { item: any }) => {
    const colors = STATUS_COLORS[item.status] ?? { bg: isDark ? '#1e293b' : '#f1f5f9', text: textSecondary };
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/trips/${item.id}`)}
        style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 3, elevation: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontWeight: '600', fontSize: 14, color: textPrimary, flex: 1, marginRight: 8 }} numberOfLines={1}>
            {item.customer_name || t.admin.common.customer}
            {item.driver_name ? ` → ${t.admin.common.driver}` : ''}
          </Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.bg }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
              {item.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: textSecondary }}>
            {item.created_at ? formatDate(item.created_at) : '—'}
          </Text>
          {item.price != null && (
            <Text style={{ fontSize: 13, fontWeight: '700', color: textPrimary }}>
              ${Number(item.price).toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary, marginBottom: 12 }}>
            {t.admin.trips.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => setQuery(search.trim())}
              placeholder={t.admin.trips.searchPlaceholder}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              returnKeyType="search"
              style={{ flex: 1, backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor: inputBorder }}
            />
            <TouchableOpacity onPress={() => setQuery(search.trim())} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>{t.admin.trips.search}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 4, backgroundColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#1e293b' : '#ffffff'), borderWidth: 1, borderColor: activeTab === tab.key ? '#3b82f6' : inputBorder }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === tab.key ? 'white' : textSecondary }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <TripRow item={item} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 100 }}
            onRefresh={refetch}
            refreshing={isRefetching}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: textSecondary, paddingVertical: 48 }}>
                {t.admin.trips.noTripsFound}
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
