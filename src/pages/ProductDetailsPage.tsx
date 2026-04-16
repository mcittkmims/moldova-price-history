import { ExternalLink, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PriceHistoryChart } from "../components/charts/PriceHistoryChart";
import { useAppState } from "../context/AppStateContext";
import { productService } from "../services/productService";
import type { Product } from "../types/product";
import {
  formatDate,
  formatMdl,
  getHighestPrice,
  getLowestPrice,
  getPriceDrop,
  getPriceDropPercent,
} from "../utils/pricing";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const { isTracked, toggleTracked } = useAppState();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    if (!productId) {
      setLoading(false);
      return;
    }

    productService.getProduct(productId).then((result) => {
      if (active) {
        setProduct(result);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
        Loading product.
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <Link
          to="/search"
          className="mt-4 inline-flex rounded-md border border-ink-300 px-3 py-2 text-sm hover:bg-ink-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const tracked = isTracked(product.id);
  const priceDrop = getPriceDrop(product);
  const lowest = getLowestPrice(product.history);
  const highest = getHighestPrice(product.history);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-normal">
            {product.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500 dark:text-neutral-400">
            <div>{product.store}</div>
            <div>{product.category}</div>
            <div>{product.availability}</div>
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
          <button
            type="button"
            onClick={() => toggleTracked(product.id)}
            className={[
              "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
              tracked
                ? "border-ink-300 bg-ink-50 text-ink-800 hover:bg-ink-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                : "border-moss-700 bg-moss-700 text-white hover:bg-moss-900 dark:border-moss-600 dark:bg-moss-600 dark:hover:bg-moss-700",
            ].join(" ")}
          >
            <ShoppingBag className="h-4 w-4" />
            {tracked ? "Untrack" : "Track"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-ink-200 bg-white p-4 shadow-soft sm:p-5 dark:border-neutral-800 dark:bg-[#171717]">
          <div
            className="mb-5 grid h-36 place-items-center rounded-md border border-ink-200 dark:border-neutral-700"
            style={{ backgroundColor: product.imageTone }}
          >
            <div className="h-20 w-14 rounded-sm border border-white/70 bg-white/30" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-ink-500 dark:text-neutral-400">
                Current price
              </div>
              <div className="mt-1 text-3xl font-semibold">
                {formatMdl(product.currentPrice)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-ink-200 pt-4 text-sm dark:border-neutral-800">
              <div>
                <div className="text-ink-500 dark:text-neutral-400">
                  Lowest
                </div>
                <div className="mt-1 font-medium">{formatMdl(lowest)}</div>
              </div>
              <div>
                <div className="text-ink-500 dark:text-neutral-400">
                  Highest
                </div>
                <div className="mt-1 font-medium">{formatMdl(highest)}</div>
              </div>
              <div>
                <div className="text-ink-500 dark:text-neutral-400">
                  Last change
                </div>
                <div className="mt-1 font-medium">{formatMdl(priceDrop)}</div>
              </div>
              <div>
                <div className="text-ink-500 dark:text-neutral-400">
                  Drop
                </div>
                <div className="mt-1 font-medium">
                  {Math.max(getPriceDropPercent(product), 0)}%
                </div>
              </div>
            </div>

            <div className="border-t border-ink-200 pt-4 dark:border-neutral-800">
              <div className="text-sm font-medium">Specifications</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-neutral-300">
                {product.specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink-200 pt-4 text-sm text-ink-500 dark:border-neutral-800 dark:text-neutral-400">
              Checked {formatDate(product.lastChecked)}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-ink-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Price history</h2>
              <p className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
                Historical prices from the current mock service.
              </p>
            </div>
            <div className="text-sm text-ink-500 dark:text-neutral-400">
              {product.history.length} observations
            </div>
          </div>
          <PriceHistoryChart data={product.history} />
        </section>
      </div>
    </div>
  );
}
