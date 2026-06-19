"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("vibe");
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const navLinks = [
    { href: "/#vibe", label: "The Vibe", sectionId: "vibe" },
    { href: "/#process", label: "Bakery Goals", sectionId: "process" },
    { href: "/#catch-us", label: "Find Us", sectionId: "catch-us" },
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

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the section with the highest intersection ratio
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
      if (section) observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
      <nav className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <Link href="/" className="font-headline-lg text-headline-lg text-primary tracking-tighter flex items-center gap-2">
          <span className="text-2xl">🥐</span>
          <span>Navisha Bakery</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 font-body-md text-body-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition-colors duration-200 ${
                activeSection === link.sectionId
                  ? "text-accent-terracotta font-bold border-b-2 border-accent-terracotta pb-1"
                  : "text-on-surface-variant hover:text-accent-terracotta"
              }`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="/#catch-us"
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform duration-200 shadow-md"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("/#catch-us");
            }}
          >
            Order Now
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-on-surface-variant"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface-card border-t border-outline-variant p-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`block py-3 px-4 rounded-lg mb-2 ${
                activeSection === link.sectionId
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#catch-us"
            className="block w-full text-center bg-primary text-on-primary px-6 py-3 rounded-lg font-bold mt-4"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("/#catch-us");
              setIsMenuOpen(false);
            }}
          >
            Order Now
          </a>
        </div>
      )}
    </header>
  );
}