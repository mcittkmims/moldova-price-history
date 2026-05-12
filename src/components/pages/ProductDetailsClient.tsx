"use client";

import { ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AvailabilityBadge } from "../products/AvailabilityBadge";
import { CategoryMeta } from "../products/CategoryMeta";
import { ProductImage } from "../products/ProductImage";
import { StoreMark } from "../products/StoreMark";
import { useAuth } from "../../context/AuthContext";
import { toErrorMessage } from "../../services/apiClient";
import { productService } from "../../services/productService";
import { trackedProductService } from "../../services/trackedProductService";
import type { PricePoint, Product } from "../../types/product";
import {
  formatDateTime,
  formatMdl,
  getHighestPrice,
  getLowestPrice,
  getPriceDrop,
  getPriceDropPercent,
  hasPrice,
} from "../../utils/pricing";

const PriceHistoryChart = dynamic(
  () => import("../charts/PriceHistoryChart").then((module) => module.PriceHistoryChart),
  {
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-ink-100 dark:bg-neutral-800 sm:h-[320px]" />
    ),
  },
);

type ProductDetailsClientProps = {
  product: Product;
};

type HistoryRange = "1m" | "3m" | "6m" | "1y" | "all";

const historyRangeLabels: Record<HistoryRange, string> = {
  "1m": "1M",
  "3m": "3M",
  "6m": "6M",
  "1y": "1Y",
  all: "All",
};

const getRangeStart = (latestTimestamp: number, range: Exclude<HistoryRange, "all">) => {
  const start = new Date(latestTimestamp);

  if (range === "1m") {
    start.setMonth(start.getMonth() - 1);
  } else if (range === "3m") {
    start.setMonth(start.getMonth() - 3);
  } else if (range === "6m") {
    start.setMonth(start.getMonth() - 6);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }

  return start.getTime();
};

