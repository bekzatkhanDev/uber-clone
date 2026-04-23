// Web map — Leaflet + OpenStreetMap (no API key required)
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import React, { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

// Load Leaflet only in the browser
let L: any;
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Polyline: any;
let useMap: any;

if (typeof window !== 'undefined') {
  // Inject Leaflet CSS once — avoids missing styles that cause tile/icon shifts
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  L = require('leaflet');
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Polyline = RL.Polyline;
  useMap = RL.useMap;

  // Fix broken default marker icons from webpack asset hashing
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

import { useNearbyDrivers, NearbyDriver } from "@/hooks/useLocation";
import { getRouteGeometry } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

// ─── Icon factories ──────────────────────────────────────────────────────────

const makeCircleIcon = (fill: string, stroke: string, size = 18) =>
  L?.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:3px solid ${stroke};box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const makeCarIcon = (selected: boolean) =>
  L?.divIcon({
    html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="${selected ? '#0286FF' : '#6B7280'}" xmlns="http://www.w3.org/2000/svg"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const makeDestIcon = () =>
  L?.divIcon({
    html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#EF4444" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

// ─── Map internals ───────────────────────────────────────────────────────────

/**
 * Calls map.invalidateSize() after mount and on every container resize.
 * This is the primary fix for Leaflet showing only a partial/shifted map
 * when the container size wasn't settled at initialization time.
 */
const MapResizer = () => {
  const map = useMap();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const safeInvalidate = () => {
      if (!mountedRef.current) return;
      try {
        if (map._loaded) map.invalidateSize({ animate: false });
      } catch {}
    };

    // Give the browser one frame to finish layout, then recalculate
    const t = setTimeout(safeInvalidate, 50);

    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return () => {
      mountedRef.current = false;
      clearTimeout(t);
    };

    const ro = new ResizeObserver(safeInvalidate);
    ro.observe(container);

    return () => {
      mountedRef.current = false;
      clearTimeout(t);
      ro.disconnect();
    };
  }, [map]);
  return null;
};

/** Stops ALL Leaflet animations before the MapContainer unmounts to prevent rAF-on-detached-DOM errors. */
const MapStopper = () => {
  const map = useMap();
  useEffect(() => {
    return () => {
      try {
        // Cancel flyTo frame
        map.stop();
        // Cancel any in-progress PosAnimation (pan animation)
        const m = map as any;
        if (m._panAnim && m._panAnim._inProgress) {
          m._panAnim.stop();
        }
        if (m._flyToFrame) {
          L?.Util?.cancelAnimFrame?.(m._flyToFrame);
          m._flyToFrame = null;
        }
      } catch {}
    };
  }, [map]);
  return null;
};

/** Moves to new center coordinates when they change (no animation to avoid PosAnimation NaN errors). */
const MapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const prevRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!isFinite(lat) || !isFinite(lng)) return;
    // Skip if coordinates haven't meaningfully changed (avoid jitter)
    const prev = prevRef.current;
    if (prev && Math.abs(prev[0] - lat) < 0.00001 && Math.abs(prev[1] - lng) < 0.00001) return;
    prevRef.current = [lat, lng];
    try {
      // Stop any in-progress animation before moving to avoid PosAnimation NaN corruption
      const m = map as any;
      if (m._panAnim && m._panAnim._inProgress) m._panAnim.stop();
      map.setView([lat, lng], map.getZoom(), { animate: false });
    } catch {}
  }, [lat, lng, map]);
  return null;
};

// ─── Main component ──────────────────────────────────────────────────────────

interface MapProps {
  showUserLocation?: boolean;
  showDestination?: boolean;
  showRoute?: boolean;
  showDrivers?: boolean;
  onMapReady?: () => void;
}

