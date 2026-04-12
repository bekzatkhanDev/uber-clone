// Edit Profile Screen - General Profile Update (Customers & Drivers)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { useCurrentUser, useUpdateProfile, UserProfileData } from '@/hooks/useUser';
import { useTranslation } from '@/i18n/I18nProvider';

const EditProfile = () => {
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(currentUser?.profile_photo || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // For web, we'll need to fetch the blob
        if (asset.uri) {
          setProfilePhoto(asset.uri);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert(t.common.error, t.profile.imagePickError);
    }
  };

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError(t.profile.nameRequired);
      return;
    }

    const updateData: UserProfileData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
    };

    // If profile photo changed and it's a local file, we need to handle it differently on web
    // For now, we'll send the URI string if it's different from current
    if (profilePhoto && profilePhoto !== currentUser?.profile_photo) {
      // On web, you might need to convert the URI to a File/Blob
      // This is a simplified version - in production you'd handle the file conversion properly
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text className="text-2xl font-JakartaBold mb-6">{t.profile.editProfile}</Text>

      {/* Profile Photo */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <TouchableOpacity onPress={handlePickImage}>
          <View className="w-32 h-32 rounded-full bg-gray-200 justify-center items-center overflow-hidden">
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={{ width: 128, height: 128 }}
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl font-JakartaBold">
                {firstName?.[0]}{lastName?.[0]}
              </Text>
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-blue-500 w-10 h-10 rounded-full justify-center items-center">
            <Text className="text-white text-xl">📷</Text>
          </View>
        </TouchableOpacity>
        <Text className="text-gray-500 mt-3">{t.profile.changePhoto}</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      {/* Form Fields */}
      <View className="bg-white rounded-xl p-5 mb-4">
        <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
          {t.profile.firstName}
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base"
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t.profile.firstName}
          autoCapitalize="words"
        />
      </View>

      <View className="bg-white rounded-xl p-5 mb-4">
        <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
          {t.profile.lastName}
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base"
          value={lastName}
          onChangeText={setLastName}
          placeholder={t.profile.lastName}
          autoCapitalize="words"
        />
      </View>

      <View className="bg-white rounded-xl p-5 mb-4">
        <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
          {t.profile.phone}
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base"
          value={phone}
          onChangeText={setPhone}
          placeholder={t.profile.phone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
      </View>

      {/* Note about read-only fields */}
      <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <Text className="text-blue-700 text-sm">
          ℹ️ {t.profile.emailReadOnly}
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={isUpdating}
        className="bg-[#0CC25F] rounded-xl p-4 items-center"
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-JakartaSemiBold text-lg">
            {t.common.save}
          </Text>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        disabled={isUpdating}
        className="bg-gray-200 rounded-xl p-4 items-center mt-3"
      >
        <Text className="text-gray-700 font-JakartaSemiBold text-lg">
          {t.common.cancel}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;
