import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const useCases = [
  {
    title: "Check before buying",
    text: "Look up a product and see whether today’s price is actually lower than the last recorded price.",
  },
  {
    title: "Follow items over time",
    text: "Keep products in a tracked list so you can return to the same models without searching again.",
  },
  {
    title: "Compare by store",
    text: "Filter results by store or category when you want to narrow a search to a specific retailer or product type.",
  },
];

const steps = [
  {
    title: "Search",
    text: "Type a product name, model, category, store name, or paste a product link.",
  },
  {
    title: "Review",
    text: "Open a product page to see details, current price, previous price, and recorded price history.",
  },
  {
    title: "Track",
    text: "Save products you care about, then sort your tracked list by price, store, or biggest drop.",
  },
];

export function HomePage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="border-b border-ink-200 pb-8 pt-3 dark:border-neutral-800">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            Price History
          </h1>
          <p className="mt-4 text-base leading-7 text-ink-600 sm:text-lg dark:text-neutral-300">
            Track Moldova store prices, check product history, and keep a short
            list of items worth watching before you buy.
          </p>
        </div>

        <div className="mt-7 max-w-2xl">
          <h2 className="text-lg font-semibold">Start</h2>
          <div className="mt-4 divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
            <Link
              to="/search"
              className="flex min-w-0 items-center gap-3 p-4 text-sm transition-colors hover:bg-ink-50 dark:hover:bg-neutral-800"
            >
              <Search className="h-5 w-5 shrink-0 text-moss-700 dark:text-moss-500" />
              <div className="min-w-0">
                <div className="font-medium">Search products</div>
                <div className="mt-1 truncate text-ink-500 dark:text-neutral-400">
                  Keyword or product link
                </div>
              </div>
            </Link>
            <Link
              to="/tracked"
              className="flex min-w-0 items-center gap-3 p-4 text-sm transition-colors hover:bg-ink-50 dark:hover:bg-neutral-800"
            >
              <ShoppingBag className="h-5 w-5 shrink-0 text-moss-700 dark:text-moss-500" />
              <div className="min-w-0">
                <div className="font-medium">Tracked products</div>
                <div className="mt-1 truncate text-ink-500 dark:text-neutral-400">
                  Items saved in this browser
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="text-xl font-semibold">What it is for</h2>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-neutral-300">
            A practical place to look up product prices and understand whether
            a change is meaningful.
          </p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
          {useCases.map((item) => (
            <div key={item.title} className="flex gap-3 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss-700 dark:text-moss-500" />
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 leading-6 text-ink-500 dark:text-neutral-400">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="text-xl font-semibold">How it works</h2>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-neutral-300">
            The flow is intentionally short: find a product, read the price
            record, and keep it if it matters.
          </p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="grid gap-3 p-4 text-sm sm:grid-cols-[42px_1fr]"
            >
              <div className="font-medium text-ink-500 dark:text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="font-medium">{step.title}</div>
                <div className="mt-1 leading-6 text-ink-500 dark:text-neutral-400">
                  {step.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="text-xl font-semibold">What you see</h2>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-neutral-300">
            Product pages keep the important details together without turning
            the page into a generic dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-y border-ink-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-[#171717]">
            <Store className="h-5 w-5 text-moss-700 dark:text-moss-500" />
            <div className="mt-3 font-medium">Store and category</div>
            <p className="mt-2 leading-6 text-ink-500 dark:text-neutral-400">
              Each listing shows where the product comes from and what kind of
              item it is.
            </p>
          </div>
          <div className="border-y border-ink-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-[#171717]">
            <BarChart3 className="h-5 w-5 text-moss-700 dark:text-moss-500" />
            <div className="mt-3 font-medium">Step price chart</div>
            <p className="mt-2 leading-6 text-ink-500 dark:text-neutral-400">
              Prices are shown as steps because store prices usually change at
              a point in time and hold until the next update.
            </p>
          </div>
          <div className="border-y border-ink-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-[#171717]">
            <Clock3 className="h-5 w-5 text-moss-700 dark:text-moss-500" />
            <div className="mt-3 font-medium">Last checked date</div>
            <p className="mt-2 leading-6 text-ink-500 dark:text-neutral-400">
              Listings include when a product was checked so the price record
              has context.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
