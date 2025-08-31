// Centralized route configuration
export const ROUTES = {
  // Public routes that don't require authentication
  PUBLIC: ["/login", "/register", "/forgot-password"] as const,
  
  // Main navigation routes
  NAVIGATION: [
    { path: "", label: "Home" },
    { path: "about", label: "About" }
  ] as const,
  
  // Authentication routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    HOME: "/"
  } as const,
  
  // API endpoints
  API: {
    AUTH: {
      LOGIN: "/api/auth/public/login",
      REGISTER: "/api/auth/public/register"
    }
  } as const
} as const;

// Helper function to check if a route is public
export const isPublicRoute = (pathname: string): boolean => {
  return ROUTES.PUBLIC.includes(pathname as any);
};

// Helper function to get navigation items
export const getNavigationItems = () => ROUTES.NAVIGATION;
