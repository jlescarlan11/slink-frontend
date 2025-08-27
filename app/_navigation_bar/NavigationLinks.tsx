import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pages = [
  ["home", "Home"],
  ["about", "About"],
];

const NavigationLinks = ({ closeNav }: { closeNav: () => void }) => {
  return (
    <>
      {pages.map(([pageLink, label]) => (
        <Link
          key={pageLink}
          onClick={() => closeNav()}
          href={`/${pageLink}`}
          className="group flex flex-col items-center gap-1 py-2"
        >
          <span className="navigation-text">{label}</span>
          <div className="w-0 group-hover:w-6 h-px bg-primary transition-all duration-300" />
        </Link>
      ))}
      <Button size="lg" variant="outline">
        SignUp
      </Button>
    </>
  );
};

export default NavigationLinks;
