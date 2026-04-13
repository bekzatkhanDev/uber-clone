import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import PhoneInput from "@/components/PhoneInput";
import { icons, images } from "@/constants";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useCarBrands, useCarTypes, useCreateDriverProfile, useAddCar } from "@/hooks/useDriver";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/i18n/I18nProvider";
import { navigateByRole } from "@/lib/utils";

const TOTAL_STEPS = 3;

const DriverRegisterWeb = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 — account
  const [account, setAccount] = useState({
    first_name: "", last_name: "", phone: "", password: "",
  });

  // Step 2 — driver profile
  const [profile, setProfile] = useState({
    license_number: "", experience_years: "",
  });

  // Step 3 — car
  const [car, setCar] = useState({
    brand_id: 0, car_type_id: 0, year: "", plate_number: "",
  });

  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: createProfile, isPending: isCreatingProfile } = useCreateDriverProfile();
  const { mutate: addCar, isPending: isAddingCar } = useAddCar();
  const { data: brands = [], isLoading: brandsLoading } = useCarBrands();
  const { data: carTypes = [], isLoading: typesLoading } = useCarTypes();
  const { setAuthenticated } = useAuthStore();

  // ─── Step 1: Register + auto-login ────────────────────────────────────────
  const handleStep1 = () => {
    if (!account.first_name || !account.last_name || !account.phone || !account.password) {
      setErrorMessage(t.auth.fillAllFields);
      return;
    }
    setErrorMessage(null);
    register(
      {
        phone: account.phone,
        password: account.password,
        first_name: account.first_name,
        last_name: account.last_name,
        role: 'driver',
      },
      {
        onSuccess: () => {
          login(
            { phone: account.phone, password: account.password },
            {
              onSuccess: () => {
                setAuthenticated(true);
                setStep(2);
              },
              onError: () => setErrorMessage(t.auth.loginFailed),
            }
          );
        },
        onError: (err: any) => {
          let message = t.auth.registrationFailed;
          if (err?.status === 400) message = t.auth.phoneAlreadyRegistered;
          else if (err?.message) message = err.message;
          setErrorMessage(message);
        },
      }
    );
  };

  // ─── Step 2: Create driver profile ────────────────────────────────────────
  const handleStep2 = () => {
    const years = parseInt(profile.experience_years, 10);
    if (!profile.license_number || !profile.experience_years) {
      setErrorMessage(t.auth.fillAllFields);
      return;
    }
    if (isNaN(years) || years < 0) {
      setErrorMessage(t.auth.experienceYears);
      return;
    }
    setErrorMessage(null);
    createProfile(
      { license_number: profile.license_number, experience_years: years },
      {
        onSuccess: () => setStep(3),
        onError: (err: any) => {
          setErrorMessage(
            err?.responseData?.license_number?.[0] ?? err?.message ?? t.auth.registrationFailed
          );
        },
      }
    );
  };

  // ─── Step 3: Add car ───────────────────────────────────────────────────────
  const handleStep3 = () => {
    const year = parseInt(car.year, 10);
    if (!car.brand_id || !car.car_type_id || !car.year || !car.plate_number) {
      setErrorMessage(t.auth.fillAllFields);
      return;
    }
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      setErrorMessage(t.auth.carYear);
      return;
    }
    setErrorMessage(null);
    addCar(
      { brand_id: car.brand_id, car_type_id: car.car_type_id, year, plate_number: car.plate_number },
      {
        onSuccess: () => setShowSuccessModal(true),
        onError: (err: any) => {
          setErrorMessage(
            err?.responseData?.plate_number?.[0] ?? err?.message ?? t.auth.registrationFailed
          );
        },
      }
    );
  };

  const stepLabels = [t.auth.accountInfo, t.auth.driverLicense, t.auth.vehicleInfo];
  const isStep1Busy = isRegistering || isLoggingIn;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' }}>

          {/* Header image */}
          <View style={{ position: 'relative', width: '100%', height: 180 }}>
            <Image source={images.signUpCar} style={{ width: '100%', height: 180 }} resizeMode="cover" />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              {t.auth.createDriverAccount}
            </Text>
          </View>

          {/* Step indicator */}
          <View className="flex-row items-center justify-center px-5 pt-5 pb-2">
            {[1, 2, 3].map((s) => (
              <View key={s} className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step >= s ? "bg-primary-500" : "bg-gray-200"
                  }`}
                >
                  <Text className={`text-sm font-JakartaBold ${step >= s ? "text-white" : "text-gray-400"}`}>
                    {s}
                  </Text>
                </View>
                {s < 3 && (
                  <View className={`h-[2px] w-12 mx-1 ${step > s ? "bg-primary-500" : "bg-gray-200"}`} />
                )}
              </View>
            ))}
          </View>
          <Text className="text-center text-sm text-gray-500 font-Jakarta mb-4">
            {t.auth.step} {step} {t.auth.of} {TOTAL_STEPS} — {stepLabels[step - 1]}
          </Text>

          <View className="p-5">
            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <>
                <InputField
                  label={t.auth.firstName}
                  placeholder={t.auth.enterFirstName}
                  icon={icons.person}
                  value={account.first_name}
                  onChangeText={(v) => setAccount({ ...account, first_name: v })}
                />
                <InputField
                  label={t.auth.lastName}
                  placeholder={t.auth.enterLastName}
                  icon={icons.person}
                  value={account.last_name}
                  onChangeText={(v) => setAccount({ ...account, last_name: v })}
                />
                <PhoneInput
                  label={t.auth.phoneNumber}
                  icon={icons.call}
                  value={account.phone}
                  onChangeText={(v) => setAccount({ ...account, phone: v })}
                />
                <InputField
                  label={t.auth.password}
                  placeholder={t.auth.enterPassword}
                  icon={icons.lock}
                  secureTextEntry
                  value={account.password}
                  onChangeText={(v) => setAccount({ ...account, password: v })}
                />
                {errorMessage && <ErrorBox message={errorMessage} />}
                <CustomButton
                  title={isStep1Busy ? t.auth.registering : t.auth.continue}
                  onPress={handleStep1}
                  className="mt-6"
                  disabled={isStep1Busy}
                />
                <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")} className="mt-8">
                  <Text className="text-lg text-center text-general-200">
                    {t.auth.alreadyHaveAccount}{" "}
                    <Text className="text-primary-500">{t.auth.logIn}</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step 2: License ── */}
            {step === 2 && (
              <>
                <InputField
                  label={t.auth.licenseNumber}
                  placeholder={t.auth.licenseNumberPlaceholder}
                  icon={icons.profile}
                  value={profile.license_number}
                  onChangeText={(v) => setProfile({ ...profile, license_number: v })}
                />
                <InputField
                  label={t.auth.experienceYears}
                  placeholder={t.auth.experienceYearsPlaceholder}
                  icon={icons.star}
                  keyboardType="numeric"
                  value={profile.experience_years}
                  onChangeText={(v) => setProfile({ ...profile, experience_years: v })}
                />
                {errorMessage && <ErrorBox message={errorMessage} />}
                <CustomButton
                  title={isCreatingProfile ? t.auth.profileCreating : t.auth.continue}
                  onPress={handleStep2}
                  className="mt-6"
                  disabled={isCreatingProfile}
                />
                <TouchableOpacity onPress={() => setStep(1)} className="mt-4">
                  <Text className="text-center text-general-200">{t.auth.back}</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Step 3: Car ── */}
            {step === 3 && (
              <>
                {/* Brand selection */}
                <Text className="text-lg font-JakartaSemiBold mb-2">{t.auth.selectBrand}</Text>
                {brandsLoading ? (
                  <Text className="text-gray-400 text-sm mb-4">{t.common.loading}</Text>
                ) : (
                  <View className="flex-row flex-wrap mb-4">
                    {brands.map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        onPress={() => setCar({ ...car, brand_id: b.id })}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                          car.brand_id === b.id
                            ? "bg-primary-500 border-primary-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={`text-sm font-JakartaSemiBold ${
                          car.brand_id === b.id ? "text-white" : "text-gray-700"
                        }`}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Car type selection */}
                <Text className="text-lg font-JakartaSemiBold mb-2">{t.auth.selectCarType}</Text>
                {typesLoading ? (
                  <Text className="text-gray-400 text-sm mb-4">{t.common.loading}</Text>
                ) : (
                  <View className="flex-row flex-wrap mb-4">
                    {carTypes.map((ct) => (
                      <TouchableOpacity
                        key={ct.id}
                        onPress={() => setCar({ ...car, car_type_id: ct.id })}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                          car.car_type_id === ct.id
                            ? "bg-primary-500 border-primary-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={`text-sm font-JakartaSemiBold ${
                          car.car_type_id === ct.id ? "text-white" : "text-gray-700"
                        }`}>
                          {ct.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <InputField
                  label={t.auth.carYear}
                  placeholder={t.auth.carYearPlaceholder}
                  icon={icons.star}
                  keyboardType="numeric"
                  value={car.year}
                  onChangeText={(v) => setCar({ ...car, year: v })}
                />
                <InputField
                  label={t.auth.plateNumber}
                  placeholder={t.auth.plateNumberPlaceholder}
                  icon={icons.marker}
                  value={car.plate_number}
                  onChangeText={(v) => setCar({ ...car, plate_number: v.toUpperCase() })}
                />
                {errorMessage && <ErrorBox message={errorMessage} />}
                <CustomButton
                  title={isAddingCar ? t.auth.carRegistering : t.auth.completeRegistration}
                  onPress={handleStep3}
                  className="mt-6"
                  disabled={isAddingCar}
                />
                <TouchableOpacity onPress={() => setStep(2)} className="mt-4">
                  <Text className="text-center text-general-200">{t.auth.back}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Success modal overlay */}
      {showSuccessModal && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View className="bg-white rounded-2xl p-8 w-full items-center" style={{ maxWidth: 360 }}>
            <Image source={images.check} style={{ width: 110, height: 110, marginBottom: 16 }} resizeMode="contain" />
            <Text className="text-3xl font-JakartaBold text-center">{t.auth.driverAccountCreated}</Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              {t.auth.driverRegistrationSuccess}
            </Text>
            <CustomButton
              title={t.auth.goToDashboard}
              onPress={() => navigateByRole(['driver'])}
              className="mt-5 w-full"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const ErrorBox = ({ message }: { message: string }) => (
  <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
    <Text className="text-red-600 text-sm">{message}</Text>
  </View>
);

export default DriverRegisterWeb;
