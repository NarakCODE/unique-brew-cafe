import * as SecureStore from "expo-secure-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  AuthResponse,
  VerifyRegistrationResponse,
  LoginResponse,
  User,
} from "../../../packages/api/src";
import { createAuthApi } from "../../../packages/api/src";

import {
  mobileApiClient,
  setApiAccessToken,
  setOnUnauthorizedCallback,
} from "@/lib/mobile-api-client";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  session: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (response: LoginResponse | VerifyRegistrationResponse) => Promise<void>;
  signOut: () => Promise<void>;
};

type StoredSession = AuthResponse;

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";
const USER_KEY = "auth.user";
const authApi = createAuthApi(mobileApiClient);

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningOutRef = useRef(false);

  const clearLocalSession = useCallback(async () => {
    isSigningOutRef.current = true;

    try {
      await clearStoredSession();
    } finally {
      setApiAccessToken(null);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      isSigningOutRef.current = false;
    }
  }, [queryClient]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const [storedAccessToken, storedRefreshToken, storedUser] =
          await Promise.all([
            SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
            SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
            SecureStore.getItemAsync(USER_KEY),
          ]);

        if (!isMounted) {
          return;
        }

        if (!storedAccessToken || !storedRefreshToken || !storedUser) {
          await clearStoredSession();
          setApiAccessToken(null);
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser) as User;

        setUser(parsedUser);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setApiAccessToken(storedAccessToken);
      } catch {
        if (isMounted) {
          setApiAccessToken(null);
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
        }

        await clearStoredSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function signIn(response: LoginResponse | VerifyRegistrationResponse) {
    const nextSession = response.data;

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, nextSession.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, nextSession.refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextSession.user)),
    ]);

    setUser(nextSession.user);
    setAccessToken(nextSession.accessToken);
    setRefreshToken(nextSession.refreshToken);
    setApiAccessToken(nextSession.accessToken);
  }

  const logoutMutation = useMutation({
    mutationFn: async (token: string | null) => {
      if (!token) {
        return null;
      }

      return authApi.logout({ refreshToken: token });
    },
  });

  const signOut = useCallback(async () => {
    if (isSigningOutRef.current || logoutMutation.isPending) {
      return;
    }

    isSigningOutRef.current = true;

    try {
      await logoutMutation.mutateAsync(refreshToken);
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "[auth] logout request failed; clearing local session anyway.",
          error,
        );
      }
    } finally {
      await clearLocalSession();
    }
  }, [clearLocalSession, logoutMutation, refreshToken]);

  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      if (isSigningOutRef.current) {
        return;
      }

      void clearLocalSession();
    });

    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, [clearLocalSession]);

  const session = useMemo<AuthResponse | null>(() => {
    if (!user || !accessToken || !refreshToken) {
      return null;
    }

    return {
      user,
      accessToken,
      refreshToken,
    };
  }, [accessToken, refreshToken, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      session,
      isAuthenticated: session !== null,
      isLoading,
      signIn,
      signOut,
    }),
    [accessToken, isLoading, refreshToken, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
