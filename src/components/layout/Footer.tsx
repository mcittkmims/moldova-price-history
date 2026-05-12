import { Github, Linkedin, Mail } from "lucide-react";

const contactLinks = [
  {
    href: "mailto:adrian@pricehistory.md",
    label: "Email",
    icon: Mail,
  },
  {
    href: "https://github.com/mcittkmims",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/adrian-vremere/",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
      <div className="flex w-full flex-col gap-4 px-4 py-5 text-sm text-ink-600 sm:px-6 lg:px-8 dark:text-neutral-400">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-ink-900 dark:text-neutral-100">
              pricehistory.md
            </div>
            <div className="mt-1 text-xs">
              Copyright {year} pricehistory.md. All rights reserved.
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
      </div>
    </footer>
  );
}
