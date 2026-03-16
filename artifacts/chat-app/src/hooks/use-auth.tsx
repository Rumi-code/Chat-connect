import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCreateOrGetUser, type User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  login: (username: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const createUserMutation = useCreateOrGetUser();

  useEffect(() => {
    const stored = localStorage.getItem("chat_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
    setIsLoaded(true);
  }, []);

  const login = async (username: string, displayName: string) => {
    const newUser = await createUserMutation.mutateAsync({
      data: { username, displayName },
    });
    localStorage.setItem("chat_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("chat_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
