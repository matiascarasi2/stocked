import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

export type PushTokenListener = (token: string) => void;

export type RemoteMessageListener = (message: RemoteMessage) => void;
