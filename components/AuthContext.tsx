"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check for token in cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (!token) {
        // Only set user to null if we don't already have a user from login
        if (user === null) {
          setUser(null);
        }
        // Return early - redirect will be handled in useEffect
        return;
      } else {
        // Token exists, user is authenticated
        // For now, we'll set a placeholder user
        // In production, you'd verify the token with the backend
        // Only set from token if we don't already have a user (e.g., from login function)
        if (user === null) {
          setUser({ id: "1", email: "user@example.com" });
        }
        // If we already have a user, we assume it's more complete or equally valid
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Only set user to null if we don't already have a user from login
      if (user === null) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, user]);

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  // Handle redirects separately to avoid React state update errors
  useEffect(() => {
    if (!isLoading && !user && !pathname?.startsWith("/login") && !pathname?.startsWith("/signup")) {
      router.push("/login");
    }
  }, [isLoading, user, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear the token cookie
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
