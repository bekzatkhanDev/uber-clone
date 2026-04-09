// Карта: маркеры водителей, маршрут, позиция пользователя и назначение
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
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
    selectedTariff?.code
  );

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number; longitude: number}[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: userLatitude ?? DEFAULT_LATITUDE,
    longitude: userLongitude ?? DEFAULT_LONGITUDE,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  // Update markers when drivers data changes
  useEffect(() => {
    if (drivers && Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;
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
  }, [drivers, userLatitude, userLongitude]);

  // Calculate driver times when markers or destination changes
  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined &&
      userLatitude &&
      userLongitude
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude, userLatitude, userLongitude, setDrivers]);

  // Animate to user location when it changes
  useEffect(() => {
    if (userLatitude && userLongitude && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  }, [userLatitude, userLongitude, mapReady]);

  // Fit region to show both user and destination
  useEffect(() => {
    if (
      userLatitude && 
      userLongitude && 
      destinationLatitude && 
      destinationLongitude &&
      mapRef.current &&
      mapReady
    ) {
      const newRegion = calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      });
      
      mapRef.current.animateToRegion(newRegion, 500);
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude, mapReady]);

  // Fetch route geometry
  useEffect(() => {
    const fetchRoute = async () => {
      if (
        userLatitude && 
        userLongitude && 
        destinationLatitude && 
        destinationLongitude &&
        showRoute
      ) {
        const coordinates = await getRouteGeometry(
          userLatitude,
          userLongitude,
          destinationLatitude,
          destinationLongitude
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
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude, showRoute]);

  // Update region state when coordinates change
  useEffect(() => {
    if (userLatitude && userLongitude) {
      setRegion(prev => ({
        ...prev,
        latitude: userLatitude,
        longitude: userLongitude,
      }));
    }
  }, [userLatitude, userLongitude]);

  const handleMapReady = () => {
    setMapReady(true);
    onMapReady?.();
  };

  // Use calculated region if destination is set, otherwise use user location
  const displayRegion: Region = (userLatitude && userLongitude && destinationLatitude && destinationLongitude)
    ? calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      })
    : {
        latitude: userLatitude ?? DEFAULT_LATITUDE,
        longitude: userLongitude ?? DEFAULT_LONGITUDE,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

  if (isLoading || (!userLatitude && !userLongitude))
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
      {showNearbyCircle && userLatitude && userLongitude && (
        <Circle
          center={{
            latitude: userLatitude,
            longitude: userLongitude,
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
                <Text style={{ fontSize: 18 }}>🚗</Text>
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
                    {marker.distance_km ? `${marker.distance_km.toFixed(1)} km` : ''}
                  </Text>
                </View>
              )}
            </View>
          </Marker>
        );
      })}

      {/* User location marker */}
      {showUserLocation && userLatitude && userLongitude && (
        <Marker
          coordinate={{
            latitude: userLatitude,
            longitude: userLongitude,
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
      {showDestination && destinationLatitude && destinationLongitude && (
        <Marker
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
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
              <Text style={{ fontSize: 18 }}>📍</Text>
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
