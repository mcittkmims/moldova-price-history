import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "../components/layout/Footer";
import { Topbar } from "../components/layout/Topbar";
import { APP_BASE_URL } from "../lib/server-env";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: {
    default: "pricehistory.md",
    template: "%s | pricehistory.md",
  },
  description:
    "Track Moldova store prices, browse product histories, and keep a stable URL for every product page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen overflow-x-hidden bg-ink-100 text-ink-900 dark:bg-[#0f0f0f] dark:text-neutral-100">
            <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
              <Topbar />
              <main className="w-full flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
