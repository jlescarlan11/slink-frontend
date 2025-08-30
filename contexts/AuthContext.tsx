// contexts/AuthContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { SecureTokenStorage } from "@/utils/tokenStorage";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
    userData: User
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Move public routes outside component to avoid recreation on every render
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const login = useCallback(
    (
      tokens: { accessToken: string; refreshToken: string; expiresIn: number },
      userData: User
    ) => {
      const tokenStorage = SecureTokenStorage.getInstance();
      tokenStorage.setTokens(tokens.accessToken);
      
      // Set user state immediately
      setUser(userData);
      
      // Ensure state is updated before redirect
      setTimeout(() => {
        if (PUBLIC_ROUTES.includes(pathname)) {
          router.push("/");
        }
      }, 150); // Increased delay to ensure state update
    },
    [router, pathname]
  );

  const logout = useCallback(() => {
    const tokenStorage = SecureTokenStorage.getInstance();
    tokenStorage.clearTokens();
    setUser(null);
    router.push("/login");
    toast.success("Logged out successfully");
  }, [router]);

  // Simplified redirect logic - only redirect to login when not authenticated
  useEffect(() => {
    if (isLoading) return;

    const tokenStorage = SecureTokenStorage.getInstance();
    const hasToken = !!tokenStorage.getToken();

    // Only redirect to login if no token and trying to access protected route
    if (!hasToken && !isPublicRoute) {
      router.push("/login");
    }
  }, [isLoading, pathname, router, isPublicRoute]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
