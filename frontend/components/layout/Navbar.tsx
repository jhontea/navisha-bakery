"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/contact", label: "Contact" },
  ];

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
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-200 ${
                pathname === link.href
                  ? "text-primary font-bold border-b-2 border-accent-terracotta"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform duration-200 shadow-md"
          >
            Order Now
          </Link>
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
            <Link
              key={link.href}
              href={link.href}
              className={`block py-3 px-4 rounded-lg mb-2 ${
                pathname === link.href
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block w-full text-center bg-primary text-on-primary px-6 py-3 rounded-lg font-bold mt-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Order Now
          </Link>
        </div>
      )}
    </header>
  );
}