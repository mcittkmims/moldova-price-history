import {
  ArrowRight,
  Bell,
  Search,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const watchedProducts = [
  {
    name: "iPhone 15 128 GB",
    store: "Darwin",
    oldPrice: "15,199 MDL",
    price: "13,999 MDL",
    drop: "-1,200 MDL",
  },
  {
    name: "AirPods Pro 2",
    store: "XStore",
    oldPrice: "4,549 MDL",
    price: "4,199 MDL",
    drop: "-350 MDL",
  },
  {
    name: "Samsung Galaxy A55",
    store: "Enter",
    oldPrice: "7,299 MDL",
    price: "6,799 MDL",
    drop: "-500 MDL",
  },
];

const trackedStores = [
  { name: "Darwin", mark: "D" },
  { name: "Enter", mark: "E" },
  { name: "Maximum", mark: "M" },
  { name: "Xstore", mark: "X" },
  { name: "Smart.md", mark: "S" },
  { name: "Bomba", mark: "B" },
];

const alertRows = [
  {
    title: "Tracking starts once",
    text: "When you or anyone else starts tracking a product, the app begins recording future price checks for that item.",
  },
  {
    title: "Every later check adds context",
    text: "The price history grows from that first tracked moment, so the record becomes more useful over time.",
  },
  {
    title: "Drops become alerts",
    text: "When a watched product moves down from its recorded price, you can see the alert in the app and receive it by email.",
  },
];

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] pb-12">
      <section className="grid min-h-[calc(100vh-10rem)] gap-8 border-b border-ink-200 py-10 xl:grid-cols-[minmax(480px,680px)_minmax(380px,460px)] xl:items-center xl:justify-between dark:border-neutral-800">
        <div className="max-w-3xl">
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-normal sm:text-6xl">
            pricehistory.md
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-ink-600 dark:text-neutral-300">
            Track Moldova store prices before you buy. Search a product, read
            its price history, and get notified when a watched item drops.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
            >
              Search products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tracked"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              View tracked products
            </Link>
          </div>
        </div>

        <div className="border-y border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
          <div className="border-b border-ink-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <Search className="h-4 w-4" />
              <span>iphone 15 128</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">iPhone 15 128 GB</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-neutral-400">
                  <Store className="h-3.5 w-3.5" />
                  <span>Darwin</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">13,999 MDL</div>
                <div className="mt-1 text-sm text-moss-700 dark:text-moss-500">
                  down 1,200 MDL
                </div>
              </div>
            </div>

            <div className="mt-6 h-36 border-y border-ink-200 py-4 dark:border-neutral-800">
              <svg
                viewBox="0 0 360 120"
                className="h-full w-full"
                role="img"
                aria-label="Stepped price history chart"
              >
                <path
                  d="M12 94H348M12 58H348M12 22H348"
                  stroke="currentColor"
                  strokeOpacity="0.14"
                />
                <path
                  d="M20 30H90V52H160V48H230V78H340"
                  fill="none"
                  stroke="#059669"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                <circle cx="340" cy="78" r="5" fill="#059669" />
              </svg>
            </div>

            <div className="mt-4 rounded-md border border-moss-100 bg-moss-50 p-3 text-sm text-moss-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
              <div className="flex items-center gap-2 font-medium">
                <Bell className="h-4 w-4" />
                Price drop alert
              </div>
              <div className="mt-1 text-moss-700 dark:text-neutral-400">
                Darwin dropped this watched product below its recent price.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-b border-ink-200 py-12 xl:grid-cols-[320px_minmax(0,1fr)] dark:border-neutral-800">
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            One search surfaces products from popular Moldova stores.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-600 dark:text-neutral-300">
            Results show where each listing comes from, and the store list can
            grow without changing the shape of the page.
          </p>
        </div>

        <div className="max-w-5xl border-y border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
          <div className="flex gap-px overflow-x-auto bg-ink-200 dark:bg-neutral-800">
            {trackedStores.map((store) => (
              <div
                key={store.name}
                className="flex min-w-36 shrink-0 flex-col items-center justify-center bg-white px-5 py-5 text-center dark:bg-[#171717]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-ink-200 bg-ink-50 text-lg font-semibold text-ink-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                  {store.mark}
                </div>
                <div className="mt-3 text-sm font-medium">{store.name}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-200 px-4 py-3 text-sm text-ink-500 dark:border-neutral-800 dark:text-neutral-400">
            New stores can be added to the same row without turning the section
            into a growing table.
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-b border-ink-200 py-12 xl:grid-cols-[320px_minmax(0,820px)] dark:border-neutral-800">
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Know when the price actually moves.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-600 dark:text-neutral-300">
            Tracked products are items with an active price record. If someone
            already started tracking the same product, future checks continue
            that record for everyone.
          </p>
        </div>

        <div className="divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
          {watchedProducts.map((product) => (
            <div
              key={product.name}
              className="grid gap-4 p-4 text-sm sm:grid-cols-[1fr_120px_120px]"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{product.name}</div>
                <div className="mt-1 text-ink-500 dark:text-neutral-400">
                  {product.store}
                </div>
              </div>
              <div>
                <div className="text-ink-500 line-through dark:text-neutral-500">
                  {product.oldPrice}
                </div>
                <div className="mt-1 font-medium">{product.price}</div>
              </div>
              <div className="font-medium text-moss-700 dark:text-moss-500">
                {product.drop}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-12 xl:grid-cols-[minmax(0,720px)_420px] xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Alerts start from tracked history.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-600 dark:text-neutral-300">
            A product does not need to be tracked separately by every visitor.
            Once tracking starts, later price checks build the same history and
            make in-app and email price-drop alerts possible.
          </p>

          <div className="mt-8 divide-y divide-ink-200 border-y border-ink-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-[#171717]">
            {alertRows.map((row, index) => (
              <div
                key={row.title}
                className="grid gap-3 p-4 text-sm sm:grid-cols-[48px_1fr]"
              >
                <div className="font-medium text-ink-500 dark:text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-medium">{row.title}</div>
                  <div className="mt-1 leading-6 text-ink-500 dark:text-neutral-400">
                    {row.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px] border-y border-ink-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-moss-700 dark:text-moss-500" />
            pricehistory.md
          </div>
          <div className="mt-5 text-2xl font-semibold leading-tight">
            AirPods Pro 2 dropped by 350 MDL.
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-neutral-400">
            XStore now lists this watched product at 4,199 MDL. Previous
            recorded price: 4,549 MDL. Email alert sent to your saved address.
          </p>
          <Link
            to="/tracked"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 px-4 text-sm font-medium transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Open tracked
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
