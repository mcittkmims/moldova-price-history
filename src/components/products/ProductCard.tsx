import { ExternalLink, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { ProductImage } from "./ProductImage";
import { StoreMark } from "./StoreMark";
import type { Product } from "../../types/product";
import {
  formatDate,
  formatMdl,
  getPriceDrop,
  getPriceDropPercent,
} from "../../utils/pricing";

type ProductCardProps = {
  product: Product;
  tracked: boolean;
  onToggleTracked: (productId: string) => void;
  compact?: boolean;
};

export function ProductCard({
  product,
  tracked,
  onToggleTracked,
  compact = false,
}: ProductCardProps) {
  const drop = getPriceDrop(product);
  const isLower = drop > 0;

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-lg border border-ink-200 bg-white p-3 shadow-soft sm:p-4 dark:border-neutral-800 dark:bg-[#171717]">
      <div className="flex min-w-0 gap-3 sm:gap-4">
        <Link
          to={`/products/${product.id}`}
          className="block h-14 w-14 shrink-0 sm:h-20 sm:w-20"
          aria-label={`Open ${product.title}`}
        >
          <ProductImage
            product={product}
            className="grid h-full w-full place-items-center overflow-hidden rounded-md border border-ink-200 bg-white dark:border-neutral-700"
            placeholderClassName="h-8 w-5 rounded-sm border border-ink-200 bg-ink-50 sm:h-10 sm:w-7"
          />
        </Link>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to={`/products/${product.id}`}
                className="block truncate text-[15px] font-semibold hover:text-moss-700 dark:hover:text-moss-500"
              >
                {product.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 dark:text-neutral-400">
                <StoreMark product={product} />
                <div>{product.category}</div>
                <div className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-rust-500 text-rust-500" />
                  {product.rating}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleTracked(product.id)}
              className={[
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors sm:h-9 sm:gap-2 sm:px-3 sm:text-sm",
                tracked
                  ? "border-ink-300 bg-ink-50 text-ink-800 hover:bg-ink-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  : "border-moss-700 bg-moss-700 text-white hover:bg-moss-900 dark:border-moss-600 dark:bg-moss-600 dark:hover:bg-moss-700",
              ].join(" ")}
            >
              {compact && tracked ? <Trash2 className="h-4 w-4" /> : null}
              {tracked ? "Untrack" : "Track"}
            </button>
          </div>

          <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold sm:text-xl">
                {formatMdl(product.currentPrice)}
              </div>
              <div className="mt-1 truncate text-xs text-ink-500 sm:text-sm dark:text-neutral-400">
                Previous {formatMdl(product.previousPrice)}
              </div>
            </div>

            <div className="min-w-0 text-xs sm:text-right sm:text-sm">
              <div
                className={
                  isLower
                    ? "font-medium text-moss-700 dark:text-moss-500"
                    : "font-medium text-rust-700 dark:text-rust-500"
                }
              >
                {isLower
                  ? `${formatMdl(drop)} lower`
                  : `${formatMdl(Math.abs(drop))} higher`}
              </div>
              <div className="mt-1 text-ink-500 dark:text-neutral-400">
                {isLower ? getPriceDropPercent(product) : 0}% since last price
              </div>
            </div>
          </div>

          {!compact ? (
            <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 border-t border-ink-200 pt-3 text-xs text-ink-500 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:text-sm dark:border-neutral-800 dark:text-neutral-400">
              <div className="min-w-0">
                <AvailabilityBadge availability={product.availability} />
              </div>
              <div className="min-w-0 truncate text-right sm:text-left">
                Checked {formatDate(product.lastChecked)}
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 inline-flex min-w-0 items-center gap-1 hover:text-moss-700 sm:col-span-1 dark:hover:text-moss-500"
              >
                <span className="truncate">Store page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
