import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useSession } from "@/contexts/SessionContext";

/**
 * Keeps the user on the correct route group after auth state changes.
 */
export function SessionGate() {
  const { isSignedIn, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const group = segments[0];
    if (!group) {
      return;
    }

    const inAuthGroup = group === "(auth)";
    const inAppGroup = group === "(app)";

    if (isSignedIn && inAuthGroup) {
      router.replace("/home");
    } else if (!isSignedIn && inAppGroup) {
      router.replace("/");
    }
  }, [isSignedIn, isLoading, segments, router]);

  return null;
}
