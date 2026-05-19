import { Platform } from "react-native";

import "expo-router/entry";

if (Platform.OS === "android") {
  const messaging = require("@react-native-firebase/messaging").default;
  const { handleBackgroundMessage } = require("./lib/push/backgroundHandler");

  messaging().setBackgroundMessageHandler(handleBackgroundMessage);
}
