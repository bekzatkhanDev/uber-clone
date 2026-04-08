// Web place search — Nominatim (OpenStreetMap), no API key required
import { useQuery } from '@tanstack/react-query';

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  point: { lat: number; lon: number };
}

const searchPlaces = async (query: string): Promise<PlaceSearchResult[]> => {
  if (query.length < 3) return [];

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}` +
    `&format=json&addressdetails=1&limit=6&countrycodes=kz` +
    `&accept-language=ru,en`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'TaxiApp/1.0' },
  });

  if (!response.ok) return [];

  const data: any[] = await response.json();

  return data.map((item) => {
    const addr = item.address ?? {};
    const nameParts = [
      addr.road || addr.pedestrian,
      addr.house_number,
    ].filter(Boolean);
    const name =
      nameParts.length > 0
        ? nameParts.join(', ')
        : item.display_name.split(',')[0];

    return {
      id: String(item.place_id),
      name,
      address: item.display_name,
      point: { lat: parseFloat(item.lat), lon: parseFloat(item.lon) },
    };
  });
};

export const usePlaceSearch = (query: string) => {
  return useQuery({
    queryKey: ['place-search-osm', query],
    queryFn: () => searchPlaces(query),
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
