import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/home", label: "Overview" },
  { to: "/search", label: "Search" },
  { to: "/tracked", label: "Tracked" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-ink-600 md:flex-row md:items-center md:justify-between md:px-7 dark:text-neutral-400">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink-900 text-moss-500 dark:bg-neutral-950">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium text-ink-900 dark:text-neutral-100">
              PriceHistory.md
            </div>
            <div className="truncate text-xs">
              Price tracking for Moldova stores.
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-2 py-1 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://pricehistory.md"
            className="rounded-md px-2 py-1 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            pricehistory.md
          </a>
        </nav>
      </div>
    </footer>
  );
}
