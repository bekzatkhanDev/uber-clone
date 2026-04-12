import { create } from "zustand";
import { DriverStore, LocationStore, MarkerData, Tariff, EstimateData } from "@/types/type";

export { useAuthStore } from "./authStore";

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => set({ selectedDriver: driverId }),
  setDrivers: (drivers: MarkerData[]) => set({ drivers }),
  clearSelectedDriver: () => set({ selectedDriver: null }),
}));

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  selectedTariff: null,
  estimate: null,
  selectedPaymentMethod: null,

  setUserLocation: ({ latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    });

    useDriverStore.getState().clearSelectedDriver();
    set({ estimate: null });
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    });

    useDriverStore.getState().clearSelectedDriver();
    set({ estimate: null });
  },

  clearDestination: () => {
    set({
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
      estimate: null,
    });
    useDriverStore.getState().clearSelectedDriver();
  },

  setSelectedTariff: (tariff: Tariff) => set({ selectedTariff: tariff }),
  clearSelectedTariff: () => set({ selectedTariff: null, estimate: null }),
  setEstimate: (estimate: EstimateData | null) => set({ estimate }),
  clearEstimate: () => set({ estimate: null }),
  setSelectedPaymentMethod: (method: string | null) => set({ selectedPaymentMethod: method }),
}));
