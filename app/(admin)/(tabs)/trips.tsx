// Admin trips list with status filter and search
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTrips } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';

const TripRow = ({ item }: { item: any }) => {
  const { t } = useTranslation();
  
  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    accepted: { bg: '#dbeafe', text: '#1e40af' },
    in_progress: { bg: '#ede9fe', text: '#5b21b6' },
    completed: { bg: '#d1fae5', text: '#065f46' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
  };
  
  const colors = STATUS_COLORS[item.status] ?? { bg: '#f1f5f9', text: '#475569' };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/trips/${item.id}`)}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }} numberOfLines={1}>
          {item.customer_name || t.admin.common.customer}
          {item.driver_name ? ` → ${t.admin.common.driver}` : ''}
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: colors.bg,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
            {item.status?.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>
          {item.created_at ? formatDate(item.created_at) : '—'}
        </Text>
        {item.price != null && (
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
            ${Number(item.price).toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function TripsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const STATUS_TABS = [
    { key: '', label: t.admin.trips.all },
    { key: 'pending', label: t.admin.trips.pending },
    { key: 'accepted', label: t.admin.trips.accepted },
    { key: 'in_progress', label: t.admin.trips.inProgress },
    { key: 'completed', label: t.admin.trips.completed },
    { key: 'cancelled', label: t.admin.trips.cancelled },
  ];

  const { data, isLoading, refetch, isRefetching } = useAdminTrips({
    status: activeTab,
    search: query,
  });
  const trips: any[] = data?.results ?? data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
          {t.admin.trips.title}
        </Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => setQuery(search.trim())}
            placeholder={t.admin.trips.searchPlaceholder}
            placeholderTextColor="#94a3b8"
            returnKeyType="search"
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 14,
              color: '#0f172a',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          />
          <TouchableOpacity
            onPress={() => setQuery(search.trim())}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>{t.admin.trips.search}</Text>
          </TouchableOpacity>
        </View>

        {/* Status filter — horizontal scroll */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: activeTab === tab.key ? '#1e293b' : 'white',
                borderWidth: 1,
                borderColor: activeTab === tab.key ? '#1e293b' : '#e2e8f0',
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: activeTab === tab.key ? 'white' : '#64748b',
                }}
              >
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
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 100,
          }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 48 }}>
              {t.admin.trips.noTripsFound}
            </Text>
          }
        />
      )}
      </View>
    </View>
  );
}
