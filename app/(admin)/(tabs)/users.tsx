// Admin users list with search
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminUsers } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

export default function UsersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, refetch, isRefetching } = useAdminUsers(query);
  const users: any[] = data?.results ?? data ?? [];

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const inputBorder = isDark ? '#334155' : '#e2e8f0';

  const handleSearch = () => setQuery(search.trim());

  const UserRow = ({ item }: { item: any }) => {
    const roles: string[] = item.roles ?? [];
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/users/${item.id}`)}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 3, elevation: 1 }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.is_active ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#450a0a' : '#fee2e2'), alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ fontSize: 18 }}>{item.is_active ? '👤' : '🚫'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', fontSize: 14, color: textPrimary }}>
            {item.first_name || item.last_name ? `${item.first_name} ${item.last_name}`.trim() : t.admin.users.noName}
          </Text>
          <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{item.phone}</Text>
          <Text style={{ fontSize: 11, color: isDark ? '#475569' : '#94a3b8', marginTop: 2 }}>
            {t.admin.users.joined} {item.created_at ? formatDate(item.created_at) : '—'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {roles.map((role) => (
            <View key={role} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 2, backgroundColor: role === 'admin' ? (isDark ? '#422006' : '#fef3c7') : role === 'driver' ? (isDark ? '#2e1065' : '#ede9fe') : (isDark ? '#1e3a5f' : '#dbeafe') }}>
              <Text style={{ fontSize: 10, fontWeight: '600', textTransform: 'capitalize', color: role === 'admin' ? '#f59e0b' : role === 'driver' ? '#a78bfa' : '#60a5fa' }}>
                {role}
              </Text>
            </View>
          ))}
          {!item.is_active && (
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: isDark ? '#450a0a' : '#fee2e2' }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#ef4444' }}>{t.admin.users.suspended}</Text>
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
            {t.admin.users.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              placeholder={t.admin.users.searchPlaceholder}
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              returnKeyType="search"
              style={{ flex: 1, backgroundColor: inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: textPrimary, borderWidth: 1, borderColor: inputBorder }}
            />
            <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>{t.admin.users.search}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <UserRow item={item} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
            onRefresh={refetch}
            refreshing={isRefetching}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: textSecondary, paddingVertical: 48 }}>
                {t.admin.users.noUsersFound}
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
