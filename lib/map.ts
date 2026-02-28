import { Driver, MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

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

// Время и примерная цена по каждому водителю через Google Directions
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
}) => {
  const missingCoords = !userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude;
  const missingApiKey = !GOOGLE_API_KEY;

  if (missingCoords || missingApiKey) {
    if (__DEV__) {
      if (missingCoords) console.log("Driver times: ждём координаты...");
      if (missingApiKey) console.log("Driver times: нет ключа Google, подставляем заглушки");
    }
    return markers.map(marker => ({
      ...marker,
      time: 5,
      price: '$5.00',
    }));
  }

  try {
    const timesPromises = markers.map(async (marker) => {
      const originDriver = `${marker.latitude},${marker.longitude}`;
      const destinationUser = `${userLatitude},${userLongitude}`;
      const originUser = `${userLatitude},${userLongitude}`;
      const destinationDest = `${destinationLatitude},${destinationLongitude}`;

      const toUserUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originDriver}&destination=${destinationUser}&mode=driving&key=${GOOGLE_API_KEY}`;
      const toDestUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originUser}&destination=${destinationDest}&mode=driving&key=${GOOGLE_API_KEY}`;

      const [resToUser, resToDest] = await Promise.all([
        fetch(toUserUrl),
        fetch(toDestUrl),
      ]);

      const [dataToUser, dataToDest] = await Promise.all([
        resToUser.json(),
        resToDest.json(),
      ]);

      const routeToUser = dataToUser?.routes?.[0]?.legs?.[0];
      const routeToDest = dataToDest?.routes?.[0]?.legs?.[0];

      if (!routeToUser?.duration?.value) {
        console.warn("No route from driver to user");
        return {
          ...marker,
          time: 5,
          price: '$5.00',
        };
      }

      if (!routeToDest?.duration?.value) {
        console.warn("No route from user to destination");
        return {
          ...marker,
          time: 5,
          price: '$5.00',
        };
      }

      const timeToUser = routeToUser.duration.value;
      const timeToDestination = routeToDest.duration.value;
      const totalTimeInMinutes = (timeToUser + timeToDestination) / 60;
      const price = (totalTimeInMinutes * 0.5).toFixed(2);

      return {
        ...marker,
        time: totalTimeInMinutes,
        price: `$${price}`,
      };
    });

    const results = await Promise.allSettled(timesPromises);
    const validResults: MarkerData[] = [];

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        validResults.push(result.value);
      }
    });

    return validResults;
  } catch (error) {
    console.error("Ошибка расчёта времени водителей:", error);
    return markers.map(marker => ({
      ...marker,
      time: 5,
      price: '$5.00',
    }));
  }
};

// Геометрия маршрута между двумя точками (Google Directions)
export const getRouteGeometry = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number[][] | null> => {
  if (!GOOGLE_API_KEY) {
    console.warn("Google API key is not configured");
    return null;
  }

  try {
    const origin = `${fromLat},${fromLng}`;
    const destination = `${toLat},${toLng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data?.routes?.[0]?.overview_polyline?.points) {
      const encoded = data.routes[0].overview_polyline.points;
      return decodePolyline(encoded);
    }

    return null;
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

// Декодирование полилинии Google в массив [lng, lat]
const decodePolyline = (encoded: string): number[][] => {
  const poly: number[][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push([lng / 1e5, lat / 1e5]);
  }

  return poly;
};
