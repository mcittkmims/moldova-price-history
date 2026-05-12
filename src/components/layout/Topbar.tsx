"use client";

import {
  BarChart3,
  CircleUserRound,
  Home,
  Languages,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export function Topbar() {
  const { theme, toggleTheme } = useAppState();
  const { isAuthenticated, isLoading, logout, session } = useAuth();
  const { tr, language, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { href: "/home", label: tr.nav_overview, icon: Home },
    { href: "/search", label: tr.nav_search, icon: Search },
    { href: "/tracked", label: tr.nav_tracked, icon: ShoppingBag },
  ];

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

  // Close dropdowns on outside click / escape
  useEffect(() => {
    if (!profileOpen && !mobileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (profileOpen && !profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileMenuOpen && !mobileMenuRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen, mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="relative border-b border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="page-px flex h-16 w-full items-center justify-between gap-3">

        {/* Left: logo + desktop/tablet nav */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
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

          {/* Desktop/tablet nav — hidden on mobile */}
          <nav className="hidden items-center gap-1 sm:flex">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-label={item.label}
                className={[
                  "inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-moss-50 text-moss-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-ink-700 hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                ].join(" ")}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {/* Labels visible at lg+, icons-only at sm–lg */}
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Language toggle — always visible */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 text-xs font-medium text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{language === "en" ? "RO" : "EN"}</span>
          </button>

          {/* Theme toggle — always visible */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? tr.theme_dark : tr.theme_light}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Auth area — desktop/tablet only */}
          <div className="hidden sm:flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-24 rounded-md border border-ink-200 bg-ink-50 dark:border-neutral-700 dark:bg-neutral-800" />
            ) : isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-label={tr.profile_menu}
                  aria-expanded={profileOpen}
                  title={session?.user.username}
                  onClick={() => setProfileOpen((c) => !c)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  <CircleUserRound className="h-4 w-4" />
                </button>
                <div
                  className={[
                    "absolute right-0 top-11 z-30 min-w-[180px] rounded-md border border-ink-200 bg-white p-1 shadow-soft dark:border-neutral-700 dark:bg-[#171717]",
                    profileOpen ? "block" : "hidden",
                  ].join(" ")}
                >
                  <div className="px-3 py-2 text-sm text-ink-500 dark:text-neutral-400">
                    {session?.user.username}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); void logout(); }}
                    className="flex h-9 w-full items-center rounded-md px-3 text-left text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {tr.logout}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  {tr.register}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-md bg-ink-900 px-3 text-sm text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
                >
                  {tr.sign_in}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <div className="sm:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((c) => !c)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <div className="absolute left-0 right-0 top-16 z-30 border-b border-ink-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
                <nav className="flex flex-col p-2 gap-1">
                  {visibleNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-moss-50 text-moss-900 dark:bg-neutral-800 dark:text-neutral-100"
                          : "text-ink-700 hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                      ].join(" ")}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1 border-t border-ink-200 dark:border-neutral-800" />

                  {isLoading ? null : isAuthenticated ? (
                    <>
                      <div className="px-3 py-1.5 text-xs text-ink-400 dark:text-neutral-500">
                        {session?.user.username}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setMobileMenuOpen(false); void logout(); }}
                        className="inline-flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm text-ink-700 transition-colors hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <CircleUserRound className="h-4 w-4 shrink-0" />
                        {tr.logout}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm text-ink-700 transition-colors hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        {tr.register}
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
                      >
                        {tr.sign_in}
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
