// Driver-mode Leaflet map — shows driver position + two-color trip routes
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getRouteGeometry } from '@/lib/map';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/constants/location';

// ─── Leaflet bootstrap (browser-only) ────────────────────────────────────────

let L: any;
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Polyline: any;
let useMap: any;

if (typeof window !== 'undefined') {
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

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// ─── Icon factories ───────────────────────────────────────────────────────────

const makeCircleIcon = (fill: string, border: string, size = 20) =>
  L?.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:3px solid ${border};box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const makeEmojiIcon = (emoji: string, size = 28) =>
  L?.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4))">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Stops all animations on unmount to prevent rAF-on-detached-DOM errors. */
const MapStopper = () => {
  const map = useMap();
  useEffect(() => {
    return () => {
      try {
        map.stop();
        const m = map as any;
        if (m._panAnim?._inProgress) m._panAnim.stop();
        if (m._flyToFrame) {
          L?.Util?.cancelAnimFrame?.(m._flyToFrame);
          m._flyToFrame = null;
        }
      } catch {}
    };
  }, [map]);
  return null;
};

/** Calls invalidateSize when the container resizes. */
const MapResizer = () => {
  const map = useMap();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const safe = () => {
      if (!mountedRef.current) return;
      try { if ((map as any)._loaded) map.invalidateSize({ animate: false }); } catch {}
    };
    const t = setTimeout(safe, 50);
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') {
      return () => { mountedRef.current = false; clearTimeout(t); };
    }
    const ro = new ResizeObserver(safe);
    ro.observe(container);
    return () => { mountedRef.current = false; clearTimeout(t); ro.disconnect(); };
  }, [map]);
  return null;
};

/** Instantly moves map view without animation (no PosAnimation NaN risk). */
const MapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!isFinite(lat) || !isFinite(lng)) return;
    const p = prev.current;
    if (p && Math.abs(p[0] - lat) < 0.00001 && Math.abs(p[1] - lng) < 0.00001) return;
    prev.current = [lat, lng];
    try {
      const m = map as any;
      if (m._panAnim?._inProgress) m._panAnim.stop();
      map.setView([lat, lng], map.getZoom(), { animate: false });
    } catch {}
  }, [lat, lng, map]);
  return null;
};

/** Fits the map to show all provided points with padding. */
const BoundsFitter = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (points.length < 2 || fitted.current) return;
    try {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], animate: false, maxZoom: 16 });
        fitted.current = true;
      }
    } catch {}
  }, [points, map]);
  // Reset when points change meaningfully
  useEffect(() => { fitted.current = false; }, [JSON.stringify(points.map(p => p.map(v => Math.round(v * 1000))))]);
  return null;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveTrip {
  id: string;
  status: 'accepted' | 'on_route' | 'completed' | 'cancelled' | 'requested';
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}

interface DriverMapProps {
  driverLat: number;
  driverLng: number;
  trip?: ActiveTrip | null;
}

// ─── Route legend ─────────────────────────────────────────────────────────────

const ROUTE_COLORS = {
  toPickup: '#F97316',     // orange — driver → pickup
  toDestination: '#3B82F6', // blue   — pickup → destination (accepted)
  onRoute: '#0CC25F',      // green  — driver → destination (on_route)
};

// ─── Main component ───────────────────────────────────────────────────────────

