import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";

import { SessionGate } from "@/components/SessionGate";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { usePushMessaging } from "@/hooks/usePushMessaging";
import { QueryProvider } from "@/providers/QueryProvider";

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { isLoading } = useSession();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <SessionGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  usePushMessaging();

  return (
    <SessionProvider>
      <QueryProvider>
        <RootNavigation />
      </QueryProvider>
    </SessionProvider>
  );
}
