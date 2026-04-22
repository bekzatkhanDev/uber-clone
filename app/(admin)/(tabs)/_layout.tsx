import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
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
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          title: 'Drivers',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tariffs"
        options={{
          title: 'Tariffs',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
