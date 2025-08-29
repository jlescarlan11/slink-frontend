import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LucideIcon } from "lucide-react";

interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isSubmitting: boolean;
  loadingText: string;
  buttonText: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = "submit",
  disabled = false,
  isSubmitting,
  loadingText,
  buttonText,
  icon: Icon,
  onClick,
}) => (
  <Button
    type={type}
    disabled={disabled || isSubmitting}
    className="w-full"
    onClick={onClick}
  >
    {isSubmitting ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        {loadingText}
      </>
    ) : (
      <>
        <Icon className="w-4 h-4 mr-2" />
        {buttonText}
      </>
    )}
  </Button>
);
