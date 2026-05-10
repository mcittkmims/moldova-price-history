"use client";

import {
  BarChart3,
  CircleUserRound,
  Home,
  Moon,
  Search,
  ShoppingBag,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { href: "/home", label: "Overview", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/tracked", label: "Tracked", icon: ShoppingBag },
];

export function Topbar() {
  const { theme, toggleTheme } = useAppState();
  const { isAuthenticated, isLoading, logout, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const visibleNavItems = isAuthenticated
    ? navItems
    : navItems.filter((item) => item.href !== "/tracked");

  useEffect(() => {
    visibleNavItems.forEach((item) => {
      if (item.href !== pathname) {
        router.prefetch(item.href);
      }
    });
  }, [pathname, router, visibleNavItems]);

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  return (
    <header className="border-b border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link
            href="/home"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="pricehistory.md home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-900 text-moss-500 shadow-soft dark:bg-neutral-950">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-[15px] font-semibold">
                pricehistory.md
              </div>
            </div>
          </Link>

          <nav className="flex min-w-0 items-center gap-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-label={item.label}
                className={[
                  "inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors sm:px-3",
                  pathname === item.href
                    ? "bg-moss-50 text-moss-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-ink-700 hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                ].join(" ")}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          {isLoading ? (
            <div className="hidden h-9 w-28 rounded-md border border-ink-200 bg-ink-50 sm:block dark:border-neutral-700 dark:bg-neutral-800" />
          ) : isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                title={session?.user.username}
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <CircleUserRound className="h-4 w-4" />
              </button>

              <div
                className={[
                  "absolute right-0 top-11 z-20 min-w-[180px] rounded-md border border-ink-200 bg-white p-1 shadow-soft dark:border-neutral-700 dark:bg-[#171717]",
                  profileOpen ? "block" : "hidden",
                ].join(" ")}
              >
                <div className="px-3 py-2 text-sm text-ink-500 dark:text-neutral-400">
                  {session?.user.username}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                  className="flex h-9 w-full items-center rounded-md px-3 text-left text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden h-9 items-center rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 sm:inline-flex dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md bg-ink-900 px-3 text-sm text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
