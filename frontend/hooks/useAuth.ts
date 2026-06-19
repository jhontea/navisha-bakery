"use client";

import { useState, useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin";
}

const MOCK_ADMIN: Admin = {
  id: "1",
  email: "admin@navishabakery.com",
  name: "Admin User",
  role: "super_admin",
};

const DEV_MODE = true;

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_MODE);
  const [isLoading, setIsLoading] = useState(!DEV_MODE);
  const [admin, setAdmin] = useState<Admin | null>(DEV_MODE ? MOCK_ADMIN : null);

  useEffect(() => {
    if (DEV_MODE) {
      setIsAuthenticated(true);
      setAdmin(MOCK_ADMIN);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/auth/me`, {
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

  const login = async (accessToken: string) => {
    if (DEV_MODE) {
      setIsAuthenticated(true);
      setAdmin(MOCK_ADMIN);
      return true;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdmin(data.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setAdmin(null);
    if (!DEV_MODE) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // ignore logout errors
      }
    }
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    login,
    logout,
  };
}