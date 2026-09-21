"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, LoginInput, RegisterInput, User } from "@/types/auth";
import { authApi } from "./auth-api";
import { clearSession, onSessionExpired, refreshSession, storeSession } from "./session";
import { hasSessionHint } from "./token-store";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Why the session ended, so guards can decide whether to remember the page. */
  endedBy: "logout" | "expired" | null;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  /** Replace the cached user after a profile update. */
  setUser: (user: User) => void;
  /** Adopt a fresh session (e.g. returned by change-password). */
  applySession: (session: AuthSession) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUserState] = useState<User | null>(null);
  const [endedBy, setEndedBy] = useState<AuthContextValue["endedBy"]>(null);

  const applySession = useCallback((session: AuthSession) => {
    storeSession(session);
    setUserState(session.user);
    setEndedBy(null);
    setStatus("authenticated");
  }, []);

  // Restore the session on page load from the HttpOnly refresh cookie.
  useEffect(() => {
    let cancelled = false;

    onSessionExpired(() => {
      setUserState(null);
      setEndedBy("expired");
      setStatus("unauthenticated");
    });

    if (!hasSessionHint()) {
      setStatus("unauthenticated");
    } else {
      void refreshSession().then((session) => {
        if (cancelled) return;
        if (session) {
          setUserState(session.user);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      });
    }

    return () => {
      cancelled = true;
      onSessionExpired(null);
    };
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await authApi.login(input);
      applySession(session);
      return session.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await authApi.register(input);
      applySession(session);
      return session.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, the local session must end.
    }
    clearSession();
    setUserState(null);
    setEndedBy("logout");
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, endedBy, login, register, logout, setUser: setUserState, applySession }),
    [status, user, endedBy, login, register, logout, applySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
