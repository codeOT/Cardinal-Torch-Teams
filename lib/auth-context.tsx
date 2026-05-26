"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiGet, apiPost } from "@/lib/api-client";
import type { TeamMember } from "@/lib/types";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  role?: string;
}

interface AuthContextValue {
  user: TeamMember | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<TeamMember>;
  signup: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const data = await apiGet<{ user: TeamMember | null }>("/api/auth/session");
    setUser(data.user);
  }, []);

  useEffect(() => {
    refreshSession()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ user: TeamMember }>("/api/auth/login", {
      email,
      password,
    });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (input: SignUpInput) => {
    const data = await apiPost<{ user: TeamMember }>("/api/auth/signup", input);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiPost("/api/auth/logout", {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
