// ================================================================
// AUTH CONTEXT - Handles login state + role persistence
// File: src/hooks/useAuth.tsx
// ================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  passenger_id?: number;
  worker_id?: number;
  name?: string;
  email?: string;
  age?: number;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Restore login state
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const extractedUser = parsed.user ? parsed.user : parsed;
        setUser(extractedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ✅ Handle login + store user properly
  const login = (userData: any) => {
  // Backend sends: { success, user: {...}, role: "Passenger" }
    let extractedUser = userData.user ? userData.user : userData;

    // Attach role if provided outside user object
    const role = userData.role || extractedUser.role || "unknown";
    extractedUser = { ...extractedUser, role: role.toLowerCase() };

    if (!extractedUser.email) {
      console.warn("⚠️ Invalid user data during login:", userData);
      return;
    }

    // ✅ Store + update context (no redirect here)
    localStorage.setItem("user", JSON.stringify(extractedUser));
    setUser(extractedUser);
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
