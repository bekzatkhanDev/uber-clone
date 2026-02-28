// Дефолтные координаты (Астана) и интерфейс для адреса

export const DEFAULT_LOCATION = {
  latitude: 51.1694,
  longitude: 71.4491,
  address: 'Pushkina 11, Astana',
};

export const DEFAULT_LATITUDE = 51.1694;
export const DEFAULT_LONGITUDE = 71.4491;

export const FALLBACK_LATITUDE = 43.2220;
export const FALLBACK_LONGITUDE = 76.9455;

export interface LocationCoords {
  latitude: number;
  longitude: number;
  address: string;
}
