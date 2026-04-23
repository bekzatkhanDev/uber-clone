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
  tabs: {
    home: string;
    rides: string;
    chat: string;
    profile: string;
    trips: string;
    earnings: string;
  };
  rides: {
    allRides: string;
    noRecentRides: string;
  };
  chat: {
    messages: string;
    loadingChats: string;
    activeRide: string;
    recentTrips: string;
    noConversations: string;
    chatHistoryEmpty: string;
    bookARide: string;
    rideWith: string;
    trip: string;
    tapToOpenChat: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    noActiveTripTitle: string;
    noActiveTripDesc: string;
    loadingChat: string;
    chatUnavailableTitle: string;
    chatUnavailableDesc: string;
    passengerChat: string;
    chatWith: string;
    live: string;
    connecting: string;
    polling: string;
    noMessagesYet: string;
    typeMessage: string;
    failedToSend: string;
    tripChat: string;
    waitingForDriver: string;
    chatOpensWhenAccepted: string;
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
    switchToDriverMode: string;
    defaultPaymentBank: string;
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
    profileTitle: string;
    driverDetails: string;
    license: string;
    experience: string;
    rating: string;
    myCars: string;
    noCars: string;
    carActive: string;
    carInactive: string;
    switchToPassenger: string;
    signingOut: string;
    myTrips: string;
    noTrips: string;
    earnings: string;
    today: string;
    sevenDays: string;
    month: string;
    allTime: string;
    tipsTitle: string;
    tipsBody: string;
    driverMode: string;
    online: string;
    offline: string;
    activeAcceptingRides: string;
    notAcceptingRides: string;
    goOffline: string;
    headToPickup: string;
    enRouteToDestination: string;
    passenger: string;
    distanceLabel: string;
    fareLabel: string;
    tariffLabel: string;
    pickedUp: string;
    completeRide: string;
    waitingForRequests: string;
    selectCarTitle: string;
    noCarsAvailable: string;
  };
  payment: {
    title: string;
    passenger: string;
    amount: string;
    selectMethod: string;
    processing: string;
    payWith: string;
    payWithCash: string;
    cash: string;
    rideBooked: string;
    tripConfirmed: string;
    paidVia: string;
    paidWithCash: string;
    backHome: string;
    paymentMethod: string;
    failed: string;
    methods: {
      cash: string;
      kaspi: string;
      halyk: string;
      freedom: string;
    };
  };
  currency: {
    symbol: string;
    code: string;
  };
  admin: {
    dashboard: {
      title: string;
      subtitle: string;
      totalUsers: string;
      totalDrivers: string;
      onlineDrivers: string;
      tripsToday: string;
      revenueToday: string;
      recentTrips: string;
      viewAll: string;
      noTrips: string;
    };
    drivers: {
      title: string;
      searchPlaceholder: string;
      search: string;
      all: string;
      pending: string;
      active: string;
      suspended: string;
      yearsExp: string;
      online: string;
      noDriversFound: string;
    };
    trips: {
      title: string;
      searchPlaceholder: string;
      search: string;
      all: string;
      pending: string;
      accepted: string;
      inProgress: string;
      completed: string;
      cancelled: string;
      noTripsFound: string;
    };
    users: {
      title: string;
      searchPlaceholder: string;
      search: string;
      joined: string;
      noName: string;
      suspended: string;
      noUsersFound: string;
    };
    settings: {
      title: string;
      quickAccess: string;
      dashboard: string;
      dashboardDesc: string;
      manageUsers: string;
      manageUsersDesc: string;
      manageDrivers: string;
      manageDriversDesc: string;
      manageTrips: string;
      manageTripsDesc: string;
      session: string;
      signOut: string;
      signingOut: string;
      signOutDesc: string;
      confirmSignOut: string;
    };
    tariffs: {
      title: string;
      active: string;
      inactive: string;
      new: string;
      activeLabel: string;
      inactiveLabel: string;
      edit: string;
      activate: string;
      deactivate: string;
      base: string;
      perKm: string;
      perMin: string;
      minPrice: string;
      newTariff: string;
      editTariff: string;
      code: string;
      codePlaceholder: string;
      basePrice: string;
      basePricePlaceholder: string;
      pricePerKm: string;
      pricePerKmPlaceholder: string;
      pricePerMin: string;
      pricePerMinPlaceholder: string;
      minimumPrice: string;
      minimumPricePlaceholder: string;
      cancel: string;
      save: string;
      saving: string;
      noTariffs: string;
      noTariffsDesc: string;
      confirmActivate: string;
      confirmDeactivate: string;
      confirmActivateDesc: string;
      confirmDeactivateDesc: string;
    };
    common: {
      customer: string;
      driver: string;
      notSet: string;
      loading: string;
    };
  };
  tripShare: {
    title: string;
    subtitle: string;
    secureSharing: string;
    secureSharingDesc: string;
    generateLink: string;
    linkGenerated: string;
    expires: string;
    accessCount: string;
    copyLink: string;
    shareVia: string;
    generateNewLink: string;
    previousLinks: string;
    created: string;
    accessedTimes: string;
    expired: string;
    loadingLinks: string;
    error: string;
    helpText: string;
  };
  publicTrack: {
    loadingTrip: string;
    linkExpired: string;
    tripNotFound: string;
    linkExpiredDesc: string;
    unableToLoad: string;
    shareLinkInfo: string;
    lookingForDriver: string;
    driverAssigned: string;
    onRoute: string;
    tripCompleted: string;
    tripCancelled: string;
    liveMapView: string;
    updatesEvery10s: string;
    yourDriver: string;
    waitingForDriver: string;
    route: string;
    pickup: string;
    dropOff: string;
    tariff: string;
    aboutPage: string;
    aboutPageDesc: string;
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
