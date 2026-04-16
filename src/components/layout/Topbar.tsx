import { Home, Moon, Search, ShoppingBag } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Overview", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/tracked", label: "Tracked", icon: ShoppingBag },
];

export function Topbar() {
  return (
    <header className="border-b border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/home" className="hidden min-w-0 sm:block">
            <div className="truncate text-[15px] font-semibold">
              Price History
            </div>
            <div className="truncate text-xs text-ink-500 dark:text-neutral-400">
              Moldova stores
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
            className="inline-flex h-9 items-center gap-2 rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    </header>
  );
}
