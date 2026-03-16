import { useState, useEffect, useCallback } from "react";

export function useAuth() {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chat_username");
      if (stored) {
        setUsername(stored);
      }
    } catch (e) {
      console.error("Failed to read username from localStorage");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    localStorage.setItem("chat_username", trimmed);
    setUsername(trimmed);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("chat_username");
    setUsername(null);
  }, []);

  return { username, login, logout, isLoaded };
}
