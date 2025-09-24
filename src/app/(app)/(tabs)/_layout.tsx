import { Redirect, Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { useSession } from '@/contexts/auth';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

export function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F18437',
        tabBarInactiveTintColor: "#393939",
        headerShown: false,
        sceneStyle: {
          backgroundColor: 'white'
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Entypo name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Your activity',
          tabBarIcon: ({ color, size }) => <Entypo name="man" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ccas"
        options={{
          title: 'CCAs',
          tabBarIcon: ({ color, size }) => <Feather name="dribbble" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function AppLayout() {
  const { session, isLoading } = useSession();
  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <TabLayout />;
}