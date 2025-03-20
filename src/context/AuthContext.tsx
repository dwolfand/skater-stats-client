import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "../types/auth";
import { googleLogin } from "../api/auth";
import { authEvents, AUTH_UNAUTHORIZED } from "../api/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "skater_stats_token";
const USER_KEY = "skater_stats_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    console.log("Initial auth check:", {
      hasToken: !!token,
      hasUser: !!savedUser,
    });

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("Received unauthorized event, logging out");
      logout();
    };

    authEvents.addEventListener(AUTH_UNAUTHORIZED, handleUnauthorized);

    return () => {
      authEvents.removeEventListener(AUTH_UNAUTHORIZED, handleUnauthorized);
    };
  }, []);

  const login = async (idToken: string) => {
    try {
      console.log("Starting login process with idToken");
      const data = await googleLogin(idToken);
      console.log("Login successful:", {
        hasToken: !!data.token,
        hasUser: !!data.user,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
