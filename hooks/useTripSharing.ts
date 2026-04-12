// Trip sharing hooks for generating and managing share tokens
import { useState, useCallback, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export interface ShareToken {
  token: string;
  share_url: string;
  expires_at: string;
  accessed_count: number;
}

// Matches TripSharePublicSerializer / TripDetailSerializer on the backend
export interface PublicTripData {
  id: string;
  status: string;
  customer: { id: number; phone: string; first_name: string; last_name: string } | null;
  driver: { id: number; phone: string; first_name: string; last_name: string } | null;
  car: {
    id: number;
    brand: { name: string; manufacturer: string };
    car_type: { code: string; description: string };
    plate_number: string;
    year: number;
  } | null;
  tariff: { code: string; base_price: string } | null;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number | null;
  price: string | null;
  created_at: string;
}

// Create a new share token
export const useCreateShareToken = (tripUuid: string) => {
  const [shareToken, setShareToken] = useState<ShareToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`/trips/${tripUuid}/share-token/`, {
        method: 'POST',
      });
      setShareToken(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create share token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tripUuid]);

  return { shareToken, isLoading, error, createToken };
};

// List existing share tokens for a trip
export const useShareTokens = (tripUuid: string) => {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`/trips/${tripUuid}/share-tokens/`);
      setTokens(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load share tokens');
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [tripUuid]);

  useEffect(() => {
    if (tripUuid) {
      refreshTokens();
    }
  }, [tripUuid, refreshTokens]);

  return { tokens, isLoading, error, refreshTokens };
};

// Fetch public trip data using share token (no auth required)
export const usePublicTripData = (shareToken: string | null, enabled: boolean = true) => {
  const [tripData, setTripData] = useState<PublicTripData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const refreshData = useCallback(async () => {
    if (!shareToken || !enabled) {
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/trips/share/${shareToken}/`);
      
      if (!response.ok) {
        if (response.status === 410) {
          setIsExpired(true);
          setError('This tracking link has expired');
        } else if (response.status === 404) {
          setError('Invalid or expired token');
        } else {
          setError('Failed to load trip data');
        }
        setTripData(null);
        return;
      }

      const data = await response.json();
      setTripData(data);
      setError(null);
      setIsExpired(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip data');
      setTripData(null);
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, enabled]);

  useEffect(() => {
    if (shareToken && enabled) {
      refreshData();
    }
  }, [shareToken, enabled, refreshData]);

  // Auto-refresh every 10 seconds when trip is in progress
  useEffect(() => {
    if (!shareToken || !enabled || !tripData || tripData.trip_status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [shareToken, enabled, tripData, refreshData]);

  return { tripData, isLoading, error, isExpired, refreshData };
};

// Copy share URL to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

// Share via native share sheet (web + mobile)
export const shareViaNative = async (url: string, title: string = 'Track my trip'): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      await (navigator as any).share({
        title,
        text: 'Track my live trip location',
        url,
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to share:', err);
    return false;
  }
};
