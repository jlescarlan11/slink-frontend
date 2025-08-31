// Type for public route paths (exact matches and patterns)
type PublicRoutePath = (typeof ROUTES.PUBLIC)[number];

// Centralized route configuration
export const ROUTES = {
  // Public routes that don't require authentication
  PUBLIC: ["/", "/about", "/login", "/register", "/forgot-password"] as const,

  // Main navigation routes
  NAVIGATION: [
    { path: "", label: "Home" },
    { path: "about", label: "About" },
  ] as const,

  // Authentication routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    DASHBOARD: "/dashboard",
  } as const,

  // API endpoints
  API: {
    AUTH: {
      LOGIN: "/api/auth/public/login",
      REGISTER: "/api/auth/public/register",
    },
  } as const,
} as const;

// Check if route requires authentication
export const isPublicRoute = (pathname: string): boolean => {
  // Handle exact matches first
  if (ROUTES.PUBLIC.includes(pathname as PublicRoutePath)) {
    return true;
  }

  // Handle root route variations (Next.js app router)
  if (pathname === "/" || pathname === "") {
    return true;
  }

  // Add any dynamic route patterns here if needed
  // Example: return pathname.startsWith('/public/') || pathname.startsWith('/blog/');

  return false;
};

// Helper function to get navigation items
export const getNavigationItems = () => ROUTES.NAVIGATION;
