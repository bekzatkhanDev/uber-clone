// Карта: маркеры водителей, маршрут, позиция пользователя и назначение
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View, Image } from "react-native";
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE, Circle } from "react-native-maps";

import { useNearbyDrivers, NearbyDriver } from "@/hooks/useLocation";
import {
  calculateDriverTimes,
  getRouteGeometry,
  calculateRegion,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

// SVG icons as base64 for native platforms
const CAR_ICON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;

const PIN_ICON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B6B"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`;

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
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    selectedTariff,
  } = useLocationStore();
  
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, isLoading, error } = useNearbyDrivers(
    userLatitude ?? 0,
    userLongitude ?? 0,
    selectedTariff?.code,
    showDrivers
  );

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number; longitude: number}[]>([]);
  
  // Ensure region uses valid coordinates or defaults
  const safeUserLat = (typeof userLatitude === 'number' && !isNaN(userLatitude)) ? userLatitude : DEFAULT_LATITUDE;
  const safeUserLng = (typeof userLongitude === 'number' && !isNaN(userLongitude)) ? userLongitude : DEFAULT_LONGITUDE;
  
  const [region, setRegion] = useState<Region>({
    latitude: safeUserLat,
    longitude: safeUserLng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  // Update markers when drivers data changes
  useEffect(() => {
    if (drivers && Array.isArray(drivers)) {
      if (!safeUserLat || !safeUserLng) return;
      const newMarkers: MarkerData[] = drivers.map((driver: NearbyDriver) => ({
        id: driver.id,
        latitude: driver.lat,
        longitude: driver.lng,
        title: `Driver ${driver.id}`,
        first_name: 'Driver',
        last_name: `${driver.id}`,
        profile_image_url: '',
        car_image_url: '',
        rating: 5,
        distance_km: driver.distance_km,
      }));

      setMarkers(newMarkers);
    }
  }, [drivers, safeUserLat, safeUserLng]);

  // Calculate driver times when markers or destination changes
  useEffect(() => {
    if (
      markers.length > 0 &&
      safeDestLat !== null &&
      safeDestLng !== null &&
      safeUserLat &&
      safeUserLng
    ) {
      calculateDriverTimes({
        markers,
        userLatitude: safeUserLat,
        userLongitude: safeUserLng,
        destinationLatitude: safeDestLat,
        destinationLongitude: safeDestLng,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, safeDestLat, safeDestLng, safeUserLat, safeUserLng, setDrivers]);

  // Animate to user location when it changes
  useEffect(() => {
    if (safeUserLat && safeUserLng && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: safeUserLat,
        longitude: safeUserLng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  }, [safeUserLat, safeUserLng, mapReady]);

  // Fit region to show both user and destination
  useEffect(() => {
    if (
      safeUserLat && 
      safeUserLng && 
      safeDestLat && 
      safeDestLng &&
      mapRef.current &&
      mapReady
    ) {
      const newRegion = calculateRegion({
        userLatitude: safeUserLat,
        userLongitude: safeUserLng,
        destinationLatitude: safeDestLat,
        destinationLongitude: safeDestLng,
      });
      
      mapRef.current.animateToRegion(newRegion, 500);
    }
  }, [safeUserLat, safeUserLng, safeDestLat, safeDestLng, mapReady]);

  // Fetch route geometry
  useEffect(() => {
    const fetchRoute = async () => {
      if (
        safeUserLat && 
        safeUserLng && 
        safeDestLat && 
        safeDestLng &&
        showRoute
      ) {
        const coordinates = await getRouteGeometry(
          safeUserLat,
          safeUserLng,
          safeDestLat,
          safeDestLng
        );
        
        if (coordinates) {
          const googleCoords = coordinates.map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteCoordinates(googleCoords);
        }
      } else if (!showRoute) {
        setRouteCoordinates([]);
      }
    };

    fetchRoute();
  }, [safeUserLat, safeUserLng, safeDestLat, safeDestLng, showRoute]);

  // Update region state when coordinates change
  useEffect(() => {
    if (safeUserLat && safeUserLng) {
      setRegion(prev => ({
        ...prev,
        latitude: safeUserLat,
        longitude: safeUserLng,
      }));
    }
  }, [safeUserLat, safeUserLng]);

  const handleMapReady = () => {
    setMapReady(true);
    onMapReady?.();
  };

  // Use calculated region if destination is set, otherwise use user location
  const safeDestLat = (typeof destinationLatitude === 'number' && !isNaN(destinationLatitude)) ? destinationLatitude : null;
  const safeDestLng = (typeof destinationLongitude === 'number' && !isNaN(destinationLongitude)) ? destinationLongitude : null;
  
  const displayRegion: Region = (safeUserLat && safeUserLng && safeDestLat && safeDestLng)
    ? calculateRegion({
        userLatitude: safeUserLat,
        userLongitude: safeUserLng,
        destinationLatitude: safeDestLat,
        destinationLongitude: safeDestLng,
      })
    : {
        latitude: safeUserLat,
        longitude: safeUserLng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

  if (isLoading || (!safeUserLat && !safeUserLng))
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    );

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={mapProvider}
      region={displayRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterest={true}
      mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      onMapReady={handleMapReady}
      onRegionChangeComplete={(newRegion: Region) => {
        setRegion(newRegion);
      }}
    >
      {/* Nearby drivers circle */}
      {showNearbyCircle && safeUserLat && safeUserLng && (
        <Circle
          center={{
            latitude: safeUserLat,
            longitude: safeUserLng,
          }}
          radius={5000} // 5km radius
          strokeColor="#0286FF"
          fillColor="rgba(2, 134, 255, 0.1)"
          strokeWidth={2}
        />
      )}

      {/* Driver markers */}
      {showDrivers && markers.map((marker) => {
        const isSelected = selectedDriver === +marker.id;
        return (
          <Marker
            key={`driver-${marker.id}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={{ alignItems: 'center' }}>
              <View 
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: isSelected ? '#0286FF' : 'white',
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#0286FF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Image 
                  source={{ uri: CAR_ICON_SVG.replace('%236B7280', isSelected ? '%230286FF' : '%236B7280') }}
                  style={{ width: 24, height: 24 }}
                />
              </View>
              {isSelected && (
                <View style={{
                  marginTop: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: '#0286FF',
                  borderRadius: 10,
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {marker.distance_km ? `${parseFloat(marker.distance_km).toFixed(1)} km` : ''}
                  </Text>
                </View>
              )}
            </View>
          </Marker>
        );
      })}

      {/* User location marker */}
      {showUserLocation && safeUserLat && safeUserLng && (
        <Marker
          coordinate={{
            latitude: safeUserLat,
            longitude: safeUserLng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{ alignItems: 'center' }}>
            <View 
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#0286FF',
                borderRadius: 14,
                borderWidth: 3,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />
            <View style={{
              position: 'absolute',
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: 'rgba(2, 134, 255, 0.3)',
            }} />
          </View>
        </Marker>
      )}

      {/* Destination marker */}
      {showDestination && safeDestLat && safeDestLng && (
        <Marker
          coordinate={{
            latitude: safeDestLat,
            longitude: safeDestLng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={{ alignItems: 'center' }}>
            <View 
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#FF6B6B',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Image 
                source={{ uri: PIN_ICON_SVG }}
                style={{ width: 24, height: 24 }}
              />
            </View>
            <View style={{
              marginTop: 4,
              paddingHorizontal: 8,
              paddingVertical: 2,
              backgroundColor: '#FF6B6B',
              borderRadius: 10,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Destination</Text>
            </View>
          </View>
        </Marker>
      )}

      {/* Route polyline */}
      {showRoute && routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0286FF"
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      )}
    </MapView>
  );
};

export default Map;
