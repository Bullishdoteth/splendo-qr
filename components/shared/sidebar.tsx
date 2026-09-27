"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ConciergeBell,
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { useState, useEffect } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Menu",
    href: "/admin/menu",
    icon: Utensils,
  },
  {
    title: "Location",
    href: "/admin/location",
    icon: ConciergeBell,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
          },
        },
      });
    } catch {
      router.push("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userEmail = session?.user?.email || "manager@splendohotels.com";
  const userName = session?.user?.name || "Splendo Manager";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const NavContent = () => (
    <>
      {/* Brand Header */}
      <div className="px-2 flex items-center justify-between">
        <Link
          href="/admin/overview"
          onClick={() => setMobileOpen(false)}
          className="block group"
        >
          <h1 className="text-lg font-bold tracking-wider text-stone-900 uppercase">
            Splendo
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium">
            Hotel & Suites
          </p>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#EAEAE3] transition-colors"
          aria-label="Close navigation"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/overview" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#1C1917] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#EAEAE3]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-stone-500"
                }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  const UserFooter = () => (
    <div className="pt-4 border-t border-[#E2E2DC]">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 font-semibold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-900 truncate">
              {userName}
            </p>
            <p className="text-[11px] text-stone-500 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          title="Sign out"
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-[#EAEAE3] transition-colors shrink-0 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-[#F5F5F0]/95 backdrop-blur-md border-b border-[#E2E2DC] px-4 py-3 flex items-center justify-between select-none font-sans">
        <Link href="/admin/overview" className="block group">
          <h1 className="text-base font-bold tracking-wider text-stone-900 uppercase">
            Splendo
          </h1>
          <p className="text-[9px] tracking-[0.2em] uppercase text-stone-500 font-medium">
            Staff Portal
          </p>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-stone-700 bg-white border border-[#E2E2DC] hover:bg-[#EAEAE3] transition-colors shadow-2xs flex items-center gap-2 text-xs font-semibold"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <aside className="relative w-72 max-w-[82vw] bg-[#F5F5F0] h-full shadow-2xl p-5 flex flex-col justify-between z-10 border-r border-[#E2E2DC] animate-in slide-in-from-left duration-200 select-none font-sans">
            <div className="space-y-8">
              <NavContent />
            </div>
            <UserFooter />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-col justify-between bg-[#F5F5F0] border-r border-[#E2E2DC] shrink-0 z-40 select-none px-4 py-6 font-sans">
        <div className="space-y-8">
          <NavContent />
        </div>
        <UserFooter />
      </aside>
    </>
  );
}

