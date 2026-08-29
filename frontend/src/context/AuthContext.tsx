import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setAccessToken, setUnauthorizedHandler } from '../lib/api/client';
import * as authApi from '../lib/api/auth.api';
import type { LoginFormValues, RegisterFormValues } from '../lib/schemas/auth.schema';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<User>;
  register: (values: RegisterFormValues) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;
    // Attempt a silent refresh on load so a returning user with a valid
    // refresh cookie doesn't have to log in again.
    authApi
      .refresh()
      .then((auth) => {
        if (cancelled) return;
        setAccessToken(auth.accessToken);
        setUser(auth.user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (values: LoginFormValues) => {
    const auth = await authApi.login(values);
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    return auth.user;
  }, []);

  const register = useCallback(async (values: RegisterFormValues) => {
    const auth = await authApi.register(values);
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
