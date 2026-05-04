// Admin drivers list with status filter tabs and search
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminDrivers } from '@/hooks/useAdmin';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

export default function DriversScreen() {
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

  const STATUS_TABS = [
    { key: '', label: t.admin.drivers.all },
    { key: 'pending', label: t.admin.drivers.pending },
    { key: 'active', label: t.admin.drivers.active },
    { key: 'suspended', label: t.admin.drivers.suspended },
  ];

  const { data, isLoading, refetch, isRefetching } = useAdminDrivers(activeTab, query);
  const drivers: any[] = data?.results ?? data ?? [];

  const getStatusStyle = (item: any) => {
    if (!item.is_active) return { label: t.admin.drivers.suspended, color: '#ef4444', bg: isDark ? '#450a0a' : '#fee2e2' };
    if (!item.is_verified) return { label: t.admin.drivers.pending, color: '#f59e0b', bg: isDark ? '#422006' : '#fef3c7' };
    return { label: t.admin.drivers.active, color: '#10b981', bg: isDark ? '#052e16' : '#d1fae5' };
  };

  const DriverRow = ({ item }: { item: any }) => {
    const { label, color, bg: statusBg } = getStatusStyle(item);
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/drivers/${item.id}`)}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 3, elevation: 1 }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: statusBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ fontSize: 18 }}>🚗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', fontSize: 14, color: textPrimary }}>
            {item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : t.admin.users.noName}
          </Text>
          <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{item.phone}</Text>
          <Text style={{ fontSize: 11, color: isDark ? '#475569' : '#94a3b8', marginTop: 2 }}>
            {item.experience_years != null ? `${item.experience_years} ${t.admin.drivers.yearsExp}` : ''}
            {item.rating_avg ? ` · ★ ${Number(item.rating_avg).toFixed(1)}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: statusBg }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color }}>{label}</Text>
          </View>
          {item.is_online && (
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: isDark ? '#052e16' : '#d1fae5' }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#10b981' }}>{t.admin.drivers.online}</Text>
            </View>
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
            {t.admin.drivers.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => setQuery(search.trim())}
              placeholder={t.admin.drivers.searchPlaceholder}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              returnKeyType="search"
              style={{ flex: 1, backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor: inputBorder }}
            />
            <TouchableOpacity onPress={() => setQuery(search.trim())} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>{t.admin.drivers.search}</Text>
            </TouchableOpacity>
          </View>
          {/* Filter tabs */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: activeTab === tab.key ? '#3b82f6' : (isDark ? '#1e293b' : '#ffffff'), borderWidth: 1, borderColor: activeTab === tab.key ? '#3b82f6' : inputBorder }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === tab.key ? 'white' : textSecondary }}>
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 100 }}
            onRefresh={refetch}
            refreshing={isRefetching}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: textSecondary, paddingVertical: 48 }}>
                {t.admin.drivers.noDriversFound}
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
