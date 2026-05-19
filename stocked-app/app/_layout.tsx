import { Stack } from "expo-router";

import { usePushMessaging } from "@/hooks/usePushMessaging";

export default function RootLayout() {
  usePushMessaging();

  return <Stack />;
}
