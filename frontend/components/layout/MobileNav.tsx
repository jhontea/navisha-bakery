"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("vibe");

  const navItems = [
    { href: "/#vibe", icon: "restaurant_menu", label: "The Menu", sectionId: "vibe" },
    { href: "/#process", icon: "flag", label: "Bakery Goals", sectionId: "process" },
    { href: "/#catch-us", icon: "contact_support", label: "Find Us", sectionId: "catch-us" },
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

  // Track active section based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const visibleSections = entries
              .filter((e) => e.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visibleSections.length > 0) {
              setActiveSection(visibleSections[0].target.id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.1, 0.3, 0.5],
      }
    );

    const sections = ["vibe", "process", "catch-us"].map((id) => document.getElementById(id)).filter(Boolean);
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around py-2 px-4 z-50">
      {navItems.map((item) => {
        const isActive = activeSection === item.sectionId;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-accent-terracotta" : "text-on-surface-variant"}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.href);
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