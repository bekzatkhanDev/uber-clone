import { create } from 'zustand';
import * as storage from '@/lib/storage';

import en from './en.json';
import ru from './ru.json';
import kk from './kk.json';

export type Language = 'en' | 'ru' | 'kk';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    close: string;
    next: string;
    back: string;
    skip: string;
    done: string;
    search: string;
  };
  auth: {
    welcome: string;
    signIn: string;
    signUp: string;
    logIn: string;
    signOut: string;
    phoneNumber: string;
    password: string;
    enterPassword: string;
    firstName: string;
    lastName: string;
    enterFirstName: string;
    enterLastName: string;
    createAccount: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    registering: string;
    signingIn: string;
    accountCreated: string;
    registrationSuccess: string;
    goToHome: string;
    fillAllFields: string;
    enterPhoneAndPassword: string;
    invalidCredentials: string;
    registrationFailed: string;
    phoneAlreadyRegistered: string;
    loginFailed: string;
    chooseRole: string;
    chooseRoleSubtitle: string;
    iAmRider: string;
    riderDescription: string;
    iAmDriver: string;
    driverDescription: string;
    createDriverAccount: string;
    driverAccountCreated: string;
    driverRegistrationSuccess: string;
    goToDashboard: string;
    wantToDrive: string;
    registerAsDriver: string;
    step: string;
    of: string;
    accountInfo: string;
    driverLicense: string;
    vehicleInfo: string;
    licenseNumber: string;
    licenseNumberPlaceholder: string;
    experienceYears: string;
    experienceYearsPlaceholder: string;
    selectBrand: string;
    selectCarType: string;
    carYear: string;
    carYearPlaceholder: string;
    plateNumber: string;
    plateNumberPlaceholder: string;
    continue: string;
    back: string;
    completeRegistration: string;
    profileCreating: string;
    carRegistering: string;
  };
  onboarding: {
    title1: string;
    description1: string;
    title2: string;
    description2: string;
    title3: string;
    description3: string;
    getStarted: string;
  };
  home: {
    welcome: string;
    whereTo: string;
  };
  findRide: {
    distance: string;
    from: string;
    to: string;
    selectTariff: string;
    findNow: string;
    loadingTariffs: string;
    starting: string;
  };
  confirmRide: {
    rideSummary: string;
    pickup: string;
    destination: string;
    tariff: string;
    distance: string;
    duration: string;
    estimatedPrice: string;
    driver: string;
    notSet: string;
    notSelected: string;
    willBeAssigned: string;
    confirmRide: string;
    driverAssigned: string;
    priceEstimate: string;
  };
  bookRide: {
    title: string;
    rideInformation: string;
    findingDriver: string;
    driverAssigned: string;
    pending: string;
    waitingForDriver: string;
    lookingForDrivers: string;
    processing: string;
    ridePrice: string;
    status: string;
    failedToCreate: string;
    missingData: string;
  };
  profile: {
    title: string;
    currentLocation: string;
    account: string;
    editProfile: string;
    phoneNumbers: string;
    rideHistory: string;
    payments: string;
    paymentMethods: string;
    savedPlaces: string;
    signOut: string;
    language: string;
    firstName: string;
    lastName: string;
    phone: string;
    changePhoto: string;
    emailReadOnly: string;
    nameRequired: string;
    updateSuccess: string;
    updateError: string;
    imagePickError: string;
  };
  driver: {
    editProfile: string;
    goOnline: string;
    onlineStatus: string;
    offlineStatus: string;
    licenseInfo: string;
    licenseNumber: string;
    licenseExpiry: string;
    licenseExpiringSoon: string;
    yearsOfExperience: string;
    vehicleInfo: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
    licenseNumberRequired: string;
    vehicleModelRequired: string;
    vehiclePlateRequired: string;
    profileUpdateSuccess: string;
    profileUpdateError: string;
  };
  currency: {
    symbol: string;
    code: string;
  };
}

const translations: Record<Language, Translations> = {
  en: en as Translations,
  ru: ru as Translations,
  kk: kk as Translations,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  kk: 'Қазақша',
};

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translations;
}

// On web, localStorage is synchronous — read the saved language instantly
// so components render with the correct language from the very first paint.
const getInitialLanguage = (): Language => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved && translations[saved]) return saved;
    }
  } catch {
    // localStorage unavailable (SSR, private mode, etc.)
  }
  return 'ru';
};

const initialLanguage = getInitialLanguage();

export const useI18n = create<I18nStore>((set) => ({
  language: initialLanguage,
  setLanguage: async (language: Language) => {
    try {
      await storage.setItem('language', language);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
    set({ language, t: translations[language] });
  },
  t: translations[initialLanguage],
}));

// Initialize language from storage
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await storage.getItem('language') as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
  } catch (e) {
    console.error('Failed to load language preference:', e);
  }
  return 'ru' as Language; // Default to Russian
};

// Helper function to get translations for a specific language
export const getTranslations = (language: Language): Translations => {
  return translations[language];
};
