// Admin drivers list with status filter tabs and search
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
import { useAdminDrivers } from '@/hooks/useAdmin';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

const DriverRow = ({ item }: { item: any }) => {
  const isVerified = item.is_verified;
  const isActive = item.is_active;

  let statusLabel = 'Active';
  let statusColor = '#10b981';
  let statusBg = '#d1fae5';

  if (!isActive) {
    statusLabel = 'Suspended';
    statusColor = '#ef4444';
    statusBg = '#fee2e2';
  } else if (!isVerified) {
    statusLabel = 'Pending';
    statusColor = '#f59e0b';
    statusBg = '#fef3c7';
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/drivers/${item.id}`)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
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
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: statusBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 18 }}>🚗</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }}>
          {item.first_name || item.last_name
            ? `${item.first_name} ${item.last_name}`.trim()
            : 'No name'}
        </Text>
        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.phone}</Text>
        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
          {item.experience_years != null ? `${item.experience_years} yrs exp` : ''}
          {item.rating_avg ? ` · ★ ${Number(item.rating_avg).toFixed(1)}` : ''}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: statusBg }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor }}>{statusLabel}</Text>
        </View>
        {item.is_online && (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#d1fae5' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#065f46' }}>Online</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function DriversScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, refetch, isRefetching } = useAdminDrivers(activeTab, query);
  const drivers: any[] = data?.results ?? data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
          Drivers
        </Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => setQuery(search.trim())}
            placeholder="Search drivers…"
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
            <Text style={{ color: 'white', fontWeight: '600' }}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeTab === tab.key ? '#1e293b' : 'white',
                borderWidth: 1,
                borderColor: activeTab === tab.key ? '#1e293b' : '#e2e8f0',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
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
          data={drivers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <DriverRow item={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 100,
          }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 48 }}>
              No drivers found
            </Text>
          }
        />
      )}
      </View>
    </View>
  );
}
