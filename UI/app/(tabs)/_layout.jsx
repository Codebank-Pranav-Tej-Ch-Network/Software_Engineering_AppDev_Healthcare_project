import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="myprofile"
          options={{
            title: 'My Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}