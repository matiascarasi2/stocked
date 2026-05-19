import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="stock/[symbol]" />
      <Stack.Screen name="alerts/index" />
      <Stack.Screen name="alerts/new" />
      <Stack.Screen name="alerts/[id]/edit" />
    </Stack>
  );
}