const Map = ({
  showUserLocation = true,
  showDestination = true,
  showRoute = true,
  showDrivers = true,
  onMapReady,
}: MapProps) => {
  const {
    userLatitude, userLongitude,
    destinationLatitude, destinationLongitude,
    selectedTariff,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers } = useNearbyDrivers(
    userLatitude ?? 0,
    userLongitude ?? 0,
    selectedTariff?.code,
    showDrivers,
  );

  const [markers, setMarkers] = React.useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = React.useState<[number, number][]>([]);

  // Build driver markers — filter out any with invalid coords
  useEffect(() => {
    if (!drivers || !Array.isArray(drivers)) return;
    setMarkers(
      drivers
        .filter((d: NearbyDriver) => isFinite(d.lat) && isFinite(d.lng))
        .map((d: NearbyDriver) => ({
          id: d.id,
          latitude: d.lat,
          longitude: d.lng,
          title: `Driver ${d.id}`,
          first_name: 'Driver',
          last_name: `${d.id}`,
          profile_image_url: '',
          car_image_url: '',
          rating: 5,
          distance_km: d.distance_km,
        })),
    );
  }, [drivers]);

  useEffect(() => {
    if (markers.length > 0) setDrivers(markers as MarkerData[]);
  }, [markers, setDrivers]);

  // Fetch OSRM route
  useEffect(() => {
    const valid = (n: any): n is number => typeof n === 'number' && isFinite(n);
    if (!valid(userLatitude) || !valid(userLongitude) || !valid(destinationLatitude) || !valid(destinationLongitude)) {
      setRouteCoords([]);
      return;
    }
    getRouteGeometry(userLatitude!, userLongitude!, destinationLatitude!, destinationLongitude!).then(coords => {
      setRouteCoords(coords ? coords.map(([lng, lat]) => [lat, lng] as [number, number]) : []);
    });
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  // Safe center with hardcoded fallback so DEFAULT_* import issues can't produce NaN
  const safeUserLat = (typeof userLatitude === 'number' && isFinite(userLatitude)) ? userLatitude : (DEFAULT_LATITUDE ?? 51.1694);
  const safeUserLng = (typeof userLongitude === 'number' && isFinite(userLongitude)) ? userLongitude : (DEFAULT_LONGITUDE ?? 71.4491);
  const center = useMemo<[number, number]>(() => [safeUserLat, safeUserLng], [safeUserLat, safeUserLng]);

  const safeDestLat = (typeof destinationLatitude === 'number' && isFinite(destinationLatitude)) ? destinationLatitude : null;
  const safeDestLng = (typeof destinationLongitude === 'number' && isFinite(destinationLongitude)) ? destinationLongitude : null;

  if (typeof window === 'undefined' || !L || !MapContainer) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  return (
    /*
     * Absolute fill: the parent View controls the height.
     * We use position:absolute here instead of height:"100%" because
     * height:100% requires every ancestor in the RN-Web flex chain to
     * have an explicit height, which is fragile. Absolute fill is
     * guaranteed to match the nearest positioned ancestor.
     */
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        whenReady={onMapReady}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapResizer />
        <MapStopper />
        <MapController lat={center[0]} lng={center[1]} />

        {/* Driver markers */}
        {showDrivers && markers
          .filter(m => isFinite(m.latitude) && isFinite(m.longitude))
          .map(m => (
            <Marker
              key={`driver-${m.id}`}
              position={[m.latitude, m.longitude]}
              icon={makeCarIcon(selectedDriver === +m.id)}
            />
          ))}

        {/* User location */}
        {showUserLocation && (
          <Marker
            position={[safeUserLat, safeUserLng]}
            icon={makeCircleIcon('#0286FF', '#ffffff', 18)}
          />
        )}

        {/* Destination */}
        {showDestination && safeDestLat !== null && safeDestLng !== null && (
          <Marker
            position={[safeDestLat, safeDestLng]}
            icon={makeDestIcon()}
          />
        )}

        {/* Route polyline */}
        {showRoute && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#0286FF', weight: 5, opacity: 0.9 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
