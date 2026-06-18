"use client";

import { useState, useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    // Check for JWT cookie or localStorage
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setAdmin(data.data);
        } else {
          setIsAuthenticated(false);
          setAdmin(null);
        }
      } catch {
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (idToken: string) => {
    const res = await fetch("/api/admin/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setIsAuthenticated(true);
      setAdmin(data.data);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    login,
    logout,
  };
}