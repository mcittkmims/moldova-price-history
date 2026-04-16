import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/home", label: "Overview" },
  { to: "/search", label: "Search" },
  { to: "/tracked", label: "Tracked" },
];

const contactLinks = [
  {
    href: "mailto:hello@pricehistory.md",
    label: "Email",
    icon: Mail,
  },
  {
    href: "https://github.com/mcittkmims/moldova-price-history",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://www.linkedin.com/company/pricehistory-md/",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-ink-600 md:px-7 dark:text-neutral-400">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-ink-900 dark:text-neutral-100">
              PriceHistory.md
            </div>
            <div className="mt-1 text-xs">
              Copyright {year} PriceHistory.md. All rights reserved.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 border-t border-ink-200 pt-4 text-xs dark:border-neutral-800">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-ink-900 dark:hover:text-neutral-100"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://pricehistory.md"
            className="transition-colors hover:text-ink-900 dark:hover:text-neutral-100"
          >
            pricehistory.md
          </a>
        </nav>
      </div>
    </footer>
  );
}
