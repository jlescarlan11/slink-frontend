import Link from "next/link";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

const socialLinks = [
  {
    href: "https://facebook.com",
    icon: SiFacebook,
    label: "Facebook",
  },
  {
    href: "https://instagram.com",
    icon: SiInstagram,
    label: "Instagram", // Fixed: Was "Instragram"
  },
  {
    href: "https://x.com",
    icon: SiX,
    label: "X",
  },
];

const Footer = () => {
  return (
    <footer className="web-layout h-28 flex items-center flex-col sm:flex-row justify-center sm:justify-between">
      <p className="text-center text-xs text-foreground/60">
        © {new Date().getFullYear()} Slink. All Rights Reserved.
      </p>

      <nav className="flex gap-4" aria-label="Social media links">
        {socialLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit our ${label} page`} // More descriptive aria-label
            className="p-2 rounded-md hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Icon
              size={18}
              className="text-foreground/40 hover:text-foreground transition-colors"
            />
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
