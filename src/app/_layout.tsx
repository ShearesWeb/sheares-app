import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../contexts/auth';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { getExpoPushNotificationToken, registerForPushNotificationsAsync } from '@/data/notif/notifications';
import { Alert, View } from 'react-native';

// Set the animation options.
// SplashScreen.setOptions({
//   duration: 500,
//   fade: true,
// });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


function SplashScreenController() {
  const { isLoading } = useSession();
  const [pushTokenReady, setPushTokenReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'NotoSans': require('@/assets/fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  });
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
      .catch((e) => console.warn('preventAutoHideAsync error:', e));
  }, []);

  // Handle push notification registration
  useEffect(() => {
    async function setupPushNotifications() {
      try {
        const existingToken = await getExpoPushNotificationToken();
        console.log('Push token already cached:', existingToken);
      } catch {
        try {
          const newToken = await registerForPushNotificationsAsync();
          if (newToken) {
            console.log('New push token registered:', newToken);
          }
        } catch (error) {
          console.error('Push notification registration failed:', error);
          const errorMessage = (error instanceof Error) ? error.message : String(error);
          Alert.alert('Error', `Push notification registration failed: ${errorMessage}`);
        }
      } finally {
        setPushTokenReady(true);
      }
    }

    setupPushNotifications();
  }, []);

  // Hide splash screen only after layout and when app is ready
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  useEffect(() => {
    if (fontError) {
      console.error('Font load error:', fontError);
    }
  }, [fontError]);


  useEffect(() => {
    if (fontsLoaded && !isLoading && !fontError && pushTokenReady) {
      setAppIsReady(true);
    }
  }, [fontsLoaded, isLoading, fontError, pushTokenReady]);

  useEffect(() => {
    if (appIsReady) {
      onLayoutRootView();
    }
  }, [appIsReady, onLayoutRootView]);

  if (!appIsReady) {
    return <View style={{ flex: 1 }} />;
  }
  return null;
}

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <Slot />
    </SessionProvider>
  );
}
