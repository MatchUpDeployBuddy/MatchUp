"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRocket, FaUsers, FaWhmcs } from "react-icons/fa";
import { BsChatText } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { NAVBAR_HEIGHT } from "@/constants";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Matches",
    href: "/dashboard",
    icon: FaRocket,
  },
  {
    label: "Buddys",
    href: "/buddys",
    icon: FaUsers,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: BsChatText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: FaWhmcs,
  },
];

export function Navbar() {
  const currentPath = usePathname();

  const hideNav =
    currentPath === "/" ||
    currentPath === "/landingpage" ||
    currentPath === "/login" ||
    currentPath === "/account-creation";

  return (
    <nav
      className={`fixed bottom-4 left-4 right-4 z-50 bg-[#1C1C1E] px-4 py-2 rounded-full shadow-md ${
        hideNav ? "hidden" : ""
      }`}
      style={{ height: NAVBAR_HEIGHT }}
    >
      <div className="flex justify-center items-center max-w-screen-xl mx-auto">
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                currentPath === item.href
                  ? "bg-[hsl(81,89%,61%)] text-black"
                  : "hover:bg-gray-800 text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  currentPath === item.href ? "text-black" : "text-white"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium transition-opacity",
                  currentPath === item.href ? "opacity-100" : "hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
