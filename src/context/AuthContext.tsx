"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import type { AuthSession } from "../types/auth";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthSession>;
  register: (username: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isExpired = (session: AuthSession | null) => {
  if (!session) {
    return true;
  }

  const expiresAt = Date.parse(session.expiresAt);
  return Number.isNaN(expiresAt) || expiresAt <= Date.now();
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const nextSession = await authService.getSession();
        if (!cancelled) {
          setSession(isExpired(nextSession) ? null : nextSession);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const expiresAt = Date.parse(session.expiresAt);
    const timeoutMs = expiresAt - Date.now();
    if (timeoutMs <= 0) {
      setSession(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSession(null);
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isLoading,
    isAuthenticated: session != null,
    async login(username: string, password: string) {
      const nextSession = await authService.login({ username, password });
      setSession(nextSession);
      return nextSession;
    },
    async register(username: string, password: string) {
      const nextSession = await authService.register({ username, password });
      setSession(nextSession);
      return nextSession;
    },
    async logout() {
      await authService.logout();
      setSession(null);
    },
    hasPermission(permission: string) {
      return session?.user.permissions.includes(permission) ?? false;
    },
  }), [isLoading, session]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
