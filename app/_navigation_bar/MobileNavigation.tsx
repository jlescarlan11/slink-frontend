import React from "react";
import NavigationLinks from "./NavigationLinks";
import { NavigationProps } from "@/types/navigationProps";
import Footer from "../Footer";

const MobileNavigation = ({ open, setOpen }: NavigationProps) => {
  return (
    <div
      className={`lg:hidden fixed inset-0 top-28 bg-background border-t z-40 flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <nav className="flex-1 flex flex-col items-center justify-center p-8 gap-2">
        <NavigationLinks closeNav={() => setOpen(false)} />
      </nav>
      <Footer />
    </div>
  );
};

export default MobileNavigation;
