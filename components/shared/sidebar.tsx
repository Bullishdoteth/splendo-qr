"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ConciergeBell,
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { useState } from "react";

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

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between bg-[#F5F5F0] border-r border-[#E2E2DC] shrink-0 z-40 select-none px-4 py-6 font-sans">
      {/* Top Header & Navigation */}
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="px-2">
          <Link href="/admin/overview" className="block group">
            <h1 className="text-lg font-bold tracking-wider text-stone-900 uppercase">
              Splendo
            </h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium">
              Hotel & Suites
            </p>
          </Link>
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
      </div>

      {/* Profile & Logout Footer */}
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
    </aside>
  );
}
