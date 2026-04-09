// Web map — Leaflet + OpenStreetMap (no API key required)
// Disable static rendering for this component - required for react-leaflet
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import React, { useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";

// Fix window is not defined error: load leaflet only in browser environment
let L: any;
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Polyline: any;
let useMap: any;

if (typeof window !== 'undefined') {
  L = require('leaflet');
  const ReactLeaflet = require('react-leaflet');
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Polyline = ReactLeaflet.Polyline;
  useMap = ReactLeaflet.useMap;
}

import { useNearbyDrivers, NearbyDriver } from "@/hooks/useLocation";
import { getRouteGeometry } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

// Fix default marker icons broken by webpack
if (typeof window !== 'undefined' && L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const makeCircleIcon = (fill: string, stroke: string, size = 18) =>
  L?.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${fill};border:3px solid ${stroke};
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const makeCarIcon = (selected: boolean) =>
  L?.divIcon({
    html: `<div style="font-size:22px;line-height:1;filter:${selected ? "drop-shadow(0 0 4px #0286FF)" : "none"}">🚗</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const makeDestIcon = () =>
  L?.divIcon({
    html: `<div style="font-size:26px;line-height:1">📍</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

// Helper: fly map to new centre when coordinates change
const MapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    // Guard against NaN or invalid coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return;
    }
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
  }, [lat, lng, map]);
  return null;
};

interface MapProps {
  showUserLocation?: boolean;
  showDestination?: boolean;
  showRoute?: boolean;
  showDrivers?: boolean;
  showNearbyCircle?: boolean;
  onMapReady?: () => void;
}

const Map = ({ 
  showUserLocation = true, 
  showDestination = true, 
  showRoute = true,
  showDrivers = true,
  showNearbyCircle = false,
  onMapReady
}: MapProps) => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude, selectedTariff } =
    useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, isLoading, error } = useNearbyDrivers(
    userLatitude ?? 0,
    userLongitude ?? 0,
    selectedTariff?.code,
    showDrivers
  );

  const [markers, setMarkers] = React.useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = React.useState<[number, number][]>([]);

  // Build driver markers
  useEffect(() => {
    if (!drivers || !Array.isArray(drivers) || !userLatitude || !userLongitude) return;
    setMarkers(
      drivers.map((d: NearbyDriver) => ({
        id: d.id,
        latitude: d.lat,
        longitude: d.lng,
        title: `Driver ${d.id}`,
        first_name: "Driver",
        last_name: `${d.id}`,
        profile_image_url: "",
        car_image_url: "",
        rating: 5,
        distance_km: d.distance_km,
      }))
    );
  }, [drivers, userLatitude, userLongitude]);

  // Update driver store with computed markers
  useEffect(() => {
    if (markers.length > 0) setDrivers(markers as MarkerData[]);
  }, [markers, setDrivers]);

  // Fetch route via OSRM (free, no API key)
  useEffect(() => {
    if (!userLatitude || !userLongitude || !destinationLatitude || !destinationLongitude) {
      setRouteCoords([]);
      return;
    }
    
    // Validate coordinates are actual numbers and not NaN
    const isValidCoords = 
      typeof userLatitude === 'number' && !isNaN(userLatitude) &&
      typeof userLongitude === 'number' && !isNaN(userLongitude) &&
      typeof destinationLatitude === 'number' && !isNaN(destinationLatitude) &&
      typeof destinationLongitude === 'number' && !isNaN(destinationLongitude);
    
    if (!isValidCoords) {
      setRouteCoords([]);
      return;
    }
    
    getRouteGeometry(userLatitude, userLongitude, destinationLatitude, destinationLongitude).then(
      (coords) => {
        if (coords) {
          // coords are [lng, lat] from OSRM — flip to [lat, lng] for Leaflet
          setRouteCoords(coords.map(([lng, lat]) => [lat, lng] as [number, number]));
        } else {
          setRouteCoords([]);
        }
      }
    );
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  // Ensure center coordinates are valid numbers, fallback to defaults
  const safeUserLat = (typeof userLatitude === 'number' && !isNaN(userLatitude)) ? userLatitude : DEFAULT_LATITUDE;
  const safeUserLng = (typeof userLongitude === 'number' && !isNaN(userLongitude)) ? userLongitude : DEFAULT_LONGITUDE;
  
  const center: [number, number] = useMemo(
    () => [safeUserLat, safeUserLng],
    [safeUserLat, safeUserLng]
  );

  // Guard: ensure center coordinates are valid numbers before rendering map
  const isValidCenter = typeof center[0] === 'number' && typeof center[1] === 'number' && 
                        !isNaN(center[0]) && !isNaN(center[1]);

  if (isLoading || (!safeUserLat && !safeUserLng) || !isValidCenter) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#ef4444" }}>Map error: {error.message}</Text>
      </View>
    );
  }

  // Guard: don't render map until leaflet is loaded
  if (typeof window === 'undefined' || !L || !MapContainer) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  // Safe values for markers
  const safeDestLat = (typeof destinationLatitude === 'number' && !isNaN(destinationLatitude)) ? destinationLatitude : null;
  const safeDestLng = (typeof destinationLongitude === 'number' && !isNaN(destinationLongitude)) ? destinationLongitude : null;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapController lat={center[0]} lng={center[1]} />

        {/* Nearby drivers */}
        {showDrivers && markers.map((m) => (
          <Marker
            key={`driver-${m.id}`}
            position={[m.latitude, m.longitude]}
            icon={makeCarIcon(selectedDriver === +m.id)}
          />
        ))}

        {/* User location */}
        {showUserLocation && safeUserLat && safeUserLng && (
          <Marker
            position={[safeUserLat, safeUserLng]}
            icon={makeCircleIcon("#0286FF", "#ffffff", 18)}
          />
        )}

        {/* Destination */}
        {showDestination && safeDestLat && safeDestLng && (
          <Marker
            position={[safeDestLat, safeDestLng]}
            icon={makeDestIcon()}
          />
        )}

        {/* Route polyline */}
        {showRoute && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#0286FF", weight: 5, opacity: 0.9 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
