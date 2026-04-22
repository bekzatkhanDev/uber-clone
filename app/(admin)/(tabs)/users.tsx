// Admin users list with search
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
import { useAdminUsers } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

const UserRow = ({ item }: { item: any }) => {
  const roles: string[] = item.roles ?? [];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/users/${item.id}`)}
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
          backgroundColor: item.is_active ? '#dbeafe' : '#fee2e2',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 18 }}>{item.is_active ? '👤' : '🚫'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: '#0f172a' }}>
          {item.first_name || item.last_name
            ? `${item.first_name} ${item.last_name}`.trim()
            : 'No name'}
        </Text>
        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.phone}</Text>
        <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
          Joined {item.created_at ? formatDate(item.created_at) : '—'}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {roles.map((role) => (
          <View
            key={role}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor:
                role === 'admin' ? '#fef3c7' : role === 'driver' ? '#ede9fe' : '#dbeafe',
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color:
                  role === 'admin' ? '#92400e' : role === 'driver' ? '#5b21b6' : '#1d4ed8',
                textTransform: 'capitalize',
              }}
            >
              {role}
            </Text>
          </View>
        ))}
        {!item.is_active && (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#fee2e2' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#dc2626' }}>Suspended</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, refetch, isRefetching } = useAdminUsers(query);
  const users: any[] = data?.results ?? data ?? [];

  const handleSearch = () => setQuery(search.trim());

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 } : { flex: 1 }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 12 }}>
          Users
        </Text>

        {/* Search bar */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            placeholder="Search by name or phone…"
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
            onPress={handleSearch}
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
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 48 }}>
              No users found
            </Text>
          }
        />
      )}
      </View>
    </View>
  );
}
