import { createContext, ReactNode, useContext, useState } from 'react';

import {
  createAuthApi,
  type AuthResponse,
  type LoginInput,
} from '../../../packages/api/src';

import { mobileApiClient, setApiAccessToken } from '@/lib/mobile-api-client';

type AuthContextValue = {
  session: AuthResponse | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginInput) => Promise<AuthResponse>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authApi = createAuthApi(mobileApiClient);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);

  async function signIn(credentials: LoginInput) {
    const response = await authApi.login(credentials);
    const nextSession = response.data;

    setSession(nextSession);
    setApiAccessToken(nextSession.tokens.accessToken);

    return nextSession;
  }

  function signOut() {
    setSession(null);
    setApiAccessToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        signIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
