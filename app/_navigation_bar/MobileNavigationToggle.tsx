import { NavigationProps } from "@/types/navigationProps";
import { MdMenu, MdMenuOpen } from "react-icons/md";

const MobileNavigationToggle = ({ open, setOpen }: NavigationProps) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="lg:hidden z-50"
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? <MdMenuOpen size={20} /> : <MdMenu size={20} />}
    </button>
  );
};

export default MobileNavigationToggle;
