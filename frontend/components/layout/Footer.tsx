import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-white border-t border-outline-variant/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>
                bakery_dining
              </span>
            </div>
            <span className="font-headline-lg text-headline-lg text-primary">
              Navisha Bakery
            </span>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-8 font-bold text-on-surface-variant uppercase tracking-widest text-xs">
            <Link
              href="#"
              className="hover:text-accent-terracotta transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="hover:text-accent-terracotta transition-colors"
            >
              TikTok
            </Link>
            <Link
              href="#"
              className="hover:text-accent-terracotta transition-colors"
            >
              Pinterest
            </Link>
            <Link
              href="#"
              className="hover:text-accent-terracotta transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Link
              href="#"
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-accent-gold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-primary">
                share
              </span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-accent-terracotta hover:text-white transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">favorite</span>
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-on-surface-variant font-body-sm opacity-40">
            © {new Date().getFullYear()} Navisha Bakery. Stay Sweet. ✨
          </div>
        </div>
      </div>
    </footer>
  );
}