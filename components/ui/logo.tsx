import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 lg:gap-4">
      <span className="text-xs lg:text-lg font-light tracking-wider">
        Slink
      </span>
    </Link>
  );
};

export default Logo;
