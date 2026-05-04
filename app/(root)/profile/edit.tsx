// Edit Profile Screen - General Profile Update (Customers & Drivers)
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { useCurrentUser, useUpdateProfile, UserProfileData } from '@/hooks/useUser';
import { useTranslation } from '@/i18n/I18nProvider';
import { useTheme } from '@/hooks/useTheme';

const EditProfile = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(currentUser?.profile_photo || null);
  const [error, setError] = useState<string | null>(null);

  const bg = isDark ? '#0f172a' : '#f5f5f5';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textSecondary = isDark ? '#94a3b8' : '#6b7280';
  const inputBorder = isDark ? '#334155' : '#e5e7eb';
  const inputBg = isDark ? '#0f172a' : '#ffffff';
  const avatarBg = isDark ? '#334155' : '#e5e7eb';

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) setProfilePhoto(asset.uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert(t.common.error, t.profile.imagePickError);
    }
  };

  const handleSave = async () => {
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError(t.profile.nameRequired);
      return;
    }

    const updateData: UserProfileData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    };

    if (profilePhoto && profilePhoto !== currentUser?.profile_photo) {
      updateData.profile_photo = profilePhoto;
    }

    updateProfile(updateData, {
      onSuccess: () => {
        Alert.alert(t.common.success, t.profile.updateSuccess);
        router.back();
      },
      onError: (err: any) => {
        const errorMsg = err?.message || t.profile.updateError;
        setError(errorMsg);
        Alert.alert(t.common.error, errorMsg);
      },
    });
  };

  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  const Field = ({ label, value, onChange, keyboardType = 'default', autoCapitalize = 'sentences' }: {
    label: string; value: string; onChange: (v: string) => void;
    keyboardType?: 'default' | 'phone-pad'; autoCapitalize?: 'none' | 'sentences' | 'words';
  }) => (
    <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '500', color: textSecondary, marginBottom: 8 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{ borderWidth: 1, borderColor: inputBorder, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: textPrimary, backgroundColor: inputBg }}
      />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: textPrimary, marginBottom: 24 }}>
        {t.profile.editProfile}
      </Text>

      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <TouchableOpacity onPress={handlePickImage} style={{ position: 'relative' }}>
          <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: avatarBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={{ width: 128, height: 128 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 36, fontWeight: '700', color: textPrimary }}>
                {firstName?.[0]}{lastName?.[0]}
              </Text>
            )}
          </View>
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>{t.profile.changePhoto}</Text>
      </View>

      {error && (
        <View style={{ backgroundColor: isDark ? '#450a0a' : '#fef2f2', borderWidth: 1, borderColor: isDark ? '#7f1d1d' : '#fecaca', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: isDark ? '#f87171' : '#dc2626' }}>{error}</Text>
        </View>
      )}

      <Field label={t.profile.firstName} value={firstName} onChange={setFirstName} autoCapitalize="words" />
      <Field label={t.profile.lastName} value={lastName} onChange={setLastName} autoCapitalize="words" />
      <Field label={t.profile.phone} value={phone} onChange={setPhone} keyboardType="phone-pad" autoCapitalize="none" />

      <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderWidth: 1, borderColor: isDark ? '#1e40af' : '#bfdbfe', borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <Text style={{ color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: 13 }}>
          ℹ️ {t.profile.emailReadOnly}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={isUpdating}
        style={{ backgroundColor: '#0CC25F', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 }}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{t.common.save}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        disabled={isUpdating}
        style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center' }}
      >
        <Text style={{ color: isDark ? '#94a3b8' : '#374151', fontWeight: '600', fontSize: 16 }}>
          {t.common.cancel}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;
