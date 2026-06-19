"use client";

import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/#vibe", icon: "restaurant_menu", label: "Menu" },
    { href: "/#catch-us", icon: "contact_support", label: "Contact" },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around py-2 px-4 z-50">
      {navItems.map((item) => {
        const isActive = pathname === "/" && (item.href === "/#vibe" || item.href === "/#catch-us")
          ? false
          : pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            onClick={(e) => {
              if (item.href.startsWith("/#")) {
                e.preventDefault();
                scrollToSection(item.href);
              }
            }}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}