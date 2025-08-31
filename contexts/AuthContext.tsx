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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public using centralized function
  const isCurrentRoutePublic = isPublicRoute(pathname);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const tokenStorage = SecureTokenStorage.getInstance();
      const token = tokenStorage.getToken();

      if (token) {
        // TODO: Validate token with your API and get user data
        // For now, we'll assume token is valid if it exists
        // You should replace this with actual API validation
        try {
          // Example API call to validate token and get user:
          // const response = await fetch('/api/auth/validate', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // const userData = await response.json();
          // setUser(userData);

          // Temporary: Set a dummy user if token exists
          // Remove this and implement proper token validation
          setUser({ id: "temp", username: "temp_user" });
        } catch {
          // Token is invalid, clear it
          tokenStorage.clearTokens();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    (
      tokens: { accessToken: string; refreshToken: string; expiresIn: number },
      userData: User
    ) => {
      const tokenStorage = SecureTokenStorage.getInstance();
      tokenStorage.setTokens(tokens.accessToken);

      // Set user state immediately
      setUser(userData);

      // Redirect to dashboard after login
      setTimeout(() => {
        router.push(ROUTES.AUTH.DASHBOARD);
      }, 100);
    },
    [router]
  );

  const logout = useCallback(() => {
    const tokenStorage = SecureTokenStorage.getInstance();
    tokenStorage.clearTokens();
    setUser(null);
    router.push(ROUTES.AUTH.LOGIN);
    toast.success(ERROR_MESSAGES.LOGOUT_SUCCESS);
  }, [router]);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const isAuthenticated = !!user;

    // Redirect logic
    if (!isAuthenticated && !isCurrentRoutePublic) {
      // User is not authenticated and trying to access protected route
      router.push(ROUTES.AUTH.LOGIN);
    } else if (
      isAuthenticated &&
      (pathname === ROUTES.AUTH.LOGIN || pathname === ROUTES.AUTH.REGISTER)
    ) {
      // User is authenticated but on login/register page
      router.push(ROUTES.AUTH.DASHBOARD);
    }
  }, [isLoading, user, pathname, router, isCurrentRoutePublic]);

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
