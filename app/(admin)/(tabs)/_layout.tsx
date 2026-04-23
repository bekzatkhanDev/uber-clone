import { Tabs } from 'expo-router';
import { Image, Platform, Text, View } from 'react-native';

// SVG icons as base64 for emoji-free tab bar
const DASHBOARD_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`;
const USERS_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
const DRIVERS_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
const TRIPS_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V17c0 .17.14.3.3.3L11 20v-2.5l-7.7-2.7V5.5l5.7-2 6 2.1 5.5-1.9V14l-7.5 2v2.5l7.7-2.7c.16-.05.3-.19.3-.36V3.5c0-.28-.22-.5-.5-.5z"/></svg>`;
const TARIFFS_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V19h-2.67v-.91c-1.95-.58-3.28-1.78-3.28-3.31 0-2.19 1.79-3.47 4.55-3.79l1.56-.18v-.65c0-1.19-.91-1.91-2.35-1.91-1.31 0-2.24.56-2.6 1.45l-2.17-.88C7.12 7.19 9.13 6 11.44 6c2.75 0 4.67 1.43 4.67 4.03v3.26l-1.59.19c-1.76.21-2.53.93-2.53 1.91 0 .87.72 1.52 1.92 1.7z"/></svg>`;
const SETTINGS_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;

const TabIcon = ({ iconSource, focused }: { iconSource: string; focused: boolean }) => (
  <View
    style={{
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
      backgroundColor: focused ? 'rgba(255,255,255,0.15)' : 'transparent',
    }}
  >
    <Image source={{ uri: iconSource }} style={{ width: 24, height: 24 }} />
  </View>
);

const webTabBarStyle = {
  backgroundColor: '#1e293b',
  height: 70,
  borderTopWidth: 0,
  paddingBottom: 0,
  paddingTop: 0,
};

const nativeTabBarStyle = {
  backgroundColor: '#1e293b',
  borderRadius: 50,
  overflow: 'hidden' as const,
  marginHorizontal: 20,
  marginBottom: 20,
  height: 72,
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  flexDirection: 'row' as const,
  position: 'absolute' as const,
  paddingBottom: 0,
};

export default function AdminTabLayout() {
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarShowLabel: isWeb,
        tabBarLabelStyle: isWeb ? { fontSize: 11, marginTop: 2, color: 'white' } : undefined,
        tabBarStyle: isWeb ? webTabBarStyle : nativeTabBarStyle,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={DASHBOARD_ICON} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={USERS_ICON} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          title: 'Drivers',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={DRIVERS_ICON} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={TRIPS_ICON} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tariffs"
        options={{
          title: 'Tariffs',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={TARIFFS_ICON} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon iconSource={SETTINGS_ICON} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
