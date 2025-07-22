// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="map" options={{ headerShown: false }} />
      <Tabs.Screen name="route" options={{ headerShown: false }} />
      <Tabs.Screen name="chatbot" options={{ headerShown: false }} />
      <Tabs.Screen name="myroute" options={{ headerShown: false }} />
    </Tabs>
  );
}
