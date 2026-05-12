"use client";

import {
  ArrowRight,
  Bell,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const watchedProducts = [
  {
    name: "iPhone 15 128 GB",
    store: "Darwin",
    storeId: "darwin",
    category: "Smartphones",
    currentPrice: "13,999 MDL",
    previousPrice: "15,199 MDL",
    drop: "1,200 MDL",
    dropPercent: 8,
    availability: "In stock",
    lastChecked: "2 hours ago",
    imageUrl: "/preview-products/iphone-15.jpg",
  },
  {
    name: "AirPods Pro 2nd Gen",
    store: "Ultra",
    storeId: "ultra",
    category: "Audio",
    currentPrice: "4,199 MDL",
    previousPrice: "4,549 MDL",
    drop: "350 MDL",
    dropPercent: 8,
    availability: "In stock",
    lastChecked: "3 hours ago",
    imageUrl: "/preview-products/airpods-pro-2.jpg",
  },
];

const trackedStores = [
  { name: "Darwin", logoPath: "/store-logos/darwin.png" },
  { name: "Enter", logoPath: "/store-logos/enter.png" },
  { name: "Maximum", logoPath: "/store-logos/maximum.png" },
  { name: "Smart.md", logoPath: "/store-logos/smart.png" },
  { name: "Bomba", logoPath: "/store-logos/bomba.png" },
];

const storeCarouselGroups = Array.from({ length: 4 }, (_, index) => index);

type PreviewProduct = (typeof watchedProducts)[number];

function PreviewProductCard({ product }: { product: PreviewProduct }) {
  const { tr } = useLanguage();
  const [imgFailed, setImgFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const initials = product.store.split(/[\s.]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
      <div className="flex min-w-0 flex-col sm:flex-row">
        <div className="grid shrink-0 place-items-center overflow-hidden border-b border-ink-200 bg-white aspect-[4/3] sm:aspect-auto sm:h-auto sm:min-h-[180px] sm:w-[132px] sm:border-b-0 sm:border-r dark:border-neutral-800">
          {product.imageUrl && !imgFailed ? (
            <img
              src={product.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-3"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="h-24 w-16 rounded-md border border-white/70 bg-ink-100 dark:bg-neutral-800 sm:h-20 sm:w-14" />
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <div
              className="min-h-[3rem] overflow-hidden break-words text-[15px] font-semibold leading-6 sm:min-h-[3.25rem] sm:text-base"
              style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 } as React.CSSProperties}
            >
              {product.name}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500 dark:text-neutral-400">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded border border-ink-200 bg-white text-[10px] font-semibold text-ink-600 dark:border-neutral-700">
                  {!faviconFailed ? (
                    <img src={`/store-favicons/${product.storeId}.png`} alt="" loading="lazy" className="h-4 w-4 object-contain" onError={() => setFaviconFailed(true)} />
                  ) : initials}
                </span>
                <span className="truncate">{product.store}</span>
              </span>
              <span className="text-ink-300 dark:text-neutral-700">·</span>
              <span>{product.category}</span>
            </div>
          </div>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="min-w-0">
              <div className="truncate text-2xl font-semibold sm:text-xl">{product.currentPrice}</div>
              <div className="mt-1 truncate text-xs text-ink-500 sm:text-sm dark:text-neutral-400">
                {tr.home_preview_previous(product.previousPrice)}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl bg-ink-50 px-3 py-2 text-xs sm:bg-transparent sm:px-0 sm:py-0 sm:text-right sm:text-sm dark:bg-neutral-800/80 sm:dark:bg-transparent">
              <div className="font-medium text-moss-700 dark:text-moss-500">{tr.home_preview_lower(product.drop)}</div>
              <div className="mt-1 text-ink-500 dark:text-neutral-400">{tr.home_preview_since(product.dropPercent)}</div>
            </div>
          </div>

          <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-ink-200 pt-3 text-xs text-ink-500 sm:gap-3 sm:text-sm dark:border-neutral-800 dark:text-neutral-400">
            <span className="inline-flex h-7 items-center rounded-md border border-moss-100 bg-white px-2.5 text-xs font-medium text-moss-700 dark:border-moss-900/60 dark:bg-[#171717] dark:text-moss-500">
              {product.availability}
            </span>
            <span className="min-w-0 truncate text-right sm:text-left">{tr.home_preview_checked(product.lastChecked)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { tr } = useLanguage();
  const trackedHref = useMemo(
    () => (isAuthenticated ? "/tracked" : "/login?next=%2Ftracked"),
    [isAuthenticated],
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] pb-12">
      <section className="grid min-h-[calc(100vh-10rem)] grid-cols-[minmax(0,1fr)] content-center justify-items-center gap-8 border-b border-ink-200 py-10 xl:grid-cols-[minmax(480px,680px)_minmax(380px,460px)] xl:items-center xl:justify-items-stretch xl:justify-between dark:border-neutral-800">
        <div className="min-w-0 w-full max-w-3xl">
          <h1 className="max-w-2xl break-words text-4xl font-semibold leading-[1.05] tracking-normal min-[380px]:text-5xl sm:text-6xl">
            pricehistory.md
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-ink-600 dark:text-neutral-300">
            {tr.home_tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-ink-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300"
            >
              {tr.home_search_products}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={trackedHref}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              {tr.home_view_tracked}
            </Link>
          </div>
        </div>

        <div className="min-w-0 w-full max-w-[460px] overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
          <div className="border-b border-ink-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <Search className="h-4 w-4" />
              <span>iphone 15 128</span>
            </div>
          </div>

          <div className="flex min-w-0 border-b border-ink-200 dark:border-neutral-800">
            <div className="grid w-[100px] shrink-0 place-items-center border-r border-ink-200 bg-white dark:border-neutral-800">
              <img src="/preview-products/iphone-15.jpg" alt="" className="h-full w-full object-contain p-3" />
            </div>
            <div className="min-w-0 flex-1 p-4">
              <div
                className="overflow-hidden text-[15px] font-semibold leading-5"
                style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 } as React.CSSProperties}
              >
                iPhone 15 128 GB
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500 dark:text-neutral-400">
                <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded border border-ink-200 bg-white dark:border-neutral-700">
                  <img src="/store-favicons/darwin.png" alt="" className="h-4 w-4 object-contain" />
                </span>
                <span>Darwin</span>
                <span className="text-ink-300 dark:text-neutral-700">·</span>
                <span>Smartphones</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <div className="text-xl font-semibold">13,999 MDL</div>
                  <div className="text-xs text-ink-500 dark:text-neutral-400">{tr.home_preview_previous("15,199 MDL")}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-moss-700 dark:text-moss-500">{tr.home_preview_lower("1,200 MDL")}</div>
                  <div className="text-xs text-ink-500 dark:text-neutral-400">{tr.home_preview_since(8)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="h-36 border-y border-ink-200 py-4 dark:border-neutral-800">
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
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 py-12 dark:border-neutral-800">
        <div className="mb-6 max-w-3xl">
          <h2 className="text-3xl font-semibold leading-tight">
            {tr.home_one_search}
          </h2>
        </div>

        <div className="-mx-2 overflow-hidden px-2 py-2" aria-label="Tracked store sources">
          <div className="store-carousel-track flex w-max">
            {storeCarouselGroups.map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex gap-4 pr-4"
                aria-hidden={groupIndex > 0}
              >
                {trackedStores.map((store) => (
                  <div
                    key={`${store.name}-${groupIndex}`}
                    className="flex min-h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white p-4 shadow-soft sm:w-32 xl:w-36 dark:border-neutral-800 dark:bg-[#171717]"
                    aria-label={store.name}
                  >
                    <img src={store.logoPath} alt={`${store.name} logo`} className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 py-12 dark:border-neutral-800">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-soft sm:p-6 dark:border-neutral-800 dark:bg-[#171717]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="max-w-xl text-3xl font-semibold leading-tight">
                {tr.home_know_when}
              </h2>
              <p className="max-w-md text-base leading-7 text-ink-600 dark:text-neutral-300">
                {tr.home_shared_record}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {watchedProducts.map((product) => (
                <PreviewProductCard key={product.name} product={product} />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-ink-200 bg-ink-50 p-5 shadow-soft sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">{tr.home_shared_history}</h3>
            <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-neutral-300">
              {tr.home_shared_history_body}
            </p>
            <Link
              href={trackedHref}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-medium transition-colors hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:hover:bg-neutral-800"
            >
              {tr.home_open_tracked}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>

      <section className="py-12">
        <div className="flex flex-col items-start gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-moss-100 bg-moss-50 px-3 py-1 text-sm font-medium text-moss-700 dark:border-moss-900/40 dark:bg-moss-900/20 dark:text-moss-400">
              <Bell className="h-3.5 w-3.5" />
              {tr.home_price_alerts}
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">{tr.home_get_notified}</h2>
            <p className="mt-3 text-base text-ink-500 dark:text-neutral-400">{tr.home_alert_body}</p>
          </div>
        <div className="w-full max-w-xl xl:shrink-0">
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            {/* Email client chrome */}
            <div className="border-b border-ink-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss-100 text-xs font-semibold text-moss-700 dark:bg-moss-900/40 dark:text-moss-400">
                  P
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">pricehistory.md</div>
                  <div className="truncate text-xs text-ink-500 dark:text-neutral-400">noreply@pricehistory.md</div>
                </div>
                <div className="ml-auto shrink-0 text-xs text-ink-400 dark:text-neutral-500">{tr.home_preview_just_now}</div>
              </div>
              <div className="mt-2 text-sm font-semibold">{tr.home_preview_email_subject}</div>
            </div>

            {/* Email body */}
            <div className="p-5">
              <div className="overflow-hidden rounded-lg border border-ink-200 bg-white dark:border-neutral-800 dark:bg-[#171717]">
                <div className="flex items-center gap-4 p-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-ink-200 bg-white dark:border-neutral-800">
                    <img src="/preview-products/airpods-pro-2.jpg" alt="" className="h-full w-full object-contain p-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">AirPods Pro 2nd Gen</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500 dark:text-neutral-400">
                      <img src="/store-favicons/ultra.png" alt="" className="h-4 w-4 object-contain" />
                      <span>Ultra</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-ink-200 px-4 py-4 dark:border-neutral-800">
                  <div>
                    <div className="text-2xl font-semibold">4,199 MDL</div>
                    <div className="text-sm text-ink-400 line-through dark:text-neutral-500">4,549 MDL</div>
                  </div>
                  <div className="rounded-md bg-moss-50 px-3 py-1.5 text-lg font-semibold text-moss-700 dark:bg-moss-900/30 dark:text-moss-400">
                    −350 MDL
                  </div>
                </div>

                <div className="border-t border-ink-200 p-4 dark:border-neutral-800">
                  <div className="flex h-9 w-full items-center justify-center rounded-md bg-ink-900 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-950">
                    {tr.home_preview_view_product}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
