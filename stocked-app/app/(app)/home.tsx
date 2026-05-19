import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";
import { useSession } from "@/contexts/SessionContext";
import { colors, spacing } from "@/constants/theme";

export default function HomeScreen() {
  const { user, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppText variant="title" center>
          Welcome
        </AppText>
        <AppText variant="body" color={colors.textMuted} center>
          {user?.email ? `Signed in as ${user.email}` : "Signed in"}
        </AppText>
        <Button
          label={isSigningOut ? "Logging out…" : "Log Out"}
          onPress={() => void handleSignOut()}
          disabled={isSigningOut}
          style={isSigningOut ? styles.buttonDisabled : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
    gap: spacing.sectionGap,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
