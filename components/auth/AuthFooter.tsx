import React from "react";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkHref: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  text,
  linkText,
  linkHref,
}) => (
  <div className="text-center text-sm text-muted-foreground">
    {text}{" "}
    <a href={linkHref} className="text-primary hover:underline">
      {linkText}
    </a>
  </div>
);
