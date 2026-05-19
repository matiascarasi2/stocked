import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "@/lib/api/types";
import type { AuthUser } from "@/lib/api/types";
import * as usersApi from "@/lib/api/users";
import { getAuthDevicePayload } from "@/lib/auth/device";
import { isValidUser } from "@/lib/auth/user";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveSession,
  saveTokens,
} from "@/lib/auth/storage";

type SessionContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isSignedIn: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function mapApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Invalid email or password";
    }
    if (error.status === 409) {
      return "Email already registered";
    }
    return error.message;
  }

  if (error instanceof Error && error.message.includes("Network request failed")) {
    return "Unable to reach the server.";
  }

  return "Something went wrong. Please try again.";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      setUser(null);
      return;
    }

    try {
      const result = await usersApi.refresh(refreshToken);
      await saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        deviceId: result.deviceId,
      });

      const storedUser = await getStoredUser();
      if (isValidUser(storedUser)) {
        setUser(storedUser);
      } else {
        await clearSession();
        setUser(null);
      }
    } catch {
      await clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await restoreSession();
      setIsLoading(false);
    };

    void init();
  }, [restoreSession]);

  const persistAuthResponse = useCallback(
    async (response: Awaited<ReturnType<typeof usersApi.signIn>>) => {
      await saveSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        deviceId: response.device.id,
        user: response.user,
      });
      setUser(response.user);
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const device = await getAuthDevicePayload();
        const response = await usersApi.register({
          email,
          password,
          ...device,
        });
        await persistAuthResponse(response);
      } catch (err) {
        setError(mapApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistAuthResponse],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const device = await getAuthDevicePayload();
        const response = await usersApi.signIn({
          email,
          password,
          ...device,
        });
        await persistAuthResponse(response);
      } catch (err) {
        setError(mapApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistAuthResponse],
  );

  const signOut = useCallback(async () => {
    setError(null);

    const accessToken = await getAccessToken();

    try {
      await clearSession();
    } finally {
      setUser(null);
    }

    if (accessToken) {
      void usersApi.logout(accessToken).catch(() => {
        // Best-effort server logout
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSubmitting,
      isSignedIn: isValidUser(user),
      error,
      signUp,
      signIn,
      signOut,
      clearError,
    }),
    [user, isLoading, isSubmitting, error, signUp, signIn, signOut, clearError],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