const DriverMap = ({ driverLat, driverLng, trip }: DriverMapProps) => {
  const [toPickupCoords, setToPickupCoords] = useState<[number, number][]>([]);
  const [toDestCoords, setToDestCoords] = useState<[number, number][]>([]);

  const safeDriverLat = isFinite(driverLat) ? driverLat : (DEFAULT_LATITUDE ?? 51.1694);
  const safeDriverLng = isFinite(driverLng) ? driverLng : (DEFAULT_LONGITUDE ?? 71.4491);
  const center = useMemo<[number, number]>(() => [safeDriverLat, safeDriverLng], [safeDriverLat, safeDriverLng]);

  const hasTrip = !!trip && (trip.status === 'accepted' || trip.status === 'on_route');

  // Fetch routes when trip is active
  useEffect(() => {
    if (!hasTrip || !trip) {
      setToPickupCoords([]);
      setToDestCoords([]);
      return;
    }

    const osrmToLeaflet = (coords: number[][]): [number, number][] =>
      coords.map(([lng, lat]) => [lat, lng]);

    if (trip.status === 'accepted') {
      // Route 1: driver → pickup (orange)
      getRouteGeometry(safeDriverLat, safeDriverLng, trip.start_lat, trip.start_lng)
        .then(c => setToPickupCoords(c ? osrmToLeaflet(c) : []));
      // Route 2: pickup → destination (blue)
      getRouteGeometry(trip.start_lat, trip.start_lng, trip.end_lat, trip.end_lng)
        .then(c => setToDestCoords(c ? osrmToLeaflet(c) : []));
    } else if (trip.status === 'on_route') {
      // Single route: driver → destination (green)
      getRouteGeometry(safeDriverLat, safeDriverLng, trip.end_lat, trip.end_lng)
        .then(c => setToPickupCoords(c ? osrmToLeaflet(c) : []));
      setToDestCoords([]);
    }
  }, [
    hasTrip,
    trip?.status,
    trip?.start_lat, trip?.start_lng,
    trip?.end_lat, trip?.end_lng,
    // Re-fetch routes when driver moves significantly (rounded to ~100m)
    Math.round(safeDriverLat * 1000),
    Math.round(safeDriverLng * 1000),
  ]);

  // Collect all map points for bounds fitting
  const allPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [[safeDriverLat, safeDriverLng]];
    if (trip && hasTrip) {
      pts.push([trip.start_lat, trip.start_lng]);
      pts.push([trip.end_lat, trip.end_lng]);
    }
    return pts;
  }, [safeDriverLat, safeDriverLng, trip, hasTrip]);

  if (typeof window === 'undefined' || !L || !MapContainer) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0CC25F" />
      </View>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapResizer />
        <MapStopper />
        <MapController lat={safeDriverLat} lng={safeDriverLng} />
        {hasTrip && <BoundsFitter points={allPoints} />}

        {/* Driver position — green dot */}
        <Marker
          position={[safeDriverLat, safeDriverLng]}
          icon={makeCircleIcon('#0CC25F', '#ffffff', 20)}
        />

        {/* Trip-specific markers & routes */}
        {hasTrip && trip && (
          <>
            {/* Pickup marker */}
            {trip.status === 'accepted' && (
              <Marker
                position={[trip.start_lat, trip.start_lng]}
                icon={makeEmojiIcon('👤', 28)}
              />
            )}

            {/* Destination marker */}
            <Marker
              position={[trip.end_lat, trip.end_lng]}
              icon={makeEmojiIcon('📍', 30)}
            />

            {/* Route: driver → pickup (orange, shown when accepted) */}
            {trip.status === 'accepted' && toPickupCoords.length > 0 && (
              <Polyline
                positions={toPickupCoords}
                pathOptions={{ color: ROUTE_COLORS.toPickup, weight: 5, opacity: 0.9 }}
              />
            )}

            {/* Route: pickup → destination (blue, shown when accepted) */}
            {trip.status === 'accepted' && toDestCoords.length > 0 && (
              <Polyline
                positions={toDestCoords}
                pathOptions={{ color: ROUTE_COLORS.toDestination, weight: 5, opacity: 0.7, dashArray: '8 4' }}
              />
            )}

            {/* Route: driver → destination (green, shown when on_route) */}
            {trip.status === 'on_route' && toPickupCoords.length > 0 && (
              <Polyline
                positions={toPickupCoords}
                pathOptions={{ color: ROUTE_COLORS.onRoute, weight: 6, opacity: 0.95 }}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Legend overlay when trip is active */}
      {hasTrip && trip && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          background: 'white', borderRadius: 10, padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 12, lineHeight: '1.8',
        }}>
          {trip.status === 'accepted' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 20, height: 3, background: ROUTE_COLORS.toPickup, borderRadius: 2 }} />
                <span>To pickup</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 20, height: 3, background: ROUTE_COLORS.toDestination, borderRadius: 2, opacity: 0.7 }} />
                <span>To destination</span>
              </div>
            </>
          )}
          {trip.status === 'on_route' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 20, height: 3, background: ROUTE_COLORS.onRoute, borderRadius: 2 }} />
              <span>En route</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverMap;
