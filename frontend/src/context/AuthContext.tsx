import  { createContext, useContext, useState, ReactNode } from "react";

// ✅ Define User type
type User = {
  id: string;
  email: string;
  role: string;
};

// ✅ Define Context type
type AuthContextType = {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

// ✅ Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Props type
type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook with safety check
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}