export function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("all");
  const [isTracked, setIsTracked] = useState(false);
  const [trackingReady, setTrackingReady] = useState(false);
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const priceDrop = getPriceDrop(product);
  const lowest = getLowestPrice(history);
  const highest = getHighestPrice(history);
  const hasCurrentPrice = hasPrice(product.currentPrice);
  const filteredHistory = useMemo(() => {
    if (historyRange === "all" || history.length < 2) {
      return history;
    }

    const latestTimestamp = new Date(history[history.length - 1]?.date).getTime();
    const rangeStart = getRangeStart(latestTimestamp, historyRange);
    const withinRange = history.filter(
      (point) => new Date(point.date).getTime() >= rangeStart,
    );

    return withinRange.length > 0 ? withinRange : history.slice(-1);
  }, [historyRange, history]);

  const canReadTracking = hasPermission("tracked:read_own");
  const canTrack = hasPermission("tracked:create_own");
  const canUntrack = hasPermission("tracked:delete_own");

  useEffect(() => {
    let cancelled = false;

    void productService.productHistory(product.slug).then((data) => {
      if (!cancelled) setHistory(data.history);
    });

    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  useEffect(() => {
    let cancelled = false;

    const loadTrackedStatus = async () => {
      if (!isAuthenticated || isLoading || !canReadTracking) {
        if (!cancelled) {
          setIsTracked(false);
          setTrackingReady(!isLoading);
        }
        return;
      }

      try {
        const tracked = await trackedProductService.status(product.slug);
        if (!cancelled) {
          setIsTracked(tracked);
        }
      } catch (error) {
        if (!cancelled) {
          setTrackingError(toErrorMessage(error, "Could not check tracking status."));
        }
      } finally {
        if (!cancelled) {
          setTrackingReady(true);
        }
      }
    };

    setTrackingReady(false);
    setTrackingError(null);
    void loadTrackedStatus();

    return () => {
      cancelled = true;
    };
  }, [canReadTracking, isAuthenticated, isLoading, product.slug]);

  const handleToggleTracking = async () => {
    setTrackingBusy(true);
    setTrackingError(null);

    try {
      const result = isTracked
        ? await trackedProductService.untrack(product.slug)
        : await trackedProductService.track(product.slug);
      setIsTracked(result.tracked);
    } catch (error) {
      setTrackingError(toErrorMessage(error, "Could not update tracking."));
    } finally {
      setTrackingBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-normal">
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-600 dark:text-neutral-300">
            <StoreMark product={product} />
            <CategoryMeta category={product.category} />
            <AvailabilityBadge availability={product.availability} />
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-300 bg-white px-3 text-sm hover:bg-ink-50 dark:border-neutral-700 dark:bg-[#171717] dark:hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
            Store page
          </a>
          {isAuthenticated ? (
            <button
              type="button"
              disabled={isLoading || !trackingReady || trackingBusy || (!isTracked && !canTrack) || (isTracked && !canUntrack)}
              onClick={() => {
                void handleToggleTracking();
              }}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors",
                isTracked
                  ? "border border-moss-200 bg-moss-50 text-moss-900 hover:bg-moss-100 dark:border-moss-900/60 dark:bg-moss-950/30 dark:text-moss-300 dark:hover:bg-moss-950/40"
                  : "bg-moss-700 text-white hover:bg-moss-900 dark:bg-moss-600 dark:hover:bg-moss-700",
                isLoading || !trackingReady || trackingBusy || (!isTracked && !canTrack) || (isTracked && !canUntrack)
                  ? "cursor-not-allowed opacity-60"
                  : "",
              ].join(" ")}
            >
              <ShoppingBag className="h-4 w-4" />
              {trackingBusy
                ? "Updating..."
                : !trackingReady
                  ? "Checking..."
                  : isTracked
                    ? "Untrack"
                    : "Track"}
            </button>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-moss-700 px-3 text-sm text-white transition-colors hover:bg-moss-900 dark:bg-moss-600 dark:hover:bg-moss-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Track
            </Link>
          )}
        </div>
      </div>

      {trackingError ? (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-sm text-rust-700 dark:border-rust-700 dark:bg-[#2b170d] dark:text-rust-100">
          {trackingError}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section className="order-2 rounded-lg border border-ink-200 bg-white p-5 shadow-soft xl:order-1 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Price history</h2>
              <p className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
                Historical prices from the current search service.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-md border border-ink-200 bg-white p-1 dark:border-neutral-700 dark:bg-[#1a1a1a]">
                {(Object.keys(historyRangeLabels) as HistoryRange[]).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setHistoryRange(range)}
                    className={[
                      "rounded px-2.5 py-1 text-xs transition-colors sm:text-sm",
                      historyRange === range
                        ? "bg-ink-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-ink-600 hover:bg-ink-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    ].join(" ")}
                  >
                    {historyRangeLabels[range]}
                  </button>
                ))}
              </div>
              <div className="text-sm text-ink-500 dark:text-neutral-400">
                {filteredHistory.length} shown
              </div>
            </div>
          </div>
          {filteredHistory.length > 0 ? (
            <PriceHistoryChart data={filteredHistory} />
          ) : (
            <div className="rounded-md border border-dashed border-ink-200 p-6 text-sm text-ink-500 dark:border-neutral-700 dark:text-neutral-400">
              No price history is available because the store did not publish a comparable price.
            </div>
          )}
        </section>

        <aside className="order-1 min-w-0 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft xl:order-2 dark:border-neutral-800 dark:bg-[#171717]">
          <div className="border-b border-ink-200 p-4 sm:p-5 dark:border-neutral-800">
            <ProductImage
              product={product}
              className="grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-lg border border-ink-200 bg-white dark:border-neutral-700 dark:bg-[#1a1a1a]"
              imageClassName="h-full w-full object-contain p-5 sm:p-6"
              placeholderClassName="h-36 w-28 rounded-md border border-ink-200 bg-white/80 dark:border-neutral-700 dark:bg-neutral-800/70"
            />
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <div>
              <div className="text-sm text-ink-500 dark:text-neutral-400">
                Current price
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {formatMdl(product.currentPrice)}
              </div>
              {!hasCurrentPrice ? (
                <div className="mt-2 text-sm text-ink-500 dark:text-neutral-400">
                  The store page does not publish a price right now.
                </div>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-4 border-t border-ink-200 pt-4 text-sm dark:border-neutral-800">
              <div>
                <dt className="text-ink-500 dark:text-neutral-400">
                  Lowest
                </dt>
                <dd className="mt-1 font-medium">{formatMdl(lowest)}</dd>
              </div>
              <div>
                <dt className="text-ink-500 dark:text-neutral-400">
                  Highest
                </dt>
                <dd className="mt-1 font-medium">{formatMdl(highest)}</dd>
              </div>
              <div>
                <dt className="text-ink-500 dark:text-neutral-400">
                  Last change
                </dt>
                <dd className="mt-1 font-medium">{formatMdl(priceDrop)}</dd>
              </div>
              <div>
                <dt className="text-ink-500 dark:text-neutral-400">
                  Drop
                </dt>
                <dd className="mt-1 font-medium">
                  {Math.max(getPriceDropPercent(product), 0)}%
                </dd>
              </div>
            </dl>

            <div className="border-t border-ink-200 pt-4 text-sm dark:border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-500 dark:text-neutral-400">Last checked</span>
                <span className="text-right font-medium text-ink-700 dark:text-neutral-200">
                  {formatDateTime(product.lastChecked)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Link
        href="/search"
        className="inline-flex rounded-md border border-ink-300 px-3 py-2 text-sm hover:bg-ink-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Back to search
      </Link>
    </div>
  );
}
