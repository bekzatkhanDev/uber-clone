// Web map utilities — OSRM for routing (free, no API key required)
import { MarkerData } from "@/types/type";

// OSRM public demo router — free, no API key
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

// Returns [lng, lat] pairs — same shape as native version
export const getRouteGeometry = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number[][] | null> => {
  const result = await osrmRoute(fromLat, fromLng, toLat, toLng);
  return result?.coordinates ?? null;
};

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
