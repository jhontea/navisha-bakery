"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, admin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/dashboard/menu", icon: "restaurant_menu", label: "Menu Management" },
    { href: "/dashboard/admins", icon: "group", label: "Admin Users" },
    { href: "/dashboard/contacts", icon: "contact_support", label: "Contact Inquiries" },
  ];

  const adminName = admin?.name || "Admin User";
  const adminEmail = admin?.email || "admin@navishabakery.com";
  const adminRole = admin?.role === "super_admin" ? "Super Admin" : "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>
              bakery_dining
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary leading-tight">Admin Portal</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Artisanal Control</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-label-md text-label-md ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
              }`}
              onClick={() => isMobile && setIsSidebarOpen(false)}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  fontSize: "20px",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg bg-surface-container-high">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="font-label-md font-bold text-on-primary-container">{adminInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md font-bold text-on-surface truncate">{adminName}</p>
            <p className="font-label-sm text-on-surface-variant truncate">{adminEmail}</p>
            <p className="font-label-sm text-primary">{adminRole}</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
          onClick={() => isMobile && setIsSidebarOpen(false)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_back</span>
          <span className="font-label-md text-label-md">Back to Site</span>
        </Link>
        <button
          onClick={() => { handleLogout(); if (isMobile) setIsSidebarOpen(false); }}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all w-full text-left"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>logout</span>
          <span className="font-label-md text-label-md">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant p-4 z-50">
        {sidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-brown-900/40 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant p-4 z-50 transition-transform duration-300 overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(true)}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant">
          <button className="p-2 text-on-surface-variant" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "24px" }}>menu</span>
          </button>
          <h1 className="font-headline-md text-headline-md text-primary">Admin Portal</h1>
          <div className="w-10" />
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around py-2 px-4 z-40">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                    fontSize: "24px",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}