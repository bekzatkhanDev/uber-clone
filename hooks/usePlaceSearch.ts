// Поиск адресов через Google Places (Autocomplete + Details для координат)
import { useQuery } from '@tanstack/react-query';

const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const DEFAULT_CITY = 'Astana';

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  point: {
    lat: number;
    lon: number;
  };
}

interface SearchParams {
  query: string;
}

const searchPlaces = async ({ query }: SearchParams): Promise<PlaceSearchResult[]> => {
  if (query.length < 3 || !googleApiKey) {
    return [];
  }

  const fullQuery = `${DEFAULT_CITY}, ${query}`;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    fullQuery
  )}&types=address&components=country:kz&key=${googleApiKey}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('Google Places API error:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();

  if (data.predictions && Array.isArray(data.predictions)) {
    const items: PlaceSearchResult[] = [];

    for (const prediction of data.predictions.slice(0, 5)) {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry&key=${googleApiKey}`;
      
      try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.result?.geometry?.location) {
          items.push({
            id: prediction.place_id,
            name: prediction.structured_formatting?.main_text || prediction.description,
            address: prediction.description || '',
            point: {
              lat: detailsData.result.geometry.location.lat,
              lon: detailsData.result.geometry.location.lng,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
    
    return items;
  }

  return [];
};

export const usePlaceSearch = (query: string) => {
  return useQuery({
    queryKey: ['place-search', query],
    queryFn: () => searchPlaces({ 
      query,
    }),
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
