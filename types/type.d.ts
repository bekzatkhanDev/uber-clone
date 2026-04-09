import { TextInputProps, TouchableOpacityProps } from "react-native";

// Водитель — это пользователь с ролью driver.
// Его идентификатор = user.id (число)
declare interface Driver {
  id: number; // = user.id
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  rating: number;
}

// MarkerData использует тот же id (user.id водителя)
declare interface MarkerData {
  latitude: number;
  longitude: number;
  id: number; // = driver's user.id
  title: string;
  profile_image_url: string;
  car_image_url: string;
  rating: number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
  distance_km?: number;
  // Legacy fields from NearbyDriver API response
  lat?: number;
  lng?: number;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
  selectedDriver?: number | null; // user.id водителя
  onMapReady?: () => void;
}

// Ride — клиентская модель поездки
declare interface Ride {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: 'pending' | 'paid' | 'failed';
  driver_id: number | null;
  user_id: number;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
  } | null;
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}

declare interface PaymentProps {
  fullName: string;
  email: string;
  amount: string;
  driverId: number; // = user.id водителя
  rideTime: number;
  tripId: string;
}

declare interface Tariff {
  id: number;
  code: string;
  base_price: string;
  price_per_km: string;
  price_per_min: string;
  min_price: string;
  is_active: boolean;
}

declare interface EstimateData {
  distance_km: number;
  duration_min: number;
  price: number;
  route_geometry?: string;
  is_estimate?: boolean;
}

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  selectedTariff: Tariff | null;
  estimate: EstimateData | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  clearDestination: () => void;
  setSelectedTariff: (tariff: Tariff) => void;
  clearSelectedTariff: () => void;
  setEstimate: (estimate: EstimateData | null) => void;
  clearEstimate: () => void;
}

declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null; // user.id
  setSelectedDriver: (driverId: number) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
  item: MarkerData;
  selected: number; // selected driver's user.id
  setSelected: () => void;
}

// 2GIS Map Types
declare interface DMapRegion {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
}

declare interface RouteGeometry {
  coordinates: number[][]; // Array of [longitude, latitude] pairs
  distance?: number; // in meters
  duration?: number; // in seconds
}
