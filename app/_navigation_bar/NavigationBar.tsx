"use client";
import React, { useEffect, useState } from "react";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigationToggle from "./MobileNavigationToggle";
import MobileNavigation from "./MobileNavigation";
import Logo from "@/components/ui/logo";

const NavigationBar = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="fixed w-full top-0 left-0 z-50 bg-background">
      <nav className="web-layout h-28 flex items-center justify-between ">
        <Logo />
        <div className="flex items-center">
          <DesktopNavigation setOpen={setOpen} />
          <MobileNavigationToggle open={open} setOpen={setOpen} />
        </div>
        <MobileNavigation open={open} setOpen={setOpen} />
      </nav>
    </div>
  );
};

export default NavigationBar;
