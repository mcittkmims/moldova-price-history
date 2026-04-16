import {
  BarChart3,
  Home,
  Moon,
  Search,
  ShoppingBag,
  Sun,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAppState } from "../../context/AppStateContext";

const navItems = [
  { to: "/home", label: "Overview", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/tracked", label: "Tracked", icon: ShoppingBag },
];

export function Topbar() {
  const { theme, toggleTheme } = useAppState();

  return (
    <header className="border-b border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-7">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link
            to="/home"
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
              <div className="truncate text-xs text-ink-500 dark:text-neutral-400">
                Track Moldova store prices
              </div>
            </div>
          </Link>

          <nav className="flex min-w-0 items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={({ isActive }) =>
                  [
                    "inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors sm:px-3",
                    isActive
                      ? "bg-moss-50 text-moss-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-ink-700 hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  ].join(" ")
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
