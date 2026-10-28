"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
  geminiApiKey?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGeminiConnected: boolean;
  loginWithGoogle: (email: string, name?: string, geminiKey?: string) => void;
  logout: () => void;
  setGeminiApiKey: (key: string) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adscene_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to read user from storage:", e);
    }
  }, []);

  const loginWithGoogle = (email: string, name?: string, geminiKey?: string) => {
    const cleanEmail = email.trim();
    const displayName = name || cleanEmail.split("@")[0] || "Google User";
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=059669`;

    const newUser: UserProfile = {
      email: cleanEmail,
      name: displayName,
      avatar,
      geminiApiKey: geminiKey?.trim() || user?.geminiApiKey || "",
    };

    setUser(newUser);
    localStorage.setItem("adscene_user", JSON.stringify(newUser));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("adscene_user");
  };

  const setGeminiApiKey = (key: string) => {
    if (!user) return;
    const updated = { ...user, geminiApiKey: key.trim() };
    setUser(updated);
    localStorage.setItem("adscene_user", JSON.stringify(updated));
  };

  const isGeminiConnected = Boolean(user?.geminiApiKey && user.geminiApiKey.length > 5);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGeminiConnected,
        loginWithGoogle,
        logout,
        setGeminiApiKey,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
