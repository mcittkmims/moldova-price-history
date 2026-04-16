import {
  ArrowRight,
  Bell,
  LineChart,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const watchedProducts = [
  {
    name: "iPhone 15 128 GB",
    store: "Darwin",
    price: "13,999 MDL",
    change: "-1,200 MDL",
  },
  {
    name: "AirPods Pro 2",
    store: "XStore",
    price: "4,199 MDL",
    change: "-350 MDL",
  },
  {
    name: "Samsung Galaxy A55",
    store: "Enter",
    price: "6,799 MDL",
    change: "-500 MDL",
  },
];

const features = [
  {
    title: "Search local listings",
    text: "Find products by name, model, category, store, or product link.",
    icon: Search,
  },
  {
    title: "Read the price history",
    text: "Check the current price, previous price, and recorded changes before buying.",
    icon: LineChart,
  },
  {
    title: "Get price-drop alerts",
    text: "Track products and know when a watched item drops below its recent price.",
    icon: Bell,
  },
];

export function HomePage() {
  return (
    <div className="pb-10">
      <section className="grid gap-8 border-b border-ink-200 pb-8 pt-3 lg:grid-cols-[minmax(0,1fr)_420px] dark:border-neutral-800">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            PriceHistory.md
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-600 sm:text-lg dark:text-neutral-300">
            Track Moldova store prices, compare product history, and get alerts
            when a watched item drops.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink-900 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
            >
              Search products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tracked"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              View tracked
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-t border-ink-200 pt-3 text-sm dark:border-neutral-800"
              >
                <feature.icon className="h-5 w-5 text-moss-700 dark:text-moss-500" />
                <div className="mt-3 font-medium">{feature.title}</div>
                <p className="mt-2 leading-6 text-ink-500 dark:text-neutral-400">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="self-start border-y border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
          <div className="flex items-center justify-between border-b border-ink-200 p-4 dark:border-neutral-800">
            <div>
              <div className="font-medium">Tracked drops</div>
              <div className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
                Products worth watching today
              </div>
            </div>
            <Bell className="h-5 w-5 text-moss-700 dark:text-moss-500" />
          </div>

          <div className="divide-y divide-ink-200 dark:divide-neutral-800">
            {watchedProducts.map((product) => (
              <div
                key={product.name}
                className="grid grid-cols-[1fr_auto] gap-3 p-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{product.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-ink-500 dark:text-neutral-400">
                    <Store className="h-3.5 w-3.5" />
                    <span>{product.store}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{product.price}</div>
                  <div className="mt-1 text-moss-700 dark:text-moss-500">
                    {product.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-ink-200 p-4 text-sm text-ink-500 dark:border-neutral-800 dark:text-neutral-400">
            <ShoppingBag className="h-4 w-4" />
            <span>Save products once, then check only what changed.</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
        <div>
          <h2 className="text-xl font-semibold">How it helps</h2>
          <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-neutral-300">
            The app keeps buying decisions close to the price record.
          </p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="grid gap-3 p-4 text-sm sm:grid-cols-[160px_1fr]">
            <div className="font-medium">Before buying</div>
            <div className="leading-6 text-ink-500 dark:text-neutral-400">
              Check whether a discount is real by comparing it with recent
              recorded prices.
            </div>
          </div>
          <div className="grid gap-3 p-4 text-sm sm:grid-cols-[160px_1fr]">
            <div className="font-medium">While tracking</div>
            <div className="leading-6 text-ink-500 dark:text-neutral-400">
              Keep watched products in one place and get notified when the
              price moves down.
            </div>
          </div>
          <div className="grid gap-3 p-4 text-sm sm:grid-cols-[160px_1fr]">
            <div className="font-medium">Across stores</div>
            <div className="leading-6 text-ink-500 dark:text-neutral-400">
              Compare store, category, current price, previous price, and last
              checked date without opening every listing again.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
