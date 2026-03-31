"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🍞" },
  { href: "/shelf", label: "Shelf", icon: "🗄️" },
  { href: "/board", label: "Board", icon: "📊" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t-2 px-4 py-2 z-50" style={{ backgroundColor: "#FFFAF0", borderColor: "rgba(244, 164, 96, 0.2)" }}>
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-1 px-3 rounded-lg transition-colors"
              style={{ color: isActive ? "#8B4513" : "rgba(62, 39, 35, 0.4)" }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
