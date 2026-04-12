// Driver Profile Edit Screen - Professional Details Update
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';

import { useUpdateDriverProfile, DriverProfileData } from '@/hooks/useUser';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { useTranslation } from '@/i18n/I18nProvider';

const DriverProfileEdit = () => {
  const { t } = useTranslation();
  const { data: dashboard, isLoading: dashboardLoading } = useDriverDashboard();
  const { mutate: updateDriverProfile, isPending: isUpdating } = useUpdateDriverProfile();
  
  const driverProfile = dashboard?.driver_profile;
  
  // Form state
  const [licenseNumber, setLicenseNumber] = useState(driverProfile?.license_number || '');
  const [licenseExpiry, setLicenseExpiry] = useState(driverProfile?.license_expiry || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    driverProfile?.experience_years?.toString() || ''
  );
  const [vehicleModel, setVehicleModel] = useState(driverProfile?.car_model || '');
  const [vehiclePlate, setVehiclePlate] = useState(driverProfile?.car_plate || '');
  const [vehicleColor, setVehicleColor] = useState(driverProfile?.car_color || '');
  const [isAvailable, setIsAvailable] = useState(driverProfile?.is_available ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!licenseNumber.trim()) {
      setError(t.driver.licenseNumberRequired);
      return;
    }

    if (!vehicleModel.trim()) {
      setError(t.driver.vehicleModelRequired);
      return;
    }

    if (!vehiclePlate.trim()) {
      setError(t.driver.vehiclePlateRequired);
      return;
    }

    const updateData: DriverProfileData = {
      license_number: licenseNumber.trim(),
      license_expiry: licenseExpiry.trim() || undefined,
      years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
      vehicle_model: vehicleModel.trim(),
      vehicle_plate: vehiclePlate.trim(),
      vehicle_color: vehicleColor.trim() || undefined,
      is_available: isAvailable,
    };

    updateDriverProfile(updateData, {
      onSuccess: () => {
        Alert.alert(t.common.success, t.driver.profileUpdateSuccess);
        router.back();
      },
      onError: (err: any) => {
        const errorMsg = err?.message || t.driver.profileUpdateError;
        setError(errorMsg);
        Alert.alert(t.common.error, errorMsg);
      },
    });
  };

  // Check if license is expiring soon (within 30 days)
  const isLicenseExpiringSoon = () => {
    if (!licenseExpiry) return false;
    const expiryDate = new Date(licenseExpiry);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= now;
  };

  if (dashboardLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text className="text-2xl font-JakartaBold mb-6">{t.driver.editProfile}</Text>

      {/* Availability Toggle */}
      <View className="bg-white rounded-xl p-5 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-JakartaSemiBold">{t.driver.goOnline}</Text>
            <Text className="text-gray-500 text-sm mt-1">
              {isAvailable ? t.driver.onlineStatus : t.driver.offlineStatus}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#ccc', true: '#0CC25F' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      {/* License Information */}
      <View className="bg-white rounded-xl p-5 mb-4">
        <Text className="text-base font-JakartaSemiBold mb-4">{t.driver.licenseInfo}</Text>
        
        <View className="mb-4">
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.licenseNumber}
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder={t.driver.licenseNumber}
            autoCapitalize="characters"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.licenseExpiry}
          </Text>
          <TextInput
            className={`border rounded-lg px-4 py-3 text-base ${
              isLicenseExpiringSoon() ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
            }`}
            value={licenseExpiry}
            onChangeText={setLicenseExpiry}
            placeholder="YYYY-MM-DD"
          />
          {isLicenseExpiringSoon() && (
            <Text className="text-yellow-600 text-sm mt-2">
              ⚠️ {t.driver.licenseExpiringSoon}
            </Text>
          )}
        </View>

        <View>
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.yearsOfExperience}
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base"
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            placeholder={t.driver.yearsOfExperience}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Vehicle Information */}
      <View className="bg-white rounded-xl p-5 mb-4">
        <Text className="text-base font-JakartaSemiBold mb-4">{t.driver.vehicleInfo}</Text>
        
        <View className="mb-4">
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.vehicleModel}
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            placeholder={t.driver.vehicleModel}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.vehiclePlate}
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            placeholder={t.driver.vehiclePlate}
            autoCapitalize="characters"
          />
        </View>

        <View>
          <Text className="text-sm font-JakartaMedium text-gray-500 mb-2">
            {t.driver.vehicleColor}
          </Text>
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-3 text-base"
            value={vehicleColor}
            onChangeText={setVehicleColor}
            placeholder={t.driver.vehicleColor}
            autoCapitalize="words"
          />
        </View>
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

export default DriverProfileEdit;
