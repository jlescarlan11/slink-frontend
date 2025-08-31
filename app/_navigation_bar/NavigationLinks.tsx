// Updated NavigationLinks.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LogIn } from "lucide-react";
import { getNavigationItems, ROUTES } from "@/lib/config/routes";

// Use centralized navigation configuration
const pages = getNavigationItems();

const NavigationLinks = ({ closeNav }: { closeNav: () => void }) => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    }
    closeNav();
  };

  return (
    <>
      {pages.map(({ path, label }) => (
        <Link
          key={path}
          onClick={() => closeNav()}
          href={`/${path}`}
          className="group flex flex-col items-center gap-1 py-2"
        >
          <span className="navigation-text">{label}</span>
          <div className="w-0 group-hover:w-6 h-px bg-primary transition-all duration-300" />
        </Link>
      ))}

      {!isLoading && (
        <>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                variant="outline"
                onClick={handleAuthAction}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href={ROUTES.AUTH.LOGIN} onClick={() => closeNav()}>
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </>
      )}
    </>
  );
};

export default NavigationLinks;
