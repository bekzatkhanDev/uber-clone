// Карта: маркеры водителей, маршрут, позиция пользователя и назначение
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from "react-native-maps";

import { useNearbyDrivers, NearbyDriver } from "@/hooks/useLocation";
import {
  calculateDriverTimes,
  getRouteGeometry,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { MarkerData } from "@/types/type";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/location";

const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const Map = () => {
  const mapRef = useRef<MapView>(null);
  
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

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
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

  useEffect(() => {
    if (userLatitude && userLongitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  }, [userLatitude, userLongitude]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (
        userLatitude && 
        userLongitude && 
        destinationLatitude && 
        destinationLongitude
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
      }
    };

    fetchRoute();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const initialRegion: Region = {
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
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      onRegionChangeComplete={(region: Region) => {
        console.log('Map region changed:', region);
      }}
    >
      {/* Driver markers using Marker */}
      {markers.map((marker) => (
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
                width: 32,
                height: 32,
                backgroundColor: selectedDriver === +marker.id ? '#0286FF' : 'white',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#0286FF',
              }}
            >
              <Text style={{ fontSize: 16 }}>🚗</Text>
            </View>
          </View>
        </Marker>
      ))}

      {/* User location marker */}
      {userLatitude && userLongitude && (
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
                width: 24,
                height: 24,
                backgroundColor: '#0286FF',
                borderRadius: 12,
                borderWidth: 3,
                borderColor: 'white',
              }}
            />
          </View>
        </Marker>
      )}

      {/* Destination marker */}
      {destinationLatitude && destinationLongitude && (
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
                width: 32,
                height: 32,
                backgroundColor: '#FF6B6B',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}
            >
              <Text style={{ fontSize: 16 }}>📍</Text>
            </View>
          </View>
        </Marker>
      )}

      {/* Route polyline using Polyline */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0286FF"
          strokeWidth={5}
        />
      )}
    </MapView>
  );
};

export default Map;
