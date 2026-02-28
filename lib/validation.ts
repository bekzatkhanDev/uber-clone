// Проверка координат для поездок и геолокации

const isValidLat = (latitude: number): boolean => latitude >= -90 && latitude <= 90;
const isValidLng = (longitude: number): boolean => longitude >= -180 && longitude <= 180;

export const validateCoordinates = (data: {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  start_lat?: number;
  start_lng?: number;
  end_lat?: number;
  end_lng?: number;
}): boolean => {
  if (data.lat !== undefined && data.lng !== undefined) {
    if (!isValidLat(data.lat) || !isValidLng(data.lng)) {
      throw new Error('Invalid coordinates: lat/lng out of range');
    }
    return true;
  }

  if (data.latitude !== undefined && data.longitude !== undefined) {
    if (!isValidLat(data.latitude) || !isValidLng(data.longitude)) {
      throw new Error('Invalid coordinates: latitude/longitude out of range');
    }
    return true;
  }

  if (data.start_lat !== undefined && data.start_lng !== undefined) {
    if (!isValidLat(data.start_lat) || !isValidLng(data.start_lng)) {
      throw new Error('Invalid start coordinates');
    }
  }

  if (data.end_lat !== undefined && data.end_lng !== undefined) {
    if (!isValidLat(data.end_lat) || !isValidLng(data.end_lng)) {
      throw new Error('Invalid end coordinates');
    }
  }

  return true;
};
