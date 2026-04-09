// Native map utilities — OSRM for routing (free, no API key required)
import { Driver, MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

const osrmRoute = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ durationSec: number; coordinates: number[][] } | null> => {
  try {
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    return {
      durationSec: route.duration,
      coordinates: route.geometry.coordinates, // [[lng, lat], ...]
    };
  } catch {
    return null;
  }
};

// Маркеры водителей по данным с бэка (для демо — небольшой случайный сдвиг)
export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

// Регион карты по пользователю и точке назначения
export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  const fallback = {
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  if (userLatitude == null || userLongitude == null) {
    return fallback;
  }

  if (destinationLatitude == null || destinationLongitude == null) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const latDelta = (maxLat - minLat) * 1.5;
  const lngDelta = (maxLng - minLng) * 1.5;

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: Math.max(latDelta, 0.02),
    longitudeDelta: Math.max(lngDelta, 0.02),
  };
};

// Время по каждому водителю через OSRM (free, no API key)
export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}): Promise<MarkerData[]> => {
  if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
    return markers.map((m) => ({ ...m, time: 5, price: "$5.00" }));
  }

  const results = await Promise.allSettled(
    markers.map(async (marker) => {
      const [toUser, toDest] = await Promise.all([
        osrmRoute(marker.latitude, marker.longitude, userLatitude, userLongitude),
        osrmRoute(userLatitude, userLongitude, destinationLatitude, destinationLongitude),
      ]);

      const driverToUserMin = (toUser?.durationSec ?? 300) / 60;
      const userToDestMin = (toDest?.durationSec ?? 300) / 60;
      const totalMin = driverToUserMin + userToDestMin;
      const price = (totalMin * 0.5).toFixed(2);

      return { ...marker, time: Math.round(totalMin), price: `$${price}` };
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<MarkerData>).value);
};

// Геометрия маршрута между двумя точками через OSRM
// Returns [lng, lat] pairs — same shape as before
export const getRouteGeometry = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number[][] | null> => {
  const result = await osrmRoute(fromLat, fromLng, toLat, toLng);
  return result?.coordinates ?? null;
};
