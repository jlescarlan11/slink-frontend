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
import { ROUTES, isPublicRoute } from "@/lib/config/routes";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";

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

// Use centralized route configuration

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public using centralized function
  const isCurrentRoutePublic = isPublicRoute(pathname);

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
        if (isCurrentRoutePublic) {
          router.push(ROUTES.AUTH.HOME);
        }
      }, 150); // Increased delay to ensure state update
    },
    [router, isCurrentRoutePublic]
  );

  const logout = useCallback(() => {
    const tokenStorage = SecureTokenStorage.getInstance();
    tokenStorage.clearTokens();
    setUser(null);
    router.push(ROUTES.AUTH.LOGIN);
    toast.success(ERROR_MESSAGES.LOGOUT_SUCCESS);
  }, [router]);

  // Simplified redirect logic - only redirect to login when not authenticated
  useEffect(() => {
    if (isLoading) return;

    const tokenStorage = SecureTokenStorage.getInstance();
    const hasToken = !!tokenStorage.getToken();

    // Only redirect to login if no token and trying to access protected route
    if (!hasToken && !isCurrentRoutePublic) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [isLoading, pathname, router, isCurrentRoutePublic]);

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
